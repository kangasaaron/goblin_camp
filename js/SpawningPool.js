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


import "Construction.js"
import "UI/Dialog.js"
import "UI/UIComponents.js"

import "data/Serialization.js"

class SpawningPool extends /*public*/ Construction {
    GC_SERIALIZABLE_CLASS

    Dialog * dialog;
    UIContainer * container;
    bool dumpFilth, dumpCorpses;
    Coordinate a, b;
    unsigned int expansion, filth, corpses, spawns;
    unsigned int expansionLeft, corruptionLeft, spawnsLeft;
    boost.shared_ptr < Container > corpseContainer;
    int jobCount;
    int burn;
    //public:
    SpawningPool(ConstructionType = 0,
        const Coordinate & = zero);
    Panel * GetContextMenu();
    static bool DumpFilth(SpawningPool * );
    static void ToggleDumpFilth(SpawningPool * );
    static bool DumpCorpses(SpawningPool * );
    static void ToggleDumpCorpses(SpawningPool * );
    void Update();
    void Draw(Coordinate, TCODConsole * );
    void Expand(bool message = true);
    virtual void CancelJob(int = 0);
    virtual void AcceptVisitor(ConstructionVisitor & visitor);
    void Burn();
    virtual int Build();
    boost.shared_ptr < Container > & GetContainer();
    void Spawn();
    //private:
    Coordinate SpawnLocation();
};

BOOST_CLASS_VERSION(SpawningPool, 0)
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
import "stdafx.js"

import "boost/serialization/shared_ptr.js"

import "Random.js"
import "SpawningPool.js"
import "UI/Button.js"
import "GCamp.js"
import "StockManager.js"
import "JobManager.js"
import "Announce.js"
import "Stats.js"
import "Camp.js"

SpawningPool.SpawningPool(ConstructionType type,
        const Coordinate & target): Construction(type, target),
    dumpFilth(false),
    dumpCorpses(false),
    a(target),
    b(target),
    expansion(0),
    filth(0),
    corpses(0),
    spawns(0),
    expansionLeft(0),
    corruptionLeft(0),
    spawnsLeft(0),
    corpseContainer(boost.shared_ptr < Container > ()),
    jobCount(0),
    burn(0) {
        container = new UIContainer(std.vector < Drawable * > (), 0, 0, 16, 11);
        dialog = new Dialog(container, "Spawning Pool", 16, 10);
        container.AddComponent(new ToggleButton("Dump filth", boost.bind( & SpawningPool.ToggleDumpFilth, this),
            boost.bind( & SpawningPool.DumpFilth, this), 2, 2, 12));
        container.AddComponent(new ToggleButton("Dump corpses", boost.bind( & SpawningPool.ToggleDumpCorpses, this),
            boost.bind( & SpawningPool.DumpCorpses, this), 1, 6, 14));
        corpseContainer = boost.shared_ptr < Container > (new Container(target, 0, 1000, -1));
    }

Panel * SpawningPool.GetContextMenu() {
    return dialog;
}

bool SpawningPool.DumpFilth(SpawningPool * sp) { return sp.dumpFilth; }
void SpawningPool.ToggleDumpFilth(SpawningPool * sp) { sp.dumpFilth = !sp.dumpFilth; }
bool SpawningPool.DumpCorpses(SpawningPool * sp) { return sp.dumpCorpses; }
void SpawningPool.ToggleDumpCorpses(SpawningPool * sp) { sp.dumpCorpses = !sp.dumpCorpses; }

Coordinate SpawningPool.SpawnLocation() {
    Direction dirs[4] = { WEST, EAST, NORTH, SOUTH };
    std.random_shuffle(dirs, dirs + 4); //shuffle to avoid predictability

    for (int x = a.X(); x <= b.X(); ++x) {
        for (int y = a.Y(); y <= b.Y(); ++y) {
            Coordinate p(x, y);
            if (map.GetConstruction(p) == uid) {
                for (int i = 0; i < 4; ++i) {
                    Coordinate candidate = p + Coordinate.DirectionToCoordinate(dirs[i]);
                    if (map.IsWalkable(candidate))
                        return candidate;
                }
            }
        }
    }
    return undefined;
}

void SpawningPool.Update() {
    if (condition > 0) {

        //Generate jobs
        if (jobCount < 4) {
            if (dumpFilth && Random.Generate(UPDATES_PER_SECOND * 4) == 0) {
                if (Game.filthList.size() > 0) {
                    boost.shared_ptr < Job > filthDumpJob(new Job("Dump filth", MED));
                    filthDumpJob.SetRequiredTool(Item.StringToItemCategory("Bucket"));
                    filthDumpJob.Attempts(1);
                    Coordinate filthLocation = Game.FindFilth(Position());
                    filthDumpJob.tasks.push_back(Task(MOVEADJACENT, filthLocation));
                    filthDumpJob.tasks.push_back(Task(FILL, filthLocation));

                    if (filthLocation != undefined) {
                        filthDumpJob.tasks.push_back(Task(MOVEADJACENT, Position()));
                        filthDumpJob.tasks.push_back(Task(POUR, Position()));
                        filthDumpJob.tasks.push_back(Task(STOCKPILEITEM));
                        filthDumpJob.ConnectToEntity(shared_from_this());
                        ++jobCount;
                        JobManager.AddJob(filthDumpJob);
                    }
                }
            }
            if (dumpCorpses && StockManager.CategoryQuantity(Item.StringToItemCategory("Corpse")) > 0 &&
                Random.Generate(UPDATES_PER_SECOND * 4) == 0) {
                boost.shared_ptr < Job > corpseDumpJob(new Job("Dump corpse", MED));
                corpseDumpJob.tasks.push_back(Task(FIND, Position(), boost.weak_ptr < Entity > (), Item.StringToItemCategory("Corpse")));
                corpseDumpJob.tasks.push_back(Task(MOVE));
                corpseDumpJob.tasks.push_back(Task(TAKE));
                corpseDumpJob.tasks.push_back(Task(FORGET));
                corpseDumpJob.tasks.push_back(Task(MOVEADJACENT, corpseContainer.Position()));
                corpseDumpJob.tasks.push_back(Task(PUTIN, corpseContainer.Position(), corpseContainer));
                corpseDumpJob.ConnectToEntity(shared_from_this());
                ++jobCount;
                JobManager.AddJob(corpseDumpJob);
            }
        }

        //Spawn / Expand
        if (map.GetFilth(pos).lock() && map.GetFilth(pos).lock().Depth() > 0) {
            boost.shared_ptr < FilthNode > filthNode = map.GetFilth(pos).lock();
            filth += filthNode.Depth();
            Stats.AddPoints(filthNode.Depth());
            corruptionLeft += filthNode.Depth() * Math.min(100 * filth, 10000 U);
            filthNode.Depth(0);
        }
        while (!corpseContainer.empty()) {
            boost.weak_ptr < Item > corpse = corpseContainer.GetFirstItem();
            if (boost.shared_ptr < Item > actualItem = corpse.lock()) {
                if (actualItem.IsCategory(Item.StringToItemCategory("corpse"))) {
                    ++corpses;
                    Stats.AddPoints(100);
                }
            }
            corpseContainer.RemoveItem(corpse);
            Game.RemoveItem(corpse);
            for (int i = 0; i < Random.Generate(1, 2); ++i)
                corruptionLeft += 1000 * Math.min(Math.max(1 U, corpses), 50 U);
        }

        if ((corpses * 10) + filth >= 30 U) {
            unsigned int newSpawns = (corpses * 10 U + filth) / 30 U;
            spawnsLeft += newSpawns;
            expansionLeft += newSpawns;
            corpses = 0;
            filth = 0;
        }
    }
    if (burn > 0) {
        if (Random.Generate(2) == 0) --burn;
        if (burn > 5000) {
            Expand(false);
            Game.CreateFire(Random.ChooseInRectangle(a, b));
            if (Random.Generate(9) == 0) {
                Coordinate spawnLocation = SpawningPool.SpawnLocation();
                if (spawnLocation != undefined && Random.Generate(20) == 0)
                    Game.CreateNPC(spawnLocation, NPC.StringToNPCType("fire elemental"));
            }
        }
    }

    if (corruptionLeft > 0) {
        map.Corrupt(Position(), 10);
        corruptionLeft -= 10;
        if (Random.Generate(500) == 0)
            map.Corrupt(Position(), 5000); //Random surges to make "tentacles" of corruption appear
    }

    if (Random.Generate(UPDATES_PER_SECOND * 5) == 0) {
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

void SpawningPool.Expand(bool message) {
    Direction dirs[4] = { WEST, EAST, NORTH, SOUTH };
    std.random_shuffle(dirs, dirs + 4); //shuffle to avoid predictability
    Coordinate location = undefined;
    for (int i = 0; location == undefined && i < 10; ++i) {
        Coordinate candidate = Random.ChooseInRectangle(a - 1, b + 1);
        //TODO factorize with IsAdjacent(p,uid) in StockPile; could go in Construction
        if (map.GetConstruction(candidate) != uid) {
            for (i = 0; i < 4; ++i)
                if (map.GetConstruction(candidate + Coordinate.DirectionToCoordinate(dirs[i])) == uid)
                    location = candidate;
        }
    }

    if (location != undefined) {
        ++expansion;
        if (message) Announce.AddMsg("The spawning pool expands", TCODColor.darkGreen, location);
        a = Coordinate.min(a, location);
        b = Coordinate.max(b, location);

        //Swallow nature objects
        if (map.GetNatureObject(location) >= 0) {
            Game.RemoveNatureObject(Game.natureList[map.GetNatureObject(location)]);
        }
        //Destroy buildings
        if (map.GetConstruction(location) >= 0) {
            if (boost.shared_ptr < Construction > construct = Game.GetConstruction(map.GetConstruction(location)).lock()) {
                if (construct.HasTag(STOCKPILE) || construct.HasTag(FARMPLOT)) {
                    construct.Dismantle(location);
                } else {
                    Attack attack;
                    attack.Type(DAMAGE_MAGIC);
                    TCOD_dice_t damage;
                    damage.nb_rolls = 1;
                    damage.nb_faces = 1;
                    damage.multiplier = 1;
                    damage.addsub = 100000;
                    attack.Amount(damage);
                    construct.Damage( & attack);
                }
            }
        }

        //Swallow items
        std.list < int > itemUids;
        for (std.set < int > .iterator itemi = map.ItemList(location).begin(); itemi != map.ItemList(location).end(); ++itemi) {
            itemUids.push_back( * itemi);
        }
        for (std.list < int > .iterator itemi = itemUids.begin(); itemi != itemUids.end(); ++itemi) {
            Game.RemoveItem(Game.GetItem( * itemi));
        }

        map.SetConstruction(location, uid);
        map.SetBuildable(location, false);
        map.SetTerritory(location, true);

        corruptionLeft += 2000 * Math.min(expansion, (unsigned int) 100);

    } else {
        if (message) Announce.AddMsg("The spawning pool bubbles ominously", TCODColor.darkGreen, Position());
        corruptionLeft += 4000 * Math.min(expansion, (unsigned int) 100);
    }

}

void SpawningPool.Draw(Coordinate upleft, TCODConsole * the_console) {
    int screenx, screeny;

    for (int x = a.X(); x <= b.X(); ++x) {
        for (int y = a.Y(); y <= b.Y(); ++y) {
            Coordinate p(x, y);
            if (map.GetConstruction(p) == uid) {
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

void SpawningPool.CancelJob(int) {
    if (jobCount > 0) --jobCount;
}

void SpawningPool.AcceptVisitor(ConstructionVisitor & visitor) {
    visitor.Visit(this);
}

void SpawningPool.Burn() {
    burn += 5;
    if (burn > 30000) {
        Game.RemoveConstruction(boost.static_pointer_cast < Construction > (shared_from_this()));
    }
}

int SpawningPool.Build() {
    if (!Camp.spawningPool.lock() || Camp.spawningPool.lock() != boost.static_pointer_cast < SpawningPool > (shared_from_this())) {
        Camp.spawningPool = boost.static_pointer_cast < SpawningPool > (shared_from_this());
    }
    map.Corrupt(Position(), 100);
    return Construction.Build();
}

boost.shared_ptr < Container > & SpawningPool.GetContainer() { return corpseContainer; }

void SpawningPool.Spawn() {
    Coordinate spawnLocation = SpawningPool.SpawnLocation();

    if (spawnLocation != undefined) {
        ++spawns;

        float goblinRatio = static_cast < float > (Game.GoblinCount()) / Game.OrcCount();
        bool goblin = false;
        bool orc = false;
        if (goblinRatio < 2) goblin = true;
        else if (goblinRatio > 4) orc = true;
        else if (Random.Generate(2) < 2) goblin = true;
        else orc = true;

        if (goblin) {
            Game.CreateNPC(spawnLocation, NPC.StringToNPCType("goblin"));
            Announce.AddMsg("A goblin crawls out of the spawning pool", TCODColor.green, spawnLocation);
        }

        if (orc) {
            Game.CreateNPC(spawnLocation, NPC.StringToNPCType("orc"));
            Announce.AddMsg("An orc claws its way out of the spawning pool", TCODColor.green, spawnLocation);
        }

    }
}

void SpawningPool.save(OutputArchive & ar,
    const unsigned int version) const {
    ar & boost.serialization.base_object < Construction > ( * this);
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

void SpawningPool.load(InputArchive & ar,
    const unsigned int version) {
    ar & boost.serialization.base_object < Construction > ( * this);
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