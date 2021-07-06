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

import { Action } from "./Action.js";
import { Announce } from "../UI/Announce.js";
import { Construction } from "../constructions/Construction.js";
import { Container } from "../items/Container.js";
import { Coordinate } from "../Coordinate.js";
import { Door } from "../constructions/Door.js";
import { Entity } from "../Entity.js";
import { FarmPlot } from "../constructions/Farmplot.js";
import { Game } from "../Game.js";
import { GCamp } from "../GCamp.js";
import { Item } from "../items/Item.js";
import { JobCompletion } from "./JobCompletion.js";
import { JobPriority } from "./JobPriority.js";
import { MapMarker } from "../UI/MapMarker.js";
import { NatureObject } from "../NatureObject.js";
import { Serializable } from "../data/Serialization.js";
import { StatusEffectType } from "../StatusEffectType.js";
import { Stockpile } from "../constructions/Stockpile.js";
import { Task } from "./Task.js";

export class Job extends Serializable {
    static CLASS_VERSION = 1;

    _priority = null;
    completion = null;
    /** @type {Array<Job>} */
    preReqs = [];
    parent = null;
    npcUid = 0;
    zone = 0;
    menial = false;
    paused = false;
    waitingForRemoval = false;
    reservedEntities = [];
    reservedSpot = {};
    attempts = 0;
    attemptMax = 5;
    connectedEntity = null;
    reservedContainer = null;
    reservedSpace = 0;
    tool = -1;
    markedGround = undefined;
    obeyTerritory = true;
    mapMarkers = [];
    fireAllowed = false;
    name = "";
    /** @type {Array<Task>} */
    tasks = [];
    internal = false;
    statusEffects = [];
    constructor(value = "NONAME JOB", pri = JobPriority.MED, z = 0, m = true) {
        this._priority = pri;
        this.completion = JobCompletion.ONGOING;
        this.npcUid = -1;
        this._zone = z;
        this.menial = m;
        this.name = value;
    }

    destructor() {
        this.preReqs = [];
        this.UnreserveEntities();
        this.UnreserveSpot();
        if (this.connectedEntity.lock())
            this.connectedEntity.lock().CancelJob();
        if (this.reservedContainer.lock()) {
            this.reservedContainer.lock().ReserveSpace(false, this.reservedSpace);
        }
        if (GameMap.i.IsInside(this.markedGround)) {
            GameMap.i.Unmark(this.markedGround);
        }
        for (let marki of this.mapMarkers) {
            GameMap.i.RemoveMarker(marki);
        }
        this.mapMarkers = [];
    }


    priority(value) {
        if (value instanceof JobPriority)
            this._priority = value;
        return this._priority;
    }
    Completed() {
        return (this.completion === JobCompletion.SUCCESS || this.completion === JobCompletion.FAILURE);
    }
    Complete() {
        this.completion = JobCompletion.SUCCESS;
    }
    Fail() {
        this.completion = JobCompletion.FAILURE;
        if (this.parent.lock()) this.parent.lock().Fail();
        this.Remove();
    }
    PreReqsCompleted() {
        for (let preReqIter of this.preReqs) {
            if (preReqIter.lock() && !preReqIter.lock().Completed()) return false;
        }
        return true;
    }
    ParentCompleted() {
        if (!this.parent.lock()) return true;
        return this.parent.lock().Completed();
    }

    PreReqs() {
        return this.preReqs;
    }
    Parent(value) {
        if (value && value instanceof Job)
            this.parent = value;
        return this.parent;
    }
    Assign(uid) {
        this.npcUid = Number(uid);
    }
    Assigned() {
        return this.npcUid;
    }
    zone(value) {
        if (value !== undefined)
            this._zone = Number(value);
        return this._zone;
    }
    Menial() {
        return this.menial;
    }
    Paused(value) {
        if (value !== undefined)
            this._zone = !(!(value));
        return this.paused;
    }
    Remove() {
        this.waitingForRemoval = true;
    }
    Removable() {
        return this.waitingForRemoval && this.PreReqsCompleted();
    }
    ReserveEntity(entity) {
        if (entity.lock()) {
            this.reservedEntities.push(entity);
            entity.lock().Reserve(true);
        }
    }
    UnreserveEntities() {
        for (let itemI of this.reservedEntities) {
            if (itemI.lock()) itemI.lock().Reserve(false);
        }
        this.reservedEntities.clear();
    }
    ReserveSpot(sp, pos, type) {
        if (sp.lock()) {
            sp.lock().ReserveSpot(pos, true, type);
            this.reservedSpot = [sp, pos, type];
        }
    }
    UnreserveSpot() {
        if (this.reservedSpot[0].lock()) {
            this.reservedSpot[0].lock().ReserveSpot(this.reservedSpot[1], false, this.reservedSpot[2]);
            this.reservedSpot[0].reset();
        }
    }


    ConnectToEntity(ent) {
        if (ent !== undefined && ent instanceof Entity)
            this.connectedEntity = ent;
        return this.connectedEntity;
    }

    ReserveSpace(cont, bulk = 1) {
        if (cont.lock()) {
            cont.lock().ReserveSpace(true, bulk);
            this.reservedContainer = cont;
            this.reservedSpace = bulk;
        }
    }

    Attempts(value) {
        if (value !== undefined)
            this.attemptMax = Number(value); // Why is this setting attemptMax, and not attempts?
        return this.attempts;
    }
    Attempt() {
        if (++this.attempts > this.attemptMax) return false;
        return true;
    }
    RequiresTool() {
        return this.tool !== -1;
    }
    SetRequiredTool(item) {
        this.tool = item;
    }
    GetRequiredTool() {
        return this.tool;
    }
    MarkGround(ground) {
        if (!GameMap.i.IsInside(ground)) return;
        this.markedGround = ground;
        GameMap.i.Mark(ground);
    }

    static ActionToString(action) {
        switch (action) {
            case Action.NOACTION:
                return "No Action";
            case Action.USE:
                return "Use";
            case Action.TAKE:
                return "Pick up";
            case Action.DROP:
                return "Drop";
            case Action.PUTIN:
                return "Put in";
            case Action.BUILD:
                return "Build";
            case Action.MOVE:
                return "Move";
            case Action.MOVEADJACENT:
                return "Move adjacent";
            case Action.MOVENEAR:
                return "Move Near";
            case Action.WAIT:
                return "Wait";
            case Action.DRINK:
                return "Drink";
            case Action.EAT:
                return "Eat";
            case Action.FIND:
                return "Find";
            case Action.HARVEST:
                return "Harvest";
            case Action.FELL:
                return "Fell";
            case Action.HARVESTWILDPLANT:
                return "Harvest plant";
            case Action.KILL:
                return "Kill";
            case Action.FLEEMAP:
                return "Flee!!";
            case Action.SLEEP:
                return "Sleep";
            case Action.DISMANTLE:
                return "Dismantle";
            case Action.WIELD:
                return "Wield";
            case Action.BOGIRON:
                return "Collect bog iron";
            case Action.STOCKPILEITEM:
                return "Stockpile item";
            case Action.QUIVER:
                return "Quiver";
            case Action.FILL:
                return "Fill";
            case Action.POUR:
                return "Pour";
            case Action.DIG:
                return "Dig";
            case Action.FORGET:
                return "Huh?";
            default:
                return "???";
        }
    }
    DisregardTerritory() {
        this.obeyTerritory = false;
    }

    OutsideTerritory() {
        if (!this.obeyTerritory) return false;

        for (let task of this.tasks) {
            let coord = task.target;
            if (!GameMap.i.IsInside(coord)) {
                if (task.entity.lock()) {
                    coord = task.entity.lock().Position();
                }
            }

            if (GameMap.i.IsInside(coord))
                if (!GameMap.i.IsTerritory(coord))
                    return true;
        }

        return false;
    }
    AddMapMarker(marker) {
        this.mapMarkers.push(GameMap.i.AddMarker(marker));
    }
    AllowFire() {
        this.fireAllowed = true;
    }
    InvalidFireAllowance() {
        if (this.fireAllowed) return false;

        for (let task of this.tasks) {
            let coord = task.target;
            if (!GameMap.i.IsInside(coord)) {
                if (task.entity.lock()) {
                    coord = task.entity.lock().Position();
                }
            }

            if (GameMap.i.IsInside(coord)) {
                if (GameMap.i.GetFire(coord).lock()) return true;
            }
        }

        return false;
    }


    static CreatePourWaterJob(job, location) {
        job.Attempts(1);

        //First search for a container containing water
        let waterItem = Game.i.FindItemByTypeFromStockpiles(Item.StringToItemType("Water"), location).lock();
        let waterLocation = Game.i.FindWater(location);

        //If a water item exists, is closer and contained then use that
        let waterContainerFound = false;
        if (waterItem) {
            let distanceToWater = Number.MAX_SAFE_INTEGER;
            if (waterLocation !== undefined)
                distanceToWater = Coordinate.Distance(location, waterLocation);
            let distanceToItem = Coordinate.Distance(location, waterItem.Position());

            if (distanceToItem < distanceToWater && waterItem.ContainedIn().lock() &&
                waterItem.ContainedIn().lock().IsCategory(Item.StringToItemCategory("Container"))) {
                let container = waterItem.ContainedIn().lock();
                //Reserve everything inside the container
                for (let itemi of this.container) {
                    job.ReserveEntity(itemi);
                }
                job.ReserveEntity(container);
                job.tasks.push(new Task(Action.MOVE, container.Position()));
                job.tasks.push(new Task(Action.TAKE, container.Position(), container));
                waterContainerFound = true;
            }
        }

        if (!waterContainerFound && waterLocation !== undefined) {
            job.SetRequiredTool(Item.StringToItemCategory("Bucket"));
            job.tasks.push(new Task(Action.MOVEADJACENT, waterLocation));
            job.tasks.push(new Task(Action.FILL, waterLocation));
        }

        if (waterContainerFound || waterLocation !== undefined) {
            job.tasks.push(new Task(Action.MOVEADJACENT, location));
            job.tasks.push(new Task(Action.POUR, location));
            if (waterContainerFound) job.tasks.push(new Task(Action.STOCKPILEITEM));
            job.DisregardTerritory();
            job.AllowFire();
            job.statusEffects.push(StatusEffectType.BRAVE);
        } else {
            job.reset();
        }
    }

    serialize(ar, version) {
        ar.register_type(Container);
        ar.register_type(Item);
        ar.register_type(Entity);
        ar.register_type(NatureObject);
        ar.register_type(Construction);
        ar.register_type(Door);
        ar.register_type(FarmPlot);
        ar.register_type(Stockpile);
        ar.register_type(JobPriority);
        ar.register_type(JobCompletion);
        return {
            _priority: ar.serialize(this._priority),
            completion: ar.serialize(this.completion),
            preReqs: ar.serialize(this.preReqs),
            parent: ar.serialize(this.parent),
            npcUid: this.npcUid,
            _zone: this._zone,
            menial: this.menial,
            paused: this.paused,
            waitingForRemoval: this.waitingForRemoval,
            reservedEntities: ar.serialize(this.reservedEntities),
            reservedSpot: ar.serialize(this.reservedSpot),
            attempts: this.attempts,
            attemptMax: this.attemptMax,
            connectedEntity: ar.serialize(this.connectedEntity),
            reservedContainer: ar.serialize(this.reservedContainer),
            reservedSpace: this.reservedSpace,
            tool: this.tool,
            name: this.name,
            tasks: ar.serialize(this.tasks),
            internal: this.internal,
            markedGround: ar.serialize(this.markedGround),
            obeyTerritory: this.obeyTerritory,
            statusEffects: ar.serialize(this.statusEffects)
        };
    }

    static deserialize(data, version, deserializer) {
        deserializer.register_type(Container);
        deserializer.register_type(Item);
        deserializer.register_type(Entity);
        deserializer.register_type(NatureObject);
        deserializer.register_type(Construction);
        deserializer.register_type(Door);
        deserializer.register_type(FarmPlot);
        deserializer.register_type(Stockpile);
        deserializer.register_type(JobPriority);
        deserializer.register_type(JobCompletion);
        let result = new Job(data.name, deserializer.deserialize(data._priority), data._zone, data.menial);
        result.completion = deserializer.deserialize(data.completion);
        result.preReqs = deserializer.deserialize(data.preReqs);
        result.parent = deserializer.deserialize(data.parent);
        result.npcUid = data.npcUid;
        result.paused = data.paused;
        result.waitingForRemoval = data.waitingForRemoval;
        result.reservedEntities = deserializer.deserialize(data.reservedEntities);
        result.reservedSpot = deserializer.deserialize(data.reservedSpot);
        result.attempts = data.attempts;
        result.attemptMax = data.attemptMax;
        result.connectedEntity = deserializer.deserialize(data.connectedEntity);
        result.reservedContainer = deserializer.deserialize(data.reservedContainer);
        result.reservedSpace = data.reservedSpace;
        result.tool = data.tool;
        result.tasks = deserializer.deserialize(data.tasks);
        result.internal = data.internal;
        result.markedGround = deserializer.deserialize(data.markedGround);
        result.obeyTerritory = data.obeyTerritory;
        if (version >= 1) {
            result.statusEffects = deserializer.deserialize(data.statusEffects);
        }
        return result;
    }
}