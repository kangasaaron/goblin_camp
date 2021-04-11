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
    Coordinate
} from "./Coordinate.js";
import {
    Skill
} from "./Skill.js";
import {
    SkillSet
} from "./SkillSet.js";
import {
    Entity
} from "./Entity.js";
import {
    NPCType
} from "./NPCType.js";
import {
    Job
} from "./Job.js";
import {
    Task
} from "./Task.js";
import {
    TaskResult
} from "./TaskResult.js";
import {
    StatusEffectType
} from "./StatusEffectType.js";
import {
    Trait
} from "./Trait.js";
import { Attack } from "./Attack.js";
import { Constants } from "./Constants.js";

export class NPC extends Entity {
    static CLASS_VERSION = 1;

    /** @type {Array<NPCPreset>} */
    static Presets = [];

    static pathingThreadCount = 0;

    /** @type {boost.mutex} */
    static threadCountMutex = null;

    /** @type {Map<string, NPCType>} */
    static NPCTypeNames = new Map();

    aggressive = false;
    coward = false;
    dead = false;
    escaped = false;
    expert = false;
    findPathWorking = false;
    hasHands = false;
    hasMagicRangedAttacks = false;
    isFlying = false;
    isTunneler = false;
    jobBegun = false;
    needsNutrition = false;
    needsSleep = false;
    nopath = false;
    pathIsDangerous = false;
    run = true;
    seenFire = false;
    statusEffectsChanged = false;
    taskBegun = false;

    addedTasksToCurrentJob = 0;
    damageDealt = 0;
    damageReceived = 0;
    _graphic = 0;
    health = 100;
    hunger = 0;
    maxHealth = 100;
    nextMove = 0;
    orderIndex = 0;
    pathIndex = 0;
    statusGraphicCounter = 0;
    taskIndex = 0;
    thinkSpeed = 0;
    thirst = 0;
    timeCount = 0;
    timer = 0;
    weariness = 0;

    /** @type {number} std.list<StatusEffect>.iterator */
    statusEffectIterator = 0;

    /** @type {TaskResult} */
    lastMoveResult;

    /** @type {boost.mutex} */
    pathMutex;

    /** @type {NPCType} */
    type;

    /** @type {function} boost.function<bool(boost.shared_ptr<NPC>)> */
    FindJob = null;
    /** @type {function} boost.function<void(boost.shared_ptr<NPC>)> */
    React = null;

    /** @type {Coordinate} */
    threatLocation = Coordinate.zero;

    /** @type {Container} boost.weak_ptr<Container> */
    quiver;
    /** @type {Container} boost.shared_ptr<Container> */
    inventory;

    /** @type {Item} boost.weak_ptr<Item> */
    carried;
    /** @type {Item} boost.weak_ptr<Item> */
    mainHand;
    /** @type {Item} boost.weak_ptr<Item> */
    offHand;
    /** @type {Item} boost.weak_ptr<Item> */
    armor;
    /** @type {Item} boost.weak_ptr<Item> */
    foundItem;

    /** @type {NPC} boost.weak_ptr<NPC> */
    aggressor;

    /** @type {Squad} boost.weak_ptr<Squad> */
    squad;

    /** @type {TCODColor} */
    _color;
    /** @type {TCODColor} */
    _bgcolor;

    /** @type {TCODPath} TCODPath * */
    path;

    /** @type {Map} */
    map = null;

    /** @type {Faction} boost.shared_ptr < Faction > */
    factionPtr;
    /** @type {SkillSet} */
    Skills;

    /** @type {Array<number>} */
    baseStats = new Array(NPC.STAT_COUNT);
    /** @type {Array<number>} */
    effectiveStats = new Array(NPC.STAT_COUNT);
    /** @type {Array<number>} */
    baseResistances = new Array(Resistance.RES_COUNT);
    /** @type {Array<number>} */
    effectiveResistances = new Array(Resistance.RES_COUNT);

    /** @type {Array<Attack>} std.list<Attack> */
    attacks = [];
    /** @type {Array<Job>} deque of shared_ptr to Job */
    jobs = [];

    /** @type {Array<StatusEffect>} */
    statusEffects = [];

    /** @type {Array<NPC>} std.list<boost.weak_ptr<NPC>> */
    nearNpcs = [];
    /** @type {Array<NPC>} std.list<boost.weak_ptr<NPC>> */
    adjacentNpcs = [];

    /** @type {Array<Construction>} std.list<boost.weak_ptr<Construction>> */
    nearConstructions = [];

    /** @type {Set<Trait>} std.set<Trait> */
    traits;

    static NPCTypeToString(type) {
        if (type >= 0 && type < this.Presets.length)
            return this.Presets[type].typeName;
        return "Nobody";
    }

    static StringToNPCType(typeName) {
        if (!this.NPCTypeNames.has(typeName)) {
            return -1;
        }
        return this.NPCTypeNames.get(typeName);
    }

    static LoadPresets(filename) {
        let listener = new NPCListener(this, filename);
        return listener.fetch()
    }

    /**
     * 
     * @param {NPC} npc 
     * @returns {boolean}
     */
    static GetSquadJob(npc) {
        let squad;
        if (!(squad = npc.MemberOf().lock())) return false;

        JobManager.NPCNotWaiting(npc.uid);
        npc.aggressive = true;
        let newJob = new Job("Follow orders");
        newJob.internal = true;

        //Priority #1, if the creature can wield a weapon get one if possible
        /*TODO: Right now this only makes friendlies take a weapon from a stockpile
        It should be expanded to allow all npc's to search for nearby weapons lying around. */
        if (!npc.mainHand.lock() && npc.GetFaction() == PLAYERFACTION && squad.Weapon() >= 0) {
            for (let attacki of npc.attacks) {
                if (!attacki.Type() == DAMAGE_WIELDED) continue;

                if (!Game.FindItemByCategoryFromStockpiles(squad.Weapon(), npc.Position()).lock()) break;

                newJob.tasks.push(new Task(TaskType.FIND, npc.Position(), null, squad.Weapon()));
                newJob.tasks.push(new Task(TaskType.MOVE));
                newJob.tasks.push(new Task(TaskType.TAKE));
                newJob.tasks.push(new Task(TaskType.WIELD));
                npc.jobs.push(newJob);
                return true;
            }
        }

        if (npc.WieldingRangedWeapon()) {
            if (!npc.quiver.lock()) {
                if (Game.FindItemByCategoryFromStockpiles(Item.StringToItemCategory("Quiver"), npc.Position()).lock()) {
                    newJob.tasks.push(new Task(TaskType.FIND, npc.Position(), null, Item.StringToItemCategory("Quiver")));
                    newJob.tasks.push(new Task(TaskType.MOVE));
                    newJob.tasks.push(new Task(TaskType.TAKE));
                    newJob.tasks.push(new Task(TaskType.WEAR));
                    npc.jobs.push(newJob);
                    return true;
                }
            } else if (npc.quiver.lock().empty()) {
                if (Game.FindItemByCategoryFromStockpiles(
                        npc.mainHand.lock().GetAttack().Projectile(), npc.Position()).lock()) {
                    for (let i = 0; i < 20; ++i) {
                        newJob.tasks.push(new Task(TaskType.FIND, npc.Position(), null, npc.mainHand.lock().GetAttack().Projectile()));
                        newJob.tasks.push(new Task(TaskType.MOVE));
                        newJob.tasks.push(new Task(TaskType.TAKE));
                        newJob.tasks.push(new Task(TaskType.QUIVER));
                    }
                    npc.jobs.push(newJob);
                    return true;
                }
            }
        }

        if (!npc.armor.lock() && npc.GetFaction() == PLAYERFACTION && squad.Armor() >= 0) {
            npc.FindNewArmor();
        }

        switch (squad.GetOrder(npc.orderIndex)) { //GetOrder handles incrementing orderIndex
            case GUARD:
                if (squad.TargetCoordinate(npc.orderIndex) != undefined) {
                    if (squad.Weapon() == Item.StringToItemCategory("Ranged weapon")) {
                        let p = npc.map.FindRangedAdvantage(squad.TargetCoordinate(npc.orderIndex));
                        if (p != undefined) {
                            newJob.tasks.push(new Task(TaskType.MOVE, p));
                            //TODO remove WAIT hack
                            newJob.tasks.push(new Task(TaskType.WAIT, Coordinate(5 * 15, 0)));
                        }
                    }

                    if (newJob.tasks.empty()) {
                        newJob.tasks.push(new Task(TaskType.MOVENEAR, squad.TargetCoordinate(npc.orderIndex)));
                        //WAIT waits Coordinate.x / 5 seconds
                        //TODO remove WAIT hack
                        newJob.tasks.push(new Task(TaskType.WAIT, Coordinate(5 * 5, 0)));
                    }

                    if (!newJob.tasks.empty()) {
                        npc.jobs.push(newJob);
                        if (Coordinate.Distance(npc.Position(), squad.TargetCoordinate(npc.orderIndex)) < 10) npc.run = false;
                        return true;
                    }
                }
                break;

            case FOLLOW:
                if (squad.TargetEntity(npc.orderIndex).lock()) {
                    newJob.tasks.push(new Task(TaskType.MOVENEAR, squad.TargetEntity(npc.orderIndex).lock().Position(), squad.TargetEntity(npc.orderIndex)));
                    npc.jobs.push(newJob);
                    return true;
                }
                break;

            default:
                break;
        }
        return false;
    }

    /**
     * 
     * @param {NPC} npc 
     * @returns {boolean}
     */
    static JobManagerFinder(npc) {
        if (!npc.MemberOf().lock()) {
            JobManager.NPCWaiting(npc.uid);
        }
        return false;
    }

    /**
     * 
     * @param {NPC} npc 
     */
    static PlayerNPCReact(npc) {
        let surroundingsScanned = false;

        //If carrying a container and adjacent to fire, dump it on it immediately
        let carriedItem;
        if (carriedItem = npc.Carrying().lock()) {
            if (carriedItem.IsCategory(Item.StringToItemCategory("bucket")) ||
                carriedItem.IsCategory(Item.StringToItemCategory("container"))) {
                npc.ScanSurroundings(true);
                surroundingsScanned = true;
                if (npc.seenFire && Game.Adjacent(npc.threatLocation, npc.Position())) {
                    npc.DumpContainer(npc.threatLocation);
                    npc.TaskFinished(TaskResult.TASKFAILNONFATAL);
                }
            }
        }

        if (npc.coward) {
            if (!surroundingsScanned) npc.ScanSurroundings();
            surroundingsScanned = true;

            //NPCs with the CHICKENHEART trait panic more than usual if they see fire
            if (npc.HasTrait(Trait.CHICKENHEART) && npc.seenFire && (npc.jobs.empty() || npc.jobs[0].name != "Aaaaaaaah!!")) {
                while (!npc.jobs.empty()) npc.TaskFinished(TaskResult.TASKFAILNONFATAL, "(FAIL)Chickenheart");
                let runAroundLikeAHeadlessChickenJob = new Job("Aaaaaaaah!!");
                for (let i = 0; i < 30; ++i)
                    runAroundLikeAHeadlessChickenJob.tasks.push(new Task(TaskType.MOVE, Random.ChooseInRadius(npc.Position(), 2)));
                runAroundLikeAHeadlessChickenJob.internal = true;
                npc.jobs.push(runAroundLikeAHeadlessChickenJob);
                npc.AddEffect(StatusEffectType.PANIC);
                return;
            }

            //Cowards panic if they see aggressive unfriendlies or their attacker
            for (let npci of npc.nearNpcs) {
                let otherNpc = npci.lock();
                if ((!npc.factionPtr.IsFriendsWith(otherNpc.GetFaction()) && otherNpc.aggressive) ||
                    otherNpc == npc.aggressor.lock()) {
                    JobManager.NPCNotWaiting(npc.uid);
                    while (!npc.jobs.empty()) npc.TaskFinished(TaskResult.TASKFAILNONFATAL, "(FAIL)Enemy sighted");
                    npc.AddEffect(StatusEffectType.PANIC);
                    npc.threatLocation = otherNpc.Position();
                    return;
                }
            }
        } else {

            //Aggressive npcs attack unfriendlies
            if (npc.aggressive) {
                if (npc.jobs.empty() || npc.currentTask().action != KILL) {
                    if (!surroundingsScanned) npc.ScanSurroundings(true);
                    surroundingsScanned = true;
                    for (let npci of npc.nearNpcs) {
                        if (!npc.factionPtr.IsFriendsWith(npci.lock().GetFaction())) {
                            JobManager.NPCNotWaiting(npc.uid);
                            let killJob = new Job("Kill " + npci.lock().name);
                            killJob.internal = true;
                            killJob.tasks.push(new Task(TaskType.KILL, npci.lock().Position(), npci));
                            while (!npc.jobs.empty()) npc.TaskFinished(TaskResult.TASKFAILNONFATAL, "(FAIL)Kill enemy");
                            npc.jobs.push(killJob);
                            return;
                        }
                    }
                }
            }

            //Npcs without BRAVE panic if they see fire
            if (!npc.HasEffect(Trait.BRAVE)) {
                if (!surroundingsScanned) npc.ScanSurroundings();
                surroundingsScanned = true;
                if (npc.seenFire) {
                    npc.AddEffect(StatusEffectType.PANIC);
                    while (!npc.jobs.empty()) npc.TaskFinished(TaskResult.TASKFAILFATAL, "(FAIL)Seen fire");
                }
            }
        }
    }

    /**
     * 
     * @param {NPC} npc 
     */
    static AnimalReact(animal) {
        animal.ScanSurroundings();

        //Aggressive animals attack constructions/other creatures depending on faction
        if (animal.aggressive) {
            if (animal.factionPtr.GetCurrentGoal() == FactionGoal.FACTIONDESTROY && animal.nearConstructions.length > 0) {
                for (let consi of animal.nearConstructions) {
                    let construct;
                    if (construct = consi.lock()) {
                        if (!construct.HasTag(ConstructionTag.PERMANENT) &&
                            (construct.HasTag(ConstructionTag.WORKSHOP) ||
                                (construct.HasTag(ConstructionTag.WALL) && Random.Generate(10) == 0))) {
                            let destroyJob = new Job("Destroy " + construct.Name());
                            destroyJob.internal = true;
                            destroyJob.tasks.push(new Task(TaskType.MOVEADJACENT, construct.Position(), construct));
                            destroyJob.tasks.push(new Task(TaskType.KILL, construct.Position(), construct));
                            while (animal.jobs.length) animal.TaskFinished(TaskResult.TASKFAILNONFATAL);
                            animal.jobs.push(destroyJob);
                            return;
                        }
                    }
                }
            } else {
                for (let npci of animal.nearNpcs) {
                    let otherNPC = npci.lock();
                    if (otherNPC && !animal.factionPtr.IsFriendsWith(otherNPC.GetFaction())) {
                        let killJob = new Job("Kill " + otherNPC.name);
                        killJob.internal = true;
                        killJob.tasks.push(new Task(TskType.KILL, otherNPC.Position(), npci));
                        while (animal.jobs.length)
                            animal.TaskFinished(TaskResult.TASKFAILNONFATAL);
                        animal.jobs.push(killJob);
                        return;
                    }
                }
            }
        }

        //Cowards run away from others
        if (animal.coward) {
            for (let npci of animal.nearNpcs) {
                if (!animal.factionPtr.IsFriendsWith(npci.lock().GetFaction())) {
                    animal.AddEffect(StatusEffectType.PANIC);
                    animal.run = true;
                }
            }
        }

        //Animals with the 'angers' tag get angry if attacked
        if (animal.aggressor.lock() && NPC.Presets[animal.type].tags.has("angers")) {
            //Turn into a hostile animal if attacked by the player's creatures
            animal.aggressive = true;
            animal.RemoveEffect(StatusEffectType.PANIC);
            animal.AddEffect(StatusEffectTye.RAGE);
        }

        //All animals avoid fire
        if (animal.seenFire) {
            animal.AddEffect(StatusEffectTye.PANIC);
            while (animal.jobs.length) animal.TaskFinished(TaskResult.TASKFAILFATAL);
            return;
        }
    }

    constructor(pos = Coordinate.zero, findJob = () => false, react = () => false) {
        super();
        this.lastMoveResult = TaskType.TASKCONTINUE;
        this.thinkSpeed = Constants.UPDATES_PER_SECOND / 5; //Think 5 times a second
        this.inventory = new Container(pos, 0, 30, -1);
        this.FindJob = findJob;
        this.React = react;
        this.threatLocation = Coordinate.undefinedCoordinate;

        this.pos = pos;
        this.inventory.SetInternal();

        this.thirst = this.thirst - (THIRST_THRESHOLD / 2) + Random.Generate(THIRST_THRESHOLD - 1);
        this.hunger = this.hunger - (HUNGER_THRESHOLD / 2) + Random.Generate(HUNGER_THRESHOLD - 1);
        this.weariness = this.weariness - (WEARY_THRESHOLD / 2) + Random.Generate(WEARY_THRESHOLD - 1);

        for (let i = 0; i < NPCStat.STAT_COUNT; ++i) {
            this.baseStats[i] = 0;
            this.effectiveStats[i] = 0;
        }
        for (let i = 0; i < Resistance.RES_COUNT; ++i) {
            this.baseResistances[i] = 0;
            this.effectiveResistances[i] = 0;
        }
    }

    destructor() {
        this.pathMutex.lock();
        /* In case a pathing thread is active we need to wait until we can lock the pathMutex,
                          because it signals that the thread has finished */
        this.map.NPCList(this.pos).erase(this.uid);
        if (this.squad.lock()) this.squad.lock().Leave(this.uid);

        if (NPC.NPCTypeToString(this.type).toLowerCase() === "orc") Game.OrcCount(-1);
        else if (NPC.NPCTypeToString(this.type) === "goblin") Game.GoblinCount(-1);
        else if (NPC.Presets[this.type].tags.has("localwildlife")) Game.PeacefulFaunaCount(-1);

        this.pathMutex.unlock();
        delete this.path;
    }


    HandleThirst() {
        let found = false;

        for (let jobIter of this.jobs) {
            if (jobIter.name.indexOf("Drink") >= 0)
                found = true;
        }
        if (found) return;

        let item = Game.FindItemByCategoryFromStockpiles(Item.StringToItemCategory("Drink"), this.Position());
        let waterCoordinate;
        if (!item.lock()) {
            waterCoordinate = Game.FindWater(this.Position());
        }
        if (item.lock() || waterCoordinate != undefined) { //Found something to drink
            let newJob = new Job("Drink", JobPriority.MED, 0, !expert);
            newJob.internal = true;

            if (item.lock()) {
                newJob.ReserveEntity(item);
                newJob.tasks.push(new Task(TaskType.MOVE, item.lock().Position()));
                newJob.tasks.push(new Task(TaskType.TAKE, item.lock().Position(), item));
                newJob.tasks.push(new Task(TaskType.DRINK));
                this.jobs.push(newJob);
            } else {
                let adjacentTile = Game.FindClosestAdjacent(this.Position(), waterCoordinate, faction);
                if (adjacentTile.X() >= 0) {
                    newJob.tasks.push(new Task(TaskType.MOVE, adjacentTile));
                    newJob.tasks.push(new Task(TaskType.DRINK, waterCoordinate));
                    if (!this.jobs.length)
                        JobManager.NPCNotWaiting(uid);
                    this.jobs.push(newJob);
                }
            }
        }

    }
    HandleHunger() {
        let found = false;

        if (this.hunger > 48000 && this.jobs.length && this.jobs[0].name.indexOf("Eat") == -1) { //Starving and doing something else
            this.TaskFinished(TaskResult.TASKFAILNONFATAL);
        }

        for (let jobIter of this.jobs) {
            if (jobIter.name.indexOf("Eat") >= 0)
                found = true;
        }
        if (found) return;

        let item = Game.FindItemByCategoryFromStockpiles(Item.StringToItemCategory("Prepared food"), this.Position(), MOSTDECAYED);
        if (!item.lock()) {
            item = Game.FindItemByCategoryFromStockpiles(Item.StringToItemCategory("Food"), this.Position(), MOSTDECAYED | AVOIDGARBAGE);
        }
        if (!item.lock()) { //Nothing to eat!
            if (this.hunger > 48000) { //Nearing death
                this.ScanSurroundings();
                let weakest;
                for (let npci of this.nearNpcs) {
                    if (npci.lock() && (!weakest || npci.lock().health < weakest.health)) {
                        weakest = npci.lock();
                    }
                }

                if (weakest) { //Found a creature nearby, eat it
                    let newJob = new Job("Eat", JobPriority.HIGH, 0, !expert);
                    newJob.internal = true;
                    newJob.tasks.push(new Task(TaskType.GETANGRY));
                    newJob.tasks.push(new Task(TaskType.KILL, weakest.Position(), weakest, 0, 1));
                    newJob.tasks.push(new Task(TaskType.EAT));
                    newJob.tasks.push(new Task(TaskType.CALMDOWN));
                    this.jobs.push(newJob);
                }
            }
        } else { //Something to eat!
            let newJob = new Job("Eat", JobPriority.MED, 0, !expert);
            newJob.internal = true;

            newJob.ReserveEntity(item);
            newJob.tasks.push(new Task(TaskType.MOVE, item.lock().Position()));
            newJob.tasks.push(new Task(TaskType.TAKE, item.lock().Position(), item));
            newJob.tasks.push(new Task(TaskType.EAT));
            if (!this.jobs.length)
                JobManager.NPCNotWaiting(uid);
            this.jobs.push(newJob);
        }
    }
    HandleWeariness() {
        let found = false;
        for (let jobIter of this.jobs) {
            if (jobIter.name.indexOf("Sleep") >= 0) found = true;
            else if (jobIter.name.indexOf("Get rid of") >= 0) found = true;
        }
        if (found) return;

        let wbed = Game.FindConstructionByTag(ConstructionTag.BED, this.Position());
        let sleepJob = new Job("Sleep");
        sleepJob.internal = true;
        if (!this.squad.lock() && this.mainHand.lock()) { //Only soldiers go to sleep gripping their weapons
            sleepJob.tasks.push(new Task(TaskType.UNWIELD));
            sleepJob.tasks.push(new Task(TaskType.TAKE));
            sleepJob.tasks.push(new Task(TaskType.STOCKPILEITEM));
        }
        let bed;
        if (bed = wbed.lock()) {
            if (bed.Built()) {
                sleepJob.ReserveEntity(bed);
                sleepJob.tasks.push(new Task(TaskType.MOVE, bed.Position()));
                sleepJob.tasks.push(new Task(TaskType.SLEEP, bed.Position(), bed));
                this.jobs.push(sleepJob);
                return;
            }
        }
        sleepJob.tasks.push(new Task(TaskType.SLEEP, this.Position()));
        if (this.jobs.length)
            JobManager.NPCNotWaiting(uid);
        this.jobs.push(sleepJob);
    }
    SetMap(map) {
        this.map = map;
        this.inventory.SetMap(map);
        while (!map.IsWalkable(this.pos)) {
            this.pos += Random.ChooseInRadius(1);
        }
        this.Position(pos, true);

        this.path = new TCODPath(map.Width(), map.Height(), map, this);
    }
    Position(p, firstTime = false) {
        if (p instanceof Coordinate) {
            this.map.MoveTo(p, this.uid);
            if (!firstTime)
                this.map.MoveFrom(this.pos, this.uid);
            this.pos = p;
            this.inventory.Position(this.pos);
        }
        return this.pos;
    }
    currentTask() {
        return this.jobs.length ? this.jobs[0].tasks[this.taskIndex] : 0;
    }
    nextTask() {
        if (!this.jobs.length) return 0;
        if (this.jobs[0].tasks.length <= this.taskIndex + 1) return 0;

        return this.jobs[0].tasks[this.taskIndex + 1];
    }
    currentJob() {
        return this.jobs.length ? this.jobs[0] : null;
    }

    TaskFinished(result, msg = "") {
        if (DEBUG) {
            if (msg.length > 0) {
                console.log(name, ":", msg);
            }
        }
        this.RemoveEffect(StatusEffectType.EATING);
        this.RemoveEffect(StatusEffectType.DRINKING);
        this.RemoveEffect(StatusEffectType.WORKING);
        if (this.jobs.length > 0) {
            if (result == TaskResult.TASKSUCCESS) {
                if (++this.taskIndex >= this.jobs[0].tasks.length) {
                    this.jobs[0].Complete();
                    this.jobs.unshift();
                    this.taskIndex = 0;
                    this.foundItem = null;
                    this.addedTasksToCurrentJob = 0;
                    this.jobBegun = false;
                }
            } else {
                //Remove any tasks this NPC added onto the front before sending it back to the JobManager
                for (let i = 0; i < this.addedTasksToCurrentJob; ++i) {
                    if (this.jobs[0].tasks.length)
                        this.jobs[0].tasks.shift();
                }
                if (!this.jobs[0].internal)
                    JobManager.CancelJob(this.jobs[0], msg, result);
                this.jobs.unshift();
                this.taskIndex = 0;
                this.DropItem(this.carried);
                this.carried.reset();
                this.foundItem = null;
                this.addedTasksToCurrentJob = 0;
                this.jobBegun = false;
            }
        }
        this.taskBegun = false;
        this.run = NPC.Presets[type].tags.has("calm") ? false : true;

        if (result != TaskResult.TASKSUCCESS) {
            //If we're wielding a container (ie. a tool) spill it's contents
            if (this.mainHand.lock() && this.mainHand.lock()) {
                let cont = this.mainHand.lock();
                if (cont.ContainsWater() > 0) {
                    Game.CreateWater(this.Position(), cont.ContainsWater());
                    cont.RemoveWater(cont.ContainsWater());
                } else if (cont.ContainsFilth() > 0) {
                    Game.CreateFilth(this.Position(), cont.ContainsFilth());
                    cont.RemoveFilth(cont.ContainsFilth());
                }
            }
        }
    }
    Update() {
        if (this.map.NPCList(this.pos).length > 1)
            this._bgcolor = new Color('darkGrey');
        else
            this._bgcolor = new Color('black');

        this.UpdateStatusEffects();
        //Apply armor effects if present
        let arm;
        if (arm = armor.lock()) {
            for (let i = 0; i < Resistance.RES_COUNT; ++i) {
                this.effectiveResistances[i] += arm.Resistance(i);
            }
        }

        if (Random.Generate(UPDATES_PER_SECOND) == 0) { //Recalculate bulk once a second, items may get unexpectedly destroyed
            this.bulk = 0;
            for (let itemi of this.inventory) {
                if (itemi.lock())
                    this.bulk += itemi.lock().GetBulk();
            }
        }
        if (!this.HasEffect(StatusEffectType.FLYING) && this.effectiveStats[NPCStat.MOVESPEED] > 0) this.effectiveStats[NPCStat.MOVESPEED] = Math.max(1, this.effectiveStats[NPCStat.MOVESPEED] - this.map.GetMoveModifier(this.pos));
        if (this.effectiveStats[NPCStat.MOVESPEED] > 0) this.effectiveStats[NPCStat.MOVESPEED] = Math.max(1, this.effectiveStats[NPCStat.MOVESPEED] - this.bulk);

        if (this.needsNutrition) {
            ++this.thirst;
            ++this.hunger;

            if (this.thirst >= THIRST_THRESHOLD) this.AddEffect(StatusEffectType.THIRST);
            else this.RemoveEffect(StatusEffectType.THIRST);
            if (this.hunger >= HUNGER_THRESHOLD) this.AddEffect(StatusEffectType.HUNGER);
            else this.RemoveEffect(StatusEffectType.HUNGER);

            if (this.thirst > THIRST_THRESHOLD && Random.Generate(UPDATES_PER_SECOND * 5 - 1) == 0) {
                this.HandleThirst();
            } else if (this.thirst > THIRST_THRESHOLD * 2)
                this.Kill(this.GetDeathMsgThirst());
            if (this.hunger > HUNGER_THRESHOLD && Random.Generate(UPDATES_PER_SECOND * 5 - 1) == 0) {
                this.HandleHunger();
            } else if (this.hunger > 72000)
                this.Kill(this.GetDeathMsgHunger());
        }

        if (this.needsSleep) {
            ++this.weariness;

            if (this.weariness >= WEARY_THRESHOLD) {
                this.AddEffect(StatusEffectType.DROWSY);
                if (this.weariness > WEARY_THRESHOLD)
                    this.HandleWeariness(); //Give the npc a chance to find a sleepiness curing item
            } else RemoveEffect(StatusEffectType.DROWSY);
        }

        if (!this.HasEffect(StatusEffectType.FLYING)) {
            let water;
            if (water = map.GetWater(this.pos).lock()) {
                let construct = Game.GetConstruction(map.GetConstruction(this.pos)).lock();
                if (water.Depth() > WALKABLE_WATER_DEPTH && (!construct || !construct.HasTag(ConstructionTag.BRIDGE) || !construct.Built())) {
                    this.AddEffect(StatusEffectType.SWIM);
                    this.RemoveEffect(StatusEffectType.BURNING);
                } else {
                    this.RemoveEffect(StatusEffectType.SWIM);
                }
            } else {
                this.RemoveEffect(StatusEffectType.SWIM);
            }

            if (this.map.GetNatureObject(this.pos) >= 0 &&
                Game.natureList[map.GetNatureObject(this.pos)].IsIce() &&
                Random.Generate(UPDATES_PER_SECOND * 5) == 0) this.AddEffect(StatusEffectType.TRIPPED);
        }

        for (let attacki of this.attacks) {
            attacki.Update();
        }

        if (this.faction == PLAYERFACTION && Random.Generate(MONTH_LENGTH - 1) == 0)
            Game.CreateFilth(this.Position());

        if (this.carried.lock()) {
            this.AddEffect(new StatusEffect(StatusEffectType.CARRYING, this.carried.lock().GetGraphic(), this.carried.lock().Color()));
        } else
            this.RemoveEffect(StatusEffectType.CARRYING);

        if (this.HasTrait(Trait.CRACKEDSKULL) && Random.Generate(MONTH_LENGTH * 6) == 0)
            this.GoBerserk();
        if (this.HasEffect(StatusEffectType.BURNING)) {
            if (Random.Generate(UPDATES_PER_SECOND * 3) == 0) {
                let spark = Game.CreateSpell(this.Position(), Spell.StringToSpellType("spark"));
                spark.CalculateFlightPath(Random.ChooseInRadius(this.Position(), 1), 50, this.GetHeight());
            }
            if (this.effectiveResistances[Resistance.FIRE_RES] < 90 && !this.HasEffect(StatusEffectType.RAGE) && (!this.jobs.length || this.jobs[0].name != "Jump into water")) {
                if (Random.Generate(UPDATES_PER_SECOND) == 0) {
                    this.RemoveEffect(StatusEffectType.PANIC);
                    while (!this.jobs.empty()) this.TaskFinished(TaskResult.TASKFAILFATAL);
                    this.jumpJob = new Job("Jump into water");
                    jumpJob.internal = true;
                    let waterPos = Game.FindWater(this.Position());
                    if (waterPos !== Coordinate.undefinedCoordinate) {
                        jumpJob.tasks.push(new Task(TaskType.MOVE, waterPos));
                        this.jobs.push(jumpJob);
                    }
                } else if (!this.coward && NPC.NPCTypeToString(type).toLowerCase() == "orc" && Random.Generate(2) == 0) {
                    this.RemoveEffect(StatusEffectType.PANIC);
                    this.GoBerserk();
                } else {
                    this.AddEffect(StatusEffectType.PANIC);
                }
            }
        }

        this.UpdateHealth();
    }

    UpdateStatusEffects() {
        //Add job related effects
        if (this.jobs.length) {
            for (let stati of this.jobs[0].statusEffects) {
                this.AddEffect(stati);
            }
        }

        for (let i = 0; i < NPCStat.STAT_COUNT; ++i) {
            this.effectiveStats[i] = this.baseStats[i];
        }
        for (let i = 0; i < Resistance.RES_COUNT; ++i) {
            this.effectiveResistances[i] = this.baseResistances[i];
        }

        if (this.factionPtr.IsFriendsWith(PLAYERFACTION))
            this.effectiveResistances[Resistance.DISEASE_RES] = Math.max(0, this.effectiveResistances[DISEASE_RES.DISEASE_RES] - Camp.GetDiseaseModifier());

        ++this.statusGraphicCounter;
        for (let statusEffectI of this.statusEffects) {
            //Apply effects to stats
            for (let i = 0; i < NPCStat.STAT_COUNT; ++i) {
                this.effectiveStats[i] = (this.effectiveStats[i] * statusEffectI.statChanges[i]);
            }
            for (let i = 0; Resistance.RES_COUNT; ++i) {
                this.effectiveResistances[i] = (this.effectiveResistances[i] * statusEffectI.resistanceChanges[i]);
            }

            if (statusEffectI.damage[1] != 0 && --statusEffectI.damage[0] <= 0) {
                statusEffectI.damage[0] = UPDATES_PER_SECOND;
                let dice = new Dice();
                dice.addsub = statusEffectI.damage[1];
                dice.multiplier = 1;
                dice.nb_rolls = 1;
                dice.nb_faces = Math.max(1, dice.addsub / 5);
                let attack = new Attack();
                attack.Amount(dice);
                attack.Type(statusEffectI.damageType);
                this.Damage(attack);
            }

            if (this.factionPtr.IsFriendsWith(PLAYERFACTION) && statusEffectI.negative && !this.HasEffect(StatusEffectType.SLEEPING) && (this.statusEffectsChanged || Random.Generate(MONTH_LENGTH) == 0)) {
                this.statusEffectsChanged = false;
                let removalJobFound = false;
                for (let jobi of this.jobs) {
                    if (jobi.name.indexOf("Get rid of") >= 0) {
                        removalJobFound = true;
                        break;
                    }
                }
                if (!removalJobFound && Item.EffectRemovers.has(statusEffectI.type)) {
                    let fixItem;
                    for (let fixi = Item.EffectRemovers.equal_range(statusEffectI.type)[0]; fixi != Item.EffectRemovers.equal_range(statusEffectI.type)[1] && !fixItem; ++fixi) {
                        fixItem = Game.FindItemByTypeFromStockpiles(fixi[1], this.Position()).lock();
                    }
                    if (fixItem) {
                        let rEffJob = new Job("Get rid of " + statusEffectI.name);
                        rEffJob.internal = true;
                        rEffJob.ReserveEntity(fixItem);
                        rEffJob.tasks.push(new Task(TaskType.MOVE, fixItem.Position()));
                        rEffJob.tasks.push(new Task(TaskType.TAKE, fixItem.Position(), fixItem));
                        if (fixItem.IsCategory(Item.StringToItemCategory("drink")))
                            rEffJob.tasks.push(new Task(TaskType.DRINK));
                        else
                            rEffJob.tasks.push(new Task(TaskType.EAT));
                        this.jobs.push(rEffJob);
                    }
                }
            }

            if (statusEffectI.contagionChance > 0 && Random.Generate(1000) == 0) { //See if we transmit this effect
                this.ScanSurroundings();
                if (this.adjacentNpcs.length > 0 &&
                    Random.Generate(100) < statusEffectI.contagionChance) {
                    for (let npci of this.adjacentNpcs) {
                        let npc;
                        if (npc = npci.lock())
                            npc.TransmitEffect(statusEffectI);
                    }
                }
            }

            //Remove the statuseffect if its cooldown has run out
            if (statusEffectI.cooldown > 0 && --statusEffectI.cooldown == 0) {
                if (statusEffectI == this.statusEffectIterator) {
                    ++this.statusEffectIterator;
                    this.statusGraphicCounter = 0;
                }
                statusEffectI = this.statusEffects.erase(statusEffectI);
                if (this.statusEffectIterator == this.statusEffects.end()) this.statusEffectIterator = this.statusEffects.begin();
            } else ++statusEffectI;
        }

        if (this.statusGraphicCounter > 10) {
            this.statusGraphicCounter = 0;
            if (this.statusEffectIterator != this.statusEffects.end()) ++this.statusEffectIterator;
            else this.statusEffectIterator = this.statusEffects.begin();

            if (this.statusEffectIterator != this.statusEffects.end() && !this.statusEffectIterator.visible) {
                let oldIterator = this.statusEffectIterator;
                ++this.statusEffectIterator;
                while (this.statusEffectIterator != oldIterator) {
                    if (this.statusEffectIterator != this.statusEffects.end()) {
                        if (this.statusEffectIterator.visible) break;
                        ++this.statusEffectIterator;
                    } else this.statusEffectIterator = this.statusEffects.begin();
                }
                if (this.statusEffectIterator != this.statusEffects.end() && !this.statusEffectIterator.visible) this.statusEffectIterator = this.statusEffects.end();
            }
        }
    }

    /**
     * 
     * @param {Job} job 
     */
    StartJob(job) {
        this.TaskFinished(TaskResult.TASKOWNDONE, "");

        if (job.RequiresTool() && (!this.mainHand.lock() || !this.mainHand.lock().IsCategory(job.GetRequiredTool()))) {
            //We insert each one into the beginning, so these are inserted in reverse order
            job.tasks.unshift(job.tasks[0], new Task(TaskType.FORGET));
            /*"forget" the item we found, otherwise later tasks might incorrectly refer to it */
            job.tasks.unshift(job.tasks[0], new Task(TaskType.WIELD));
            job.tasks.unshift(job.tasks[0], new Task(TaskType.TAKE));
            job.tasks.unshift(job.tasks[0], new Task(TaskType.MOVE));
            job.tasks.unshift(job.tasks[0], new Task(TaskType.FIND, this.Position(), null, job.GetRequiredTool()));
            addedTasksToCurrentJob = 5;
        }

        this.jobs.push(job);
    }

    /**
     * 
     * @param {Coordinate} target 
     */
    findPath(target) {
        this.pathMutex.lock();
        this.findPathWorking = true;
        this.pathIsDangerous = false;
        this.pathIndex = 0;

        delete this.path;
        this.path = new TCODPath(this.map.Width(), this.map.Height(), this.map, this);

        this.threadCountMutex.lock();
        if (this.pathingThreadCount < 12) {
            ++this.pathingThreadCount;
            this.threadCountMutex.unlock();
            this.pathMutex.unlock();
            let pathThread = new Thread(tFindPath.bind(), this.path, this.pos.X(), this.pos.Y(), this.target.X(), this.target.Y(), this, true);
        } else {
            this.threadCountMutex.unlock();
            this.pathMutex.unlock();
            tFindPath(this.path, this.pos.X(), this.pos.Y(), this.target.X(), this.target.Y(), this, false);
        }
    }

    //TODO all those messages should be data-driven
    GetDeathMsg() {
        let choice = Random.Generate(5);
        switch (choice) {
            default:
                case 0:
                return this.name + " has died";
            case 1:
                    return this.name + " has left the mortal realm";
            case 2:
                    return this.name + " is no longer among us";
            case 3:
                    return this.name + " is wormfood";
            case 4:
                    return this.name + " lost his will to live";
        }
    }
    GetDeathMsgStrengthLoss() {
        let effectName = "Unknown disease";
        for (let statI of this.statusEffects) {
            if (statI.statChanges[NPCStat.STRENGTH] < 1) {
                effectName = statI.name;
                break;
            }
        }
        let choice = Random.Generate(5);
        switch (choice) {
            default:
                case 0:
                return this.name + " has died from " + effectName;
            case 1:
                    return this.name + " succumbed to " + effectName;
            case 2:
                    return effectName + " claims another victim in " + this.name;
            case 3:
                    return this.name + " is overcome by " + effectName;
            case 4:
                    return effectName + " was too much for " + this.name;
        }
    }
    GetDeathMsgThirst() {
        choice = Random.Generate(2);
        switch (choice) {
            default:
                case 0:
                return this.name + " has died from thirst";
            case 1:
                    return this.name + " died from dehydration";
        }
    }

    GetDeathMsgHunger() {
        choice = Random.Generate(2);
        switch (choice) {
            default:
                case 0:
                return this.name + " has died from hunger";
            case 1:
                    return this.name + " was too weak to live";
        }
    }

    GetDeathMsgCombat(other, damage) {
        let choice = Random.Generate(4);
        let attacker;
        if (attacker = other.lock()) {
            let otherName = attacker.Name();

            switch (damage) {
                case DamageType.DAMAGE_SLASH:
                    switch (choice) {
                        default:
                            case 0:
                            return otherName + " sliced " + this.name + " into ribbons";
                        case 1:
                                return otherName + " slashed " + this.name + " into pieces";
                        case 2:
                                return this.name + " was dissected by " + otherName;
                        case 3:
                                return otherName + " chopped " + this.name + " up";
                    }
                case DamageType.DAMAGE_BLUNT:
                    switch (choice) {
                        default:
                            case 0:
                            return otherName + " bludgeoned " + this.name + " to death";
                        case 1:
                                return otherName + " smashed " + this.name + " into pulp";
                        case 2:
                                return this.name + " was crushed by " + otherName;
                        case 3:
                                return otherName + " hammered " + this.name + " to death";
                    }
                case DAMAGE_PIERCE:
                    switch (choice) {
                        default:
                            case 0:
                            return otherName + " pierced " + this.name + " straight through";
                        case 1:
                                return otherName + " punched holes through " + this.name;
                        case 2:
                                return this.name + " was made into a pincushion by " + otherName;
                    }
                case DAMAGE_FIRE:
                    switch (choice) {
                        default:
                            case 0:
                            return otherName + " burnt " + this.name + " to ashes";
                        case 1:
                                return otherName + " fried " + this.name + " to a crisp";
                        case 2:
                                return this.name + " was barbecued by" + otherName;
                    }
                default:
                    switch (choice) {
                        default:
                            case 0:
                            return otherName + " ended " + this.name + "'s life";
                        case 1:
                                return otherName + " was too much for " + this.name + " to handle";
                        case 2:
                                return otherName + " killed " + this.name;
                    }
            }
        }

        switch (damage) {
            case DamageType.DAMAGE_SLASH:
                switch (choice) {
                    default:
                        case 0:
                        return this.name + " was cut into ribbons";
                    case 1:
                            return this.name + " got slashed into pieces";
                    case 2:
                            return this.name + " was dissected";
                    case 3:
                            return this.name + " was chopped up";
                }
            case DamageType.DAMAGE_BLUNT:
                switch (choice) {
                    default:
                        case 0:
                        return this.name + " was bludgeoned to death";
                    case 1:
                            return this.name + " was smashed into pulp";
                    case 2:
                            return this.name + " was crushed";
                    case 3:
                            return this.name + " was hammered to death";
                }
            case DamageType.DAMAGE_PIERCE:
                switch (choice) {
                    default:
                        case 0:
                        return this.name + " got pierced straight through";
                    case 1:
                            return this.name + " got too many holes punched through";
                    case 2:
                            return this.name + " was made into a pincushion";
                }

            case DamageType.DAMAGE_FIRE:
                switch (choice) {
                    default:
                        case 0:
                        return this.name + " burnt into ashes";
                    case 1:
                            return this.name + " fried to a crisp";
                    case 2:
                            return this.name + " was barbecued";
                }
            default:
                return this.GetDeathMsg();
        }
    }

    /**
     * Checks all the current job's tasks to see if they are potentially doable
     */
    ValidateCurrentJob() {
        if (!this.jobs.length) return;
        //Only check tasks from the current one onwards
        let job = this.jobs[0];
        for (let i = this.taskIndex; i < job.tasks.length; ++i) {
            let task = job.task[i];
            switch (task.action) {
                case FELL:
                case HARVESTWILDPLANT:
                    if (!task.entity.lock() || !task.entity.lock()) {
                        this.TaskFinished(TaskResult.TASKFAILFATAL, "(FELL/HARVESTWILDPLANT)Target doesn't exist");
                        return;
                    } else if ((task.entity.lock()).Marked()) {
                        this.TaskFinished(TaskResult.TASKFAILFATAL, "(FELL/HARVESTWILDPLANT)Target not marked");
                        return;
                    }
                    break;
                case POUR:
                    if (job.name !== "Dump filth") { //Filth dumping is the one time we want to pour liquid onto an unmarked tile
                        if (!task.entity.lock() && !map.GroundMarked(task.target)) {
                            this.TaskFinished(TaskResult.TASKFAILFATAL, "(POUR)Target does not exist");
                            return;
                        }
                    }
                    break;
                case PUTIN:
                    if (!task.entity.lock()) {
                        this.TaskFinished(TaskResult.TASKFAILFATAL, "(PUTIN)Target doesn't exist");
                        return;
                    }
                    break;
                case DIG:
                    let season = Game.CurrentSeason();
                    if (season == Season.EarlyWinter || season == Season.Winter || season == Season.LateWinter) {
                        this.TaskFinished(this.TASKFAILFATAL, "(DIG)Cannot dig in winter");
                        return;
                    }
                    break;
                default:
                    break; //Non-validatable tasks
            }
        }
    }

    /**
     * 
     * @param {Coordinate} upleft 
     * @param {TCODConsole} the_console 
     */
    Draw(upleft, the_console) {
        let screenx = (this.pos.minusCoordinate(upleft)).X();
        let screeny = (this.pos.minusCoordinate(upleft)).Y();
        if (screenx >= 0 && screenx < the_console.getWidth() && screeny >= 0 && screeny < the_console.getHeight()) {
            if (this.statusGraphicCounter < 5 || this.statusEffectIterator == this.statusEffects.end()) {
                the_console.putCharEx(screenx, screeny, this._graphic, this._color, this._bgcolor);
            } else {
                the_console.putCharEx(screenx, screeny, this.statusEffectIterator.graphic, this.statusEffectIterator.color, this._bgcolor);
            }
        }
    }

    /** 
     * @param {number} x
     * @param {number} y
     * @param {Tooltip} tooltip
     */
    GetTooltip(x, y, tooltip) {
        super.GetTooltip(x, y, tooltip);
        if (this.faction == PLAYERFACTION && !this.jobs.length) {
            let job = this.jobs[0];
            if (job.name != "Idle") {
                tooltip.AddEntry(new TooltipEntry(`  ${job.name}`, new Color('grey')));
            }
        }
    }

    /**
     * 
     * @param {Color} value 
     * @param {Color} bvalue 
     */
    color(value, bvalue) {
        this._color = value;
        this._bgcolor = bvalue;
    }
    graphic(value) {
        this._graphic = value;
    }
    GetGraphicsHint() {
        return NPC.Presets[this.type].graphicsHint;
    }
    Expert(value) {
        if (value !== undefined)
            this.expert = value;
        return this.expert;
    }
    Dead() {
        return this.dead;
    }
    Wielding() {
        return this.mainHand;
    }
    Carrying() {
        return this.carried;
    }
    Wearing() {
        return this.armor;
    }
    HasHands() {
        return this.hasHands;
    }
    GetHealth() {
        return this.health;
    }
    GetMaxHealth() {
        return this.maxHealth;
    }
    IsTunneler() {
        return this.isTunneler;
    }
    HasTrait(trait) {
        return this.traits.has(trait);
    }

    //Special case for pathing's sake. Equivalent to HasEffect(FLYING) except it's threadsafe
    IsFlying() {
        return this.isFlying;
    }
    Escaped() {
        return this.escaped;
    }
    GetNPCSymbol() {
        return Presets[this.type].graphic;
    }
    StatusEffects() {
        return this.statusEffects;
    }
    DropItem(witem) {
        let item;
        if (!(item = witem.lock())) return;

        this.inventory.RemoveItem(item);
        item.Position(this.Position());
        item.PutInContainer();
        bulk -= item.GetBulk();

        //If the item is a container with filth in it, spill it on the ground
        if (item) {
            let cont = Container(item);
            if (cont.ContainsFilth() > 0) {
                Game.CreateFilth(this.Position(), cont.ContainsFilth());
                cont.RemoveFilth(cont.ContainsFilth());
            }
        }
    }
    CurrentTarget() {
        if (this.currentTask().target == Coordinate.undefinedCoordinate && this.foundItem.lock()) {
            return this.foundItem.lock().Position();
        }
        return this.currentTask().target;
    }
    currentEntity() {
        if (this.currentTask().entity.lock()) return this.currentTask().entity;
        else if (this.foundItem.lock()) return this.foundItem.lock();
        return null;
    }
    AddEffect(effect) {
        if (effect instanceof StatusEffectType)
            this.AddStatusEffect(new StatusEffect(effect));
        else if (effect instanceof StatusEffect)
            this.AddStatusEffect(effect);
    }
    AddStatusEffect(effect) {
        if (effect.type == StatusEffectType.PANIC && HasEffect(StatusEffectType.BRAVE)) return; //BRAVE prevents PANIC
        if (effect.type == StatusEffectType.BRAVE && HasTrait(Traits.CHICKENHEART)) return; //CHICKENHEARTs can't be BRAVE
        if (effect.type == StatusEffectType.BRAVE && HasEffect(StatusEffectType.PANIC)) this.RemoveEffect(StatusEffectType.PANIC); //Becoming BRAVE stops PANIC

        if (effect.type == StatusEffectType.FLYING) this.isFlying = true;

        for (let statusEffectI of this.statusEffects) {
            if (statusEffectI.type == effect.type) {
                statusEffectI.cooldown = statusEffectI.cooldownDefault;
                return;
            }
        }

        this.statusEffects.push(effect);
        this.statusEffectsChanged = true;
    }
    RemoveEffect(effect) {
        if (effect == StatusEffectType.FLYING) this.isFlying = false;

        for (let statusEffectI of this.statusEffects) {
            if (statusEffectI.type != effect) continue;
            if (statusEffectIterator == statusEffectI) ++statusEffectIterator;
            statusEffects.erase(statusEffectI);
            if (statusEffectIterator == statusEffects.end()) statusEffectIterator = statusEffects.begin();

            if (statusEffectIterator != statusEffects.end() && !statusEffectIterator.visible) {
                let oldIterator = statusEffectIterator;
                ++statusEffectIterator;
                while (statusEffectIterator != oldIterator) {
                    if (statusEffectIterator != statusEffects.end()) {
                        if (statusEffectIterator.visible) break;
                        ++statusEffectIterator;
                    } else statusEffectIterator = statusEffects.begin();
                }
                if (statusEffectIterator != statusEffects.end() && !statusEffectIterator.visible) statusEffectIterator = statusEffects.end();
            }

            return;

        }
    }

    /**
     * @param {StatusEffectType} effect
     */
    HasEffect(effect) {
        for (let statusEffectI = statusEffects.begin(); statusEffectI != statusEffects.end(); ++statusEffectI) {
            if (statusEffectI.type == effect) {
                return true;
            }
        }
        return false;
    }

    /**
     * 
     * @param {boolean} remove_job 
     */
    AbortCurrentJob(remove_job) {
        let job = jobs[0];
        TaskFinished(TASKFAILFATAL, "Job aborted");
        if (remove_job) {
            JobManager.RemoveJob(job);
        }
    }

    /**
     * 
     * @param {Entity} target
     * @param {boolean} careful
     */
    Hit(target, careful = false) {
        if (target.lock()) {
            let npc = target.lock();
            let construction = target.lock();
            for (let attacki = attacks.begin(); attacki != attacks.end(); ++attacki) {
                if (attacki.Cooldown() <= 0) {
                    attacki.ResetCooldown();

                    if (npc) {
                        //First check if the target dodges the attack
                        if (Random.Generate(99) < npc.effectiveStats[DODGE]) {
                            continue;
                        }
                    }

                    let attack = attacki;

                    if (attack.Type() == DAMAGE_WIELDED) {
                        GetMainHandAttack(attack);
                        if (mainHand.lock() && Random.Generate(9) == 0) DecreaseItemCondition(mainHand);
                    }
                    if (npc && !careful && effectiveStats[STRENGTH] >= npc.effectiveStats[NPCSIZE]) {
                        if (attack.Type() == DAMAGE_BLUNT || Random.Generate(4) == 0) {
                            let tar = new Coordinate();
                            tar.X((npc.Position().X() - this.Position().X()) * Math.max((effectiveStats[STRENGTH] - npc.effectiveStats[NPCSIZE]) / 2, 1));
                            tar.Y((npc.Position().Y() - this.Position().Y()) * Math.max((effectiveStats[STRENGTH] - npc.effectiveStats[NPCSIZE]) / 2, 1));
                            npc.CalculateFlightPath(npc.Position() + tar, Random.Generate(25, 19 + 25));
                            npc.pathIndex = -1;
                        }
                    }

                    if (npc) {
                        npc.Damage(attack, this);
                        let dice = new Random.Dice(attack.Amount());
                        damageDealt += dice.Roll();
                        if (HasTrait(FRESH) && damageDealt > 50) RemoveTrait(FRESH);
                    } else if (construction) construction.Damage(attack);
                }
            }
        }
    }

    /**
     * @param {Entity} target
     */
    FireProjectile(target) {
        let targetEntity
        if (targetEntity = target.lock()) {
            for (let attacki = attacks.begin(); attacki != attacks.end(); ++attacki) {
                if (attacki.Type() == DAMAGE_WIELDED) {
                    if (attacki.Cooldown() <= 0) {
                        attacki.ResetCooldown();

                        if (!quiver.lock().empty()) {
                            let projectile = quiver.lock().GetFirstItem().lock();
                            quiver.lock().RemoveItem(projectile);
                            projectile.PutInContainer();
                            projectile.Position(Position());
                            projectile.CalculateFlightPath(targetEntity.Position(), 100, GetHeight());
                            projectile.SetFaction(PLAYERFACTION);
                        }
                    }
                    break;
                }
            }
        }
    }

    /**
     * @param {Entity} target
     */
    CastOffensiveSpell(target) {
        let targetEntity;
        if (targetEntity = target.lock()) {
            for (let attacki = attacks.begin(); attacki != attacks.end(); ++attacki) {
                if (attacki.IsProjectileMagic()) {
                    if (attacki.Cooldown() <= 0) {
                        attacki.ResetCooldown();
                        let spell = Game.CreateSpell(Position(), attacki.Projectile());
                        if (spell) {
                            spell.CalculateFlightPath(target.lock().Position(), Spell.Presets[attacki.Projectile()].speed, GetHeight());
                        }
                    }
                    break;
                }
            }
        }
    }





    //TODO split that monster into smaller chunks
    Think() {
        let tmpCoord = new Coordinate();
        let tmp = 0;

        UpdateVelocity();

        lastMoveResult = Move(lastMoveResult);

        if (velocity == 0) {
            timeCount += thinkSpeed; //Can't think while hurtling through the air, sorry
        } else if (!jobs.empty()) {
            TaskFinished(TASKFAILFATAL, "Flying through the air");
            JobManager.NPCNotWaiting(uid);
        }

        while (timeCount > UPDATES_PER_SECOND) {
            if (Random.GenerateBool()) React(boost.static_pointer_cast < NPC > (shared_from_this()));

            {
                let enemy = aggressor.lock();
                for (letnpci = adjacentNpcs.begin(); npci != adjacentNpcs.end(); ++npci) {
                    let adjacentNpc;
                    if (adjacentNpc = npci.lock()) {
                        if ((!coward && !factionPtr.IsFriendsWith(adjacentNpc.GetFaction())) || adjacentNpc == enemy) {
                            if (currentTask() && currentTask().action == KILL) Hit(adjacentNpc, currentTask().flags != 0);
                            else Hit(adjacentNpc);
                        }
                    }
                }

                if (currentTask() && currentTask().action == KILL) {
                    let target;
                    if (target = currentTask().entity.lock()) {
                        if (Random.Generate(4) == 0 && !map.LineOfSight(pos, target.Position())) {
                            TaskFinished(TASKFAILFATAL, "Target lost");
                        }
                    }
                }
            }

            timeCount -= UPDATES_PER_SECOND;
            if (!jobs.empty() && !jobBegun) {
                jobBegun = true;
                ValidateCurrentJob();
            }

            if (!jobs.empty()) {
                switch (currentTask().action) {
                    case MOVE:
                        if (!map.IsWalkable(currentTarget(), this)) {
                            TaskFinished(TASKFAILFATAL, "(MOVE)Target unwalkable");
                            break;
                        }
                        if (pos == currentTarget()) {
                            TaskFinished(TASKSUCCESS);
                            break;
                        }
                        if (!taskBegun) {
                            findPath(currentTarget());
                            taskBegun = true;
                            lastMoveResult = TASKCONTINUE;
                        }

                        if (lastMoveResult == TASKFAILFATAL || lastMoveResult == TASKFAILNONFATAL) {
                            TaskFinished(lastMoveResult, std.string("(MOVE)Could not find path to target"));
                            break;
                        } else if (lastMoveResult == PATHEMPTY) {
                            if (pos != currentTarget()) {
                                TaskFinished(TASKFAILFATAL, std.string("(MOVE)No path to target"));
                                break;
                            }
                        }
                        break;

                    case MOVENEAR:
                        /*MOVENEAR first figures out our "real" target, which is a tile near
                        to our current target. Near means max 5 tiles away, visible and
                        walkable. Once we have our target we can actually switch over
                        to a normal MOVE task. In case we can't find a visible tile,
                        we'll allow a non LOS one*/
                        MOVENEAR: {
                            let checkLOS = true;
                            for (let i = 0; i < 2; ++i) {
                                tmp = 0;
                                while (tmp++ < 10) {
                                    let tar = map.Shrink(Random.ChooseInRadius(currentTarget(), 5));
                                    if (map.IsWalkable(tar, this) && !map.IsUnbridgedWater(tar) &&
                                        !map.IsDangerous(tar, faction)) {
                                        if (!checkLOS || map.LineOfSight(tar, currentTarget())) {
                                            currentJob().lock().tasks[taskIndex] = Task(MOVE, tar);
                                            break MOVENEAR;
                                            //goto MOVENEARend;
                                        }
                                    }
                                }
                                checkLOS = !checkLOS;
                            }

                            //If we got here we couldn't find a near coordinate
                            TaskFinished(TASKFAILFATAL, "(MOVENEAR)Couldn't find NEAR coordinate");
                        }
                        MOVENEARend:
                            break;


                    case MOVEADJACENT:
                        if (currentEntity().lock()) {
                            if (Game.Adjacent(Position(), currentEntity())) {
                                TaskFinished(TASKSUCCESS);
                                break;
                            }
                        } else {
                            if (Game.Adjacent(Position(), currentTarget())) {
                                TaskFinished(TASKSUCCESS);
                                break;
                            }
                        }
                        if (!taskBegun) {
                            if (currentEntity().lock()) tmpCoord = Game.FindClosestAdjacent(Position(), currentEntity(), GetFaction());
                            else tmpCoord = Game.FindClosestAdjacent(Position(), currentTarget(), GetFaction());
                            if (tmpCoord != undefined) {
                                findPath(tmpCoord);
                            } else {
                                TaskFinished(TASKFAILFATAL, std.string("(MOVEADJACENT)No walkable adjacent tiles"));
                                break;
                            }
                            taskBegun = true;
                            lastMoveResult = TASKCONTINUE;
                        }
                        if (lastMoveResult == TASKFAILFATAL || lastMoveResult == TASKFAILNONFATAL) {
                            TaskFinished(lastMoveResult, std.string("Could not find path to target"));
                            break;
                        } else if (lastMoveResult == PATHEMPTY) {
                            TaskFinished(TASKFAILFATAL, "(MOVEADJACENT)PATHEMPTY");
                        }
                        break;

                    case WAIT:
                        //TODO remove that WAIT hack
                        if (++timer > currentTarget().X()) {
                            timer = 0;
                            TaskFinished(TASKSUCCESS);
                        }
                        break;

                    case BUILD:
                        if (Game.Adjacent(Position(), currentEntity())) {
                            AddEffect(WORKING);
                            tmp = boost.static_pointer_cast < Construction > (currentEntity().lock()).Build();
                            if (tmp > 0) {
                                Announce.AddMsg((boost.format("%s completed") % currentEntity().lock().Name()).str(), TCODColor.white, currentEntity().lock().Position());
                                TaskFinished(TASKSUCCESS);
                                break;
                            } else if (tmp == BUILD_NOMATERIAL) {
                                TaskFinished(TASKFAILFATAL, "(BUILD)Missing materials");
                                break;
                            }
                        } else {
                            TaskFinished(TASKFAILFATAL, "(BUILD)Not adjacent to target");
                            break;
                        }
                        break;

                    case TAKE:
                        if (!currentEntity().lock()) {
                            TaskFinished(TASKFAILFATAL, "(TAKE)No target entity");
                            break;
                        }
                        if (Position() == currentEntity().lock().Position()) {
                            if (boost.static_pointer_cast < Item > (currentEntity().lock()).ContainedIn().lock()) {
                                boost.weak_ptr < Container > cont(boost.static_pointer_cast < Container > (boost.static_pointer_cast < Item > (currentEntity().lock()).ContainedIn().lock()));
                                cont.lock().RemoveItem(
                                    boost.static_pointer_cast < Item > (currentEntity().lock()));
                            }
                            PickupItem(boost.static_pointer_cast < Item > (currentEntity().lock()));
                            TaskFinished(TASKSUCCESS);
                            break;
                        } else {
                            TaskFinished(TASKFAILFATAL, "(TAKE)Item not found");
                            break;
                        }
                        break;

                    case DROP:
                        DropItem(carried);
                        carried.reset();
                        TaskFinished(TASKSUCCESS);
                        break;

                    case PUTIN:
                        if (carried.lock()) {
                            inventory.RemoveItem(carried);
                            carried.lock().Position(Position());
                            if (!currentEntity().lock()) {
                                TaskFinished(TASKFAILFATAL, "(PUTIN)Target does not exist");
                                break;
                            }
                            if (!Game.Adjacent(Position(), currentEntity().lock().Position())) {
                                TaskFinished(TASKFAILFATAL, "(PUTIN)Not adjacent to container");
                                break;
                            }
                            if (boost.dynamic_pointer_cast < Container > (currentEntity().lock())) {
                                let cont = currentEntity().lock();
                                if (!cont.AddItem(carried)) {
                                    TaskFinished(TASKFAILFATAL, "(PUTIN)Container full");
                                    break;
                                }
                                bulk -= carried.lock().GetBulk();
                            } else {
                                TaskFinished(TASKFAILFATAL, "(PUTIN)Target not a container");
                                break;
                            }
                        }
                        carried.reset();
                        TaskFinished(TASKSUCCESS);
                        break;

                    case DRINK: //Either we have an item target to drink, or a water tile
                        if (carried.lock()) { //Drink from an item
                            timer = boost.static_pointer_cast < OrganicItem > (carried.lock()).Nutrition();
                            inventory.RemoveItem(carried);
                            bulk -= carried.lock().GetBulk();
                            ApplyEffects(carried.lock());
                            Game.RemoveItem(carried);
                            carried = null;
                        } else if (timer == 0) { //Drink from a water tile
                            if (Game.Adjacent(pos, currentTarget())) {
                                let WaterNode;
                                if (water = map.GetWater(currentTarget()).lock()) {
                                    if (water.Depth() > DRINKABLE_WATER_DEPTH) {
                                        thirst -= (int)(THIRST_THRESHOLD / 10);
                                        AddEffect(DRINKING);

                                        //Create a temporary water item to give us the right effects
                                        let waterItem = Game.GetItem(Game.CreateItem(Position(), Item.StringToItemType("water"), false, -1)).lock();
                                        ApplyEffects(waterItem);
                                        Game.RemoveItem(waterItem);

                                        if (thirst < 0) {
                                            TaskFinished(TASKSUCCESS);
                                        }
                                        break;
                                    }
                                }
                            }
                            TaskFinished(TASKFAILFATAL, "(DRINK)Not enough water");
                        }

                        if (timer > 0) {
                            AddEffect(DRINKING);
                            thirst -= Math.min((int)(THIRST_THRESHOLD / 5), timer);
                            timer -= (int)(THIRST_THRESHOLD / 5);
                            if (timer <= 0) {
                                timer = 0;
                                TaskFinished(TASKSUCCESS);
                            }
                        }
                        break;

                    case EAT:
                        EAT: {
                            if (carried.lock()) {
                                //Set the nutrition to the timer variable
                                if (boost.dynamic_pointer_cast < OrganicItem > (carried.lock())) {
                                    timer = boost.static_pointer_cast < OrganicItem > (carried.lock()).Nutrition();
                                } else timer = 100;
                                inventory.RemoveItem(carried);
                                bulk -= carried.lock().GetBulk();
                                ApplyEffects(carried.lock());
                                for (let fruiti = Item.Presets[carried.lock().Type()].fruits.begin(); fruiti != Item.Presets[carried.lock().Type()].fruits.end(); ++fruiti) {
                                    Game.CreateItem(Position(), fruiti, true);
                                }

                                Game.RemoveItem(carried);
                            } else if (timer == 0) { //Look in all adjacent tiles for anything edible
                                for (let ix = pos.X() - 1; ix <= pos.X() + 1; ++ix) {
                                    for (let iy = pos.Y() - 1; iy <= pos.Y() + 1; ++iy) {
                                        let p = new Coordinate(ix, iy);
                                        if (map.IsInside(p)) {
                                            for (let itemi = map.ItemList(p).begin(); itemi != map.ItemList(p).end(); ++itemi) {
                                                let item = Game.GetItem(itemi).lock();
                                                if (item && (item.IsCategory(Item.StringToItemCategory("food")) ||
                                                        item.IsCategory(Item.StringToItemCategory("corpse")))) {
                                                    jobs[0].ReserveEntity(item);
                                                    jobs[0].tasks.push(new Task(TaskType.MOVE, item.Position()));
                                                    jobs[0].tasks.push(new Task(TaskType.TAKE, item.Position(), item));
                                                    jobs[0].tasks.push(new Task(TaskType.EAT));
                                                    break EAT;
                                                    // goto CONTINUEEAT;
                                                }
                                            }

                                        }
                                    }
                                }
                            }

                            if (timer > 0) {
                                AddEffect(EATING);
                                hunger -= Math.min(5000, timer);
                                timer -= 5000;
                                if (timer <= 0) {
                                    timer = 0;
                                    TaskFinished(TASKSUCCESS);
                                }
                                break;
                            }
                        }
                        CONTINUEEAT:
                            carried = null;
                        TaskFinished(TASKSUCCESS);
                        break;

                    case FIND:
                        foundItem = Game.FindItemByCategoryFromStockpiles(currentTask().item, currentTask().target, currentTask().flags);
                        if (!foundItem.lock()) {
                            TaskFinished(TASKFAILFATAL, "(FIND)Failed");
                            break;
                        } else {
                            if (factionPtr.IsFriendsWith(PLAYERFACTION)) currentJob().lock().ReserveEntity(foundItem);
                            TaskFinished(TASKSUCCESS);
                            break;
                        }

                    case USE:
                        if (currentEntity().lock() && boost.dynamic_pointer_cast < Construction > (currentEntity().lock())) {
                            tmp = boost.static_pointer_cast < Construction > (currentEntity().lock()).Use();
                            AddEffect(WORKING);
                            if (tmp >= 100) {
                                TaskFinished(TASKSUCCESS);
                            } else if (tmp < 0) {
                                TaskFinished(TASKFAILFATAL, "(USE)Can not use (tmp<0)");
                                break;
                            }
                        } else {
                            TaskFinished(TASKFAILFATAL, "(USE)Attempted to use non-construct");
                            break;
                        }
                        break;

                    case HARVEST:
                        if (carried.lock()) {
                            let stockpile = false;
                            if (nextTask() && nextTask().action == STOCKPILEITEM) stockpile = true;

                            let plant = carried.lock();
                            inventory.RemoveItem(carried);
                            bulk -= plant.GetBulk();
                            carried = null;

                            for (let fruiti = Item.Presets[plant.Type()].fruits.begin(); fruiti != Item.Presets[plant.Type()].fruits.end(); ++fruiti) {
                                if (stockpile) {
                                    let item = Game.CreateItem(Position(), fruiti, false);
                                    Stats.ItemBuilt(Item.Presets[fruiti].name); //Harvesting counts as production
                                    PickupItem(Game.GetItem(item));
                                    stockpile = false;
                                } else {
                                    Game.CreateItem(Position(), fruiti, true);
                                }
                            }

                            Game.RemoveItem(plant);

                            TaskFinished(TASKSUCCESS);
                            break;
                        } else {
                            inventory.RemoveItem(carried);
                            carried = null;
                            TaskFinished(TASKFAILFATAL, "(HARVEST)Carrying nonexistant item");
                            break;
                        }

                    case FELL:
                        let tree;
                        if (tree = currentEntity().lock()) {
                            tmp = tree.Fell(); //This'll be called about 100-150 times per tree
                            if (mainHand.lock() && Random.Generate(300) == 0) DecreaseItemCondition(mainHand);
                            AddEffect(WORKING);
                            if (tmp <= 0) {
                                let stockpile = false;
                                if (nextTask() && nextTask().action == STOCKPILEITEM) stockpile = true;
                                for (let iti = NatureObject.Presets[tree.Type()].components.begin(); iti != NatureObject.Presets[tree.Type()].components.end(); ++iti) {
                                    if (stockpile) {
                                        let item = Game.CreateItem(tree.Position(), iti, false);
                                        Stats.ItemBuilt(Item.Presets[iti].name); //Felling trees counts as item production
                                        DropItem(carried);
                                        PickupItem(Game.GetItem(item));
                                        stockpile = false;
                                    } else {
                                        Game.CreateItem(tree.Position(), iti, true);
                                    }
                                }
                                Game.RemoveNatureObject(tree);
                                TaskFinished(TASKSUCCESS);
                                break;
                            }
                            //Job underway
                            break;
                        }
                        TaskFinished(TASKFAILFATAL, "(FELL) No NatureObject to fell");
                        break;

                    case HARVESTWILDPLANT:
                        let plant;
                        if (plant = currentEntity().lock()) {
                            tmp = plant.Harvest();
                            AddEffect(WORKING);
                            if (tmp <= 0) {
                                let stockpile = false;
                                if (nextTask() && nextTask().action == STOCKPILEITEM) stockpile = true;
                                for (let iti = NatureObject.Presets[plant.Type()].components.begin(); iti != NatureObject.Presets[plant.Type()].components.end(); ++iti) {
                                    if (stockpile) {
                                        let item = Game.CreateItem(plant.Position(), iti, false);
                                        DropItem(carried);
                                        PickupItem(Game.GetItem(item));
                                        stockpile = false;
                                    } else {
                                        Game.CreateItem(plant.Position(), iti, true);
                                    }
                                }
                                Game.RemoveNatureObject(plant);
                                TaskFinished(TASKSUCCESS);
                                break;
                            }
                            //Job underway
                            break;
                        }
                        TaskFinished(TASKFAILFATAL, "(HARVESTWILDPLANT)Harvest target doesn't exist");
                        break;

                    case KILL:
                        //The reason KILL isn't a combination of MOVEADJACENT and something else is that the other moving actions
                        //assume their target isn't a moving one
                        if (!currentEntity().lock()) {
                            TaskFinished(TASKSUCCESS);
                            break;
                        }

                        if (Game.Adjacent(Position(), currentEntity())) {
                            Hit(currentEntity(), currentTask().flags != 0);
                            break;
                        } else if (currentTask().flags == 0 && WieldingRangedWeapon() && quiver.lock() &&
                            !quiver.lock().empty()) {
                            FireProjectile(currentEntity());
                            break;
                        } else if (hasMagicRangedAttacks) {
                            CastOffensiveSpell(currentEntity());
                            break;
                        }

                        if (!taskBegun || Random.Generate(UPDATES_PER_SECOND * 2 - 1) == 0) { //Repath every ~2 seconds
                            tmpCoord = Game.FindClosestAdjacent(Position(), currentEntity(), GetFaction());
                            if (tmpCoord.X() >= 0) {
                                findPath(tmpCoord);
                            }
                            taskBegun = true;
                            lastMoveResult = TASKCONTINUE;
                        }

                        if (lastMoveResult == TASKFAILFATAL || lastMoveResult == TASKFAILNONFATAL) {
                            TaskFinished(lastMoveResult, std.string("(KILL)Could not find path to target"));
                            break;
                        } else if (lastMoveResult == PATHEMPTY) {
                            tmpCoord = Game.FindClosestAdjacent(Position(), currentEntity(), GetFaction());
                            if (tmpCoord.X() >= 0) {
                                findPath(tmpCoord);
                            }
                        }
                        break;

                    case FLEEMAP:
                        if (pos.onExtentEdges(zero, map.Extent())) {
                            //We are at the edge, escape!
                            Escape();
                            return;
                        }

                        //Find the closest edge and change into a MOVE task and a new FLEEMAP task
                        //Unfortunately this assumes that FLEEMAP is the last task in a job,
                        //which might not be.
                        {
                            let target = new Coordinate();
                            tmp = std.abs(pos.X() - map.Width() / 2);
                            if (tmp < std.abs(pos.Y() - map.Height() / 2)) {
                                let target_y = (pos.Y() < map.Height() / 2) ? 0 : map.Height() - 1;
                                target = new Coordinate(pos.X(), target_y);
                            } else {
                                let target_x = (pos.X() < map.Width() / 2) ? 0 : map.Width() - 1;
                                target = new Coordinate(target_x, pos.Y());
                            }
                            if (map.IsWalkable(target, this))
                                currentJob().lock().tasks[taskIndex] = Task(MOVE, target);
                            else
                                currentJob().lock().tasks[taskIndex] = Task(MOVENEAR, target);
                        }
                        currentJob().lock().tasks.push(new Task(TaskType.FLEEMAP));
                        break;

                    case SLEEP:
                        AddEffect(SLEEPING);
                        AddEffect(BADSLEEP);
                        weariness -= 25;
                        if (weariness <= 0) {
                            let entity;
                            if (entity = currentEntity().lock()) {
                                if (entity.HasTag(BED)) {
                                    RemoveEffect(BADSLEEP);
                                }
                            }
                            TaskFinished(TASKSUCCESS);
                            break;
                        }
                        break;

                    case DISMANTLE:
                        let construct;
                        if (construct = currentEntity().lock()) {
                            construct.Condition(construct.Condition() - 10);
                            AddEffect(WORKING);
                            if (construct.Condition() <= 0) {
                                Game.RemoveConstruction(construct);
                                TaskFinished(TASKSUCCESS);
                                break;
                            }
                        } else {
                            TaskFinished(TASKFAILFATAL, "(DISMANTLE)Construction does not exist!");
                        }
                        break;

                    case WIELD:
                        if (carried.lock()) {
                            if (mainHand.lock()) { //Drop currently wielded weapon if such exists
                                DropItem(mainHand);
                                mainHand.reset();
                            }
                            mainHand = carried;
                            carried.reset();
                            TaskFinished(TASKSUCCESS);
                            if (DEBUG) {
                                std.cout << name << " wielded " << mainHand.lock().Name() << "\n";
                            }
                            break;
                        }
                        TaskFinished(TASKFAILFATAL, "(WIELD)Not carrying an item");
                        break;

                    case WEAR:
                        if (carried.lock()) {
                            if (carried.lock().IsCategory(Item.StringToItemCategory("Armor"))) {
                                if (armor.lock()) { //Remove armor and drop if already wearing
                                    DropItem(armor);
                                    armor.reset();
                                }
                                armor = carried;
                                if (DEBUG) {
                                    std.cout << name << " wearing " << armor.lock().Name() << "\n";
                                }
                            } else if (carried.lock().IsCategory(Item.StringToItemCategory("Quiver"))) {
                                if (quiver.lock()) { //Remove quiver and drop if already wearing
                                    DropItem(quiver);
                                    quiver.reset();
                                }
                                quiver = boost.static_pointer_cast < Container > (carried.lock());
                                if (DEBUG) {
                                    std.cout << name << " wearing " << quiver.lock().Name() << "\n";
                                }
                            }
                            carried.reset();
                            TaskFinished(TASKSUCCESS);
                            break;
                        }
                        TaskFinished(TASKFAILFATAL, "(WEAR)Not carrying an item");
                        break;

                    case BOGIRON:
                        if (map.GetType(pos) == TILEBOG) {
                            AddEffect(WORKING);
                            if (Random.Generate(UPDATES_PER_SECOND * 15 - 1) == 0) {
                                let stockpile = false;
                                if (nextTask() && nextTask().action == STOCKPILEITEM) stockpile = true;

                                if (stockpile) {
                                    let item = Game.CreateItem(Position(), Item.StringToItemType("Bog iron"), false);
                                    DropItem(carried);
                                    PickupItem(Game.GetItem(item));
                                    stockpile = false;
                                } else {
                                    Game.CreateItem(Position(), Item.StringToItemType("Bog iron"), true);
                                }
                                TaskFinished(TASKSUCCESS);
                                break;
                            } else {
                                break;
                            }
                        }
                        TaskFinished(TASKFAILFATAL, "(BOGIRON)Not on a bog tile");
                        break;

                    case STOCKPILEITEM:
                        let item;
                        if (item = carried.lock()) {
                            let stockJob = Game.StockpileItem(item, true, true, !item.Reserved());
                            if (stockJob) {
                                stockJob.internal = true;
                                //Add remaining tasks into stockjob
                                for (let i = 1; taskIndex + i < jobs[0].tasks.size(); ++i) {
                                    stockJob.tasks.push(jobs[0].tasks[taskIndex + i]);
                                }
                                jobs[0].tasks.clear();
                                let jobi = jobs.begin();
                                ++jobi;
                                jobs.insert(jobi, stockJob);
                                DropItem(item); //The stockpiling job will pickup the item
                                carried.reset();
                                TaskFinished(TASKSUCCESS);
                                break;
                            }
                        }
                        TaskFinished(TASKFAILFATAL, "(STOCKPILEITEM)Not carrying an item");
                        break;

                    case QUIVER:
                        if (carried.lock()) {
                            if (!quiver.lock()) {
                                DropItem(carried);
                                carried.reset();
                                TaskFinished(TASKFAILFATAL, "(QUIVER)No quiver");
                                break;
                            }
                            inventory.RemoveItem(carried);
                            if (!quiver.lock().AddItem(carried)) {
                                DropItem(carried);
                                carried.reset();
                                TaskFinished(TASKFAILFATAL, "(QUIVER)Quiver full");
                                break;
                            }
                            carried.reset();
                            TaskFinished(TASKSUCCESS);
                            break;
                        }
                        TaskFinished(TASKFAILFATAL, "(QUIVER)Not carrying an item");
                        break;

                    case FILL:
                        {
                            boost.shared_ptr < Container > cont;
                            if (carried.lock() &&
                                (carried.lock().IsCategory(Item.StringToItemCategory("Container")) ||
                                    carried.lock().IsCategory(Item.StringToItemCategory("Bucket")))) {
                                cont = (carried.lock());
                            } else if (mainHand.lock() &&
                                (mainHand.lock().IsCategory(Item.StringToItemCategory("Container")) ||
                                    mainHand.lock().IsCategory(Item.StringToItemCategory("Bucket")))) {
                                cont = (mainHand.lock());
                            }

                            if (cont) {
                                if (!cont.empty() && cont.ContainsWater() == 0 && cont.ContainsFilth() == 0) {
                                    //Not empty, but doesn't have water/filth, so it has items in it
                                    TaskFinished(TASKFAILFATAL, "(FILL)Attempting to fill non-empty container");
                                    break;
                                }

                                let wnode = map.GetWater(currentTarget());
                                if (wnode.lock() && wnode.lock().Depth() > 0 && cont.ContainsFilth() == 0) {
                                    let waterAmount = Math.min(50, wnode.lock().Depth());
                                    wnode.lock().Depth(wnode.lock().Depth() - waterAmount);
                                    cont.AddWater(waterAmount);
                                    TaskFinished(TASKSUCCESS);
                                    break;
                                }

                                let fnode = map.GetFilth(currentTarget());
                                if (fnode.lock() && fnode.lock().Depth() > 0 && cont.ContainsWater() == 0) {
                                    let filthAmount = Math.min(3, fnode.lock().Depth());
                                    fnode.lock().Depth(fnode.lock().Depth() - filthAmount);
                                    cont.AddFilth(filthAmount);
                                    TaskFinished(TASKSUCCESS);
                                    break;
                                }
                                TaskFinished(TASKFAILFATAL, "(FILL)Nothing to fill container with");
                                break;
                            }
                        }
                        TaskFinished(TASKFAILFATAL, "(FILL)Not carrying a container");
                        break;

                    case POUR:
                        {
                            let sourceContainer;
                            if (carried.lock() &&
                                (carried.lock().IsCategory(Item.StringToItemCategory("Container")) ||
                                    carried.lock().IsCategory(Item.StringToItemCategory("Bucket")))) {
                                sourceContainer = boost.static_pointer_cast < Container > (carried.lock());
                            } else if (mainHand.lock() &&
                                (mainHand.lock().IsCategory(Item.StringToItemCategory("Container")) ||
                                    mainHand.lock().IsCategory(Item.StringToItemCategory("Bucket")))) {
                                sourceContainer = boost.static_pointer_cast < Container > (mainHand.lock());
                            }

                            if (sourceContainer) {
                                if (currentEntity().lock() && (currentEntity().lock())) {
                                    let targetContainer = ((currentEntity().lock()));
                                    if (sourceContainer.ContainsWater() > 0) {
                                        targetContainer.AddWater(sourceContainer.ContainsWater());
                                        sourceContainer.RemoveWater(sourceContainer.ContainsWater());
                                    } else {
                                        targetContainer.AddFilth(sourceContainer.ContainsFilth());
                                        sourceContainer.RemoveFilth(sourceContainer.ContainsFilth());
                                    }
                                    TaskFinished(TASKSUCCESS);
                                    break;
                                } else if (map.IsInside(currentTarget())) {
                                    if (sourceContainer.ContainsWater() > 0) {
                                        Game.CreateWater(currentTarget(), sourceContainer.ContainsWater());
                                        sourceContainer.RemoveWater(sourceContainer.ContainsWater());
                                    } else {
                                        Game.CreateFilth(currentTarget(), sourceContainer.ContainsFilth());
                                        sourceContainer.RemoveFilth(sourceContainer.ContainsFilth());
                                    }
                                    TaskFinished(TASKSUCCESS);
                                    break;
                                }
                            } else {
                                TaskFinished(TASKFAILFATAL, "(POUR) Not carrying a container!");
                                break;
                            }
                        }
                        TaskFinished(TASKFAILFATAL, "(POUR)No valid target");
                        break;

                    case DIG:
                        if (!taskBegun) {
                            timer = 0;
                            taskBegun = true;
                        } else {
                            AddEffect(WORKING);
                            if (mainHand.lock() && Random.Generate(300) == 0) DecreaseItemCondition(mainHand);
                            if (++timer >= 50) {
                                map.SetLow(currentTarget(), true);
                                map.ChangeType(currentTarget(), TILEDITCH);
                                let amount = 0;
                                let chance = Random.Generate(9);
                                if (chance < 4) amount = 1;
                                else if (chance < 8) amount = 2;
                                else amount = 3;
                                for (let i = 0; i < amount; ++i)
                                    Game.CreateItem(Position(), Item.StringToItemType("earth"));
                                TaskFinished(TASKSUCCESS);
                            }
                        }
                        break;

                    case FORGET:
                        foundItem.reset();
                        TaskFinished(TASKSUCCESS);
                        break;

                    case UNWIELD:
                        if (mainHand.lock()) {
                            foundItem = mainHand;
                            DropItem(mainHand);
                            mainHand.reset();
                        }
                        TaskFinished(TASKSUCCESS);
                        break;

                    case GETANGRY:
                        aggressive = true;
                        TaskFinished(TASKSUCCESS);
                        break;

                    case CALMDOWN:
                        aggressive = false;
                        TaskFinished(TASKSUCCESS);
                        break;

                    case STARTFIRE:
                        if (!taskBegun) {
                            taskBegun = true;
                            timer = 0;
                        } else {
                            AddEffect(WORKING);
                            if (++timer >= 50) {
                                Game.CreateFire(currentTarget(), 10);
                                TaskFinished(TASKSUCCESS);
                            }
                        }
                        break;

                    case REPAIR:
                        if (currentEntity().lock() && (currentEntity().lock())) {
                            tmp = (currentEntity().lock()).Repair();
                            AddEffect(WORKING);
                            if (tmp >= 100) {
                                if (carried.lock()) { //Repairjobs usually require some material
                                    inventory.RemoveItem(carried);
                                    bulk -= carried.lock().GetBulk();
                                    Game.RemoveItem(carried);
                                    carried.reset();
                                }
                                TaskFinished(TASKSUCCESS);
                            } else if (tmp < 0) {
                                TaskFinished(TASKFAILFATAL, "(USE)Can not use (tmp<0)");
                                break;
                            }
                        } else {
                            TaskFinished(TASKFAILFATAL, "(USE)Attempted to use non-construct");
                            break;
                        }
                        break;

                    case FILLDITCH:
                        if (carried.lock() && carried.lock().IsCategory(Item.StringToItemCategory("earth"))) {
                            if (map.GetType(currentTarget()) != TILEDITCH) {
                                TaskFinished(TASKFAILFATAL, "(FILLDITCH)Target not a ditch");
                                break;
                            }

                            if (!taskBegun) {
                                taskBegun = true;
                                timer = 0;
                            } else {
                                AddEffect(WORKING);
                                if (++timer >= 50) {
                                    inventory.RemoveItem(carried);
                                    bulk -= carried.lock().GetBulk();
                                    Game.RemoveItem(carried);
                                    carried.reset();

                                    map.ChangeType(currentTarget(), TILEMUD);

                                    TaskFinished(TASKSUCCESS);
                                    break;
                                }
                            }
                        } else {
                            TaskFinished(TASKFAILFATAL, "(FILLDITCH)Not carrying earth");
                            break;
                        }
                        break;

                    default:
                        TaskFinished(TASKFAILFATAL, "*BUG*Unknown task*BUG*");
                        break;
                }
            } else {
                if (HasEffect(DRUNK)) {
                    JobManager.NPCNotWaiting(uid);
                    let drunkJob = (new Job("Huh?"));
                    drunkJob.internal = true;
                    run = false;
                    drunkJob.tasks.push(new Task(TaskType.MOVENEAR, this.Position()));
                    jobs.push(drunkJob);
                    if (Random.Generate(75) == 0) GoBerserk();
                } else if (HasEffect(PANIC)) {
                    JobManager.NPCNotWaiting(uid);
                    if (jobs.empty() && threatLocation != undefined) {
                        let fleeJob = (new Job("Flee"));
                        fleeJob.internal = true;
                        let x = pos.X(),
                            y = pos.Y();
                        let dx = x - threatLocation.X();
                        let dy = y - threatLocation.Y();
                        let t1 = new Coordinate(x + dx, y + dy),
                            t2 = new Coordinate(x + dx, y),
                            t3 = new Coordinate(x, y + dy);
                        if (map.IsWalkable(t1, this)) {
                            fleeJob.tasks.push(new Task(TaskType.MOVE, t1));
                            jobs.push(fleeJob);
                        } else if (map.IsWalkable(t2, this)) {
                            fleeJob.tasks.push(new Task(TaskType.MOVE, t2));
                            jobs.push(fleeJob);
                        } else if (map.IsWalkable(t3, this)) {
                            fleeJob.tasks.push(new Task(TaskType.MOVE, t3));
                            jobs.push(fleeJob);
                        }
                    }
                } else if (!GetSquadJob(boost.static_pointer_cast < NPC > (shared_from_this())) &&
                    !FindJob(boost.static_pointer_cast < NPC > (shared_from_this()))) {
                    boost.shared_ptr < Job > idleJob(new Job("Idle"));
                    idleJob.internal = true;
                    if (faction == PLAYERFACTION) {
                        if (Random.Generate(8) < 7) {
                            idleJob.tasks.push(new Task(TaskType.MOVENEAR, Camp.Center()));
                        } else {
                            let randomLocation = Camp.GetRandomSpot();
                            idleJob.tasks.push(new Task(TaskType.MOVENEAR,
                                randomLocation != undefined ? randomLocation : Camp.Center()));
                        }
                        if (map.IsTerritory(pos)) run = false;
                    } else {
                        idleJob.tasks.push(new Task(TaskType.MOVENEAR, this.Position()));
                        run = false;
                    }
                    idleJob.tasks.push(new Task(TaskType.WAIT, new Coordinate(Random.Generate(9), 0)));
                    jobs.push(idleJob);
                }
            }
        }

        return;
    }
    Move(oldResult) {
        if (run)
            nextMove += effectiveStats[MOVESPEED];
        else {
            if (effectiveStats[MOVESPEED] / 3 == 0 && effectiveStats[MOVESPEED] != 0) ++nextMove;
            else nextMove += effectiveStats[MOVESPEED] / 3;
        }
        while (nextMove > 100) {
            nextMove -= 100;
            let pathLock = (pathMutex);
            if (pathLock.owns_lock()) {
                if (nopath) {
                    nopath = false;
                    return TASKFAILFATAL;
                }
                if (pathIndex < path.size() && pathIndex >= 0) {
                    //Get next move
                    let move = new Coordinate();
                    path.get(pathIndex, move.Xptr(), move.Yptr());

                    if (pathIndex != path.size() - 1 && map.NPCList(move).size() > 0) {
                        //Our next move target has an npc on it, and it isn't our target
                        let next = new Coordinate();
                        path.get(pathIndex + 1, next.Xptr(), next.Yptr());
                        /*Find a new target that is adjacent to our current, next, and the next after targets
                        Effectively this makes the npc try and move around another npc, instead of walking onto
                        the same tile and slowing down*/
                        map.FindEquivalentMoveTarget(pos, move, next, this);
                    }

                    //If we're about to step on a dangerous tile that we didn't plan to, repath
                    if (!pathIsDangerous && map.IsDangerous(move, faction)) return TASKFAILNONFATAL;

                    if (map.IsWalkable(move, this)) { //If the tile is walkable, move there
                        Position(move);
                        map.WalkOver(move);
                        ++pathIndex;
                    } else { //Encountered an obstacle. Fail if the npc can't tunnel
                        if (IsTunneler() && map.GetConstruction(move) >= 0) {
                            Hit(Game.GetConstruction(map.GetConstruction(move)));
                            return TASKCONTINUE;
                        }
                        return TASKFAILNONFATAL;
                    }
                    return TASKCONTINUE; //Everything is ok
                } else if (!findPathWorking) return PATHEMPTY; //No path
            }
        }
        //Can't move yet, so the earlier result is still valid
        return oldResult;
    }

    IsPathWalkable() {
        for (let i = 0; i < path.size(); i++) {
            let p = new Coordinate();
            path.get(i, p.Xptr(), p.Yptr());
            if (!map.IsWalkable(p, this)) return false;
        }
        return true;
    }

    speed(value) {
        baseStats[MOVESPEED] = value;
    }
    speed() {
        return effectiveStats[MOVESPEED];
    }


    Kill(deathMessage) {
        if (!dead) { //You can't be killed if you're already dead!
            dead = true;
            health = 0;
            if (NPC.Presets[type].deathItem >= 0) {
                let corpsenum = Game.CreateItem(Position(), NPC.Presets[type].deathItem, false);
                let corpse = Game.GetItem(corpsenum).lock();
                corpse.Color(_color);
                corpse.Name(corpse.Name() + "(" + name + ")");
                if (velocity > 0) {
                    corpse.CalculateFlightPath(GetVelocityTarget(), velocity, GetHeight());
                }
            } else if (NPC.Presets[type].deathItem == -1) {
                Game.CreateFilth(Position());
            }

            while (!jobs.empty()) TaskFinished(TASKFAILFATAL, std.string("dead"));

            while (!inventory.empty()) {
                let witem = inventory.GetFirstItem();
                let item;
                if (item = witem.lock()) {
                    item.Position(Position());
                    item.PutInContainer();
                    item.SetFaction(PLAYERFACTION);
                }
                inventory.RemoveItem(witem);
            }

            if (deathMessage.length() > 0) Announce.AddMsg(deathMessage, (factionPtr.IsFriendsWith(PLAYERFACTION) ? TCODColor.red : TCODColor.brass), this.Position());

            Stats.deaths[NPC.NPCTypeToString(type)] += 1;
            Stats.AddPoints(NPC.Presets[type].health);
        }
    }


    tFindPath(path, x0, y0, x1, y1, npc, threaded) {
        let pathLock = (npc.pathMutex);
        let readCacheLock = (npc.map.cacheMutex);
        npc.nopath = !path.compute(x0, y0, x1, y1);

        //TODO factorize with path walkability test
        for (let i = 0; i < path.size(); ++i) {
            let p = new Coordinate();
            path.get(i, p.Xptr(), p.Yptr());
            if (npc.map.IsDangerousCache(p, npc.faction)) {
                npc.pathIsDangerous = true;
                break; //One dangerous tile = whole path considered dangerous
            }
        }

        npc.findPathWorking = false;
        if (threaded) {
            NPC.threadCountMutex.lock();
            --NPC.pathingThreadCount;
            NPC.threadCountMutex.unlock();
        }
    }






    Damage(attack, aggr) {
        let res = null;

        switch (attack.Type()) {
            case DAMAGE_SLASH:
            case DAMAGE_PIERCE:
            case DAMAGE_BLUNT:
                res = PHYSICAL_RES;
                break;

            case DAMAGE_MAGIC:
                res = MAGIC_RES;
                break;

            case DAMAGE_FIRE:
                res = FIRE_RES;
                break;

            case DAMAGE_COLD:
                res = COLD_RES;
                break;

            case DAMAGE_POISON:
                res = POISON_RES;
                break;

            default:
                res = PHYSICAL_RES;
                break;
        }

        let resistance = (100.0 - effectiveResistances[res]) / 100.0;
        let damage = Math.round((Game.DiceToInt(attack.Amount()) * resistance));
        health -= damage;

        for (let effecti = 0; effecti < attack.StatusEffects().size(); ++effecti) {
            if (Random.Generate(99) < attack.StatusEffects().at(effecti).second) {
                TransmitEffect(attack.StatusEffects().at(effecti).first);
            }
        }

        if (health <= 0) Kill(GetDeathMsgCombat(aggr, attack.Type()));

        if (damage > 0) {
            damageReceived += damage;
            if (res == PHYSICAL_RES && Random.Generate(99) > effectiveResistances[BLEEDING_RES]) {
                Game.CreateBlood(Coordinate(
                        this.Position().X() + Random.Generate(-1, 1),
                        this.Position().Y() + Random.Generate(-1, 1)),
                    Random.Generate(75, 75 + damage * 20));
                if (Random.Generate(10) == 0 && attack.Type() == DAMAGE_SLASH || attack.Type() == DAMAGE_PIERCE) {
                    let gibId = Game.CreateItem(Position(), Item.StringToItemType("Gib"), false, -1);
                    let gib = Game.GetItem(gibId).lock();
                    if (gib) {
                        let target = Random.ChooseInRadius(Position(), 3);
                        gib.CalculateFlightPath(target, Random.Generate(10, 35));
                    }
                }

                if (damage >= maxHealth / 3 && attack.Type() == DAMAGE_BLUNT && Random.Generate(10) == 0) {
                    AddTrait(CRACKEDSKULL);
                }
            } else if (res == FIRE_RES && Random.Generate(Math.max(2, 10 - damage)) == 0) {
                AddEffect(BURNING);
            }
            if (aggr.lock()) aggressor = aggr;
            if (!jobs.empty() && boost.iequals(jobs[0].name, "Sleep")) {
                TaskFinished(TASKFAILFATAL);
            }
        }
    }

    MemberOf(newSquad) {
        squad = newSquad;
        if (!squad.lock()) { //NPC was removed from a squad
            //Drop weapon, quiver and armor
            let equipment;
            if (mainHand.lock()) {
                equipment.push(mainHand.lock());
                mainHand.reset();
            }
            if (armor.lock()) {
                equipment.push(armor.lock());
                armor.reset();
            }
            if (quiver.lock()) {
                equipment.push(quiver.lock());
                quiver.reset();
            }

            for (let eqit = equipment.begin(); eqit != equipment.end(); ++eqit) {
                inventory.RemoveItem(eqit);
                (eqit).Position(Position());
                (eqit).PutInContainer();
            }

            aggressive = false;
        }
    }
    MemberOf() {
        return squad;
    }

    Escape() {
        if (carried.lock()) {
            Announce.AddMsg((boost.format("%s has escaped with [%s]!") % name % carried.lock().Name()).str(),
                TCODColor.yellow, this.Position());
        }
        DestroyAllItems();
        escaped = true;
    }

    DestroyAllItems() {
        while (!inventory.empty()) {
            let item = inventory.GetFirstItem();
            inventory.RemoveItem(item);
            let container;
            if (container = (item.lock())) {
                while (!container.empty()) {
                    let item = container.GetFirstItem();
                    container.RemoveItem(item);
                    Game.RemoveItem(item);
                }
            }
            Game.RemoveItem(item);
        }
    }


    InitializeAIFunctions() {
        FindJob = boost.bind(Faction.FindJob, Faction.factions[faction], _1);
        React = boost.bind(NPC.AnimalReact, _1);

        if (NPC.Presets[type].ai == "PlayerNPC") {
            FindJob = boost.bind(NPC.JobManagerFinder, _1);
            React = boost.bind(NPC.PlayerNPCReact, _1);
        }
    }

    GetMainHandAttack(attack) {
        attack.Type(DAMAGE_BLUNT);
        let weapon;
        if (weapon = mainHand.lock()) {
            let wAttack = weapon.GetAttack();
            attack.Type(wAttack.Type());
            attack.AddDamage(wAttack.Amount());
            attack.Projectile(wAttack.Projectile());
            for (let effecti = wAttack.StatusEffects().begin(); effecti != wAttack.StatusEffects().end(); ++effecti) {
                attack.StatusEffects().push(effecti);
            }
        }
    }

    WieldingRangedWeapon() {
        let weapon;
        if (weapon = mainHand.lock()) {
            let wAttack = weapon.GetAttack();
            return wAttack.Type() == DAMAGE_RANGED;
        }
        return false;
    }

    FindNewWeapon() {
        let weaponValue = 0;
        if (mainHand.lock() && mainHand.lock().IsCategory(squad.lock().Weapon())) {
            weaponValue = mainHand.lock().RelativeValue();
        }
        let weaponCategory = squad.lock() ? squad.lock().Weapon() : Item.StringToItemCategory("Weapon");
        let newWeapon = Game.FindItemByCategoryFromStockpiles(weaponCategory, this.Position(), BETTERTHAN, weaponValue);
        let weapon;
        if (weapon = newWeapon.lock()) {
            let weaponJob = (new Job("Grab weapon"));
            weaponJob.internal = true;
            weaponJob.ReserveEntity(weapon);
            weaponJob.tasks.push(new Task(TaskType.MOVE, weapon.Position()));
            weaponJob.tasks.push(new Task(TaskType.TAKE, weapon.Position(), weapon));
            weaponJob.tasks.push(new Task(TaskType.WIELD));
            jobs.push(weaponJob);
        }
    }

    FindNewArmor() {
        let armorValue = 0;
        if (armor.lock() && armor.lock().IsCategory(squad.lock().Armor())) {
            armorValue = armor.lock().RelativeValue();
        }
        let armorCategory = squad.lock() ? squad.lock().Armor() : Item.StringToItemCategory("Armor");
        let newArmor = Game.FindItemByCategoryFromStockpiles(armorCategory, this.Position(), BETTERTHAN, armorValue);
        let arm
        if (arm = newArmor.lock()) {
            let armorJob = (new Job("Grab armor"));
            armorJob.internal = true;
            armorJob.ReserveEntity(arm);
            armorJob.tasks.push(new Task(TaskType.MOVE, arm.Position()));
            armorJob.tasks.push(new Task(TaskType.TAKE, arm.Position(), arm));
            armorJob.tasks.push(new Task(TaskType.WEAR));
            jobs.push(armorJob);
        }
    }
    UpdateVelocity() {
        if (velocity > 0) {
            nextVelocityMove += velocity;
            while (nextVelocityMove > 100) {
                nextVelocityMove -= 100;
                if (flightPath.size() > 0) {
                    if (flightPath.back().height < ENTITYHEIGHT) { //We're flying low enough to hit things
                        let t = flightPath.back().coord;
                        if (map.BlocksWater(t)) { //We've hit an obstacle
                            health -= velocity / 5;
                            AddEffect(CONCUSSION);

                            if (map.GetConstruction(t) > -1) {
                                let construct;
                                if (construct = Game.GetConstruction(map.GetConstruction(t)).lock()) {
                                    let attack;
                                    attack.Type(DAMAGE_BLUNT);
                                    let damage = new Dice();
                                    damage.addsub = velocity / 5;
                                    damage.multiplier = 1;
                                    damage.nb_rolls = 1;
                                    damage.nb_faces = 5 + effectiveStats[NPCSIZE];
                                    construct.Damage(attack);
                                }
                            }

                            SetVelocity(0);
                            flightPath.clear();
                            return;
                        }
                        if (map.NPCList(t).size() > 0 && Random.Generate(9) < Math.round((2 + map.NPCList(t).size()))) {
                            health -= velocity / 5;
                            AddEffect(CONCUSSION);
                            SetVelocity(0);
                            flightPath.clear();
                            return;
                        }
                    }
                    if (flightPath.back().height == 0) {
                        health -= velocity / 5;
                        AddEffect(CONCUSSION);
                        SetVelocity(0);
                    }
                    Position(flightPath.back().coord);

                    flightPath.pop_back();
                } else SetVelocity(0);
            }
        } else { //We're not hurtling through air so let's tumble around if we're stuck on unwalkable terrain
            if (!map.IsWalkable(pos, this)) {
                for (let radius = 1; radius < 10; ++radius) {
                    for (let ix = pos.X() - radius; ix <= pos.X() + radius; ++ix) {
                        for (let iy = pos.Y() - radius; iy <= pos.Y() + radius; ++iy) {
                            let p = new Coordinate(ix, iy);
                            if (map.IsWalkable(p, this)) {
                                Position(p);
                                return;
                            }
                        }
                    }
                }
            }
        }
    }

    PickupItem(item) {
        if (item.lock()) {
            carried = (item.lock());
            bulk += item.lock().GetBulk();
            if (!inventory.AddItem(carried)) Announce.AddMsg("No space in inventory");
        }
    }


    AbortJob(wjob) {
        let job;
        if (job = wjob.lock()) {
            for (let jobi = jobs.begin(); jobi != jobs.end(); ++jobi) {
                if (jobi == job) {
                    if (job == jobs[0]) {
                        TaskFinished(TASKFAILFATAL, "(AbortJob)");
                    }
                    return;
                }
            }
        }
    }



    ScanSurroundings(onlyHostiles = false) {
        /* The algorithm performs in the following, slightly wrong, way:

           - for each point B at the border of the rectangle at LOS_DISTANCE of the current position C
             - for each point P on a line from C to B (from the inside, outwards)
               - if there is a non-friend NPC on P, update the threat location

           This means that, depending on the order of traversal of the rectangle border, the final
           threatLocation may not be the closest non-friend NPC: on each line, the threat location was
           set to the farthest non-friend NPC.

           But that's ok, as 'gencontain' explains: « It's not like it matters that much anyway. What's
           important is that a cowardly npc runs away from some threat that it sees, not that they
           prioritize threats accurately. A goblin seeing a threat further away and running blindly into
           a closer one sounds like something a goblin would do. »

           If you're not happy with that, just go play chess!
        */
        adjacentNpcs.clear();
        nearNpcs.clear();
        nearConstructions.clear();
        threatLocation = Coordinate(-1, -1);
        seenFire = false;
        let skipPosition = false; //We should skip checking this npc's position after the first time
        let low = map.Shrink(pos - LOS_DISTANCE);
        let high = map.Shrink(pos + LOS_DISTANCE);
        for (let endx = low.X(); endx < high.X(); endx += 2) {
            for (let endy = low.Y(); endy < high.Y(); endy += 2) {
                let end = new Coordinate(endx, endy);
                if (end.onRectangleEdges(low, high)) {
                    let adjacent = 2; //We're going outwards, the first two iterations are considered adjacent to the starting point

                    let p = pos;
                    TCODLine.init(p.X(), p.Y(), end.X(), end.Y());

                    if (skipPosition) {
                        TCODLine.step(p.Xptr(), p.Yptr());
                        --adjacent;
                    }
                    skipPosition = true;

                    do {
                        /*Check constructions before checking for lightblockage because we can see a wall
                          even though we can't see through it*/
                        let constructUid = map.GetConstruction(p);
                        if (constructUid >= 0) {
                            nearConstructions.push(Game.GetConstruction(constructUid));
                        }

                        //Stop moving along this line if our view is blocked
                        if (map.BlocksLight(p) && GetHeight() < ENTITYHEIGHT) break;

                        //Add all the npcs on this tile, or only hostiles if that boolean is set
                        for (let npci = map.NPCList(p).begin(); npci != map.NPCList(p).end(); ++npci) {
                            if (npci != uid) {
                                let npc = Game.GetNPC(npci);
                                if (!factionPtr.IsFriendsWith(npc.GetFaction())) threatLocation = new Coordinate(p);
                                if (!onlyHostiles || !factionPtr.IsFriendsWith(npc.GetFaction())) {
                                    nearNpcs.push(npc);
                                    if (adjacent > 0)
                                        adjacentNpcs.push(npc);
                                }
                            }
                        }

                        //Only care about fire if we're not flying and/or not effectively immune
                        if (!HasEffect(FLYING) && map.GetFire(p).lock()) {
                            if (effectiveResistances[FIRE_RES] < 90) {
                                threatLocation = p;
                                seenFire = true;
                            }
                        }

                        /*Stop if we already see many npcs, otherwise this can start to bog down in
                          high traffic places*/
                        if (adjacent <= 0 && nearNpcs.size() > 16) break;

                        --adjacent;
                    } while (!TCODLine.step(p.Xptr(), p.Yptr()));
                }
            }
        }
    }

    AddTrait(trait) {
        traits.insert(trait);
        switch (trait) {
            case CRACKEDSKULL:
                AddEffect(CRACKEDSKULLEFFECT);
                break;

            default:
                break;
        }
    }

    RemoveTrait(trait) {
        traits.erase(trait);
        switch (trait) {
            case FRESH:
                _color.g = Math.max(0, _color.g - 100);
                break;

            default:
                break;
        }
    }


    GoBerserk() {
        ScanSurroundings();
        let carriedItem;
        if (carriedItem = carried.lock()) {
            inventory.RemoveItem(carriedItem);
            carriedItem.PutInContainer();
            carriedItem.Position(Position());
            let target = Coordinate.undefinedCoordinate;
            if (!nearNpcs.empty()) {
                let creature = boost.next(nearNpcs.begin(), Random.ChooseIndex(nearNpcs)).lock();
                if (creature) target = creature.Position();
            }
            if (target.equals(Coordinate.undefinedCoordinate)) target = Random.ChooseInRadius(Position(), 7);
            carriedItem.CalculateFlightPath(target, 50, GetHeight());
        }
        carried.reset();

        while (!jobs.empty()) TaskFinished(TASKFAILFATAL, "(FAIL)Gone berserk");

        if (!nearNpcs.empty()) {
            let creature = boost.next(nearNpcs.begin(), Random.ChooseIndex(nearNpcs)).lock();
            let berserkJob = (new Job("Berserk!"));
            berserkJob.internal = true;
            berserkJob.tasks.push(new Task(TaskType.KILL, creature.Position(), creature));
            jobs.push(berserkJob);
        }

        AddEffect(RAGE);
    }

    ApplyEffects(item) {
        if (item) {
            for (let addEffecti = Item.Presets[item.Type()].addsEffects.begin(); addEffecti != Item.Presets[item.Type()].addsEffects.end(); ++addEffecti) {
                if (Random.Generate(99) < addEffecti.second)
                    TransmitEffect(addEffecti.first);
            }
            for (let remEffecti = Item.Presets[item.Type()].removesEffects.begin(); remEffecti != Item.Presets[item.Type()].removesEffects.end(); ++remEffecti) {
                if (Random.Generate(99) < remEffecti.second) {
                    RemoveEffect(remEffecti.first);
                    if (remEffecti.first == DROWSY) weariness = 0; //Special case, the effect would come straight back otherwise
                }
            }
        }
    }

    UpdateHealth() {
        if (health <= 0) {
            Kill(GetDeathMsg());
            return;
        }
        if (effectiveStats[STRENGTH] <= baseStats[STRENGTH] / 10) {
            Kill(GetDeathMsgStrengthLoss());
            return;
        }
        if (health > maxHealth) health = maxHealth;

        if (Random.Generate(UPDATES_PER_SECOND * 10) == 0 && health < maxHealth) ++health;

        if (faction == PLAYERFACTION && health < maxHealth / 2 && !HasEffect(HEALING)) {
            let healJobFound = false;
            for (let jobi = jobs.begin(); jobi != jobs.end(); ++jobi) {
                if ((jobi).name.find("Heal") != std.string.npos) {
                    healJobFound = true;
                    break;
                }
            }

            if (!healJobFound && Item.GoodEffectAdders.find(HEALING) != Item.GoodEffectAdders.end()) {
                let healItem;
                for (let fixi = Item.GoodEffectAdders.equal_range(HEALING).first; fixi != Item.GoodEffectAdders.equal_range(HEALING).second && !healItem; ++fixi) {
                    healItem = Game.FindItemByTypeFromStockpiles(fixi.second, this.Position()).lock();
                }
                if (healItem) {
                    let healJob = (new Job("Heal"));
                    healJob.internal = true;
                    healJob.ReserveEntity(healItem);
                    healJob.tasks.push(new Task(TaskType.MOVE, healItem.Position()));
                    healJob.tasks.push(new Task(TaskType.TAKE, healItem.Position(), healItem));
                    if (healItem.IsCategory(Item.StringToItemCategory("drink")))
                        healJob.tasks.push(new Task(TaskType.DRINK));
                    else
                        healJob.tasks.push(new Task(TaskType.EAT));
                    jobs.push(healJob);
                }
            }
        }
    }

    /*I opted to place this in NPC instead of it being a method of Item mainly because Item won't know
    if it's being wielded, worn or whatever, and that's important information when an axe breaks in an
    orc's hand, for exmple*/
    DecreaseItemCondition(witem) {
        let item;
        if (item = witem.lock()) {
            let condition = item.DecreaseCondition();
            if (condition == 0) { //< 0 == does not break, > 0 == not broken
                inventory.RemoveItem(item);
                if (carried.lock() == item) carried.reset();
                if (mainHand.lock() == item) {
                    mainHand.reset();
                    if (currentJob().lock() && currentJob().lock().RequiresTool()) {
                        TaskFinished(TASKFAILFATAL, "(FAIL)Wielded item broken");
                    }
                }
                if (offHand.lock() == item) offHand.reset();
                if (armor.lock() == item) armor.reset();
                if (quiver.lock() == item) quiver.reset();
                let component = [1, item];
                Game.CreateItem(Position(), Item.StringToItemType("debris"), false, -1, component);
                Game.RemoveItem(item);
            }
        }
    }

    DumpContainer(p) {
        let sourceContainer;
        if (carried.lock() && (carried.lock().IsCategory(Item.StringToItemCategory("Bucket")) ||
                carried.lock().IsCategory(Item.StringToItemCategory("Container")))) {
            sourceContainer = (carried.lock());
        } else if (mainHand.lock() && (mainHand.lock().IsCategory(Item.StringToItemCategory("Bucket")) ||
                mainHand.lock().IsCategory(Item.StringToItemCategory("Container")))) {
            sourceContainer = (mainHand.lock());
        }

        if (sourceContainer) {
            if (map.IsInside(p)) {
                if (sourceContainer.ContainsWater() > 0) {
                    Game.CreateWater(p, sourceContainer.ContainsWater());
                    sourceContainer.RemoveWater(sourceContainer.ContainsWater());
                } else {
                    Game.CreateFilth(p, sourceContainer.ContainsFilth());
                    sourceContainer.RemoveFilth(sourceContainer.ContainsFilth());
                }
            }
        }
    }


    GetHeight() {
        if (!flightPath.empty()) return flightPath.back().height;
        if (HasEffect(FLYING) || HasEffect(HIGHGROUND)) return ENTITYHEIGHT + 2;
        return 0;
    }


    SetFaction(newFaction) {
        if (newFaction >= 0 && newFaction < (Faction.factions.size())) {
            faction = newFaction;
            factionPtr = Faction.factions[newFaction];
        } else if (!Faction.factions.empty()) {
            factionPtr = Faction.factions[0];
        }
    }

    TransmitEffect(effect) {
        if (Random.Generate(effectiveResistances[effect.applicableResistance]) == 0) {
            if (effect.type != PANIC || coward) //PANIC can only be transmitted to cowards
                AddEffect(effect);
        }
    }


    serialize(ar, version) {
        ar.register_type(Container);
        ar.register_type(Item);
        ar.register_type(Entity);
        ar.register_type(SkillSet);
        let result = Entity.deserialize(ar, version);
        result.npcType = NPC.NPCTypeToString(this.type);
        result.timeCount = this.timeCount;
        result.jobs = this.jobs;
        result.taskIndex = this.taskIndex;
        result.orderIndex = this.orderIndex;
        result.nopath = this.nopath;
        result.findPathWorking = this.findPathWorking;
        result.timer = this.timer;
        result.nextMove = this.nextMove;
        result.run = this.run;
        result._color = ar.serialize(this._color);
        result._bgcolor = ar.serialize(this._bgcolor);
        result._graphic = this._graphic;
        result.taskBegun = this.taskBegun;
        result.expert = this.expert;
        result.carried = this.carried;
        result.mainHand = this.mainHand;
        result.offHand = this.offHand;
        result.armor = this.armor;
        result.quiver = this.quiver;
        result.thirst = this.thirst;
        result.hunger = this.hunger;
        result.weariness = this.weariness;
        result.thinkSpeed = this.thinkSpeed;
        result.statusEffects = this.statusEffects;
        result.health = this.health;
        result.maxHealth = this.maxHealth;
        result.foundItem = this.foundItem;
        result.inventory = this.inventory;
        result.needsNutrition = this.needsNutrition;
        result.needsSleep = this.needsSleep;
        result.hasHands = this.hasHands;
        result.isTunneler = this.isTunneler;
        result.baseStats = this.baseStats;
        result.effectiveStats = this.effectiveStats;
        result.baseResistances = this.baseResistances;
        result.effectiveResistances = this.effectiveResistances;
        result.aggressive = this.aggressive;
        result.coward = this.coward;
        result.aggressor = this.aggressor;
        result.dead = this.dead;
        result.squad = this.squad;
        result.attacks = this.attacks;
        result.escaped = this.escaped;
        result.addedTasksToCurrentJob = this.addedTasksToCurrentJob;
        result.Skills = this.Skills;
        result.hasMagicRangedAttacks = this.hasMagicRangedAttacks;
        result.traits = this.traits;
        result.damageDealt = this.damageDealt;
        result.damageReceived = this.damageReceived;
        result.jobBegun = this.jobBegun;
        return result;
    }

    load(ar, version) {
        ar.register_type(Container);
        ar.register_type(Item);
        ar.register_type(Entity);
        ar.register_type(SkillSet);
        ar.boost.serialization.base_object(Entity, this);
        let typeName;
        ar & typeName;
        type = -1;
        let failedToFindType = false;
        type = NPC.StringToNPCType(typeName);
        if (type == -1) { //Apparently a creature type that doesn't exist
            type = 2; //Whatever the first monster happens to be
            failedToFindType = true; //We'll allow loading, this creature will just immediately die
        }

        ar & timeCount;
        ar & jobs;
        ar & taskIndex;
        ar & orderIndex;
        ar & nopath;
        ar & findPathWorking;
        ar & timer;
        ar & nextMove;
        ar & run;
        ar & _color.r;
        ar & _color.g;
        ar & _color.b;
        ar & _bgcolor.r;
        ar & _bgcolor.g;
        ar & _bgcolor.b;
        ar & _graphic;
        ar & taskBegun;
        ar & expert;
        ar & carried;
        ar & mainHand;
        ar & offHand;
        ar & armor;
        ar & quiver;
        ar & thirst;
        ar & hunger;
        ar & weariness;
        ar & thinkSpeed;
        ar & statusEffects;
        ar & health;
        if (failedToFindType) health = 0;
        ar & maxHealth;
        ar & foundItem;
        ar & inventory;
        ar & needsNutrition;
        ar & needsSleep;
        ar & hasHands;
        ar & isTunneler;
        ar & baseStats;
        ar & effectiveStats;
        ar & baseResistances;
        ar & effectiveResistances;
        ar & aggressive;
        ar & coward;
        ar & aggressor;
        ar & dead;
        ar & squad;
        ar & attacks;
        ar & escaped;
        ar & addedTasksToCurrentJob;
        ar & Skills;
        ar & hasMagicRangedAttacks;
        ar & traits;
        ar & damageDealt;
        ar & damageReceived;
        if (version >= 1) {
            ar & jobBegun;
        }
        SetFaction(faction); //Required to initialize factionPtr
        InitializeAIFunctions();
    }
}