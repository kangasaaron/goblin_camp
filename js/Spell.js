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
    SpellType
} from "./SpellType.js";
import {
    SpellPreset
} from "./SpellPreset.js";
import {
    SpellListener
} from "./SpellListener.js";
import {
    Entity
} from "./Entity.js";
import {
    Attack
} from "./Attack.js";
import {
    Color
} from "./Color.js";
import {
    Coordinate
} from "./Coordinate.js";

export class Spell extends Entity {
    static CLASS_VERSION = 0;
    /**
     * @type{Map<string,SpellType>}
     */
    static spellTypeNames = new Map();
    /**
     * @type{Array<SpellPreset>}
     */
    static Presets = [];

    color = new Color();
    graphic = 0;
    type = 0;
    dead = false;
    attacks = [];
    immaterial = false;

    constructor(pos = Coordinate.undefinedCoordinate, vtype = 0) {
        super();
        this.type = vtype;
        this.pos = pos;
        this.color = Spell.Presets[this.type].color;
        //TODO: I don't like making special cases like this, perhaps a flag instead?
        if ((Spell.Presets[type].name.toLowerCase() == "smoke") || (Spell.Presets[type].name.toLowerCase() == "steam")) {
            let add = Random.Generate(50);
            this.color.r += add;
            this.color.g += add;
            this.color.b += add;
        }
        this.graphic = Spell.Presets[this.type].graphic;
        this.attacks = Spell.Presets[this.type].attacks;
        this.immaterial = Spell.Presets[this.type].immaterial;
    }
    GetGraphicsHint() {
        return Spell.Presets[this.type].graphicsHint;
    }
    IsDead() {
        return this.dead;
    }
    Draw(upleft, the_console) {
        let screenx = (this.pos.minus(upleft)).X();
        let screeny = (this.pos.minus(upleft)).Y();
        if (screenx >= 0 && screenx < the_console.getWidth() && screeny >= 0 && screeny < the_console.getHeight()) {
            the_console.putCharEx(screenx, screeny, this.graphic, this.color, Map.GetBackColor(this.pos));
        }
    }
    Impact(speedChange) {
        this.SetVelocity(0);
        this.flightPath.clear();

        for (let attacki of this.attacks) {
            if (attacki.Type() == DamageType.DAMAGE_FIRE) {
                Game.CreateFire(this.Position());
                break;
            }
        }

        this.dead = true;
    }
    CollideWithObstacle(t) {
        if (Map.GetConstruction(t) > -1) {
            let construct;
            if (construct = Game.GetConstruction(Map.GetConstruction(t)).lock()) {
                for (let attacki of this.attacks)
                    construct.Damage(attacki);
            }
        }
        for (let attacki of this.attacks) {
            if (attacki.Type() == DamageType.DAMAGE_FIRE) {
                /*The spell's attack was a fire attack, so theres a chance it'll create fire on the 
                obstacle it hit */
                Game.CreateFire(this.flightPath[this.flightPath.length - 1].coord, 5);
                break;
            }
        }
    }
    CollideWithCreatures(t) {
        if (Random.Generate(Math.max(1, this.flightPath[this.flightPath.length - 1].height) - 1) >= (2 + Map.NPCList(t).length))
            return false;

        let npc = Game.GetNPC(Map.NPCList(t)[0]);
        for (let attacki of this.attacks) {
            npc.Damage(attacki);
        }

        this.Position(this.flightPath[this.flightPath.length - 1].coord);

        return true;
    }
    CollisionDetection() {
        let t = this.flightPath[this.flightPath.length - 1].coord;

        if (this.immaterial) return false;

        if (Map.BlocksWater(t) || !Map.IsWalkable(t)) { //We've hit an obstacle
            this.CollideWithObstacle(t);
            return true;
        }
        if (Map.NPCList(t).length > 0) { //Hit a creature
            return this.CollideWithCreatures(t);
        }

        return false;
    }
    UpdateVelocity() {
        if (this.velocity <= 0) return;
        this.nextVelocityMove += this.velocity;

        while (this.nextVelocityMove > 100) {
            this.nextVelocityMove -= 100;
            if (this.flightPath.length <= 0) {
                this.Impact(velocity);
                return;
            } //No more flightpath

            if (this.flightPath[this.flightPath.length - 1].height < ENTITYHEIGHT) { //We're flying low enough to hit things
                let impacts = this.CollisionDetection();
                if (impacts) {
                    this.Impact(velocity);
                    return;
                }
            }

            this.Position(this.flightPath[this.flightPath.length - 1].coord);

            if (this.flightPath[this.flightPath.length - 1].height <= 0) { //Hit the ground early
                this.Impact(velocity);
                return;
            }

            this.flightPath.pop();
        }
    }
    static StringToSpellType(spell) {
        if (this.spellTypeNames.has(spell))
            return this.spellTypeNames.get(spell);
        return -1;
    }
    static SpellTypeToString(type) {
        if (type >= 0 && type < this.Presets.length)
            return this.Presets[type].name;
        return "";
    }
    serialize(ar, version) {
        ar.register_type(Color);
        let result = super.serialize(ar, version);
        result.color = ar.serialize(this.color);
        result.graphic = this.graphic;
        result.spellType = Spell.SpellTypeToString(this.type);
        result.dead = this.dead;
        result.attacks = ar.serialize(this.attacks);
        result.immaterial = this.immaterial;
        return result;
    }

    load(data, version, deserializer) {
        let entityResult = Entity.deserialize(data, version, deserializer);
        let result = Object.assign(new Spell(deserializer.deserialize(data.pos), deserializer.deserialize(data.type)), entityResult);
        result.color = deserializer.deserialize(data.color);
        result.graphic = data.graphic;
        result.type = Spell.StringToSpellType(data.spellType);
        if (result.type == -1) result.type = 0;
        result.dead = data.dead;
        result.attacks = data.attacks;
        result.immaterial = data.immaterial;
        return result;
    }
    static LoadPresets(filename) {
        let listener = new SpellListener(this, filename);
        return listener.fetch();
    }
}