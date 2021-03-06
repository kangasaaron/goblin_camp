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

import {
    Coordinate
} from "../Coordinate.js";
import {
    Serializable
} from "../data/Serialization.js";
import { TCODColor } from "../../fakeTCOD/libtcod.js";

export class BloodNode extends Serializable {
    static CLASS_VERSION = 0;
    static __instance_id = 0;
    pos = Coordinate.zero;
    depth = 0;
    graphic = null;
    color = new TCODColor();
    constructor(pos = Coordinate.zero, depth = 0) {
        this.__id = BloodNode.__instance_id++;
        this.pos = pos;
        this.depth = depth;
    }
    Update() {}
    Draw(upleft, the_console) {}
    Depth(val) {
        if (val !== undefined)
            this.depth = val;
        return this.depth;
    }
    Position() {
        return this.pos;
    }
    get hashCode() {
        return this.constructor.name + "_" + this.__id;
    }
    serialize(ar, version) {
        ar.register_type(Coordinate);
        ar.register_type(TCODColor);
        return {
            "pos": ar.serialize(this.pos),
            "depth": this.depth,
            "graphic": this.graphic,
            "color": ar.serialize(this.color),
            "__id": this.__id
        };
    }
    static deserialize(data, version, deserializer) {
        deserializer.register_type(Coordinate);
        deserializer.register_type(TCODColor);
        let result = new BloodNode(
            deserializer.deserialize(data.pos),
            data.depth);
        result.graphic = data.graphic;
        result.color = deserializer.deserialize(data.color);
        result.__id = data.__id;
        return result;
    }
}