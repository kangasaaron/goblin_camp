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
    DamageType
} from "./DamageType.js";
import {
    Serializable
} from "./data/Serialization.js";

export class Attack extends Serializable {
    static CLASS_VERSION = 0;

    damageType = DamageType.DAMAGE_BLUNT;
    /*
    	damageAmount.addsub = 1;
    	damageAmount.multiplier = 1;
    	damageAmount.nb_rolls = 1;
    	damageAmount.nb_faces = 1;
    */
    damageAmount = new Dice(1, 1, 1, 1);
    cooldown = 0;
    cooldownMax = UPDATES_PER_SECOND;
    statusEffects = [];
    projectile = 0;
    magicProjectile = false;



    Type(value) {
        if (value !== undefined && value instanceof DamageType) {
            this.damageType = value;
        }
        return this.damageType;
    }
    Amount(value) {
        if (value !== undefined && value instanceof Dice) {
            this.damageAmount = value;
        }
        return this.damageAmount;
    }
    CooldownMax(value) {
        if (value !== undefined && Number.isFinite(value)) {
            this.cooldownMax = value;
        }
        return this.cooldownMax;
    }
    Cooldown() {
        return this.cooldown;
    }
    Update() {
        if (this.cooldown > 0) --this.cooldown;
    }
    ResetCooldown() {
        this.cooldown = this.cooldownMax;
    }
    StatusEffects() {
        return this.statusEffects;
    }
    Ranged() {
        return this.damageType == DamageType.DAMAGE_RANGED;
    }

    Projectile(value) {
        if (value !== undefined && Number.isFinite(value)) {
            projectile = value;
        }
        return projectile;
    }

    AddDamage(value) {
        this.damageAmount.addsub += Game.DiceToInt(value);
    }

    SetMagicProjectile() {
        this.magicProjectile = true;
    }
    IsProjectileMagic() {
        return this.magicProjectile;
    }

    static StringToDamageType(type) {
        type = type.toLowerCase();
        if (type == "slashing") {
            return DamageType.DAMAGE_SLASH;
        } else if (type == "piercing") {
            return DamageType.DAMAGE_PIERCE;
        } else if (type == "blunt") {
            return DamageType.DAMAGE_BLUNT;
        } else if (type == "magic") {
            return DamageType.DAMAGE_MAGIC;
        } else if (type == "fire") {
            return DamageType.DAMAGE_FIRE;
        } else if (type == "cold") {
            return DamageType.DAMAGE_COLD;
        } else if (type == "poison") {
            return DamageType.DAMAGE_POISON;
        } else if (type == "wielded") {
            return DamageType.DAMAGE_WIELDED;
        } else if (type == "ranged") {
            return DamageType.DAMAGE_RANGED;
        }
        return DamageType.DAMAGE_SLASH;
    }
    static DamageTypeToString(type) {
        //TODO (easy) use switch
        if (type == DamageType.DAMAGE_SLASH) {
            return "slashing";
        } else if (type == DamageType.DAMAGE_PIERCE) {
            return "piercing";
        } else if (type == DamageType.DAMAGE_BLUNT) {
            return "blunt";
        } else if (type == DamageType.DAMAGE_MAGIC) {
            return "magic";
        } else if (type == DamageType.DAMAGE_FIRE) {
            return "fire";
        } else if (type == DamageType.DAMAGE_COLD) {
            return "cold";
        } else if (type == DamageType.DAMAGE_POISON) {
            return "poison";
        } else if (type == DamageType.DAMAGE_WIELDED) {
            return "wielded";
        } else if (type == DamageType.DAMAGE_RANGED) {
            return "ranged";
        }
        return "";
    }
    serialize(ar, version) {
        ar.register_type(DamageType);
        ar.register_type(Dice);
        return {
            "damageType": ar.serialize(this.damageType),
            "damageAmount": ar.serialize(this.damageAmount),
            "cooldown": this.cooldown,
            "cooldownMax": this.cooldownMax,
            "statusEffects": this.statusEffects,
            "projectile": this.projectile,
            "magicProjectile": this.magicProjectile
        };
    }

    static deserialize(data, version, deserializer) {
        deserializer.register_type(DamageType);
        deserializer.register_type(Dice);
        let result = new Attack();
        result.damageType = deserializer.deserialize(data.damageType);
        result.damageAmount = deserializer.deserialize(data.damageAmount);
        result.cooldown = data.cooldown;
        result.cooldownMax = data.cooldownMax;
        result.statusEffects = data.statusEffects;
        result.projectile = data.projectile;
        result.magicProjectile = data.magicProjectile;
        return result;
    }
}