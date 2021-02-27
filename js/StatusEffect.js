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
	NPCStat
} from "./NPCStat.js";

import {
	Resistance
} from "./Resistance.js";

import {
	StatusEffectType
} from "./StatusEffectType.js";

class StatusEffect {
	static CLASS_VERSION = 1;
	graphic = '';
	color = [, , ];
	type = null;
	damageType = null;
	visible = true;
	/**
	 * Is this a negative effect? ie. one the creature wants to get rid of
	 * */
	negative = true;
	/**
	 * How contagious (if at all) is this effect?
	 */
	contagionChance = 0;
	/*
	 * What resistance helps resist this effect?
	 */
	applicableResistance = Resistance.MAGIC_RES;
	name = "";
	cooldown = 0;
	cooldownDefault = 0;
	//Initialize changes to nothing, ie. 100%
	statChanges = new Array(NPCStat.STAT_COUNT).fill(1.0); //These are percentage values of the original value (100% = no change)
	resistanceChanges = new Array(Resistance.RES_COUNT).fill(1.0); //These are percentage values of the original value (100% = no change)
	damage = []; //First - counter, second - damage amount

	constructor(typeval = StatusEffectType.HUNGER, g = 'Y', col = 'pink') {
		this.graphic = g;
		this.color = col;
		this.type = typeval;

		this.damage[0] = UPDATES_PER_SECOND;
		this.damage[1] = 0;

		//TODO: All this needs to be put into data files at some point
		switch (type) {
			case StatusEffectType.HUNGER:
				this.name = "Hungry";
				this.graphic = TCOD_CHAR_ARROW_S;
				this.color = TCODColor.orange;
				this.cooldown = -1;
				break;
			case StatusEffectType.THIRST:
				this.name = "Thirsty";
				this.graphic = TCOD_CHAR_ARROW_S;
				this.color = TCODColor.blue;
				this.cooldown = -1;
				break;
			case StatusEffectType.PANIC:
				this.name = "Panicking";
				this.graphic = '!';
				this.color = TCODColor.white;
				this.cooldown = UPDATES_PER_SECOND * 5;
				this.contagionChance = 75;
				break;
			case StatusEffectType.CONCUSSION:
				this.name = "Concussed";
				this.graphic = '?';
				this.color = TCODColor.grey;
				this.cooldown = UPDATES_PER_SECOND * 5;
				this.statChanges[NPCStat.MOVESPEED] = 0.5;
				this.statChanges[NPCStat.DODGE] = 0.5;
				break;
			case StatusEffectType.DROWSY:
				this.name = "Drowsy";
				this.graphic = 'z';
				this.color = TCODColor.lightGrey;
				this.cooldown = -1;
				this.statChanges[NPCStat.MOVESPEED] = 0.8;
				this.statChanges[NPCStat.DODGE] = 0.8;
				break;
			case StatusEffectType.SLEEPING:
				this.name = "Sleeping";
				this.graphic = 'Z';
				this.color = TCODColor.lightGrey;
				this.cooldown = UPDATES_PER_SECOND;
				break;
			case StatusEffectType.POISON:
				this.name = "Poisoned";
				this.graphic = '#';
				this.color = TCODColor.green;
				this.cooldown = (MONTH_LENGTH * 2);
				this.statChanges[NPCStat.STRENGTH] = 0.5;
				this.statChanges[NPCStat.MOVESPEED] = 0.8;
				this.statChanges[NPCStat.DODGE] = 0.5;
				break;

			case StatusEffectType.BLEEDING:
				this.name = "Bleeding";
				this.graphic = '#';
				this.color = TCODColor.red;
				this.cooldown = UPDATES_PER_SECOND * 4;
				this.damage.second = 4;
				this.damageType = DAMAGE_SLASH;
				this.applicableResistance = Resistance.BLEEDING_RES;
				break;

			case StatusEffectType.FLYING:
				this.name = "Flying";
				this.graphic = '"';
				this.color = TCODColor.lightBlue;
				this.cooldown = -1;
				this.negative = false;
				break;
			case StatusEffectType.BADSLEEP:
				this.name = "Sluggish";
				this.graphic = '-';
				this.color = TCODColor.grey;
				this.cooldown = MONTH_LENGTH * 3;
				this.statChanges[NPCStat.MOVESPEED] = 0.75;
				this.statChanges[NPCStat.DODGE] = 0.75;
				this.resistanceChanges[Resistance.POISON_RES] = 0.75;
				break;

			case StatusEffectType.RAGE:
				this.name = "Enraged";
				this.graphic = '!';
				this.color = TCODColor.red;
				this.cooldown = UPDATES_PER_SECOND * 7;
				this.statChanges[NPCStat.STRENGTH] = 2;
				this.statChanges[NPCStat.DODGE] = 0.5;
				this.negative = false;
				break;

			case StatusEffectType.SWIM:
				this.name = "Swimming";
				this.graphic = '~';
				this.color = TCODColor.lightBlue;
				this.cooldown = -1;
				this.statChanges[NPCStat.DODGE] = 0.0;
				this.statChanges[NPCStat.STRENGTH] = 0.75;
				this.negative = false;
				break;

			case StatusEffectType.EATING:
				this.name = "Eating";
				this.graphic = TCOD_CHAR_ARROW_N;
				this.color = TCODColor.orange;
				this.cooldown = -1;
				this.negative = false;
				break;
			case StatusEffectType.DRINKING:
				this.name = "Drinking";
				this.graphic = TCOD_CHAR_ARROW_N;
				this.color = TCODColor.blue;
				this.cooldown = -1;
				this.negative = false;
				break;
			case StatusEffectType.CARRYING:
				this.name = "Carrying item";
				this.cooldown = -1;
				this.negative = false;
				this.break;
			case StatusEffectType.WORKING:
				this.name = "Working";
				this.cooldown = -1;
				this.graphic = '+';
				this.color = TCODColor.grey;
				this.negative = false;
				break;
			case StatusEffectType.BURNING:
				this.name = "On fire!";
				this.cooldown = UPDATES_PER_SECOND * 10;
				this.graphic = '!';
				this.color = TCODColor.red;
				this.damage.second = 7;
				this.damageType = DAMAGE_FIRE;
				break;
			case StatusEffectType.CRACKEDSKULLEFFECT:
				this.name = "Cracked skull";
				this.cooldown = -1;
				this.graphic = 168;
				this.color = TCODColor.grey;
				this.visible = false;
				break;
			case StatusEffectType.INVIGORATED:
				this.name = "Invigorated";
				this.cooldown = MONTH_LENGTH * 3;
				this.graphic = 11;
				this.color = TCODColor(127, 255, 255);
				this.visible = false;
				this.statChanges[NPCStat.STRENGTH] = 1.25;
				this.statChanges[NPCStat.MOVESPEED] = 1.25;
				this.statChanges[NPCStat.DODGE] = 1.25;
				this.resistanceChanges[Resistance.POISON_RES] = 1.25;
				this.negative = false;
				break;
			case StatusEffectType.DRUNK:
				this.name = "Drunk";
				this.cooldown = MONTH_LENGTH;
				this.graphic = 63;
				this.color = TCODColor(218, 255, 127);
				break;
			case StatusEffectType.HEALING:
				this.name = "Healing";
				this.cooldown = MONTH_LENGTH;
				this.graphic = 241;
				this.color = TCODColor(0, 255, 0);
				this.damage.second = -10;
				this.damageType = DAMAGE_MAGIC;
				this.negative = false;
				break;

			case StatusEffectType.HELPLESS:
				this.name = "Helpless";
				this.cooldown = UPDATES_PER_SECOND * 10;
				this.graphic = 168;
				this.color = TCODColor(130, 240, 255);
				this.statChanges[NPCStat.MOVESPEED] = 0;
				this.statChanges[NPCStat.DODGE] = 0;
				break;
			case StatusEffectType.HIGHGROUND:
				this.name = "Higher ground";
				this.cooldown = UPDATES_PER_SECOND / 2;
				this.graphic = 23;
				this.color = TCODColor(100, 255, 255);
				this.visible = false;
				this.negative = false;
				break;
			case StatusEffectType.TRIPPED:
				this.name = "Tripped";
				this.cooldown = UPDATES_PER_SECOND * 2;
				this.graphic = 31;
				this.color = TCODColor.white;
				this.statChanges[NPCStat.MOVESPEED] = 0.2;
				this.statChanges[NPCStat.DODGE] = 0.2;
				break;
			case StatusEffectType.BRAVE:
				this.name = "Brave";
				this.cooldown = UPDATES_PER_SECOND;
				this.graphic = 30;
				this.color = TCODColor(0, 255, 255);
				this.negative = false;
				this.visible = false;
				break;
			case StatusEffectType.COLLYWOBBLES:
				this.name = "Collywobbles";
				this.cooldown = MONTH_LENGTH * 3;
				this.graphic = 207;
				this.color = TCODColor(127, 106, 0);
				this.statChanges[NPCStat.STRENGTH] = 0.5;
				this.statChanges[NPCStat.MOVESPEED] = 0.75;
				this.contagionChance = 50;
				this.applicableResistance = Resistance.DISEASE_RES;
				break;

			case StatusEffectType.DROOPS:
				this.name = "Droops";
				this.cooldown = MONTH_LENGTH * 3;
				this.graphic = 207;
				this.color = TCODColor(127, 106, 0);
				this.statChanges[NPCStat.STRENGTH] = 0.5;
				this.statChanges[NPCStat.MOVESPEED] = 0.75;
				this.contagionChance = 50;
				this.applicableResistance = Resistance.DISEASE_RES;
				break;

			case StatusEffectType.RATTLES:
				this.name = "Rattles";
				this.cooldown = MONTH_LENGTH * 3;
				this.graphic = 207;
				this.color = TCODColor(127, 106, 0);
				this.statChanges[NPCStat.STRENGTH] = 0.5;
				this.statChanges[NPCStat.MOVESPEED] = 0.75;
				this.contagionChance = 50;
				this.applicableResistance = Resistance.DISEASE_RES;
				break;

			case StatusEffectType.CHILLS:
				this.name = "Chills";
				this.cooldown = MONTH_LENGTH * 3;
				this.graphic = 207;
				this.color = TCODColor(127, 106, 0);
				this.statChanges[NPCStat.STRENGTH] = 0.5;
				this.statChanges[NPCStat.MOVESPEED] = 0.75;
				this.contagionChance = 50;
				this.applicableResistance = Resistance.DISEASE_RES;
				break;

			default:
				break;
		}
		this.cooldownDefault = this.cooldown;
	}

	static IsApplyableStatusEffect(type) {
		switch (type) {
			case StatusEffectType.HUNGER:
			case StatusEffectType.THIRST:
			case StatusEffectType.PANIC:
			case StatusEffectType.CONCUSSION:
			case StatusEffectType.DROWSY:
			case StatusEffectType.SLEEPING:
			case StatusEffectType.POISON:
			case StatusEffectType.BLEEDING:
			case StatusEffectType.BURNING:
			case StatusEffectType.BADSLEEP:
			case StatusEffectType.INVIGORATED:
			case StatusEffectType.DRUNK:
			case StatusEffectType.HEALING:
			case StatusEffectType.HELPLESS:
			case StatusEffectType.HIGHGROUND:
			case StatusEffectType.TRIPPED:
			case StatusEffectType.BRAVE:
			case StatusEffectType.COLLYWOBBLES:
			case StatusEffectType.DROOPS:
			case StatusEffectType.RATTLES:
			case StatusEffectType.CHILLS:
				return true;
			default:
				return false;
		}
	}
	static StringToStatusEffectType(str) {
		str = str.toLowerCase();
		if (str === "hunger") {
			return StatusEffectType.HUNGER;
		} else if (str === "thirst") {
			return StatusEffectType.THIRST;
		} else if (str === "panic") {
			return StatusEffectType.PANIC;
		} else if (str === "concussion") {
			return StatusEffectType.CONCUSSION;
		} else if (str === "drowsy") {
			return StatusEffectType.DROWSY;
		} else if (str === "sleeping") {
			return StatusEffectType.SLEEPING;
		} else if (str === "poison") {
			return StatusEffectType.POISON;
		} else if (str === "bleeding") {
			return StatusEffectType.BLEEDING;
		} else if (str === "flying") {
			return StatusEffectType.FLYING;
		} else if (str === "sluggish") {
			return StatusEffectType.BADSLEEP;
		} else if (str === "rage") {
			return StatusEffectType.RAGE;
		} else if (str === "swimming") {
			return StatusEffectType.SWIM;
		} else if (str === "eating") {
			return StatusEffectType.EATING;
		} else if (str === "drinking") {
			return StatusEffectType.DRINKING;
		} else if (str === "carrying") {
			return StatusEffectType.CARRYING;
		} else if (str === "working") {
			return StatusEffectType.WORKING;
		} else if (str === "burning") {
			return StatusEffectType.BURNING;
		} else if (str === "crackedskull") {
			return StatusEffectType.CRACKEDSKULLEFFECT;
		} else if (str === "invigorated") {
			return StatusEffectType.INVIGORATED;
		} else if (str === "drunk") {
			return StatusEffectType.DRUNK;
		} else if (str === "healing") {
			return StatusEffectType.HEALING;
		} else if (str === "helpless") {
			return StatusEffectType.HELPLESS;
		} else if (str === "highground") {
			return StatusEffectType.HIGHGROUND;
		} else if (str === "tripped") {
			return StatusEffectType.TRIPPED;
		} else if (str === "brave") {
			return StatusEffectType.BRAVE;
		} else if (str === "collywobbles") {
			return StatusEffectType.COLLYWOBBLES;
		} else if (str === "droops") {
			return StatusEffectType.DROOPS;
		} else if (str === "rattles") {
			return StatusEffectType.RATTLES;
		} else if (str === "chills") {
			return StatusEffectType.CHILLS;
		}
		return StatusEffectType.HUNGER;
	}
	static StatusEffectTypeToString(type) {
		switch (type) {
			case StatusEffectType.HUNGER:
				return "hunger";
			case StatusEffectType.THIRST:
				return "thirst";
			case StatusEffectType.PANIC:
				return "panic";
			case StatusEffectType.CONCUSSION:
				return "concussion";
			case StatusEffectType.DROWSY:
				return "drowsy";
			case StatusEffectType.SLEEPING:
				return "sleeping";
			case StatusEffectType.POISON:
				return "poison";
			case StatusEffectType.BLEEDING:
				return "bleeding";
			case StatusEffectType.FLYING:
				return "flying";
			case StatusEffectType.BADSLEEP:
				return "sluggish";
			case StatusEffectType.RAGE:
				return "rage";
			case StatusEffectType.SWIM:
				return "swimming";
			case StatusEffectType.EATING:
				return "eating";
			case StatusEffectType.DRINKING:
				return "drinking";
			case StatusEffectType.CARRYING:
				return "carrying";
			case StatusEffectType.WORKING:
				return "working";
			case StatusEffectType.BURNING:
				return "burning";
			case StatusEffectType.CRACKEDSKULLEFFECT:
				return "crackedskull";
			case StatusEffectType.INVIGORATED:
				return "invigorated";
			case StatusEffectType.DRUNK:
				return "drunk";
			case StatusEffectType.HEALING:
				return "healing";
			case StatusEffectType.HELPLESS:
				return "helpless";
			case StatusEffectType.HIGHGROUND:
				return "highground";
			case StatusEffectType.TRIPPED:
				return "tripped";
			case StatusEffectType.BRAVE:
				return "brave";
			case StatusEffectType.COLLYWOBBLES:
				return "collywobbles";
			case StatusEffectType.DROOPS:
				return "droops";
			case StatusEffectType.RATTLES:
				return "rattles";
			case StatusEffectType.CHILLS:
				return "chills";
			default:
				return "";
		}
	}
	save(ar, version) {
		ar.save(this, "graphic");
		ar.save(this, "r", this.color[0]);
		ar.save(this, "g", this.color[1]);
		ar.save(this, "b", this.color[2]);
		ar.save(this, "name");
		ar.save(this, "type");
		ar.save(this, "cooldown");
		ar.save(this, "cooldownDefault");
		ar.save(this, "statChanges");
		ar.save(this, "resistanceChanges");
		ar.save(this, "damage");
		ar.save(this, "damageType");
		ar.save(this, "visible");
		ar.save(this, "negative");
		ar.save(this, "contagionChance");
		ar.save(this, "applicableResistance");
	}
	load(ar, version) {
		this.graphic = ar.graphic;
		this.color = [ar.r, ar.g, ar.b];
		this.name = ar.name;
		this.type = ar.type;
		this.cooldown = ar.cooldown;
		this.cooldownDefault = ar.cooldownDefault;
		this.statChanges = ar.statChanges;
		this.resistanceChanges = ar.resistanceChanges;
		this.damage = ar.damage;
		this.damageType = ar.damageType;
		this.visible = ar.visible;
		this.negative = ar.negative;
		if (version >= 1) {
			this.contagionChance = ar.contagionChance;
			this.applicableResistance = ar.applicableResistance;
		}
	}
}
//Version 1 = v0.2 - contagionChance