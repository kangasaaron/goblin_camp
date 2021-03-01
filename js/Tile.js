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
    CacheTile
} from "./CacheTile.js";

import {
    TileType
} from "./TileType.js";

class Tile {
    static CLASS_VERSION = 0;
    type = null;
    /**
     * Does light pass through this tile? Tile type, but also constructions/objects affect this
     */
    vis = true;
    walkable = true;
    buildable = true;
    moveCost = 0;
    construction = -1;
    low = false;
    blocksWater = false;
    water = null;
    graphic = '.';
    foreColor = TCODColor.white;
    originalForeColor = TCODColor.white;
    backColor = TCODColor.black;
    natureObject = -1;
    /**
     * Set of NPC uid's
     */
    npcList = [];
    /**
     * Set of Item uid's
     */
    itemList = [];
    filth = null;
    blood = null;
    fire = null;
    marked = false;
    walkedOver = 0;
    corruption = 0;
    territory = false;
    burnt = 0;
    flow = Direction.NODIRECTION;

    constructor(newType = TileType.TILEGRASS, newCost = 1) {
        this.moveCost = newCost;
        this.ResetType(newType);
    }
    GetType() {
        return this.type;
    }
    BlocksLight() {
        return !this.vis;
    }
    SetBlocksLight(value) {
        this.vis = !value;
    }
    IsWalkable() {
        return this.walkable;
    }
    BlocksWater() {
        return this.blocksWater;
    }
    SetBlocksWater(value) {
        this.blocksWater = value;
    }
    GetTerrainMoveCost() {
        let cost = this.moveCost;
        if (this.construction >= 0) cost += 2;
        return cost;
    }
    SetMoveCost(value) {
        this.moveCost = value;
    }

    SetBuildable(value) {
        this.buildable = value;
    }
    IsBuildable() {
        return this.buildable;
    }
    MoveFrom(uid) {
        if (this.npcList.indexOf(uid) === -1) {
            if (DEBUG) {
                console.log `NPC ${uid} moved off of empty list`;
            }
            return;
        }
        this.npcList.splice(npcList.indexOf(uid), 1);
    }
    MoveTo(uid) {
        this.npcList.push(uid);
    }
    SetConstruction(uid) {
        this.construction = uid;
    }
    GetConstruction() {
        return this.construction;
    }
    GetWater() {
        return this.water;
    }
    SetWater(value) {
        this.water = value;
    }
    IsLow() {
        return this.low;
    }
    SetLow(value) {
        this.low = value;
    }
    GetGraphic() {
        return this.graphic;
    }
    GetForeColor() {
        return this.foreColor;
    }
    GetBackColor() {
        if (!this.blood && !this.marked) return this.backColor;
        let result = this.backColor;
        if (this.blood)
            result[0] = Math.min(255, this.backColor[0] + this.blood.Depth());
        if (this.marked) {
            result[0] += TCODColor.darkGrey[0];
            result[1] += TCODColor.darkGrey[1];
            result[2] += TCODColor.darkGrey[2];
        }
        return result;
    }
    SetNatureObject(val) {
        this.natureObject = val;
    }
    GetNatureObject() {
        return this.natureObject;
    }
    GetFilth() {
        return this.filth;
    }
    SetFilth(value) {
        this.filth = value;
    }
    GetBlood() {
        return this.blood;
    }
    SetBlood(value) {
        this.blood = value;
    }
    GetFire() {
        return this.fire
    }
    SetFire(value) {
        this.fire = value;
    }
    Mark() {
        this.marked = true;
    }
    Unmark() {
        this.marked = false;
    }
    WalkOver() {
        //Ground under a construction wont turn to mud
        if (this.walkedOver < 120 || this.construction < 0) ++this.walkedOver;
        if (this.type == TileType.TILEGRASS) {
            this.foreColor = [
                this.originalForeColor[0] + Math.min(255, walkedOver),
                this.originalForeColor[1] + Math.min(255, corruption),
                this.originalForeColor[2]
            ];
            if (this.burnt > 0) this.Burn(0); //Just to re-do the color
            if (this.walkedOver > 100 && this.graphic != '.' && this.graphic != ',') this.graphic = Random.GenerateBool() ? '.' : ',';
            if (this.walkedOver > 300 && Random.Generate(99) == 0) this.ChangeType(TileType.TILEMUD);
        }
    }
    Corrupt(magnitude) {
        this.corruption += magnitude;
        if (this.corruption < 0) this.corruption = 0;
        if (this.type == TileType.TILEGRASS) {
            this.foreColor = [
                originalForeColor[0] + Math.min(255, walkedOver),
                originalForeColor[1] + Math.min(255, corruption),
                originalForeColor[2]
            ];
            if (this.burnt > 0)
                this.Burn(0); //Just to re-do the color
        }
    }
    ChangeType(newType, height = 0.0) {
        let oldBuildable = this.buildable;
        let oldVis = this.vis;
        let oldWalkable = this.walkable;
        let oldGraphic = this.graphic;
        let keepGraphic = (this.type == TileType.TILEGRASS || this.type == TileType.TILESNOW) && (newType == TileType.TILEGRASS || newType == TileType.TILESNOW);
        this.ResetType(newType, height);
        this.buildable = oldBuildable;
        this.vis = oldVis;
        this.walkable = oldWalkable;
        if (keepGraphic) {
            this.graphic = oldGraphic;
            this.Corrupt(0); //Recalculates color
        }
    }
    SetWalkable(value) {
        let bumpQueue = [];
        this.walkable = value;
        if (value == false) return;
        //We temporarily store the uids elsewhere so that we can safely
        //call them. Iterating through a set while modifying it destructively isn't safe
        for (let npcIter of this.npcList) {
            bumpQueue.push(npcIter);
        }
        for (let itemIter of this.itemList) {
            bumpQueue.push(itemIter);
        }
        while (bumpQueue.length) {
            Game.BumpEntity(bumpQueue.shift());
        }
    }
    StringToTileType(string) {
        string = string.toLowerCase();
        if (string === "grass") {
            return TileType.TILEGRASS;
        } else if (string === "river") {
            return TileType.TILERIVERBED;
        } else if (string === "ditch") {
            return TileType.TILEDITCH;
        } else if (string === "rock") {
            return TileType.TILEROCK;
        } else if (string === "mud") {
            return TileType.TILEMUD;
        } else if (string === "bog") {
            return TileType.TILEBOG;
        }
        return TileType.TILENONE;
    }
    Burn(magnitude) {
        if (this.type != TileType.TILEGRASS) return;
        this.burnt = Math.min(10, this.burnt + magnitude);
        this.burnt = Math.max(0, this.burnt);
        if (this.burnt == 0) {
            this.Corrupt(0);
            /*Corruption changes the color, and by corrupting by 0 we just return to what color the tile
            			would be without any burning*/
            return;
        }

        if (this.type != TileType.TILEGRASS) return;

        if (this.burnt < 5) {
            foreColor[0] = 130 + ((5 - this.burnt) * 10);
            foreColor[1] = 80 + ((5 - this.burnt) * 5);
            foreColor[2] = 0;
        } else {
            foreColor[0] = 50 + ((10 - this.burnt) * 12);
            foreColor[1] = 50 + ((10 - this.burnt) * 6);
            foreColor[2] = (this.burnt - 5) * 10;
        }
    }
    ResetTypeToGrass(height) {
        this.vis = true;
        this.walkable = true;
        this.buildable = true;
        this.low = false;
        this.originalForeColor = [Random.Generate(49), 127, 0];
        if (Random.Generate(9) < 9) {
            if (height < -0.01) {
                this.originalForeColor = [Random.Generate(100, 192), 127, 0];
            } else if (height < 0.0 f) {
                this.originalForeColor = [Random.Generate(20, 170), 127, 0];
            } else if (height > 4.0 f) {
                this.originalForeColor = [90, Random.Generate(120, 150), 90];
            }
        }
        this.backColor = [0, 0, 0];
        switch (Random.Generate(9)) {
            case 0:
            case 1:
            case 2:
            case 3:
                this.graphic = '.';
                break;
            case 4:
            case 5:
            case 6:
            case 7:
                this.graphic = ',';
                break;
            case 8:
                this.graphic = ':';
                break;
            case 9:
                this.graphic = '\'';
                break;
        }
    }
    ResetTypeToDitchOrRiverbed(height) {
        this.vis = true;
        this.walkable = true;
        this.buildable = true;
        this.low = true;
        this.graphic = '_';
        this.originalForeColor = [125, 50, 0];
        this.moveCost = Random.Generate(3, 5);
        this.flow = Direction.NODIRECTION; //Reset flow
    }
    ResetTypeToBog(height) {
        this.vis = true;
        this.walkable = true;
        this.buildable = true;
        this.low = false;
        switch (Random.Generate(9)) {
            case 0:
            case 1:
            case 2:
            case 3:
                this.graphic = '~';
                break;
            case 4:
            case 5:
            case 6:
            case 7:
                this.graphic = ',';
                break;
            case 8:
                this.graphic = ':';
                break;
            case 9:
                this.graphic = '\'';
                break;
        }
        this.originalForeColor = [Random.Generate(184), 127, 70];
        this.backColor = [60, 30, 20];
        this.moveCost = Random.Generate(6, 10);
    }
    ResetTypeToRock(height) {
        this.vis = true;
        this.walkable = true;
        this.buildable = true;
        this.low = false;
        this.graphic = (Random.GenerateBool() ? ',' : '.');
        this.originalForeColor = [Random.Generate(182, 182 + 19), Random.Generate(182, 182 + 19), Random.Generate(182, 182 + 19)];
        this.backColor = [0, 0, 0];
    }
    ResetTypeToMud(height) {
        this.vis = true;
        this.walkable = true;
        this.buildable = true;
        this.low = false;
        this.graphic = Random.GenerateBool() ? '#' : '~';
        this.originalForeColor = [Random.Generate(120, 130), Random.Generate(80, 90), 0];
        this.backColor = [0, 0, 0];
        this.moveCost = 5;
    }
    ResetTypeToSnow(height) {
        this.vis = true;
        this.walkable = true;
        this.buildable = true;
        this.low = false;
        let colorNum = Random.Generate(195, 250);
        this.originalForeColor = [colorNum + Random.Generate(-5, 5), colorNum + Random.Generate(-5, 5),
            colorNum + Random.Generate(-5, 5)
        ];
        this.backColor = [0, 0, 0];
        switch (Random.Generate(9)) {
            case 0:
            case 1:
            case 2:
            case 3:
                this.graphic = '.';
                break;
            case 4:
            case 5:
            case 6:
            case 7:
                this.graphic = ',';
                break;
            case 8:
                this.graphic = ':';
                break;
            case 9:
                this.graphic = '\'';
                break;
        }
    }
    ResetType(newType, height = 0.0) {
        this.type = newType;
        if (type == TileType.TILEGRASS) {
            this.ResetTypeToGrass(height);
        } else if (type == TileType.TILEDITCH || type == TileType.TILERIVERBED) {
            this.ResetTypeToDitchOrRiverbed(height);
        } else if (type == TileType.TILEBOG) {
            this.ResetTypeToBog(height);
        } else if (type == TileType.TILEROCK) {
            this.ResetTypeToRock(height);
        } else if (type == TileType.TILEMUD) {
            this.ResetTypeToMud(height);
        } else if (type == TileType.TILESNOW) {
            this.ResetTypeToSnow(height);
        } else {
            this.vis = false;
            this.walkable = false;
            this.buildable = false;
        }
        this.foreColor = this.originalForeColor;
    }
    serialize(ar, version) {
        ar.register_type(TileType);
        ar.register_type(Direction);
        ar.register_type(WaterNode);
        ar.register_type(FireNode);
        ar.register_type(BloodNode);
        return {
            "type": ar.serializable(this.type),
            "vis": this.vis,
            "walkable": this.walkable,
            "buildable": this.buildable,
            "moveCost": this.moveCost,
            "construction": this.construction,
            "low": this.low,
            "blocksWater": this.blocksWater,
            "water": ar.serializable(this.water),
            "graphic": this.graphic,
            "foreColor": this.foreColor,
            "originalForeColor": this.originalForeColor,
            "backColor": this.backColor,
            "natureObject": this.natureObject,
            "npcList": this.npcList,
            "itemList": this.itemList,
            "filth": ar.serializable(this.filth),
            "blood": ar.serializable(this.blood),
            "marked": this.marked,
            "walkedOver": this.walkedOver,
            "corruption": this.corruption,
            "territory": this.territory,
            "burnt": this.burnt,
            "fire": ar.serializable(this.fire),
            "flow": this.flow,
        };
    }
    static deserialize(data, version, deserializer) {
        ar.register_type(TileType);
        ar.register_type(Direction);
        ar.register_type(WaterNode);
        ar.register_type(FireNode);
        ar.register_type(BloodNode);
        let result = new Tile(
            deserializer.deserializable(data.type),
            data.cost
        );
        result.vis = data.vis;
        result.walkable = data.walkable;
        result.buildable = data.buildable;
        result.construction = data.construction;
        result.low = data.low;
        result.blocksWater = data.blocksWater;
        result.water = deserialzier.deserializable(data.water);
        result.graphic = data.graphic;
        result.foreColor = data.foreColor;
        result.originalForeColor = data.originalForeColor;
        result.backColor = data.backColor;
        result.natureObject = data.natureObject;
        result.npcList = data.npcList;
        result.itemList = data.itemList;
        result.filth = deserialzier.deserializable(data.filth);
        result.blood = deserialzier.deserializable(data.blood);
        result.marked = data.marked;
        result.walkedOver = data.walkedOver;
        result.corruption = data.corruption;
        result.territory = data.territory;
        result.burnt = data.burnt;
        result.fire = deserialzier.deserializable(data.fire);
        result.flow = data.flow;
        return result;
    }
}