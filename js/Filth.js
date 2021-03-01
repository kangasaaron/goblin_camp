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
import "./other/rot.js";
import {
    Random
} from "./Random.js";

export class FilthNode {
    static CLASS_VERSION = 0;
    pos = Coordinate.zero;
    depth = 0;
    graphic = 0;
    color = null;
    graphic = null;
    constructor(pos = Coordinate.zero, depth = 0) {
        this.pos = pos;
        this.depth = depth;
        this.color = [, , 0];
    }
    Update() {}
    GetGraphic() {
        return (this.depth < 5) ? '~' : '#';
    }
    GetColor() {
        return this.color;
    }
    Depth(val) {
        if (val !== undefined) {
            this.depth = Math.floor(Number(val));
            let add = Random.Generate(60);
            this.color.r = 170 - Math.min(Map.GetCorruption(pos), 40) + add;
            this.color.g = 150 - Math.min(Map.GetCorruption(pos), 80) + add;
        }
        return this.depth;
    }
    Position() {
        return this.pos;
    }
    serialize(ar, version) {
        ar.register_type(Coordinate);
        return {
            'pos': ar.serializable(this.pos),
            'depth': this.depth,
            'graphic': this.graphic,
            'color': this.color
        }
    }
    static deserialize(data, version, deserializer) {
        let result = new FilthNode(deserializer.deserializable(data.pos), data.depth);
        result.graphic = ar.graphic;
        result.color = ar.color;
        return result;
    }
}