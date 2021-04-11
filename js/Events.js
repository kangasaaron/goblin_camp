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

import {
    Color
} from "./color/Color.js";
import {
    Coordinate
} from "./Coordinate.js";
import {
    NPC
} from "./NPC.js";


/*Events will include all the hardcoded events. Once Python is figured
out events will be able to be defined in py code, and the hardcoded ones
should be possible to turn off if desired.
I want to have the basic ones coded in c++, python will necessarily be
a bit slower, and it might make a crucial difference on low-end machines. */

export class Events {
    map = null;
    hostileSpawningMonsters = [];
    timeSinceHostileSpawn = 0;
    peacefulAnimals = [];
    migratingAnimals = [];
    immigrants = [];
    existingImmigrants = [];
    constructor(vmap) {
        this.map = vmap;
        for (let i = 0; i < NPC.Presets.length; ++i) {
            if (NPC.Presets[i].tags.has("attacksrandomly"))
                this.hostileSpawningMonsters.push(i);
            if (NPC.Presets[i].tags.has("localwildlife"))
                this.peacefulAnimals.push(i);
            if (NPC.Presets[i].tags.has("immigrant"))
                this.immigrants.push(i);
            if (NPC.Presets[i].tags.has("migratory"))
                this.migratingAnimals.push(i);
        }
    }


    Update(safe = false) {
        if (!safe) {
            ++this.timeSinceHostileSpawn;
            if (Random.Generate(UPDATES_PER_SECOND * 60 * 15 - 1) == 0 || this.timeSinceHostileSpawn > (UPDATES_PER_SECOND * 60 * 25)) {
                this.SpawnHostileMonsters();
            }
        }

        if (Random.Generate(UPDATES_PER_SECOND * 60 * 2 - 1) == 0) {
            this.SpawnBenignFauna();
        }

        //Remove immigrants that have left/died
        let index = -1;
        for (let immi of this.existingImmigrants) {
            index++;
            if (!immi.lock())
                immi = this.existingImmigrants.splice(index, 1);
        }

        if (this.existingImmigrants.length < Game.OrcCount() / 7 &&
            Random.Generate(UPDATES_PER_SECOND * 60 * 30) == 0) {
            this.SpawnImmigrants();
        }

        let cSeason = Game.CurrentSeason();
        if ((cSeason == EarlySpring ||
                cSeason == Spring ||
                cSeason == LateSpring ||
                cSeason == EarlyFall ||
                cSeason == Fall ||
                cSeason == LateFall) && Random.Generate(UPDATES_PER_SECOND * 60 * 30) == 0) {
            this.SpawnMigratingAnimals();
        }
    }

    SpawnHostileMonsters() {
        let possibleMonsters = [];
        for (let hosti of this.hostileSpawningMonsters) {
            if (NPC.Presets[hosti].tier <= Camp.GetTier() - 2) {
                possibleMonsters.push(hosti);
            } else if (NPC.Presets[hosti].tier <= Camp.GetTier()) {
                possibleMonsters.push(hosti); // This is intentional, it raises the odds that monsters at or lower
                possibleMonsters.push(hosti); // than this tier are spawned vs. one tier higher.
            } else if (NPC.Presets[hosti].tier == Camp.GetTier() + 1) {
                possibleMonsters.push(hosti);
            }
        }
        if (possibleMonsters.length == 0) return;

        let monsterType = Random.ChooseElement(possibleMonsters);
        let hostileSpawnCount = Game.DiceToInt(NPC.Presets[monsterType].group);

        let msg;
        if (hostileSpawnCount > 1)
            msg = `${NPC.Presets[monsterType].plural} have been sighted outside your ${Camp.GetName()}!`;
        else
            msg = `A ${NPC.Presets[monsterType].name} has been sighted outside your ${Camp.GetName()}!`;

        let a = new Coordinate(),
            b = new Coordinate();
        GenerateEdgeCoordinates(map, a, b);

        Game.CreateNPCs(hostileSpawnCount, monsterType, a, b);
        Announce.AddMsg(msg, Color.red, new Coordinate((a.X() + b.X()) / 2, (a.Y() + b.Y()) / 2));
        this.timeSinceHostileSpawn = 0;
        if (Config.GetCVar("pauseOnDanger"))
            Game.AddDelay(UPDATES_PER_SECOND, Game.Pause.bind(Game));

    }

    /**
     * Generate benign fauna
     */
    SpawnBenignFauna() {
        if (this.peacefulAnimals.length <= 0 || Game.PeacefulFaunaCount >= 20) return;

        let possibleFauna = [];
        for (let iter of this.peacefulAnimals) {
            if (NPC.Presets[iter].tier <= Camp.GetTier())
                possibleFauna.push(iter);
        }

        for (let i = 0; i < Random.Generate(1, 10); ++i) {
            let type = Random.ChooseIndex(possibleFauna);
            let target = new Coordinate();
            do {
                target = Random.ChooseInExtent(map.Extent());
            } while (!map.IsWalkable(target) || Distance(Camp.Center(), target) < 100 ||
                (map.GetType(target) != TILEGRASS && map.GetType(target) != TILESNOW && map.GetType(target) != TILEMUD));
            Game.CreateNPC(target, possibleFauna[type]);
        }
    }
    SpawnImmigrants() {
        let possibleImmigrants = [];
        for (let immi of this.immigrants) {
            if (NPC.Presets[immi].tier <= Camp.GetTier()) {
                this.possibleImmigrants.push(immi);
            }
        }

        if (possibleImmigrants.length == 0) return;

        let monsterType = Random.ChooseElement(possibleImmigrants);
        let spawnCount = Game.DiceToInt(NPC.Presets[monsterType].group);

        let msg;
        if (spawnCount > 1)
            msg = `${NPC.Presets[monsterType].plural} join your ${Camp.GetName()}!`;
        else
            msg = `A ${NPC.Presets[monsterType].name} joins your ${Camp.GetName()}!`;

        let a, b;
        GenerateEdgeCoordinates(map, a, b);

        for (let i = 0; i < spawnCount; ++i) {
            let npcUid = Game.CreateNPC(Random.ChooseInRectangle(a, b), monsterType);
            this.existingImmigrants.push(Game.GetNPC(npcUid));
        }

        Announce.AddMsg(msg, new Color(0, 150, 255), (a + b) / 2);

    }

    SpawnMigratingAnimals() {
        if (this.migratingAnimals.length === 0) return;

        let monsterType = Random.ChooseElement(this.migratingAnimals);
        let migrationSpawnCount = Game.DiceToInt(NPC.Presets[monsterType].group);
        if (migrationSpawnCount == 0) {
            return;
        }

        // Migrations are usually much bigger than your average group, so time number by 3
        migrationSpawnCount *= 3;

        let tries = 0;
        let a, b;
        do {
            GenerateEdgeCoordinates(map, a, b);
        } while (!Map.IsWalkable(a));

        if (DEBUG) {
            console.log("Migration entry at ", a.X(), "x", a.Y());
        }

        let tuid = Game.CreateNPC(a, monsterType);
        migrationSpawnCount--;
        if (DEBUG) {
            console.log("Migration spawning ", migrationSpawnCount, " ", monsterType);
        }

        let firstNPC = Game.GetNPC(tuid).get(),
            x, y,
            halfMapWidth = Math.round(Map.Width() / 2),
            halfMapHeight = Math.round(Map.Height() / 2);

        // On the left
        if (a.X() < 5) {
            while (tries < 20) {
                // Try the right side first
                x = Map.Width() - 1;
                y = halfMapHeight + Random.Generate(-halfMapHeight, halfMapHeight);
                firstNPC.findPath(Coordinate(x, y));
                if (firstNPC.IsPathWalkable()) break;
                tries++;

                // Try the bottom side
                x = halfMapWidth + Random.Generate(-halfMapWidth, halfMapWidth);
                y = 0;
                firstNPC.findPath(Coordinate(x, y));
                if (firstNPC.IsPathWalkable()) break;
                tries++;

                // Try top
                x = halfMapWidth + Random.Generate(-halfMapWidth, halfMapWidth);
                y = Map.Height() - 1;
                firstNPC.findPath(Coordinate(x, y));
                if (firstNPC.IsPathWalkable()) break;
                tries++;
            }
            // Right side
        } else if (a.X() > Map.Width() - 5) {
            while (tries < 20) {
                // Try the left side first
                x = 0;
                y = halfMapHeight + Random.Generate(-halfMapHeight, halfMapHeight);
                firstNPC.findPath(Coordinate(x, y));
                if (firstNPC.IsPathWalkable()) break;
                tries++;

                // Try the bottom side
                x = halfMapWidth + Random.Generate(-halfMapWidth, halfMapWidth);
                y = 0;
                firstNPC.findPath(Coordinate(x, y));
                if (firstNPC.IsPathWalkable()) break;
                tries++;

                // Try top
                x = halfMapWidth + Random.Generate(-halfMapWidth, halfMapWidth);
                y = Map.Height() - 1;
                firstNPC.findPath(Coordinate(x, y));
                if (firstNPC.IsPathWalkable()) break;
                tries++;
            }
            // Bottom side
        } else if (a.Y() < 5) {
            while (tries < 20) {
                // Try the left side first
                x = 0;
                y = halfMapHeight + Random.Generate(-halfMapHeight, halfMapHeight);
                firstNPC.findPath(Coordinate(x, y));
                if (firstNPC.IsPathWalkable()) break;
                tries++;

                // Try the right side
                x = Map.Width() - 1;
                y = halfMapHeight + Random.Generate(-halfMapHeight, halfMapHeight);
                firstNPC.findPath(Coordinate(x, y));
                if (firstNPC.IsPathWalkable()) break;
                tries++;

                // Try top
                x = halfMapWidth + Random.Generate(-halfMapWidth, halfMapWidth);
                y = Map.Height() - 1;
                firstNPC.findPath(Coordinate(x, y));
                if (firstNPC.IsPathWalkable()) break;
                tries++;
            }
            // Top
        } else if (a.Y() > Map.Height() - 5) {
            while (tries < 20) {
                // Try the left side first
                x = 0;
                y = halfMapHeight + Random.Generate(-halfMapHeight, halfMapHeight);
                firstNPC.findPath(Coordinate(x, y));
                if (firstNPC.IsPathWalkable()) break;
                tries++;

                // Try the right side
                x = Map.Width() - 1;
                y = halfMapHeight + Random.Generate(-halfMapHeight, halfMapHeight);
                firstNPC.findPath(Coordinate(x, y));
                if (firstNPC.IsPathWalkable()) break;
                tries++;

                // Try the bottom side
                x = halfMapWidth + Random.Generate(-halfMapWidth, halfMapWidth);
                y = 0;
                firstNPC.findPath(Coordinate(x, y));
                if (firstNPC.IsPathWalkable()) break;
                tries++;
            }
        } else {
            if (DEBUG) {
                console.log("Could not run migration, coordinates from GenerateEdgeCoordinates were not on edge");
            }
            return;
        }

        if (tries > 20) {
            if (DEBUG) {
                console.log("Could not find a destination for a migration, tried ", tries, " times.");
            }
            return;
        }

        if (DEBUG) {
            console.log("Migration exit at ", x, "x", y);
        }

        let migrants = [],
            uids = Game.CreateNPCs(migrationSpawnCount, monsterType, a, b);

        for (let uidi of uids) {
            let ptr = Game.GetNPC(uidi);
            if (!ptr) continue;
            migrants.push(ptr.get());
        }
        migrants.push(firstNPC);
        if (migrants.length == 0) {
            return;
        }

        // Create jobs for the migration
        for (let mgrnt of migrants) {
            let migrateJob = new Job("Migrate");

            // This is so they don't all disapear into one spot.
            let fx, fy;
            if (x < 5 || x > Map.Width() - 5) {
                fx = 0;
                fy = y + Random.Generate(-5, 5);
            } else {
                fy = 0;
                fx = x + Random.Generate(-5, 5);
            }

            migrateJob.tasks.push(new Task(TaskType.MOVENEAR, new Coordinate(fx, fy)));
            migrateJob.tasks.push(new Task(TaskType.FLEEMAP));
            mgrnt.StartJob(migrateJob);
        }

        let msg = `A ${NPC.Presets[monsterType].name} migration is occurring outside your ${ Camp.GetName()}.`;

        Announce.AddMsg(msg, Color.green, (a + b) / 2);
        if (DEBUG) {
            console.log("Migration underway.");
        }

    }
}




function GenerateEdgeCoordinates(map, a, b) {
    let counter = 0;
    do {
        switch (Random.Generate(3)) {
            case 0:
                a.X(0);
                a.Y(Random.Generate(map.Height() - 21));
                b.X(1);
                b.Y(a.Y() + 20);
                break;

            case 1:
                a.X(Random.Generate(map.Width() - 21));
                a.Y(0);
                b.X(a.X() + 20);
                b.Y(1);
                break;

            case 2:
                a.X(map.Width() - 2);
                a.Y(Random.Generate(map.Height() - 21));
                b.X(map.Width() - 1);
                b.Y(a.Y() + 20);
                break;

            case 3:
                a.X(Random.Generate(map.Width() - 21));
                a.Y(map.Height() - 2);
                b.X(a.X() + 20);
                b.Y(map.Height() - 1);
                break;
        }
        ++counter;
    } while ((Map.IsUnbridgedWater(a) || Map.IsUnbridgedWater(b)) && counter < 100);
}