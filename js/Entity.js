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
    FlightPath
} from "./FlightPath.js";
import {
    Coordinate
} from "./Coordinate.js";
import {
    Color
} from "./libtcod.js";

const ENTITYHEIGHT = 5;

export class Entity extends Serializable {
    static CLASS_VERSION = 0;
    static uids = 0;
    /** @type {Coordinate} */
    pos = null;
    uid = 0;
    zone = 0;
    reserved = false;
    name = "NONAME";
    faction = -1;
    velocity = 0;
    nextVelocityMove = 0;
    /** @type {Coordinate} */
    velocityTarget = new Coordinate();
    /** @type {Array<FlightPath>} */
    flightPath = [];
    bulk = 0;
    strobe = 0;
    map = null;
    constructor() {
        this.uid = Entity.uids++; //TODO FIXME: Entity should keep track of freed uids
    }
    X() {
        return this.pos.X();
    }
    Y() {
            return this.pos.Y();
        }
        /** @type {Coordinate} */
    Center() {
            return this.Position();
        }
        /** @type {Coordinate} */
    Position(p) {
        if (p !== undefined && p instanceof Coordinate)
            this.pos = p;
        return this.pos;
    }
    Uid() {
        return this.uid;
    }
    Zone(value) {
        if (p !== undefined && Number.isFinite(p))
            this.zone = value;
        return this.zone;
    }
    Reserve(value) {
        if (value !== undefined)
            this.reserved = !(!(value));
        return this.reserved;
    }
    Name(newName) {
        if (newName !== undefined)
            this.name = String(newName);
        return this.name;
    }
    CancelJob() {}
    GetFaction() {
        return this.faction;
    }
    SetFaction(val) {
        this.faction = val;
    }
    GetContextMenu() {
        return null;
    }
    GetTooltip(x, y, tooltip) {
        tooltip.AddEntry(new TooltipEntry(this.name, Color.white));
    }
    GetVelocity() {
            return this.velocity;
        }
        /**
         * 
         * @param {number} value 
         */
    SetVelocity(value) {
        this.velocity = value;
    }

    /** @returns {Coordinate} */
    GetVelocityTarget() {
            return this.velocityTarget;
        }
        /**
         * 
         * @param {Coordinate} value 
         */
    SetVelocityTarget(value) {
        this.velocityTarget = value;
    }
    GetHeight() {
        return this.flightPath.length ? this.flightPath[this.flightPath.length - 1].height : 0;
    }
    SetBulk(amount) {
        this.bulk = amount;
    }
    GetBulk() {
        return this.bulk;
    }
    AddBulk(amount) {
        this.bulk += amount;
    }
    RemoveBulk(amount) {
        this.bulk -= amount;
    }
    Strobe() {
        this.strobe += 0.1;
    }
    ResetStrobe() {
        this.strobe = 0;
    }
    CanStrobe() {
        return false;
    }
    SetMap(map) {
        this.map = map;
    }
    serialize(ar, version) {
        ar.register_type(Coordinate);
        return {
            "pos": ar.serialize(this.pos),
            "uid": this.uid,
            "zone": this.zone,
            "reserved": this.reserved,
            "name": this.name,
            "factionName": Faction.FactionTypeToString(this.faction),
            "velocity": this.velocity,
            "nextVelocityMove": this.nextVelocityMove,
            "velocityTarget": ar.serialize(this.velocityTarget),
            "bulk": this.bulk,
        }
    }
    static deserialize(data, version, deserializer) {
            let result = new Entity();
            result.pos = deserializer.deserialize(data.pos);
            result.uid = data.uid;
            result.zone = data.zone;
            result.reserved = data.reserved;
            result.name = data.name;
            result.faction = Faction.StringToFactionType(data.factionName);
            result.velocity = data.velocity;
            result.nextVelocityMove = data.nextVelocityMove;
            result.velocityTarget = deserializer.deserialize(data.velocityTarget);
            result.bulk = data.bulk;
            return result;
        }
        /**
         * 
         * @param {Coordinate} target 
         * @param {number} speed 
         * @param {number} initialHeight 
         * @returns 
         */
    CalculateFlightPath(target, speed, initialHeight = 0) {
        if (DEBUG) {
            console.log(`Calculating flightpath for ${this.name} from ${this.pos.X()},${this.pos.Y()} to ${target.X()},${target.Y()} at v:${speed}`);
        }
        this.velocityTarget = target;
        this.flightPath = [];
        TCODLine.init(target.X(), target.Y(), this.pos.X(), this.pos.Y());
        let p = target;
        do {
            if (Map.IsInside(p))
                this.flightPath.push(new FlightPath(p));
        } while (!TCODLine.step(p.Xptr(), p.Yptr()));

        if (this.flightPath.length <= 0) {
            this.SetVelocity(speed);
            return;
        }

        let h = 0;
        let hAdd = Math.max(1, 50 / speed);
        /* The lower the speed, the higher the entity has to arch in order
                               for it to fly the distance */

        let begIt = 0;
        let endIt = this.flightPath.length;
        --endIt;

        while (this.flightPath[begIt].height == -1 && this.flightPath[endIt].height == -1) {
            this.flightPath[begIt].height = h;
            this.flightPath[endIt].height = Math.max(initialHeight, h);
            h += hAdd;
            // Preventing iterator problems
            if (begIt != this.flightPath.length) ++begIt;
            if (endIt != 0) --endIt;
            if (begIt == this.flightPath.length || endIt == this.flightPath.length) break;
        }
        this.flightPath.pop(); //Last coordinate is the entity's coordinate

        this.SetVelocity(speed);
    }

}