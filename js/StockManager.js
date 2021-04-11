/* Copyright 2010-2011 Ilkka Halila
This file is part of Goblin Camp.

Goblin Camp is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Goblin Camp is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License 
along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/




class StockManager {
    GC_SERIALIZABLE_CLASS


    /** std.map <ItemCategory, int>**/
    categoryQuantities = new Map();
    /** std.map <ItemType, int>**/
    typeQuantities = new Map();
    /** std.map <ItemType, int>**/
    minimums = new Map(); //If minimum is -1, the product isn't available yet
    /** std.set <ItemType>**/
    producables = new Set();
    /** std.set <ItemType>**/
    dumpables = new Set();
    /** std.map <ItemType, ConstructionType>**/
    producers = new Map();
    /** std.multimap <ConstructionType, boost.weak_ptr < Construction>>**/
    workshops = new Map();
    /** std.set <ItemType>**/
    fromTrees = new Set(); //Trees and stones are a special case, possibly fish in the future as well
    /** std.set <ItemType>**/
    fromEarth = new Set();
    /** std.list <boost.weak_ptr < NatureObject>>**/
    designatedTrees = [];
    /** std.list <std.pair < boost.weak_ptr < Job>, boost.weak_ptr < NatureObject>>>**/
    treeFellingJobs = [];
    /** std.set <Coordinate>**/
    designatedBog = new Set();
    /** std.list <boost.weak_ptr < Job>>**/
    bogIronJobs = [];
    /** std.list <boost.weak_ptr < Job>>**/
    barrelWaterJobs = [];
    //public extends 


    static CLASS_VERSION = 1;


    constructor() {
        Init();
    }

    Init() {
        //Initialize all quantities to -1 (== not visible in stocks screen)
        for (let i = 0; i < Item.Categories.size(); ++i) {
            categoryQuantities.insert(std.pair < ItemCategory, int > (i, -1));
        }
        for (let i = 0; i < Item.Presets.size(); ++i) {
            typeQuantities.insert(std.pair < ItemType, int > (i, -1));
            if (DEBUG) {
                std.cout << "Initializing typeQuantity " << Item.ItemTypeToString(i) << " to " << typeQuantities[i] << "\n";
            }
        }

        //Figure out which items are producable, this is so that we won't show _all_ item types in the
        //stock manager screen. Things such as trash and plant mid-growth types won't show this way
        for (let itemIndex = 0; itemIndex < Item.Presets.size(); ++itemIndex) {
            let item = static_cast < ItemType > (itemIndex);

            //Now figure out if this item is producable either from a workshop, or designations
            let producerFound = false;

            //Bog iron is a hard coded special case, for now. TODO: Think about this
            if (boost.iequals(Item.Presets[itemIndex].name, "Bog iron") ||
                boost.iequals(Item.Presets[itemIndex].name, "Water")) {
                producables.insert(item);
                if (boost.iequals(Item.Presets[itemIndex].name, "Bog iron"))
                    fromEarth.insert(item);
                producerFound = true;
                UpdateQuantity(item, 0);
            }

            for (let cons = 0; cons < Construction.Presets.size(); ++cons) { //Look through all constructions
                for (let prod = 0; prod < Construction.Presets[cons].products.size(); ++prod) { //Products
                    if (Construction.Presets[cons].products[prod] == item) {
                        //This construction has this itemtype as a product
                        producables.insert(item);
                        producers.insert(std.pair < ItemType, ConstructionType > (item, static_cast < ConstructionType > (cons)));
                        producerFound = true;
                        break;
                    }
                }
            }

            if (!producerFound) { //Haven't found a producer, so check NatureObjects if a tree has this item as a component
                for (let natObj = 0; natObj < NatureObject.Presets.size(); ++natObj) {
                    if (NatureObject.Presets[natObj].tree) {
                        for (let compi = NatureObject.Presets[natObj].components.begin(); compi != NatureObject.Presets[natObj].components.end(); ++compi) {
                            if (compi == item) {
                                producables.insert(item);
                                fromTrees.insert(item);
                                UpdateQuantity(item, 0);
                            }
                        }
                    }
                }

                //Anything not in the Misc. category can be shown in the stock manager dialog
                if (Item.Presets[itemIndex].categories.find(Item.StringToItemCategory("Misc.")) == Item.Presets[itemIndex].categories.end())
                    producables.insert(item);
            }

            //Flag all inorganic materials for dumping (except seeds which are technically not organic)
            if (!Item.Presets[itemIndex].organic &&
                Item.Presets[itemIndex].categories.find(Item.StringToItemCategory("Seed")) == Item.Presets[itemIndex].categories.end())
                dumpables.insert(item);
        }
    }

    Update() {
        //Check all ItemTypes
        for (let type = 0; type < static_cast < int > (Item.Presets.size()); ++type) {
            let difference = minimums[type] - typeQuantities[type];
            if (producables.find(type) != producables.end()) {
                if (minimums[type] > 0 && difference > 0) { //Only consider production if we have a positive minimum
                    difference = Math.max(1, difference / Item.Presets[type].multiplier);
                    //Difference is now equal to how many jobs are required to fulfill the deficit
                    if (fromTrees.find(type) != fromTrees.end()) { //Item is a component of trees
                        //Subtract the amount of active tree felling jobs from the difference
                        difference -= treeFellingJobs.size();
                        //Pick a designated tree and go chop it
                        for (let treei = designatedTrees.begin(); treei != designatedTrees.end() && difference > 0; ++treei) {
                            if (!treei.lock()) continue;

                            let componentInTree = false;
                            for (let compi = NatureObject.Presets[treei.lock().Type()].components.begin(); compi != NatureObject.Presets[treei.lock().Type()].components.end(); ++compi) {
                                if (compi == type) {
                                    componentInTree = true;
                                    break;
                                }
                            }
                            if (componentInTree) {
                                let fellJob = (new Job("Fell tree", MED, 0, true));
                                fellJob.Attempts(50);
                                fellJob.ConnectToEntity(treei);
                                fellJob.DisregardTerritory();
                                fellJob.SetRequiredTool(Item.StringToItemCategory("Axe"));
                                fellJob.tasks.push_back(Task(MOVEADJACENT, treei.lock().Position(), treei));
                                fellJob.tasks.push_back(Task(FELL, treei.lock().Position(), treei));
                                JobManager.AddJob(fellJob);
                                --difference;
                                treeFellingJobs.push_back(
                                    fellJob, treei);
                                treei = designatedTrees.erase(treei);
                            }
                            // Fix MSVC iterator end overflow
                            if (treei == designatedTrees.end()) break; // Break out of for loop
                        }
                    } else if (fromEarth.find(type) != fromEarth.end()) {
                        difference -= bogIronJobs.size();
                        if (designatedBog.size() > 0) {
                            for (let i = bogIronJobs.size(); i < Math.max(1, (int)(designatedBog.size() / 100)) && difference > 0; ++i) {
                                let cIndex = Random.ChooseIndex(designatedBog);
                                let coord = boost.next(designatedBog.begin(), cIndex);
                                boost.shared_ptr < Job > ironJob(new Job("Gather bog iron", MED, 0, true));
                                ironJob.DisregardTerritory();
                                ironJob.tasks.push_back(Task(MOVE, coord));
                                ironJob.tasks.push_back(Task(BOGIRON));
                                ironJob.tasks.push_back(Task(STOCKPILEITEM));
                                JobManager.AddJob(ironJob);
                                bogIronJobs.push_back(ironJob);
                                --difference;
                            }
                        }
                    } else if (type == Item.StringToItemType("Water")) {
                        difference -= barrelWaterJobs.size();
                        if (difference > 0) {
                            let waterLocation = Game.FindWater(Camp.Center());
                            if (waterLocation.X() >= 0 && waterLocation.Y() >= 0) {
                                boost.shared_ptr < Job > barrelWaterJob(new Job("Fill barrel", MED, 0, true));
                                barrelWaterJob.DisregardTerritory();
                                barrelWaterJob.tasks.push_back(Task(FIND, waterLocation, null, Item.StringToItemCategory("Barrel"), EMPTY));
                                barrelWaterJob.tasks.push_back(Task(MOVE));
                                barrelWaterJob.tasks.push_back(Task(TAKE));
                                barrelWaterJob.tasks.push_back(Task(FORGET));
                                barrelWaterJob.tasks.push_back(Task(MOVEADJACENT, waterLocation));
                                barrelWaterJob.tasks.push_back(Task(FILL, waterLocation));
                                barrelWaterJob.tasks.push_back(Task(STOCKPILEITEM));
                                JobManager.AddJob(barrelWaterJob);
                                barrelWaterJobs.push_back(barrelWaterJob);
                            }
                        }
                    } else {
                        //First get all the workshops capable of producing this product
                        let workshopRange = workshops.equal_range(producers[type]);
                        //By dividing the difference by the amount of workshops we get how many jobs each one should handle
                        let workshopCount = std.distance(workshopRange.first, workshopRange.second);
                        if (workshopCount > 0) {
                            //We clamp this value to 10, no point in queuing up more at a time
                            let jobCount = Math.min(Math.max(1, difference / workshopCount), 10);
                            //Now we just check that each workshop has 'jobCount' amount of jobs for this product
                            for (let worki = workshopRange.first; worki != workshopRange.second && difference > 0; ++worki) {
                                let jobsFound = 0;
                                for (let jobi = 0; jobi < worki.second.lock().JobList().size(); ++jobi) {
                                    if ((worki.second.lock().JobList())[jobi] == type) {
                                        ++jobsFound;
                                        --difference;
                                    }
                                }
                                if (jobsFound < jobCount) {
                                    for (let i = 0; i < jobCount - jobsFound; ++i) {
                                        worki.second.lock().AddJob(type);
                                        if (Random.Generate(9) < 8) --difference; //Adds a bit of inexactness (see orcyness) to production
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (dumpables.find(type) != dumpables.end() &&
                difference < (minimums[type] <= 0 ? 100 : minimums[type]) * -2) {
                //The item is eligible for dumping and we have a surplus
                if (Random.Generate(59) == 0) {
                    let spawningPool;
                    if (spawningPool = Camp.spawningPool.lock()) {
                        let dumpJob = (new Job("Dump " + Item.ItemTypeToString(type), LOW));
                        let item = Game.FindItemByTypeFromStockpiles(type, spawningPool.Position()).lock();
                        if (item) {
                            dumpJob.Attempts(1);
                            dumpJob.ReserveEntity(item);
                            dumpJob.tasks.push_back(Task(MOVE, item.Position()));
                            dumpJob.tasks.push_back(Task(TAKE, item.Position(), item));
                            dumpJob.tasks.push_back(Task(MOVEADJACENT, spawningPool.GetContainer().Position()));
                            dumpJob.tasks.push_back(Task(PUTIN, spawningPool.GetContainer().Position(), spawningPool.GetContainer()));
                            JobManager.AddJob(dumpJob);
                        }
                    }
                }
            }
        }

        //We need to check our treefelling jobs for successes and cancellations
        for (let jobi = treeFellingJobs.begin(); jobi != treeFellingJobs.end();) { //*Phew*
            if (!jobi.first.lock()) {
                //Job no longer exists, so remove it from our list
                //If the tree still exists, it means that the job was cancelled, so add
                //the tree back to our designations.
                if (jobi.second.lock()) {
                    designatedTrees.push_back(jobi.second);
                }
                jobi = treeFellingJobs.erase(jobi);
            } else {
                ++jobi;
            }
        }

        for (let jobi = bogIronJobs.begin(); jobi != bogIronJobs.end();) {
            if (!jobi.lock()) {
                jobi = bogIronJobs.erase(jobi);
            } else {
                ++jobi;
            }
        }

        for (let jobi = barrelWaterJobs.begin(); jobi != barrelWaterJobs.end();) {
            if (!jobi.lock()) {
                jobi = barrelWaterJobs.erase(jobi);
            } else {
                ++jobi;
            }
        }
    }
    UpdateQuantity(type, quantity) {
        //If we receive an update about a new type, it should be made available
        //Constructions issue a 0 quantity update when they are built
        if (type >= 0 && type < static_cast < int > (Item.Presets.size())) {
            if (DEBUG) {
                std.cout << "Quantity update " << Item.ItemTypeToString(type) << "\n";
            } /*#endif*/

            if (typeQuantities[type] == -1) {
                typeQuantities[type] = 0;
                Game.UpdateFarmPlotSeedAllowances(type);
            }

            typeQuantities[type] += quantity;
            if (DEBUG) {
                std.cout << "Type " << type << " quantity now " << typeQuantities[type] << "\n";
            } /*#endif*/
            for (let cati = Item.Presets[type].categories.begin(); cati != Item.Presets[type].categories.end(); ++cati) {
                if (categoryQuantities[cati] == -1) categoryQuantities[cati] = 0;
                categoryQuantities[cati] += quantity;
                if (DEBUG) {
                    std.cout << Item.ItemCategoryToString(cati) << " " << quantity << "\n";
                } /*#endif*/
            }
            if (DEBUG) {
                std.cout << Item.ItemTypeToString(type) << " " << quantity << "\n";
            } /*#endif*/
        }
    }

    CategoryQuantity(cat) { return categoryQuantities[cat]; }
    TypeQuantity(type) { return typeQuantities[type]; }

    Producables() { return producables; }

    UpdateWorkshops(cons, add) {
        if (add) {
            workshops.insert((cons.lock().Type(), cons));
        } else {
            //Because it is being removed, this has been called from a destructor which means
            //that the construction no longer exists, and the weak_ptr should give !lock
            for (let worki = workshops.begin(); worki != workshops.end(); ++worki) {
                if (!worki.second.lock()) {
                    workshops.erase(worki);
                    break;
                }
            }
        }
    }
    Minimum(item) { return minimums[item]; }

    AdjustMinimum(item, value) {
        minimums[item] += value;
        if (minimums[item] < 0) minimums[item] = 0;
    }
    SetMinimum(item, value) {
        minimums[item] = Math.max(0, value);
    }


    UpdateTreeDesignations(nObj, add) {
        let natObj;
        if (natObj = nObj.lock()) {
            if (add) {
                designatedTrees.push_back(natObj);
            } else {
                for (let desi = designatedTrees.begin(); desi != designatedTrees.end();) {
                    //Now that we're iterating through the designations anyway, might as well
                    //do some upkeeping
                    if (!desi.lock()) desi = designatedTrees.erase(desi);
                    else if (desi.lock() == natObj) {
                        designatedTrees.erase(desi);
                        break;
                    } else ++desi;
                }
            }
        }
    }

    UpdateBogDesignations(coord, add) {
        if (add) {
            if (Map.GetType(coord) == TILEBOG) {
                designatedBog.insert(coord);
            }
        } else if (!add && designatedBog.find(coord) != designatedBog.end()) {
            designatedBog.erase(coord);
        }
    }

    Reset() {
        delete instance;
        instance = 0;
    }

    save(ar, version) {
        ar & categoryQuantities;
        ar & typeQuantities;
        ar & minimums;
        ar & producables;
        ar & producers;
        ar & workshops;
        ar & fromTrees;
        ar & fromEarth;
        ar & designatedTrees;
        ar & treeFellingJobs;
        ar & designatedBog;
        ar & bogIronJobs;
        ar & barrelWaterJobs;
    }

    load(ar, version) {
        ar & categoryQuantities;
        ar & typeQuantities;
        ar & minimums;
        ar & producables;
        ar & producers;
        ar & workshops;
        ar & fromTrees;
        ar & fromEarth;
        ar & designatedTrees;
        ar & treeFellingJobs;
        ar & designatedBog;
        ar & bogIronJobs;
        if (version >= 1) {
            ar & barrelWaterJobs;
        }
    }
}