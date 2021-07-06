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


import { Stockpile } from "./Stockpile.js";

export class FarmPlot extends Stockpile {

    tilled = false;
    /**std.map < Coordinate, int > growth;*/
    growth = new Map();
    /**std.map < ItemType, bool > allowedSeeds;*/
    allowedSeds = new Map();

    constructor(type = 0, symbol = '?', target = Coordinate.zero) {
            super(type, symbol, target);

            //Farmplots are a form of stockpile, disallow all items so they don't get stored here
            for (let i = 0; i < Game.i.ItemCatCount; ++i) {
                allowed[i] = false;
            }

            //Allow all discovered seeds
            for (let i = 0; i < Game.i.ItemTypeCount; ++i) {
                if (Item.Presets[i].categories.find(Item.StringToItemCategory("Seed")) !== Item.Presets[i].categories.end()) {
                    if (StockManager.TypeQuantity(i) >= 0)
                        allowedSeeds.insert(std.pair < ItemType, bool > (i, false));
                }
            }
        }
        /**(Coordinate upleft, TCODConsole * the_console)  */
    Draw(upleft, the_console) {
        let screenx, screeny;

        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (map.GetConstruction(p) === uid) {
                    screenx = x - upleft.X();
                    screeny = y - upleft.Y();
                    if (screenx >= 0 && screenx < the_console.getWidth() && screeny >= 0 &&
                        screeny < the_console.getHeight()) {
                        the_console.setCharForeground(screenx, screeny, Color.darkAmber);
                        the_console.setChar(screenx, screeny, (graphic[1]));

                        if (!containers[p].empty()) {
                            let item = containers[p].GetFirstItem();
                            if (item.lock()) {
                                the_console.putCharEx(screenx, screeny, item.lock().GetGraphic(), item.lock().Color(), Color.black);
                            }
                        }

                        let gray = Math.round(50 - cos(strobe) * 50);
                        the_console.setCharBackground(screenx, screeny, Color(gray, gray, gray));

                    }
                }
            }
        }
    }
    Update() {
        if (!tilled) graphic[1] = 176;
        for (let containerIt = containers.begin(); containerIt !== containers.end(); ++containerIt) {
            ++growth[containerIt.first];
            //Normal plants ought to grow seed . young plant . mature plant . fruits, which means 3
            //growths before giving fruit. 3 * 2 months means 6 months from seed to fruits
            if (!containerIt.second.empty() && growth[containerIt.first] > Constants.MONTH_LENGTH * 2 && Random.i.Generate(4) === 0) {
                boost.weak_ptr < OrganicItem > plant(boost.static_pointer_cast < OrganicItem > (containerIt.second.GetFirstItem().lock()));
                if (plant.lock() && !plant.lock().Reserved()) {
                    if (Random.i.Generate(9) === 0) { //Chance for the plant to die
                        containerIt.second.RemoveItem(plant);
                        Game.i.CreateItem(plant.lock().Position(), Item.StringToItemType("Dead plant"), true);
                        Game.i.RemoveItem(plant);
                        growth[containerIt.first] = 0;
                    } else {
                        if (plant.lock().Growth() > -1) { //Plant is stil growing
                            let newPlant = Game.i.CreateItem(plant.lock().Position(), plant.lock().Growth());
                            containerIt.second.RemoveItem(plant);
                            containerIt.second.AddItem(Game.i.GetItem(newPlant));
                            Game.i.RemoveItem(plant);
                            growth[containerIt.first] = 0;
                        } else { //Plant has grown to full maturity, and should be harvested
                            boost.shared_ptr < Job > harvestJob(new Job("Harvest", HIGH, 0, true));
                            harvestJob.ReserveEntity(plant);
                            harvestJob.tasks.push(Task(MOVE, plant.lock().Position()));
                            harvestJob.tasks.push(Task(TAKE, plant.lock().Position(), plant));
                            harvestJob.tasks.push(Task(HARVEST, plant.lock().Position(), plant));
                            JobManager.AddJob(harvestJob);
                            growth[containerIt.first] = 0;
                        }
                    }
                }
            }
        }
    }
    Use() {
        ++progress;
        if (progress >= 100) {
            tilled = true;
            graphic[1] = '~';
            progress = 0;

            let seedsLeft = true;
            let containerIt = containers.begin();
            while (seedsLeft && containerIt !== containers.end()) {
                while (!containerIt.second.empty() || reserved[containerIt.first]) {
                    ++containerIt;
                    if (containerIt === containers.end()) return 100;
                }
                seedsLeft = false;
                if (containerIt.first.X() >= 0 && containerIt.first.Y() >= 0 && containerIt.second) {
                    for (let seedi = allowedSeeds.begin(); seedi !== allowedSeeds.end(); ++seedi) {
                        growth[containerIt.first] = -(Constants.MONTH_LENGTH / 2) + Random.i.Generate(Constants.MONTH_LENGTH - 1);
                        if (seedi.second) {
                            let seed = Game.i.FindItemByTypeFromStockpiles(seedi.first, Center());
                            if (seed.lock()) {
                                boost.shared_ptr < Job > plantJob(new Job("Plant " + Item.ItemTypeToString(seedi.first)));
                                plantJob.ReserveEntity(seed);
                                plantJob.ReserveSpot(boost.static_pointer_cast < Stockpile > (shared_from_this()), containerIt.first, seed.lock().Type());
                                plantJob.tasks.push(Task(MOVE, seed.lock().Position()));
                                plantJob.tasks.push(Task(TAKE, seed.lock().Position(), seed));
                                plantJob.tasks.push(Task(MOVE, containerIt.first));
                                plantJob.tasks.push(Task(PUTIN, containerIt.first, containerIt.second));
                                JobManager.AddJob(plantJob);
                                seedsLeft = true;
                                break; //Break out of for-loop, we found a seed to plant
                            }
                        }
                    }
                } else { return 100; } //Container invalid 
            }
            return 100;
        }
        return progress;
    }

    AllowedSeeds() { return allowedSeeds; }

    AllowSeed(type, bool) { allowedSeeds[type] = value; }

    SwitchAllowed(index) {
        let it = allowedSeeds.begin();
        for (let i = 0; i < index && it !== allowedSeeds.end(); i++) {
            it++;
        }
        if (it !== allowedSeeds.end()) {
            allowedSeeds[it.first] = !allowedSeeds[it.first];
        }
    }

    SeedAllowed(type) { return allowedSeeds[type]; }

    AcceptVisitor(visitor) {
        visitor.Visit(this);
    }

    Full(type) {
        for (let ix = a.X(); ix <= b.X(); ++ix) {
            for (let iy = a.Y(); iy <= b.Y(); ++iy) {
                let p = new Coordinate(ix, iy);
                if (map.GetConstruction(p) === uid) {
                    //If the stockpile has hit the limit then it's full for this itemtype
                    if (type !== 1) {
                        for (let cati = Item.Presets[type].categories.begin(); cati !== Item.Presets[type].categories.end(); ++cati) {
                            if (GetLimit(cati) > 0 && amount[cati] >= GetLimit(cati)) return true;
                        }
                    }

                    //If theres a free space then it obviously is not full
                    if (containers[p].empty() && !reserved[p]) return false;

                    //Check if a container exists for this ItemCategory that isn't full
                    let item = containers[p].GetFirstItem();
                    if (item.lock() && item.lock().IsCategory(Item.StringToItemCategory("Container"))) {
                        let container = boost.static_pointer_cast < Container > (item.lock());
                        if (type !== -1 && container.IsCategory(Item.Presets[type].fitsin) &&
                            container.Capacity() >= Item.Presets[type].bulk) return false;
                    }
                }
            }
        }
        return true;
    }

    FreePosition() {
        if (containers.size() > 0) {
            //First attempt to find a random position
            for (let i = 0; i < Math.max(1, containers.size() / 4); ++i) {
                let conti = boost.next(containers.begin(), Random.ChooseIndex(containers));
                if (conti !== containers.end() && conti.second.empty() && !reserved[conti.first])
                    return conti.first;
            }
            //If that fails still iterate through each position because a free position _should_ exist
            for (let ix = a.X(); ix <= b.X(); ++ix) {
                for (let iy = a.Y(); iy <= b.Y(); ++iy) {
                    let p = new Coordinate(ix, iy);
                    if (map.GetConstruction(p) === uid) {
                        if (containers[p].empty() && !reserved[p]) return p;
                    }
                }
            }
        }
        return Coordinate(-1, -1);
    }

    save(ar, version) {
        ar & boost.serialization.base_object < Stockpile > (this);
        ar & tilled;
        ar & allowedSeeds;
        ar & growth;
    }

    load(ar, version) {
        ar & boost.serialization.base_object < Stockpile > (this);
        ar & tilled;
        ar & allowedSeeds;
        ar & growth;
    }
    static CLASS_VERSION = 0;
};