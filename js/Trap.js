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
    Construction
} from "./Construction.js";
import {
    Task
} from "./Task.js";

export class Trap extends Construction {
    static CLASS_VERSION = 0;
    ready = false;
    reloadJob = null;
    readyGraphic = 0;

    constructor(vtype = 0, pos = Coordinate(0, 0)) {
        super(vtype, pos);
        this.ready = true;
        this.readyGraphic = this.graphic[1];
    }
    Update() {
        if (!this.built) return;
        if (!this.ready || this.map.NPCList(this.pos).length == 0) return;

        let npc = Game.GetNPC(this.map.NPCList(this.pos)[0]);
        if (!npc || npc.HasEffect(FLYING)) return;

        this.ready = false;
        this.graphic[1] = 62;
        this.npc.Damage(Construction.Presets[type].trapAttack);
        Faction.factions[npc.GetFaction()].TrapDiscovered(this.Position());
    }
    GetMoveCostModifier(visible) {
        return visible ? 100 : -(this.map.GetTerrainMoveCost(this.pos) - 1); //-1 because a movecost of 0 = unwalkable
    }

    Use() {
        if (this.ready) return -1;
        if (++this.progress != 75) return this.progress;
        this.ready = true;
        this.graphic[1] = this.readyGraphic;
        this.progress = 0;
        //Hide the trap from everyone unfriendly to the player faction
        for (let i = 0; i < Faction.factions.length; ++i) {
            Faction.factions[i].TrapSet(Position(), Faction.factions[i].IsFriendsWith(PLAYERFACTION));
        }
        return 100;

    }
    SpawnRepairJob() {
        super.SpawnRepairJob();
        if (ready || this.reloadJob.lock()) return;
        //Spawn reload job only if one doesn't already exist
        let reload = new Job("Reset " + name);
        reload.tasks.push(new Task(MOVEADJACENT, this.Position(), this));
        reload.tasks.push(new Task(USE, this.Position(), this));
        reload.DisregardTerritory();
        JobManager.AddJob(reload);
        this.reloadJob = reload;
    }
    AcceptVisitor(visitor) {
        visitor.Visit(this);
    }
    IsReady() {
        return this.ready;
    }
    serialize(ar, version) {
        let result = super.serialize(ar, version);
        result.ready = this.ready;
        result.reloadJob = this.reloadJob;
        result.readyGraphic = this.readyGraphic;
        return result;
    }

    static deserialize(data, version, deserializer) {
        let ConstructionResult = Construction.deserialize(data, version, deserializer);
        let TrapResult = new Trap(ConstructionResult.type);
        for (let key of Object.keys(ConstructionResult)) {
            TrapResult[key] = ConstructionResult[key];
        }
        TrapResult.ready = data.ready;
        TrapResult.reloadJob = data.reloadJob;
        TrapResult.readyGraphic = data.readyGraphic;
        return TrapResult;
    }
}