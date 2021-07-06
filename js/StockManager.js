/* Copyright 2010-2011 Ilkka Halila
This file is part of Goblin Camp.

Goblin Camp is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Goblin Camp is distributed in the hope that it will be useful,
but without any warranty; without even the implied warranty of
merchantability or fitness for a particular purpose. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License 
along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/

import { Action } from "./jobs/Action.js";
import { Camp } from "./Camp.js";
import { Constants } from "./Constants.js";
import { Construction } from "./constructions/Construction.js";
import { Game } from "./Game.js";
import { GameMap } from "./GameMap.js";
import { Globals } from "./Globals.js";
import { Item } from "./items/Item.js"; 
import { Job } from "./jobs/Job.js";
import { JobManager } from "./jobs/JobManager.js";
import { JobPriority } from "./jobs/JobPriority.js";
import { NatureObject } from "./NatureObject.js";
import { ChooseIndex, Generate } from "./Random.js";
import { Serializable } from "./data/Serialization.js";
import { Singletonify } from "./cplusplus/Singleton.js";
import { Task } from "./jobs/Task.js";
import { TileType } from "./TileType.js";

export class StockManager extends Serializable {
    //public extends 


    constructor() {
        super();
        /** @type {Map<ItemCategory, int>} **/
        this.categoryQuantities = new Map();
        /** @type {Map<ItemType, int>} **/
        this.typeQuantities = new Map();
        /** @type {Map<ItemType, int>} **/
        this.minimums = new Map(); //If minimum is -1, the product isn't available yet
        /** @type {std.set <ItemType>} **/
        this.producables = new Set();
        /** @type {std.set <ItemType>} **/
        this.dumpables = new Set();
        /** @type {Map<ItemType, ConstructionType>} **/
        this.producers = new Map();
        /** @type {std.multimap <ConstructionType, boost.weak_ptr < Construction>>} **/
        this.workshops = new Map();
        /** @type {std.set <ItemType>} **/
        this.fromTrees = new Set(); //Trees and stones are a special case, possibly fish in the future as well
        /** @type {std.set <ItemType>} **/
        this.fromEarth = new Set();
        /** @type {std.list <boost.weak_ptr < NatureObject>>} **/
        this.designatedTrees = [];
        /** @type {std.list <std.pair < boost.weak_ptr < Job>, boost.weak_ptr < NatureObject>>>} **/
        this.treeFellingJobs = [];
        /** @type {std.set <Coordinate>} **/
        this.designatedBog = new Set();
        /** @type {std.list <boost.weak_ptr < Job>>} **/
        this.bogIronJobs = [];
        /** @type {std.list <boost.weak_ptr < Job>>} **/
        this.barrelWaterJobs = [];
        this.Init();
    }

    Init() {
        //Initialize all quantities to -1 (== not visible in stocks screen)
        for (let i = 0; i < Item.Categories.length; ++i) {
            this.categoryQuantities.set(i, -1);
        }
        for (let i = 0; i < Item.Presets.length; ++i) {
            this.typeQuantities.set(i, -1);
            if (Globals.DEBUG) {
                console.log("Initializing typeQuantity ", Item.ItemTypeToString(i), " to ", this.typeQuantities[i]);
            }
        }

        //Figure out which items are producable, this is so that we won't show _all_ item types in the
        //stock manager screen. Things such as trash and plant mid-growth types won't show this way
        for (let itemIndex = 0; itemIndex < Item.Presets.length; ++itemIndex) {
            let item = (itemIndex);

            //Now figure out if this item is producable either from a workshop, or designations
            let producerFound = false;

            //Bog iron is a hard coded special case, for now. TODO: Think about this
            if (Item.Presets[itemIndex].name.toLowerCase() === "bog iron" ||
                Item.Presets[itemIndex].name.toLowerCase() === "water") {
                this.producables.add(item);
                if (Item.Presets[itemIndex].name.toLowerCase === "bog iron")
                    this.fromEarth.add(item);
                producerFound = true;
                this.UpdateQuantity(item, 0);
            }

            for (let cons = 0; cons < Construction.Presets.length; ++cons) { //Look through all constructions
                for (let prod = 0; prod < Construction.Presets[cons].products.length; ++prod) { //Products
                    if (Construction.Presets[cons].products[prod] === item) {
                        //This construction has this itemtype as a product
                        this.producables.add(item);
                        this.producers.set(item, cons);
                        producerFound = true;
                        break;
                    }
                }
            }

            if (!producerFound) { //Haven't found a producer, so check NatureObjects if a tree has this item as a component
                for (let natObj = 0; natObj < NatureObject.Presets.length; ++natObj) {
                    if (NatureObject.Presets[natObj].tree) {
                        for (let compi of NatureObject.Presets[natObj].components) {
                            if (compi === item) {
                                this.producables.add(item);
                                this.fromTrees.add(item);
                                this.UpdateQuantity(item, 0);
                            }
                        }
                    }
                }

                //Anything not in the Misc. category can be shown in the stock manager dialog
                if (!(Item.Presets[itemIndex].categories.find(Item.StringToItemCategory("Misc."))))
                    this.producables.add(item);
            }

            //Flag all inorganic materials for dumping (except seeds which are technically not organic)
            if (!Item.Presets[itemIndex].organic && !(Item.Presets[itemIndex].categories.find(Item.StringToItemCategory("Seed"))))
                this.dumpables.add(item);
        }
    }

    Update() {
        //Check all ItemTypes
        for (let type = 0; type < Item.Presets.length(); ++type) {
            let difference = this.minimums[type] - this.typeQuantities[type];
            if (this.producables.find(type) !== this.producables.end()) {
                if (this.minimums[type] > 0 && difference > 0) { //Only consider production if we have a positive minimum
                    difference = Math.max(1, difference / Item.Presets[type].multiplier);
                    //Difference is now equal to how many jobs are required to fulfill the deficit
                    if (this.fromTrees.find(type) !== this.fromTrees.end()) { //Item is a component of trees
                        //Subtract the amount of active tree felling jobs from the difference
                        difference -= this.treeFellingJobs.size();
                        //Pick a designated tree and go chop it
                        for (let treei = this.designatedTrees.begin(); treei !== this.designatedTrees.end() && difference > 0; ++treei) {
                            if (!treei.lock()) continue;

                            let componentInTree = false;
                            for (let compi = NatureObject.Presets[treei.lock().Type()].components.begin(); compi !== NatureObject.Presets[treei.lock().Type()].components.end(); ++compi) {
                                if (compi === type) {
                                    componentInTree = true;
                                    break;
                                }
                            }
                            if (componentInTree) {
                                let fellJob = (new Job("Fell tree", JobPriority.MED, 0, true));
                                fellJob.Attempts(50);
                                fellJob.ConnectToEntity(treei);
                                fellJob.DisregardTerritory();
                                fellJob.SetRequiredTool(Item.StringToItemCategory("Axe"));
                                fellJob.tasks.push(new Task(Action.MOVEADJACENT, treei.lock().Position(), treei));
                                fellJob.tasks.push(new Task(Action.FELL, treei.lock().Position(), treei));
                                JobManager.AddJob(fellJob);
                                --difference;
                                this.treeFellingJobs.push(
                                    fellJob, treei);
                                treei = this.designatedTrees.erase(treei);
                            }
                            // Fix MSVC iterator end overflow
                            if (treei === this.designatedTrees.end()) break; // Break out of for loop
                        }
                    } else if (this.fromEarth.find(type) !== this.fromEarth.end()) {
                        difference -= this.bogIronJobs.size();
                        if (this.designatedBog.size() > 0) {
                            for (let i = this.bogIronJobs.size(); i < Math.max(1, (this.designatedBog.size() / 100)) && difference > 0; ++i) {
                                let cIndex = ChooseIndex(this.designatedBog);
                                let coord = boost.next(this.designatedBog.begin(), cIndex);
                                let ironJob = (new Job("Gather bog iron", JobPriority.MED, 0, true));
                                ironJob.DisregardTerritory();
                                ironJob.tasks.push(new Task(Action.MOVE, coord));
                                ironJob.tasks.push(new Task(Action.BOGIRON));
                                ironJob.tasks.push(new Task(Action.STOCKPILEITEM));
                                JobManager.AddJob(ironJob);
                                this.bogIronJobs.push(ironJob);
                                --difference;
                            }
                        }
                    } else if (type === Item.StringToItemType("Water")) {
                        difference -= this.barrelWaterJobs.size();
                        if (difference > 0) {
                            let waterLocation = Game.i.FindWater(Camp.i.Center());
                            if (waterLocation.X() >= 0 && waterLocation.Y() >= 0) {
                                let barrelWaterJob = (new Job("Fill barrel", JobPriority.MED, 0, true));
                                barrelWaterJob.DisregardTerritory();
                                barrelWaterJob.tasks.push(new Task(Action.FIND, waterLocation, null, Item.StringToItemCategory("Barrel"), Constants.EMPTY));
                                barrelWaterJob.tasks.push(new Task(Action.MOVE));
                                barrelWaterJob.tasks.push(new Task(Action.TAKE));
                                barrelWaterJob.tasks.push(new Task(Action.FORGET));
                                barrelWaterJob.tasks.push(new Task(Action.MOVEADJACENT, waterLocation));
                                barrelWaterJob.tasks.push(new Task(Action.FILL, waterLocation));
                                barrelWaterJob.tasks.push(new Task(Action.STOCKPILEITEM));
                                JobManager.AddJob(barrelWaterJob);
                                this.barrelWaterJobs.push(barrelWaterJob);
                            }
                        }
                    } else {
                        //First get all the workshops capable of producing this product
                        let workshopRange = this.workshops.equal_range(this.producers[type]);
                        //By dividing the difference by the amount of workshops we get how many jobs each one should handle
                        let workshopCount = std.distance(workshopRange.first, workshopRange.second);
                        if (workshopCount > 0) {
                            //We clamp this value to 10, no point in queuing up more at a time
                            let jobCount = Math.min(Math.max(1, difference / workshopCount), 10);
                            //Now we just check that each workshop has 'jobCount' amount of jobs for this product
                            for (let worki = workshopRange.first; worki !== workshopRange.second && difference > 0; ++worki) {
                                let jobsFound = 0;
                                for (let jobi = 0; jobi < worki.second.lock().JobList().size(); ++jobi) {
                                    if ((worki.second.lock().JobList())[jobi] === type) {
                                        ++jobsFound;
                                        --difference;
                                    }
                                }
                                if (jobsFound < jobCount) {
                                    for (let i = 0; i < jobCount - jobsFound; ++i) {
                                        worki.second.lock().AddJob(type);
                                        if (Generate(9) < 8) --difference; //Adds a bit of inexactness (see orcyness) to production
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (this.dumpables.find(type) !== this.dumpables.end() &&
                difference < (this.minimums[type] <= 0 ? 100 : this.minimums[type]) * -2) {
                //The item is eligible for dumping and we have a surplus
                if (Generate(59) === 0) {
                    let spawningPool = Camp.i.spawningPool.lock();
                    if (spawningPool) {
                        let dumpJob = (new Job("Dump " + Item.ItemTypeToString(type), JobPriority.LOW));
                        let item = Game.i.FindItemByTypeFromStockpiles(type, spawningPool.Position()).lock();
                        if (item) {
                            dumpJob.Attempts(1);
                            dumpJob.ReserveEntity(item);
                            dumpJob.tasks.push(new Task(Action.MOVE, item.Position()));
                            dumpJob.tasks.push(new Task(Action.TAKE, item.Position(), item));
                            dumpJob.tasks.push(new Task(Action.MOVEADJACENT, spawningPool.GetContainer().Position()));
                            dumpJob.tasks.push(new Task(Action.PUTIN, spawningPool.GetContainer().Position(), spawningPool.GetContainer()));
                            JobManager.AddJob(dumpJob);
                        }
                    }
                }
            }
        }

        //We need to check our treefelling jobs for successes and cancellations
        for (let jobi = this.treeFellingJobs.begin(); jobi !== this.treeFellingJobs.end();) { //*Phew*
            if (!jobi.first.lock()) {
                //Job no longer exists, so remove it from our list
                //If the tree still exists, it means that the job was cancelled, so add
                //the tree back to our designations.
                if (jobi.second.lock()) {
                    this.designatedTrees.push(jobi.second);
                }
                jobi = this.treeFellingJobs.erase(jobi);
            } else {
                ++jobi;
            }
        }

        for (let jobi = this.bogIronJobs.begin(); jobi !== this.bogIronJobs.end();) {
            if (!jobi.lock()) {
                jobi = this.bogIronJobs.erase(jobi);
            } else {
                ++jobi;
            }
        }

        for (let jobi = this.barrelWaterJobs.begin(); jobi !== this.barrelWaterJobs.end();) {
            if (!jobi.lock()) {
                jobi = this.barrelWaterJobs.erase(jobi);
            } else {
                ++jobi;
            }
        }
    }
    UpdateQuantity(type, quantity) {
        //If we receive an update about a new type, it should be made available
        //Constructions issue a 0 quantity update when they are built
        if (type >= 0 && type < Item.Presets.length) {
            if (Globals.DEBUG) {
                console.log("Quantity update " , Item.ItemTypeToString(type) , "\n");
            } /*#endif*/

            if (this.typeQuantities[type] === -1) {
                this.typeQuantities[type] = 0;
                Game.i.UpdateFarmPlotSeedAllowances(type);
            }

            this.typeQuantities[type] += quantity;
            if (Globals.DEBUG) {
                console.log("Type " , type , " quantity now " , this.typeQuantities[type] , "\n");
            } /*#endif*/
            for (let cati = Item.Presets[type].categories.begin(); cati !== Item.Presets[type].categories.end(); ++cati) {
                if (this.categoryQuantities[cati] === -1) this.categoryQuantities[cati] = 0;
                this.categoryQuantities[cati] += quantity;
                if (Globals.DEBUG) {
                    console.log(Item.ItemCategoryToString(cati) , " " , quantity , "\n");
                } /*#endif*/
            }
            if (Globals.DEBUG) {
                console.log(Item.ItemTypeToString(type) , " " , quantity , "\n");
            } /*#endif*/
        }
    }

    CategoryQuantity(cat) { return this.categoryQuantities[cat]; }
    TypeQuantity(type) { return this.typeQuantities[type]; }

    Producables() { return this.producables; }

    UpdateWorkshops(cons, add) {
        if (add) {
            this.workshops.insert((cons.lock().Type(), cons));
        } else {
            //Because it is being removed, this has been called from a destructor which means
            //that the construction no longer exists, and the weak_ptr should give !lock
            for (let worki = this.workshops.begin(); worki !== this.workshops.end(); ++worki) {
                if (!worki.second.lock()) {
                    this.workshops.erase(worki);
                    break;
                }
            }
        }
    }
    Minimum(item) { return this.minimums[item]; }

    AdjustMinimum(item, value) {
        this.minimums[item] += value;
        if (this.minimums[item] < 0) this.minimums[item] = 0;
    }

    SetMinimum(item, value) {
        this.minimums[item] = Math.max(0, value);
    }

    UpdateTreeDesignations(nObj, add) {
        let natObj = nObj.lock();
        if (!natObj) 
            return;
        if (add) {
            this.designatedTrees.push(natObj);
            return;
        } 

        for (let desi of this.designatedTrees) {
            //Now that we're iterating through the designations anyway, might as well
            //do some upkeeping
            if (!desi.lock()) 
                desi = this.designatedTrees.splice(this.designatedTrees.indexOf(desi),1);
            else if (desi.lock() === natObj) {
                this.designatedTrees.splice(this.designatedTrees.indexOf(desi),1);
                break;
            } else ++desi;
        }     
    }

    UpdateBogDesignations(coord, add) {
        if (add) {
            if (GameMap.i.GetType(coord) === TileType.TILEBOG) {
                this.designatedBog.insert(coord);
            }
        } else if (!add && this.designatedBog.find(coord) !== this.designatedBog.end()) {
            this.designatedBog.erase(coord);
        }
    }

    save(ar, /*version*/) {
        ar & this.categoryQuantities;
        ar & this.typeQuantities;
        ar & this.minimums;
        ar & this.producables;
        ar & this.producers;
        ar & this.workshops;
        ar & this.fromTrees;
        ar & this.fromEarth;
        ar & this.designatedTrees;
        ar & this.treeFellingJobs;
        ar & this.designatedBog;
        ar & this.bogIronJobs;
        ar & this.barrelWaterJobs;
    }

    load(ar, version) {
        ar & this.categoryQuantities;
        ar & this.typeQuantities;
        ar & this.minimums;
        ar & this.producables;
        ar & this.producers;
        ar & this.workshops;
        ar & this.fromTrees;
        ar & this.fromEarth;
        ar & this.designatedTrees;
        ar & this.treeFellingJobs;
        ar & this.designatedBog;
        ar & this.bogIronJobs;
        if (version >= 1) {
            ar & this.barrelWaterJobs;
        }
    }
}
StockManager.CLASS_VERSION = 1;
Singletonify(StockManager);
