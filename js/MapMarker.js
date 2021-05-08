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
    Serializable
} from "./data/Serialization.js";
import {
    Color
} from "./libtcod.js";
import {
    Coordinate
} from "./Coordinate.js";
import {
    MarkerType
} from "./MarkerType.js";

export class MapMarker extends Serializable {
    static CLASS_VERSION = 0;
    type = MarkerType.FLASHINGMARKER;
    origColor = new Color();
    color = new Color();
    duration = 0;
    graphic = 0;
    pos = new Coordinate();
    counter = 0;
    constructor(t = MarkerType.FLASHINGMARKER, g = '?', pos = Coordinate.zero, duration = 1, color = Color.pink) {
        this.type = t;
        this.origColor = color;
        this.color = color;
        this.duration = duration;
        this.graphic = g;
        this.pos = pos.clone();
    }
    Update() {
        if (this.duration > 0) --this.duration;
        this.color = Color.lerp(this.origColor, Color.white, Math.abs(Math.sin(counter)));
        this.counter += 0.1;
        if (this.counter > Math.PI) counter = 0.0;
        return this.duration != 0;
    }
    X() {
        return this.pos.X();
    }
    Y() {
        return this.pos.Y();
    }
    Position() {
        this.pos;
    }
    Graphic() {
        return this.graphic;
    }
    Color() {
        return this.color;
    }
    serialize(ar, version) {
        ar.register_type(Coordinate);
        ar.register_type(Color);
        ar.register_type(MarkerType);
        return {
            type: ar.serialize(this.type),
            origColor: ar.serialize(this.origColor),
            color: ar.serialize(this.color),
            duration: this.duration,
            graphic: this.graphic,
            pos: ar.serialize(this.pos),
            counter: this.counter
        };
    }
    static deserialize(data, version, deserializer) {
        deserializer.register_type(Coordinate);
        deserializer.register_type(Color);
        deserializer.register_type(MarkerType);
        let result = new MapMarker(
            deserializer.deserialize(data.type),
            data.graphic,
            deserializer.deserialize(data.pos),
            data.duration,
            deserializer.deserialize(data.color)
        );
        result.origColor = deserializer.deserialize(data.origColor)
        result.counter = data.counter;
        return result;
    }
};