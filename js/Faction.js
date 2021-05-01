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
    Constants
} from "./Constants.js";
import {
    FactionGoal
} from "./FactionGoal.js";
import {
    FactionType
} from "./FactionType.js";
import {
    Serializable
} from "./data/Serialization.js"
import {
    Item
} from "./Item.js";
import {
    Job
} from "./Job.js";
import {
    Coordinate
} from "./Coordinate.js";

const PLAYERFACTION = 0;

export class Faction extends Serializable {
    static CLASS_VERSION = 1;

    /**
     * @type {Map<string,number>}
     */
    static factionNames = new Map(); // name => index (of factions, below)
    static factions = [];

    members = new WeakSet();
    membersAsUids = [];
    trapVisible = new Map(); // coordinate of trap => boolean (visibility)
    friends = new Set();
    friendNames = [];
    jobs = new WeakSet();
    goals = [];
    goalSpecifiers = [];
    name = "";
    index = 0;
    trapVisibleMutex = null;
    currentGoal = 0;
    activeTime = 0;
    maxActiveTime = Constants.MONTH_LENGTH / 2;
    active = false;
    aggressive = false;
    coward = false;

    constructor(vname = "Noname faction", vindex = -1) {
        this.name = vname;
        this.index = vindex;
    }
    AddMember(newMember) {
        this.members.add(newMember);
        if (!this.active) {
            this.active = true;
            this.activeTime = 0;
        }
    }
    RemoveMember(member) {
        let memberFound = false;
        for (let membi of this.members.values()) {
            if (membi.lock()) {
                if (member.lock() && member.lock() == membi.lock()) {
                    // Saving the iterator from doom
                    this.members.delete(membi);
                    memberFound = true;
                }

            } else
                members.delete(membi);
            if (memberFound)
                break;
        }
        if (this.active && this.members.length == 0)
            this.active = false;
    }
    CancelJob(oldJob, msg, result) { }

    MakeFriendsWith(otherFaction) {
        this.friends.add(otherFaction);
    }
    IsFriendsWith(otherFaction) {
        return this.friends.has(otherFaction);
    }
    TrapDiscovered(trapLocation, propagate = true) {
        this.trapVisible.set(trapLocation.hashCode(), true);
        //Inform friends
        if (propagate) {
            for (let friendi of this.friends) {
                if (friendi !== this.index)
                    Faction.factions[friendi].TrapDiscovered(trapLocation, false);
            }
        }
    }
    IsTrapVisible(trapLocation) {
        let trapi = this.trapVisible.get(trapLocation.hashCode());
        if (!trapi)
            return false;
        return trapi;
    }
    TrapSet(trapLocation, visible) {
        this.trapVisible.set(trapLocation.hashCode(), visible);
    }
    Update() {
        if (this.active && this.maxActiveTime >= 0) {
            ++this.activeTime;
        }
    }
    /**
     * Reset() does not erase names or goals because these are defined at startup and remain constant
     */
    Reset() {
        this.members.clear();
        this.membersAsUids = [];
        this.trapVisible.clear();
        this.jobs.clear();
        this.currentGoal = 0;
        this.activeTime = 0;
        this.active = false;
    }
    GetCurrentGoal() {
        let i = this.currentGoal;
        if (i < this.goals.length) return this.goals[i];
        return FactionGoal.FACTIONIDLE;
    }
    /**
     * One way transfer, not used for sharing trap data between friendly factions
     */
    TransferTrapInfo(otherFaction) {
        for (let entry of this.trapVisible) {
            otherFaction.trapVisible.set(entry[0], entry[1]);
        }
    }
    IsCoward() {
        return this.coward;
    }
    IsAggressive() {
        return this.aggressive;
    }
    FindJob(npc) {
        if (this.maxActiveTime >= 0 && this.activeTime >= this.maxActiveTime) {
            let fleeJob = new Job("Leave");
            fleeJob.internal = true;
            fleeJob.tasks.push(new Task(TaskType.CALMDOWN));
            fleeJob.tasks.push(new Task(TaskType.FLEEMAP));
            npc.StartJob(fleeJob);
            return true;
        }
        if (this.goals.length === 0) return false;

        if (this.currentGoal < 0 || this.currentGoal >= this.goals.length)
            this.currentGoal = 0;
        switch (this.goals[this.currentGoal]) {
            case FactionGoal.FACTIONDESTROY:
                let destroyJob = new Job("Destroy building");
                if (GenerateDestroyJob(npc.map, destroyJob, npc) || GenerateKillJob(destroyJob)) {
                    npc.StartJob(destroyJob);
                    return true;
                }
                break;
            case FactionGoal.FACTIONKILL:
                let attackJob = new Job("Attack settlement");
                if (GenerateKillJob(attackJob)) {
                    npc.StartJob(attackJob);
                    return true;
                }
                break;
            case FactionGoal.FACTIONSTEAL:
                if (this.currentGoal < this.goalSpecifiers.length && this.goalSpecifiers[this.currentGoal] >= 0) {
                    let stealJob = new Job("Steal " + Item.ItemCategoryToString(this.goalSpecifiers[this.currentGoal]));
                    let item = Game.FindItemByCategoryFromStockpiles(this.goalSpecifiers[this.currentGoal], npc.Position());
                    if (item.lock()) {
                        if (GenerateStealJob(stealJob, item.lock())) {
                            npc.StartJob(stealJob);
                            return true;
                        }
                    } else {
                        ++this.currentGoal;
                    }
                }
                break;
            case FACTIONPATROL:
                let patrolJob = new Job("Patrol");
                patrolJob.internal = true;
                let location = Coordinate.undefinedCoordinate;
                if (this.IsFriendsWith(PLAYERFACTION)) {
                    location = Camp.GetRandomSpot();
                } else {
                    for (let limit = 0; limit < 100 && location == Coordinate.undefinedCoordinate; ++limit) {
                        let candidate = Random.ChooseInExtent(npc.map.Extent());
                        if (!npc.map.IsTerritory(candidate))
                            location = candidate;
                    }
                }
                if (location != Coordinate.undefinedCoordinate) {
                    patrolJob.tasks.push(new Task(TaskType.MOVENEAR, location));
                    patrolJob.tasks.push(new Task(TaskType.WAIT, new Coordinate(Random.Generate(5, 20), 0)));
                    npc.StartJob(patrolJob);
                    return true;
                }
                break;
            case FACTIONIDLE:
                break;

            default:
                break;
        }
        return false;
    }
    TranslateFriends() {
        for (let namei of this.friendNames) {
            this.friends.add(Faction.StringToFactionType(namei));
        }
    }


    static fromPreset(preset) {
        let result = this.StringToFactionType(preset.faction_type);
        if ("friends" in preset)
            result.friendNames.push(...preset.friends);
        if ("goals" in preset) {
            preset.goals.map(function (goal) {
                result.goals.push(Faction.StringToFactionGoal(goal));
            });
        }
        if ("goalSpecifiers" in preset) {
            preset.goalSpecifiers.map(function (spec) {
                result.goalSpecifiers.push(Item.StringToItemCategory(spec));
            });
        }
        if ("activeTime" in preset) {
            if (preset.activeTime < 0.0)
                result.maxActiveTime = -1;
            else
                result.maxActiveTime = Math.round(activeTime * MONTH_LENGTH);
        }
        if ("aggressive" in preset)
            result.aggressive = preset.aggressive;
        if ("coward" in preset)
            result.coward = preset.coward;

    }
    static StringToFactionType(factionName) {
        if (factionName === "Faction name not found") return -1;
        if (this.factionNames.indexOf(factionName) >= 0)
            return this.factionNames[factionName];

        let index = this.factions.length;
        this.factions.push(new Faction(factionName, index));
        this.factionNames.set(factionName, this.factions.length - 1);
        this.factions[this.factions.length - 1].MakeFriendsWith(this.factions.length - 1); //A faction is always friendly with itself

        return this.factionNames.get(factionName);
    }
    static StringToFactionGoal(goal) {
        goal = goal.toLowercase();
        if (goal === "destroy") {
            return FactionGoal.FACTIONDESTROY;
        } else if (goal === "kill") {
            return FactionGoal.FACTIONKILL;
        } else if (goal === "steal") {
            return FactionGoal.FACTIONSTEAL;
        } else if (goal === "patrol") {
            return FactionGoal.FACTIONPATROL;
        } else if (goal === "idle") {
            return FactionGoal.FACTIONIDLE;
        }
        return FactionGoal.FACTIONIDLE;
    }
    static FactionGoalToString(goal) {
        switch (goal) {
            case FactionGoal.FACTIONDESTROY:
                return "destroy";
            case FactionGoal.FACTIONKILL:
                return "kill";
            case FactionGoal.FACTIONSTEAL:
                return "steal";
            case FactionGoal.FACTIONPATROL:
                return "patrol";
            case FactionGoal.FACTIONIDLE:
                return "idle";
        }
        return "idle";
    }
    static FactionTypeToString(faction) {
        if (faction >= 0 && faction < this.factions.length) {
            return this.factions[faction].name;
        }
        return "Faction name not found";
    }
    /**
     * Initialize faction names, required before loading npcs from a save file
     */
    static InitAfterLoad() {
        this.factionNames.clear();
        for (let i = 0; i < this.factions.length; ++i)
            this.factionNames.set(this.factions[i].name, i);

        for (let i = 0; i < this.factions.length; ++i) {
            this.factions[i].index = i;
            this.factions[i].MakeFriendsWith(i);
            this.factions[i].TranslateFriends();
        }
    }
    /**
     * Translate member uids into pointers _after_ loading npcs from a save
     */
    static TranslateMembers() {
        for (let faction of this.factions) {
            for (let uidi of faction.membersAsUids) {
                let npc = Game.GetNPC(uidi);
                if (npc.lock())
                    faction.AddMember(npc);
            }
        }
    }
    static LoadPresets(filename) {
        let listener = new FactionListener(this, filename);
        return listener.fetch()
            .then(function () {
                for (let faction of Faction.factions) {
                    faction.TranslateFriends();
                }
            });
    }

    serialize(ar, version) {
        ar.register_type(Job);
        ar.register_type(FactionGoal);
        let result = {
            name: this.name,
            index: this.index,
            jobs: ar.serialize(this.jobs),
            goals: ar.serialize(this.goals),
            trapVisible: ar.serialize(this.trapVisible),
            goalSpecifiers: this.goalSpecifiers,
            currentGoal: this.currentGoal,
            activeTime: this.activeTime,
            maxActiveTime: this.maxActiveTime,
            active: this.active,
            coward: this.coward,
            aggressive: this.aggressive,
            friends: this.friends.map(factionIter => Faction.FactionTypeToString(factionIter)),
            members: this.members.map(function (membi) {
                let uid = -1;
                if (membi.lock()) uid = membi.lock().Uid()
                return uid;
            })
        };
    }
    static deserialize(data, version, deserializer) {
        let f = new Faction(data.name, data.index);
        f.jobs = deserializer.deserialize(data.jobs);
        f.goals = deserializer.deserialize(data.goals);
        f.trapVisible = deserializer.deserialize(data.trapVisible);
        f.goalSpecifiers = data.goalSpecifiers;
        f.currentGoal = data.currentGoal;
        f.activeTime = data.activeTime;
        f.maxActiveTime = data.maxActiveTime;
        f.active = data.active;
        f.coward = data.coward;
        f.aggressive = data.aggressive;
        f.friendNames = data.friends; // TODO
        f.members = data.members;
    }

}

function bresenham(x0, y0, x1, y1) {
    let dx = Math.abs(x1 - x0),
        dy = Math.abs(y1 - y0),
        sx = (x0 < x1) ? 1 : -1,
        sy = (y0 < y1) ? 1 : -1,
        err = dx - dy,
        result = [];
    while (true) {
        result.push([x0, y0]);
        if ((x0 === x1) && y0 === y1)
            break;
        let e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
    return result;
}

function GenerateDestroyJob(map, job, npc) {
    let construction;
    let p = npc.Position();
    let path = bresenham(p.X(), p.Y(), Camp.Center().X(), Camp.Center().Y()).map(arr => new Coordinate(arr[0], arr[1]));
    let index = 0;
    do {
        let constructionID = map.GetConstruction(path[index]);
        index++;
        if (constructionID < 0) continue;

        construction = Game.GetConstruction(constructionID).lock();
        if (construction && (construction.HasTag(ConstructionTag.PERMANENT) ||
            (!construction.HasTag(ConstructionTag.WORKSHOP) && !construction.HasTag(ConstructionTag.WALL))))
            construction.reset();

    } while (index < path.length && !construction);
    if (!construction) return false;

    job.tasks.push(new Task(TaskType.MOVEADJACENT, construction.Position(), construction));
    job.tasks.push(new Task(TaskType.KILL, construction.Position(), construction));
    job.internal = true;
    return true;

}

function GenerateKillJob(job) {
    job.internal = true;
    job.tasks.push(new Task(TaskType.GETANGRY));
    job.tasks.push(new Task(TaskType.MOVENEAR, Camp.Center()));
    return true;
}

function GenerateStealJob(job, item) {
    job.internal = true;
    if (item) {
        job.tasks.push(new Task(TaskType.MOVE, item.Position()));
        job.tasks.push(new Task(TaskType.TAKE, item.Position(), item));
    }
    job.tasks.push(new Task(TaskType.FLEEMAP));
    return true;
}
