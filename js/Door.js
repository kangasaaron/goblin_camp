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

export class Door extends Construction {
    static CLASS_VERSION = 0;

    closedGraphic = 0;
    constructor(type = 0, target = new Coordinate(0, 0)) {
        super(type, target);
        this.closedGraphic = this.graphic[1];
    }
    Update() {
        if (this.map.NPCList(this.pos).length == 0) {
            this.graphic[1] = 254;
            this.time = UPDATES_PER_SECOND / 2;
            this.map.SetBlocksLight(this.pos, false);
        } else {
            if (this.time == 0) {
                this.graphic[1] = this.closedGraphic;
                this.map.SetBlocksLight(this.pos, true);
            } else {
                --this.time;
            }
        }
    }
    Open() {
        return this.time > 0;
    }
    AcceptVisitor(visitor) {
        visitor.Visit(this);
    }
    serialize(ar, version) {
        let result = super.serialize(ar, version);
        result.closedGraphic = this.closedGraphic;
        return result;
    }
    static deserialize(data, version, deserializer) {
        let superResult = Construction.deserialize(data, version, deserializer);
        let result = new Door(data.type, data.target)
        for (let key of Object.keys(superResult)) {
            result[key] = superResult[key];
        }
        result.closedGraphic = data.closedGraphic;
        return result;
    }
}