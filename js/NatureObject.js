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
    Entity
}
from "./Entity.js";
import {
    NatureObjectPreset
}
from "./NatureObjectPreset.js";
import {
    ItemType
}
from "./ItemType.js";
import {
    NatureObjectType
}
from "./NatureObjectType.js";
import {
    Color
} from "./libtcod.js";

export class NatureObject extends Entity {
    static CLASS_VERSION = 1;
    static Presets = [];
    type = 0;
    graphic = 0;
    condition = 0;
    color = new Color();
    marked = false;
    tree = false;
    harvestable = false;
    ice = false;

    constructor(pos = Coordinate.zero, typeVal = 0) {
        super();
        this.type = typeVal;
        this.pos = pos;
        this.name = NatureObject.Presets[this.type].name;
        this.graphic = NatureObject.Presets[this.type].graphic;
        this.color = NatureObject.Presets[this.type].color.clone();
        this.condition = NatureObject.Presets[this.type].condition;
        this.tree = NatureObject.Presets[this.type].tree;
        this.harvestable = NatureObject.Presets[this.type].harvestable;
    }
    destructor() {
        if (!NatureObject.Presets[this.type].walkable) {
            Map.SetWalkable(this.pos, true);
            Map.SetBlocksLight(this.pos, false);
        }
        Map.SetBuildable(this.pos, true);
        super.destructor();
    }
    Update() {}
    GetGraphicsHint() {
        return NatureObject.Presets[this.type].graphicsHint;
    }
    Mark() {
        this.marked = true;
    }
    Unmark() {
        this.marked = false;
    }
    Marked() {
        return this.marked;
    }
    CancelJob(int) {
        this.marked = false;
    }
    Fell() {
        return --this.condition;
    }
    Harvest() {
        return --this.condition;
    }
    Type() {
        return this.type;
    }
    Tree() {
        return this.tree;
    }
    Harvestable() {
        return this.harvestable;
    }
    IsIce() {
        return this.ice;
    }
    Draw(upleft, the_console) {
        let screenx = (this.pos.minus(upleft)).X();
        let screeny = (this.pos.minus(upleft)).Y();
        if (screenx >= 0 && screenx < the_console.getWidth() && screeny >= 0 && screeny < the_console.getHeight()) {
            the_console.putCharEx(screenx, screeny, this.graphic, this.color, this.marked ? Color.white : Color.black);
        }
    }

    serialize(ar, version) {
        let result = super.serialize(ar, version);
        result.name = NatureObject.Presets[this.type].name;
        result.graphic = this.graphic;
        result.color = ar.serialize(this.color);
        result.marked = this.marked;
        result.condition = this.condition;
        result.tree = this.tree;
        result.harvestable = this.harvestable;
        result.ice = this.ice;
        return result;
    }
    static deserialize(data, version, deserializer) {
        let EntityResult = Entity.deserialize(data, version, deserializer);
        let result = new NatureObject(deserializer.deserialize(data.pos), deserializer.deserialize(data.type));
        for (let key of Object.keys(EntityResult)) {
            result[key] = EntityResult[key];
        }
        result.graphic = data.graphic;
        result.color = deserializer.deserialize(data.color);
        result.graphic = data.graphic;
        result.marked = data.marked;
        result.condition = data.condition;
        result.tree = data.tree;
        result.harvestable = data.harvestable;
        result.ice = data.ice;
        result.tree = data.tree;
        return result;
    }

    static LoadPresets(filename) {
        let listener = new NatureObjectListener(this, filename);
        return listener.fetch();
    }
}