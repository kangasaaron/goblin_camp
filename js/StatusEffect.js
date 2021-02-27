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
'use strict'; //

import "string"

import "boost/format.js"
import "libtcod.js"

import "data/Serialization.js"

const  NPCStat ={ // enum
	MOVESPEED: Symbol('NPCStat.MOVESPEED'),
	DODGE: Symbol('NPCStat.DODGE'),
	STRENGTH: Symbol('NPCStat.STRENGTH'),
	NPCSIZE: Symbol('NPCStat.NPCSIZE'),
	STAT_COUNT: Symbol('NPCStat.STAT_COUNT')
};

const  Resistance ={ // enum
	PHYSICAL_RES: Symbol('Resistance.Resistance'),
	MAGIC_RES: Symbol('Resistance.Resistance'),
	POISON_RES: Symbol('Resistance.Resistance'),
	COLD_RES: Symbol('Resistance.Resistance'),
	FIRE_RES: Symbol('Resistance.Resistance'),
	DISEASE_RES: Symbol('Resistance.Resistance'),
	BLEEDING_RES: Symbol('Resistance.Resistance'),
	RES_COUNT: Symbol('Resistance.Resistance')
};

const  StatusEffectType ={ // enum
	HUNGER: Symbol('StatusEffectType.HUNGER'),
	THIRST: Symbol('StatusEffectType.THIRST'),
	PANIC: Symbol('StatusEffectType.PANIC'),
	CONCUSSION: Symbol('StatusEffectType.CONCUSSION'),
	DROWSY: Symbol('StatusEffectType.DROWSY'),
	SLEEPING: Symbol('StatusEffectType.SLEEPING'),
	POISON: Symbol('StatusEffectType.POISON'),
	BLEEDING: Symbol('StatusEffectType.BLEEDING'),
	FLYING: Symbol('StatusEffectType.FLYING'),
	BADSLEEP: Symbol('StatusEffectType.BADSLEEP'),
	RAGE: Symbol('StatusEffectType.RAGE'),
	SWIM: Symbol('StatusEffectType.SWIM'),
	EATING: Symbol('StatusEffectType.EATING'),
	DRINKING: Symbol('StatusEffectType.DRINKING'),
	CARRYING: Symbol('StatusEffectType.CARRYING'),
	WORKING: Symbol('StatusEffectType.WORKING'),
	BURNING: Symbol('StatusEffectType.BURNING'),
	CRACKEDSKULLEFFECT: Symbol('StatusEffectType.CRACKEDSKULLEFFECT'),
	INVIGORATED: Symbol('StatusEffectType.INVIGORATED'),
	DRUNK: Symbol('StatusEffectType.DRUNK'),
	HEALING: Symbol('StatusEffectType.HEALING'),
	HELPLESS: Symbol('StatusEffectType.HELPLESS'),
	HIGHGROUND: Symbol('StatusEffectType.HIGHGROUND'),
	TRIPPED: Symbol('StatusEffectType.TRIPPED'),
	BRAVE: Symbol('StatusEffectType.BRAVE'),
	COLLYWOBBLES: Symbol('StatusEffectType.COLLYWOBBLES'),
	DROOPS: Symbol('StatusEffectType.DROOPS'),
	RATTLES: Symbol('StatusEffectType.RATTLES'),
	CHILLS: Symbol('StatusEffectType.CHILLS'),
	STATUS_EFFECT_COUNT: Symbol('StatusEffectType.STATUS_EFFECT_COUNT')
};

struct StatusEffect {
//private:
	GC_SERIALIZABLE_CLASS
//public:
	StatusEffect(StatusEffectType=HUNGER, int graphic = 'Y', TCODColor=TCODColor.pink);
	
	static StatusEffectType StringToStatusEffectType(std.string);
	static std.string StatusEffectTypeToString(StatusEffectType);
	static bool IsApplyableStatusEffect(StatusEffectType);

	int graphic;
	TCODColor color;
	std.string name;
	int type;
	int cooldown;
	int cooldownDefault;
	double statChanges[STAT_COUNT]; //These are percentage values of the original value (100% = no change)
	double resistanceChanges[RES_COUNT]; //These are percentage values of the original value (100% = no change)
	std.pair<int,int> damage; //First - counter, second - damage amount
	int damageType;
	bool visible;
	bool negative; //Is this a negative effect? ie. one the creature wants to get rid of
	int contagionChance; //How contagious (if at all) is this effect?
	Resistance applicableResistance; //What resistance helps resist this effect?
};

BOOST_CLASS_VERSION(StatusEffect, 1)

//Version 1 = v0.2 - contagionChance
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
import "stdafx.js"

import "boost/algorithm/string.js"
import "boost/serialization/utility.js"

import "StatusEffect.js"
import "GCamp.js"
import "Game.js"
import "Attack.js"

//TODO: All this needs to be put into data files at some point

StatusEffect.StatusEffect(StatusEffectType typeval, int g, TCODColor col) : 
graphic(g),
	color(col),
	type(typeval),
	damageType(DAMAGE_BLUNT),
	visible(true),
	negative(true),
	contagionChance(0),
	applicableResistance(MAGIC_RES)
{
	//Initialize changes to nothing, ie. 100%
	for (int i = 0; i < STAT_COUNT; ++i) { statChanges[i] = 1.0; }
	for (int i = 0; i < RES_COUNT; ++i) { resistanceChanges[i] = 1.0; }
	damage.first = UPDATES_PER_SECOND;
	damage.second = 0;

	switch (type) {
	case HUNGER:
		name = "Hungry";
		graphic = TCOD_CHAR_ARROW_S;
		color = TCODColor.orange;
		cooldown = -1;
		break;

	case THIRST:
		name = "Thirsty";
		graphic = TCOD_CHAR_ARROW_S;
		color = TCODColor.blue;
		cooldown = -1;
		break;

	case PANIC:
		name = "Panicking";
		graphic = '!';
		color = TCODColor.white;
		cooldown = UPDATES_PER_SECOND * 5;
		contagionChance = 75;
		break;

	case CONCUSSION:
		name = "Concussed";
		graphic = '?';
		color = TCODColor.grey;
		cooldown = UPDATES_PER_SECOND * 5;
		statChanges[MOVESPEED] = 0.5;
		statChanges[DODGE] = 0.5;
		break;

	case DROWSY:
		name = "Drowsy";
		graphic = 'z';
		color = TCODColor.lightGrey;
		cooldown = -1;
		statChanges[MOVESPEED] = 0.8;
		statChanges[DODGE] = 0.8;
		break;

	case SLEEPING:
		name = "Sleeping";
		graphic = 'Z';
		color = TCODColor.lightGrey;
		cooldown = UPDATES_PER_SECOND;
		break;

	case POISON:
		name = "Poisoned";
		graphic = '#';
		color = TCODColor.green;
		cooldown = (int)(MONTH_LENGTH*2);
		statChanges[STRENGTH] = 0.5;
		statChanges[MOVESPEED] = 0.8;
		statChanges[DODGE] = 0.5;
		break;

	case BLEEDING:
		name = "Bleeding";
		graphic = '#';
		color = TCODColor.red;
		cooldown = UPDATES_PER_SECOND * 4;
		damage.second = 4;
		damageType = DAMAGE_SLASH;
		applicableResistance = BLEEDING_RES;
		break;

	case FLYING:
		name = "Flying";
		graphic = '"';
		color = TCODColor.lightBlue;
		cooldown = -1;
		negative=false;
		break;

	case BADSLEEP:
		name = "Sluggish";
		graphic = '-';
		color = TCODColor.grey;
		cooldown = MONTH_LENGTH*3;
		statChanges[MOVESPEED] = 0.75;
		statChanges[DODGE] = 0.75;
		resistanceChanges[POISON_RES] = 0.75;
		break;

	case RAGE:
		name = "Enraged";
		graphic = '!';
		color = TCODColor.red;
		cooldown = UPDATES_PER_SECOND * 7;
		statChanges[STRENGTH] = 2;
		statChanges[DODGE] = 0.5;
		negative=false;
		break;

	case SWIM:
		name = "Swimming";
		graphic = '~';
		color = TCODColor.lightBlue;
		cooldown = -1;
		statChanges[DODGE] = 0.0;
		statChanges[STRENGTH] = 0.75;
		negative=false;
		break;

	case EATING:
		name = "Eating";
		graphic = TCOD_CHAR_ARROW_N;
		color = TCODColor.orange;
		cooldown = -1;
		negative=false;
		break;

	case DRINKING:
		name = "Drinking";
		graphic = TCOD_CHAR_ARROW_N;
		color = TCODColor.blue;
		cooldown = -1;
		negative=false;
		break;

	case CARRYING:
		name = "Carrying item";
		cooldown = -1;
		negative=false;
		break;

	case WORKING:
		name = "Working";
		cooldown = -1;
		graphic = '+';
		color = TCODColor.grey;
		negative=false;
		break;

	case BURNING:
		name = "On fire!";
		cooldown = UPDATES_PER_SECOND * 10;
		graphic = '!';
		color = TCODColor.red;
		damage.second = 7;
		damageType = DAMAGE_FIRE;
		break;

	case CRACKEDSKULLEFFECT:
		name = "Cracked skull";
		cooldown = -1;
		graphic = 168;
		color = TCODColor.grey;
		visible = false;
		break;

	case INVIGORATED:
		name = "Invigorated";
		cooldown = MONTH_LENGTH * 3;
		graphic = 11;
		color = TCODColor(127,255,255);
		visible = false;
		statChanges[STRENGTH] = 1.25;
		statChanges[MOVESPEED] = 1.25;
		statChanges[DODGE] = 1.25;
		resistanceChanges[POISON_RES] = 1.25;
		negative=false;
		break;

	case DRUNK:
		name = "Drunk";
		cooldown = MONTH_LENGTH;
		graphic = 63;
		color = TCODColor(218,255,127);
		break;

	case HEALING:
		name = "Healing";
		cooldown = MONTH_LENGTH;
		graphic = 241;
		color = TCODColor(0,255,0);
		damage.second = -10;
		damageType = DAMAGE_MAGIC;
		negative=false;
		break;

	case HELPLESS:
		name = "Helpless";
		cooldown = UPDATES_PER_SECOND*10;
		graphic = 168;
		color = TCODColor(130,240,255);
		statChanges[MOVESPEED] = 0;
		statChanges[DODGE] = 0;
		break;

	case HIGHGROUND:
		name = "Higher ground";
		cooldown = UPDATES_PER_SECOND/2;
		graphic = 23;
		color = TCODColor(100,255,255);
		visible = false;
		negative = false;
		break;

	case TRIPPED:
		name = "Tripped";
		cooldown = UPDATES_PER_SECOND*2;
		graphic = 31;
		color = TCODColor.white;
		statChanges[MOVESPEED] = 0.2;
		statChanges[DODGE] = 0.2;
		break;

	case BRAVE:
		name = "Brave";
		cooldown = UPDATES_PER_SECOND;
		graphic = 30;
		color = TCODColor(0,255,255);
		negative = false;
		visible = false;
		break;

	case COLLYWOBBLES:
		name = "Collywobbles";
		cooldown = MONTH_LENGTH*3;
		graphic = 207;
		color = TCODColor(127,106,0);
		statChanges[STRENGTH] = 0.5;
		statChanges[MOVESPEED] = 0.75;
		contagionChance = 50;
		applicableResistance = DISEASE_RES;
		break;

	case DROOPS:
		name = "Droops";
		cooldown = MONTH_LENGTH*3;
		graphic = 207;
		color = TCODColor(127,106,0);
		statChanges[STRENGTH] = 0.5;
		statChanges[MOVESPEED] = 0.75;
		contagionChance = 50;
		applicableResistance = DISEASE_RES;
		break;

	case RATTLES:
		name = "Rattles";
		cooldown = MONTH_LENGTH*3;
		graphic = 207;
		color = TCODColor(127,106,0);
		statChanges[STRENGTH] = 0.5;
		statChanges[MOVESPEED] = 0.75;
		contagionChance = 50;
		applicableResistance = DISEASE_RES;
		break;

	case CHILLS:
		name = "Chills";
		cooldown = MONTH_LENGTH*3;
		graphic = 207;
		color = TCODColor(127,106,0);
		statChanges[STRENGTH] = 0.5;
		statChanges[MOVESPEED] = 0.75;
		contagionChance = 50;
		applicableResistance = DISEASE_RES;
		break;

	default: break;
	}
	cooldownDefault = cooldown;
}

bool StatusEffect.IsApplyableStatusEffect(StatusEffectType type) {
	switch (type) {
	case HUNGER:
	case THIRST:
	case PANIC: 
	case CONCUSSION:
	case DROWSY: 
	case SLEEPING: 
	case POISON: 
	case BLEEDING: 
	case BURNING: 
	case BADSLEEP: 
	case INVIGORATED: 
	case DRUNK: 
	case HEALING: 
	case HELPLESS: 
	case HIGHGROUND:
	case TRIPPED:
	case BRAVE:
	case COLLYWOBBLES:
	case DROOPS:
	case RATTLES:
	case CHILLS:
		return true;
	default: 
		return false;
	}
}

StatusEffectType StatusEffect.StringToStatusEffectType(std.string str) {
	if (boost.iequals(str, "hunger")) {
		return HUNGER;
	} else if (boost.iequals(str, "thirst")) {
		return THIRST;
	} else if (boost.iequals(str, "panic")) {
		return PANIC;
	} else if (boost.iequals(str, "concussion")) {
		return CONCUSSION;
	} else if (boost.iequals(str, "drowsy")) {
		return DROWSY;
	} else if (boost.iequals(str, "sleeping")) {
		return SLEEPING;
	} else if (boost.iequals(str, "poison")) {
		return POISON;
	} else if (boost.iequals(str, "bleeding")) {
		return BLEEDING;
	} else if (boost.iequals(str, "flying")) {
		return FLYING;
	} else if (boost.iequals(str, "sluggish")) {
		return BADSLEEP;
	} else if (boost.iequals(str, "rage")) {
		return RAGE;
	} else if (boost.iequals(str, "swimming")) {
		return SWIM;
	} else if (boost.iequals(str, "eating")) {
		return EATING;
	} else if (boost.iequals(str, "drinking")) {
		return DRINKING;
	} else if (boost.iequals(str, "carrying")) {
		return CARRYING;
	} else if (boost.iequals(str, "working")) {
		return WORKING;
	} else if (boost.iequals(str, "burning")) {
		return BURNING;
	} else if (boost.iequals(str, "crackedskull")) {
		return CRACKEDSKULLEFFECT;
	} else if (boost.iequals(str, "invigorated")) {
		return INVIGORATED;
	} else if (boost.iequals(str, "drunk")) {
		return DRUNK;
	} else if (boost.iequals(str, "healing")) {
		return HEALING;
	} else if (boost.iequals(str, "helpless")) {
		return HELPLESS;
	} else if (boost.iequals(str, "highground")) {
		return HIGHGROUND;
	} else if (boost.iequals(str, "tripped")) {
		return TRIPPED;
	} else if (boost.iequals(str, "brave")) {
		return BRAVE;
	} else if (boost.iequals(str, "collywobbles")) {
		return COLLYWOBBLES;
	} else if (boost.iequals(str, "droops")) {
		return DROOPS;
	} else if (boost.iequals(str, "rattles")) {
		return RATTLES;
	} else if (boost.iequals(str, "chills")) {
		return CHILLS;
	}
	return HUNGER;
}

std.string StatusEffect.StatusEffectTypeToString(StatusEffectType type) {
	switch (type) {
	case HUNGER: return "hunger";
	case THIRST: return "thirst";
	case PANIC: return "panic";
	case CONCUSSION: return "concussion";
	case DROWSY: return "drowsy";
	case SLEEPING: return "sleeping";
	case POISON: return "poison";
	case BLEEDING: return "bleeding";
	case FLYING: return "flying";
	case BADSLEEP: return "sluggish";
	case RAGE: return "rage";
	case SWIM: return "swimming";
	case EATING: return "eating";
	case DRINKING: return "drinking";
	case CARRYING: return "carrying";
	case WORKING: return "working";
	case BURNING: return "burning";
	case CRACKEDSKULLEFFECT: return "crackedskull";
	case INVIGORATED: return "invigorated";
	case DRUNK: return "drunk";
	case HEALING: return "healing";
	case HELPLESS: return "helpless";
	case HIGHGROUND: return "highground";
	case TRIPPED: return "tripped";
	case BRAVE: return "brave";
	case COLLYWOBBLES: return "collywobbles";
	case DROOPS: return "droops";
	case RATTLES: return "rattles";
	case CHILLS: return "chills";
	default: return "";
	}
}

void StatusEffect.save(OutputArchive& ar, const unsigned int version) const {
	ar & graphic;
	ar & color.r;
	ar & color.g;
	ar & color.b;
	ar & name;
	ar & type;
	ar & cooldown;
	ar & cooldownDefault;
	ar & statChanges;
	ar & resistanceChanges;
	ar & damage;
	ar & damageType;
	ar & visible;
	ar & negative;
	ar & contagionChance;
	ar & applicableResistance;
}

void StatusEffect.load(InputArchive& ar, const unsigned int version) {
	ar & graphic;
	ar & color.r;
	ar & color.g;
	ar & color.b;
	ar & name;
	ar & type;
	ar & cooldown;
	ar & cooldownDefault;
	ar & statChanges;
	ar & resistanceChanges;
	ar & damage;
	ar & damageType;
	ar & visible;
	ar & negative;
	if (version >= 1) {
		ar & contagionChance;
		ar & applicableResistance;
	}
}
