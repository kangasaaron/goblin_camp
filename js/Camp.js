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

import { Announce } from "./UI/Announce.js";
import { Constants } from "./Constants.js";
import { Game } from "./Game.js";
import { JobManager } from "./jobs/JobManager.js";
import { Generate, ChooseInRectangle } from "./Random.js";
import { Script } from "./scripting/Script.js";
import { Stats } from "./Stats.js";
import { Coordinate } from "./Coordinate.js";
import { Construction } from "./constructions/Construction.js";
import { ConstructionTag } from "./constructions/ConstructionTag.js";
import { TCODColor } from "../fakeTCOD/libtcod.js";
import { Job } from "./jobs/Job.js";
import { JobPriority } from "./jobs/JobPriority.js";
import { Serializable } from "./data/Serialization.js";
import { Singletonify } from "./cplusplus/Singleton.js";

    
class Camp extends Serializable{
    //Version 2 = 0.2 - diseaseChance
    static CLASS_VERSION = 2;
    centerX = 220.0;
    centerY = 220.0;
    buildingCount = 0;
    locked = false;
    lockedCenter = new Coordinate();
    tier = 0;
    name = "Clearing";
    article = "a";
    workshops = 0;
    farmplots = 0;
    upperCorner = new Coordinate();
    lowerCorner = new Coordinate();
    autoTerritory = true;
    waterZones = [];
    menialWaterJobs = [];
    expertWaterJobs = [];
    diseaseModifier = 0;
    spawningPool = null;
    static get i(){
        if(!this._instance)
            this._instance = new this();
        return this._instance;
    }
    static Reset(){
        this._instance = null;
        return this.i;
    }
    Center() {
        return this.locked ? this.lockedCenter : new Coordinate(this.centerX, this.centerY);
    }
    SetCenter(newCenter) {
        this.centerX = newCenter.X();
        this.centerY = newCenter.Y();
    }
    LockCenter(newCenter) {
        this.lockedCenter = newCenter;
        this.locked = true;
    }
    UnlockCenter() {
        this.locked = false;
    }
    GetTier() {
        return this.tier;
    }
    GetName() {
        return this.name;
    }
    IsAutoTerritoryEnabled() {
        return this.autoTerritory;
    }
    GetUprTerritoryCorner() {
        return this.upperCorner;
    }
    GetLowTerritoryCorner() {
        return this.lowerCorner;
    }
    GetDiseaseModifier() {
        return this.diseaseModifier;
    }

    ConstructionBuilt(type) {
        if (Construction.Presets[type].tags[ConstructionTag.WORKSHOP]) ++this.workshops;
        if (Construction.Presets[type].tags[ConstructionTag.FARMPLOT]) ++this.farmplots;
    }

    DisableAutoTerritory() {
        this.autoTerritory = false;
    }
    ToggleAutoTerritory() {
        this.autoTerritory = !this.autoTerritory;
        Announce.i.AddMsg(`Automatic territory handling ${(this.autoTerritory ? "enabled" : "disabled")}`, TCODColor.cyan);
    }
    Update() {
        this.UpdateTier();
        this.UpdateWaterJobs();

        this.diseaseModifier = Math.round(Math.pow((Game.i.GoblinCount() + Game.i.OrcCount() - 20) / 10, 2.0));
    }
    serialize(ar, version) {
        ar.register_type(Coordinate);
        return {
            centerX: this.centerX,
            centerY: this.centerY,
            buildingCount: this.buildingCount,
            locked: this.locked,
            lockedCenter: ar.serialize(this.lockedCenter),
            tier: this.tier,
            name: this.name,
            workshops: this.workshops,
            farmplots: this.farmplots,
            upperCorner: ar.serialize(this.upperCorner),
            lowerCorner: ar.serialize(this.lowerCorner),
            autoTerritory: this.autoTerritory,
            article: this.article,
            waterZones: this.waterZones,
            menialWaterJobs: this.menialWaterJobs,
            expertWaterJobs: this.expertWaterJobs,
            spawningPool: this.spawningPool,
            diseaseModifier: this.diseaseModifier,
        };
    }
    static deserialize(data, version, deserializer) {
        deserializer.register_type(Coordinate);
        let result = new Camp();
        result.centerX = data.centerX;
        result.centerY = data.centerY;
        result.buildingCount = data.buildingCount;
        result.locked = data.locked;
        result.lockedCenter = deserializer.deserializable(data.lockedCenter);
        result.tier = data.tier;
        result.name = data.name;
        result.workshops = data.workshops;
        result.farmplots = data.farmplots;
        result.upperCorner = deserializer.deserializable(data.upperCorner);
        result.lowerCorner = deserializer.deserializable(data.lowerCorner);
        result.autoTerritory = data.autoTerritory;
        result.article = data.article;
        result.waterZones = data.waterZones;
        result.menialWaterJobs = data.menialWaterJobs;
        result.expertWaterJobs = data.expertWaterJobs;
        if (version >= 1) {
            result.spawningPool = data.spawningPool;
        }
        if (version >= 2) {
            result.diseaseModifier = data.diseaseModifier;
        }
        return result;
    }
    GetRandomSpot() {
        for (let tries = 0; tries < 20; ++tries) {
            let randomLocation = Random.ChooseInRectangle(this.upperCorner, this.lowerCorner);
            if (GameMap.i.IsTerritory(randomLocation) &&
                !GameMap.i.IsDangerous(randomLocation, Constants.PLAYERFACTION) &&
                GameMap.i.IsWalkable(randomLocation) &&
                !GameMap.i.GetWater(randomLocation).lock())
                return randomLocation;
        }
        return Coordinate.undefinedCoordinate;
    }
    AddWaterZone(from, to) {
        for (let x = from.X(); x <= to.X(); ++x) {
            for (let y = from.Y(); y <= to.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (GameMap.i.IsInside(p)) {
                    if (!GameMap.i.GroundMarked(p)) {
                        this.waterZones.push(p);
                        GameMap.i.Mark(p);
                    }
                }
            }
        }
    }

    RemoveWaterZone(from, to) {
        for (let x = from.X(); x <= to.X(); ++x) {
            for (let y = from.Y(); y <= to.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (GameMap.i.IsInside(p)) {
                    let index = this.waterZones.findIndex(zone => zone.equals(p));
                    if (index > -1) {
                        this.waterZones.splice(index, 1);
                        GameMap.i.Unmark(p);
                    }
                }
            }
        }
    }
    UpdateCenterAddingBuilding(building) {
        if (this.buildingCount === 0) {
            this.upperCorner = building;
            this.lowerCorner = building;
        } else {
            if (building.X() < this.upperCorner.X()) this.upperCorner.X(building.X());
            if (building.X() > this.lowerCorner.X()) this.lowerCorner.X(building.X());
            if (building.Y() < this.upperCorner.Y()) this.upperCorner.Y(building.Y());
            if (building.Y() > this.lowerCorner.Y()) this.lowerCorner.Y(building.Y());
            if (this.autoTerritory) GameMap.i.SetTerritoryRectangle(this.upperCorner, this.lowerCorner, true);
        }

        this.centerX = (this.centerX * this.buildingCount + building.X()) / (this.buildingCount + 1);
        this.centerY = (this.centerY * this.buildingCount + building.Y()) / (this.buildingCount + 1);
        ++this.buildingCount;
    }
    UpdateCenterRemovingBuilding(building) {
        if (this.buildingCount > 1) {
            this.centerX = (this.centerX * this.buildingCount - building.X()) / (this.buildingCount - 1);
            this.centerY = (this.centerY * this.buildingCount - building.Y()) / (this.buildingCount - 1);
        } else {
            this.centerX = 220.0;
            this.centerY = 220.0;
        }
        --this.buildingCount;
    }
    UpdateCenter(newBuilding, add) {
        if (add) {
            this.UpdateCenterAddingBuilding(newBuilding);
        } else {
            this.UpdateCenterRemovingBuilding(newBuilding);
        }
    }
    UpdateTier() {
        let population = Game.i.OrcCount() + Game.i.GoblinCount();

        // Immortius: There was previously an issue with new tier calculation - because
        // the check for each tier had a population range, if you exceeded that population
        // range before you achieved the other requirements you would not be able to reach that tier.
        // The solution is to check eligability from highest tier downwards and avoid population ranges.
        let newTier = 0;
        if (this.farmplots > 0) {
            if (this.workshops > 10 && Stats.GetItemsBuilt() > 10000 && population >= 200)
                newTier = 6;
            else if (this.workshops > 10 && Stats.GetItemsBuilt() > 5000 && population >= 100)
                newTier = 5;
            else if (this.workshops > 10 && Stats.GetItemsBuilt() > 3000 && population >= 70)
                newTier = 4;
            else if (this.workshops > 10 && Stats.GetItemsBuilt() > 1000 && population >= 50)
                newTier = 3;
            else if (this.workshops > 5 && Stats.GetItemsBuilt() > 400 && population >= 30)
                newTier = 2;
            else if (this.workshops > 1 && Stats.GetItemsBuilt() > 20 && population >= 20)
                newTier = 1;
        }

        if (newTier < this.tier) ++newTier; //Only drop the camp tier down if newtier <= tier-2

        if (newTier !== this.tier)
            this.TierChange(newTier);
    }
    TierChange(newTier) {
        let positive = newTier > this.tier;
        this.tier = newTier;
        let oldName = this.name;
        switch (this.tier) {
            case 0:
                this.article = "a";
                this.name = "Clearing";
                break;
            case 1:
                this.article = "a";
                this.name = "Camp";
                break;
            case 2:
                this.article = "a";
                this.name = "Settlement";
                break;
            case 3:
                this.article = "an";
                this.name = "Outpost";
                break;
            case 4:
                this.article = "a";
                this.name = "Fort";
                break;
            case 5:
                this.article = "a";
                this.name = "Stronghold";
                break;
            case 6:
                this.article = "a";
                this.name = "Citadel";
                break;
        }
        Announce.i.AddMsg(`Your ${oldName} is now ${this.article} ${this.name}!`,
            positive ? TCODColor.lightGreen : TCODColor.yellow);
        Script.Event.TierChanged(this.tier, this.name);
    }
    UpdateWaterJobs() {
        //Remove finished jobs
        for (let i = 0; i < this.menialWaterJobs.length; i++) {
            let jobi = this.menialWaterJobs[i];
            if (!jobi.lock())
                jobi = this.menialWaterJobs.splice(i, 1);
            else
                ++jobi;
        }
        for (let i = 0; i < this.expertWaterJobs.length; i++) {
            let jobi = this.expertWaterJobs[i];
            if (!jobi.lock())
                jobi = this.expertWaterJobs.splice(i, 1);
            else
                ++jobi;
        }

        if (this.waterZones <= 0) return;

        //The amount and priority of water pouring jobs depends on if there's fire anywhere
        if (Game.i.fireNodes.length > 0) {
            for (let i = 1; this.menialWaterJobs.length < Game.i.GoblinCount() && i <= 10; ++i) {
                let waterJob = new Job("Pour water", JobPriority.VERYHIGH, 0, true);
                let location = this.waterZones[Generate(this.waterZones.length - 1)];
                Job.CreatePourWaterJob(waterJob, location);
                if (waterJob) {
                    this.menialWaterJobs.push(waterJob);
                    JobManager.AddJob(waterJob);
                }
            }
            for (let i = 1; this.expertWaterJobs.length < Game.i.OrcCount() && i <= 10; ++i) {
                let waterJob = new Job("Pour water", JobPriority.VERYHIGH, 0, false);
                let location = this.waterZones[Generate(this.waterZones.length - 1)];
                Job.CreatePourWaterJob(waterJob, location);
                if (waterJob) {
                    this.expertWaterJobs.push(waterJob);
                    JobManager.AddJob(waterJob);
                }
            }
        } else {
            if (this.menialWaterJobs.length < 5) {
                let waterJob = new Job("Pour water", JobPriority.LOW, 0, true);
                let location = this.waterZones[Generate(this.waterZones.length - 1)];
                Job.CreatePourWaterJob(waterJob, location);
                if (waterJob) {
                    this.menialWaterJobs.push(waterJob);
                    JobManager.AddJob(waterJob);
                }
            }
        }
    }
}

Singletonify(Camp);

export { Camp };