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


// import "./Construction.js";
// import "./UI/Dialog.js"
// import "./UI/UIComponents.js"

// import "./data/Serialization.js"

class SpawningPool extends Construction {


    /**Dialog * */
    dialog;
    /**UIContainer * */
    container;
    dumpFilth = false;
    dumpCorpses = false;
    a = Coordinate.zero;
    b = Coordinate.zero;
    expansion = 0;
    filth = 0;
    corpses = 0;
    spawns = 0;
    expansionLeft = 0;
    corruptionLeft = 0;
    spawnsLeft = 0;
    /**boost.shared_ptr < Container >*/
    corpseContainer;
    jobCount = 0;
    burn = 0;
    static CLASS_VERSION = 0;


    /** 
        SpawningPool(ConstructionType = 0,
            const Coordinate & = zero);
    SpawningPool.SpawningPool(ConstructionType type,
            const Coordinate & target): Construction(type, target),
            */
    constructor(type = 0, target = Coordinate.zero) {

            a = (target);
            b = (target);

            container = new UIContainer([], 0, 0, 16, 11);
            dialog = new Dialog(container, "Spawning Pool", 16, 10);
            container.AddComponent(new ToggleButton("Dump filth", boost.bind(SpawningPool.ToggleDumpFilth, this),
                boost.bind(SpawningPool.DumpFilth, this), 2, 2, 12));
            container.AddComponent(new ToggleButton("Dump corpses", boost.bind(SpawningPool.ToggleDumpCorpses, this),
                boost.bind(SpawningPool.DumpCorpses, this), 1, 6, 14));
            corpseContainer = boost.shared_ptr < Container > (new Container(target, 0, 1000, -1));
        }
        /**
            Panel * GetContextMenu();
        Panel * SpawningPool.
        */
    GetContextMenu() {
        return dialog;
    }

    /**    static bool DumpFilth(SpawningPool * );
    bool SpawningPool.*/
    static DumpFilth(sp) { return sp.dumpFilth; }
        /**static void ToggleDumpFilth(SpawningPool * );
void SpawningPool.*/
    static ToggleDumpFilth(sp) { sp.dumpFilth = !sp.dumpFilth; }
        /**static bool DumpCorpses(SpawningPool * );
bool SpawningPool.*/
    static DumpCorpses(sp) { return sp.dumpCorpses; }
        /**static void ToggleDumpCorpses(SpawningPool * );
void SpawningPool.*/
    static ToggleDumpCorpses(sp) { sp.dumpCorpses = !sp.dumpCorpses; }
        //private:

    /**Coordinate SpawningPool.SpawnLocation*/
    SpawnLocation() {
        let dirs = [WEST, EAST, NORTH, SOUTH];
        std.random_shuffle(dirs, dirs + 4); //shuffle to avoid predictability

        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (map.GetConstruction(p) === uid) {
                    for (let i = 0; i < 4; ++i) {
                        let candidate = p + Coordinate.DirectionToCoordinate(dirs[i]);
                        if (map.IsWalkable(candidate))
                            return candidate;
                    }
                }
            }
        }
        return undefined;
    }

    Update() {
        if (condition > 0) {

            //Generate jobs
            if (jobCount < 4) {
                if (dumpFilth && Random.i.GenerateConstants.UPDATES_PER_SECOND * 4) === 0) {
                    if (Game.i.filthNodes.size() > 0) {
                        boost.shared_ptr < Job > filthDumpJob(new Job("Dump filth", MED));
                        filthDumpJob.SetRequiredTool(Item.StringToItemCategory("Bucket"));
                        filthDumpJob.Attempts(1);
                        let filthLocation = Game.i.FindFilth(Position());
                        filthDumpJob.tasks.push(Task(MOVEADJACENT, filthLocation));
                        filthDumpJob.tasks.push(Task(FILL, filthLocation));

                        if (filthLocation !== undefined) {
                            filthDumpJob.tasks.push(Task(MOVEADJACENT, Position()));
                            filthDumpJob.tasks.push(Task(POUR, Position()));
                            filthDumpJob.tasks.push(Task(STOCKPILEITEM));
                            filthDumpJob.ConnectToEntity(shared_from_this());
                            ++jobCount;
                            JobManager.AddJob(filthDumpJob);
                        }
                    }
                }
                if (dumpCorpses && StockManager.CategoryQuantity(Item.StringToItemCategory("Corpse")) > 0 &&
                    Random.i.GenerateConstants.UPDATES_PER_SECOND * 4) === 0) {
                    boost.shared_ptr < Job > corpseDumpJob(new Job("Dump corpse", MED));
                    corpseDumpJob.tasks.push(Task(FIND, Position(), null, Item.StringToItemCategory("Corpse")));
                    corpseDumpJob.tasks.push(Task(MOVE));
                    corpseDumpJob.tasks.push(Task(TAKE));
                    corpseDumpJob.tasks.push(Task(FORGET));
                    corpseDumpJob.tasks.push(Task(MOVEADJACENT, corpseContainer.Position()));
                    corpseDumpJob.tasks.push(Task(PUTIN, corpseContainer.Position(), corpseContainer));
                    corpseDumpJob.ConnectToEntity(shared_from_this());
                    ++jobCount;
                    JobManager.AddJob(corpseDumpJob);
                }
            }

            //Spawn / Expand
            if (map.GetFilth(pos).lock() && map.GetFilth(pos).lock().Depth() > 0) {
                let filthNode = map.GetFilth(pos).lock();
                filth += filthNode.Depth();
                Stats.AddPoints(filthNode.Depth());
                corruptionLeft += filthNode.Depth() * Math.min(100 * filth, 10000);
                filthNode.Depth(0);
            }
            while (!corpseContainer.empty()) {
                let corpse = corpseContainer.GetFirstItem();
                let actualItem;
                if (actualItem = corpse.lock()) {
                    if (actualItem.IsCategory(Item.StringToItemCategory("corpse"))) {
                        ++corpses;
                        Stats.AddPoints(100);
                    }
                }
                corpseContainer.RemoveItem(corpse);
                Game.i.RemoveItem(corpse);
                for (let i = 0; i < Random.i.Generate(1, 2); ++i)
                    corruptionLeft += 1000 * Math.min(Math.max(1, corpses), 50);
            }

            if ((corpses * 10) + filth >= 30) {
                let newSpawns = (corpses * 10 + filth) / 30;
                spawnsLeft += newSpawns;
                expansionLeft += newSpawns;
                corpses = 0;
                filth = 0;
            }
        }
        if (burn > 0) {
            if (Random.i.Generate(2) === 0) --burn;
            if (burn > 5000) {
                Expand(false);
                Game.i.CreateFire(Random.ChooseInRectangle(a, b));
                if (Random.i.Generate(9) === 0) {
                    let spawnLocation = SpawningPool.SpawnLocation();
                    if (spawnLocation !== undefined && Random.i.Generate(20) === 0)
                        Game.i.CreateNPC(spawnLocation, NPC.StringToNPCType("fire elemental"));
                }
            }
        }

        if (corruptionLeft > 0) {
            map.Corrupt(Position(), 10);
            corruptionLeft -= 10;
            if (Random.i.Generate(500) === 0)
                map.Corrupt(Position(), 5000); //Random surges to make "tentacles" of corruption appear
        }

        if (Random.i.GenerateConstants.UPDATES_PER_SECOND * 5) === 0) {
            if (expansionLeft > 0) {
                Expand(true);
                --expansionLeft;
            }
            if (spawnsLeft > 0) {
                Spawn();
                --spawnsLeft;
            }
        }
    }

    Expand(message = true) {
            let dirs = [WEST, EAST, NORTH, SOUTH];
            std.random_shuffle(dirs, dirs + 4); //shuffle to avoid predictability
            let location = undefinedCoordinate;
            for (let i = 0; location === undefinedCoordinate && i < 10; ++i) {
                let candidate = Random.ChooseInRectangle(a - 1, b + 1);
                //TODO factorize with IsAdjacent(p,uid) in StockPile; could go in Construction
                if (map.GetConstruction(candidate) !== uid) {
                    for (i = 0; i < 4; ++i)
                        if (map.GetConstruction(candidate + Coordinate.DirectionToCoordinate(dirs[i])) === uid)
                            location = candidate;
                }
            }

            if (location !== undefinedCoordinate) {
                ++expansion;
                if (message) Announce.i.AddMsg("The spawning pool expands", Color.darkGreen, location);
                a = Coordinate.min(a, location);
                b = Coordinate.max(b, location);

                //Swallow nature objects
                if (map.GetNatureObject(location) >= 0) {
                    Game.i.RemoveNatureObject(Game.i.natureList[map.GetNatureObject(location)]);
                }
                //Destroy buildings
                if (map.GetConstruction(location) >= 0) {
                    let construct;
                    if (construct = Game.i.GetConstruction(map.GetConstruction(location)).lock()) {
                        if (construct.HasTag(STOCKPILE) || construct.HasTag(FARMPLOT)) {
                            construct.Dismantle(location);
                        } else {
                            let attack;
                            attack.Type(DAMAGE_MAGIC);
                            let damage = new Dice();
                            damage.nb_rolls = 1;
                            damage.nb_faces = 1;
                            damage.multiplier = 1;
                            damage.addsub = 100000;
                            attack.Amount(damage);
                            construct.Damage(attack);
                        }
                    }
                }

                //Swallow items
                let itemUids;
                for (let itemi = map.ItemList(location).begin(); itemi !== map.ItemList(location).end(); ++itemi) {
                    itemUids.push(itemi);
                }
                for (let itemi = itemUids.begin(); itemi !== itemUids.end(); ++itemi) {
                    Game.i.RemoveItem(Game.i.GetItem(itemi));
                }

                map.SetConstruction(location, uid);
                map.SetBuildable(location, false);
                map.SetTerritory(location, true);

                corruptionLeft += 2000 * Math.min(expansion, 100);

            } else {
                if (message) Announce.i.AddMsg("The spawning pool bubbles ominously", Color.darkGreen, Position());
                corruptionLeft += 4000 * Math.min(expansion, 100);
            }

        }
        /**Draw(Coordinate upleft, TCODConsole * the_console) {*/
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
                        the_console.setCharForeground(screenx, screeny, color);
                        if (condition > 0) the_console.setChar(screenx, screeny, (graphic[1]));
                        else the_console.setChar(screenx, screeny, TCOD_CHAR_BLOCK2);
                    }
                }
            }
        }
    }
    CancelJob(i = 0) {
        if (jobCount > 0) --jobCount;
    }

    /**    virtual void AcceptVisitor(ConstructionVisitor & visitor);*/
    AcceptVisitor(visitor) {
        visitor.Visit(this);
    }


    Burn() {
        burn += 5;
        if (burn > 30000) {
            Game.i.RemoveConstruction(boost.static_pointer_cast < Construction > (shared_from_this()));
        }
    }

    Build() {
        if (!Camp.i.spawningPool.lock() || Camp.i.spawningPool.lock() !== boost.static_pointer_cast < SpawningPool > (shared_from_this())) {
            Camp.i.spawningPool = boost.static_pointer_cast < SpawningPool > (shared_from_this());
        }
        map.Corrupt(Position(), 100);
        return Construction.Build();
    }

    GetContainer() { return corpseContainer; }

    Spawn() {
        let spawnLocation = SpawningPool.SpawnLocation();

        if (spawnLocation !== undefined) {
            ++spawns;

            let goblinRatio = static_cast < float > (Game.i.GoblinCount()) / Game.i.OrcCount();
            let goblin = false;
            let orc = false;
            if (goblinRatio < 2) goblin = true;
            else if (goblinRatio > 4) orc = true;
            else if (Random.i.Generate(2) < 2) goblin = true;
            else orc = true;

            if (goblin) {
                Game.i.CreateNPC(spawnLocation, NPC.StringToNPCType("goblin"));
                Announce.i.AddMsg("A goblin crawls out of the spawning pool", Color.green, spawnLocation);
            }

            if (orc) {
                Game.i.CreateNPC(spawnLocation, NPC.StringToNPCType("orc"));
                Announce.i.AddMsg("An orc claws its way out of the spawning pool", Color.green, spawnLocation);
            }

        }
    }

    save(ar,
        version) {
        ar & boost.serialization.base_object < Construction > (this);
        ar & dumpFilth;
        ar & dumpCorpses;
        ar & a;
        ar & b;
        ar & expansion;
        ar & filth;
        ar & corpses;
        ar & spawns;
        ar & corpseContainer;
        ar & jobCount;
        ar & burn;
    }

    load(ar, version) {
        ar & boost.serialization.base_object < Construction > (this);
        ar & dumpFilth;
        ar & dumpCorpses;
        ar & a;
        ar & b;
        ar & expansion;
        ar & filth;
        ar & corpses;
        ar & spawns;
        ar & corpseContainer;
        ar & jobCount;
        ar & burn;
    }
}