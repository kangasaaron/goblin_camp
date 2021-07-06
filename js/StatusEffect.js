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
along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>. */

import { Serializable } from './data/Serialization.js'
import { NPCStat } from './NPCStat.js'
import { Constants } from './Constants.js'
import { TCODColor, TCOD_chars_t } from '../fakeTCOD/libtcod.js'
import { DamageType } from './DamageType.js'

import { Resistance } from './Resistance.js'

import { StatusEffectType } from './StatusEffectType.js'
// import { TCODColor } from '../fakeTCOD/libtcod.js'

export class StatusEffect extends Serializable {
  constructor (typeval = StatusEffectType.HUNGER, g = 'Y', col = 'pink') {
    super()
    this.damageType = null
    this.visible = true
    /**
         * Is this a negative effect? ie. one the creature wants to get rid of
         */
    this.negative = true
    /**
         * How contagious (if at all) is this effect?
         */
    this.contagionChance = 0
    /*
         * What resistance helps resist this effect?
         */
    this.applicableResistance = Resistance.MAGIC_RES
    this.name = ''
    this.cooldown = 0
    this.cooldownDefault = 0
    // Initialize changes to nothing, ie. 100%
    this.statChanges = new Array(NPCStat.STAT_COUNT).fill(1.0) // These are percentage values of the original value (100%= no change)
    this.resistanceChanges = new Array(Resistance.RES_COUNT).fill(1.0) // These are percentage values of the original value (100%= no change)
    this.damage = [] // First - counter, second - damage amount
    this.graphic = g
    this.color = col
    this.type = typeval

    this.damage[0] = Constants.UPDATES_PER_SECOND
    this.damage[1] = 0

    // TODO: All this needs to be put into data files at some point
    switch (this.type) {
      case StatusEffectType.HUNGER:
        this.name = 'Hungry'
        this.graphic = TCOD_chars_t.TCOD_CHAR_ARROW_S
        this.color = TCODColor.orange
        this.cooldown = -1
        break
      case StatusEffectType.THIRST:
        this.name = 'Thirsty'
        this.graphic = TCOD_chars_t.TCOD_CHAR_ARROW_S
        this.color = TCODColor.blue
        this.cooldown = -1
        break
      case StatusEffectType.PANIC:
        this.name = 'Panicking'
        this.graphic = '!'
        this.color = TCODColor.white
        this.cooldown = Constants.UPDATES_PER_SECOND * 5
        this.contagionChance = 75
        break
      case StatusEffectType.CONCUSSION:
        this.name = 'Concussed'
        this.graphic = '?'
        this.color = TCODColor.grey
        this.cooldown = Constants.UPDATES_PER_SECOND * 5
        this.statChanges[NPCStat.MOVESPEED] = 0.5
        this.statChanges[NPCStat.DODGE] = 0.5
        break
      case StatusEffectType.DROWSY:
        this.name = 'Drowsy'
        this.graphic = 'z'
        this.color = TCODColor.lightGrey
        this.cooldown = -1
        this.statChanges[NPCStat.MOVESPEED] = 0.8
        this.statChanges[NPCStat.DODGE] = 0.8
        break
      case StatusEffectType.SLEEPING:
        this.name = 'Sleeping'
        this.graphic = 'Z'
        this.color = TCODColor.lightGrey
        this.cooldown = Constants.UPDATES_PER_SECOND
        break
      case StatusEffectType.POISON:
        this.name = 'Poisoned'
        this.graphic = '#'
        this.color = TCODColor.green
        this.cooldown = (Constants.MONTH_LENGTH * 2)
        this.statChanges[NPCStat.STRENGTH] = 0.5
        this.statChanges[NPCStat.MOVESPEED] = 0.8
        this.statChanges[NPCStat.DODGE] = 0.5
        break

      case StatusEffectType.BLEEDING:
        this.name = 'Bleeding'
        this.graphic = '#'
        this.color = TCODColor.red
        this.cooldown = Constants.UPDATES_PER_SECOND * 4
        this.damage.second = 4
        this.damageType = DamageType.DAMAGE_SLASH
        this.applicableResistance = Resistance.BLEEDING_RES
        break

      case StatusEffectType.FLYING:
        this.name = 'Flying'
        this.graphic = '"'
        this.color = TCODColor.lightBlue
        this.cooldown = -1
        this.negative = false
        break
      case StatusEffectType.BADSLEEP:
        this.name = 'Sluggish'
        this.graphic = '-'
        this.color = TCODColor.grey
        this.cooldown = Constants.MONTH_LENGTH * 3
        this.statChanges[NPCStat.MOVESPEED] = 0.75
        this.statChanges[NPCStat.DODGE] = 0.75
        this.resistanceChanges[Resistance.POISON_RES] = 0.75
        break

      case StatusEffectType.RAGE:
        this.name = 'Enraged'
        this.graphic = '!'
        this.color = TCODColor.red
        this.cooldown = Constants.UPDATES_PER_SECOND * 7
        this.statChanges[NPCStat.STRENGTH] = 2
        this.statChanges[NPCStat.DODGE] = 0.5
        this.negative = false
        break

      case StatusEffectType.SWIM:
        this.name = 'Swimming'
        this.graphic = '~'
        this.color = TCODColor.lightBlue
        this.cooldown = -1
        this.statChanges[NPCStat.DODGE] = 0.0
        this.statChanges[NPCStat.STRENGTH] = 0.75
        this.negative = false
        break

      case StatusEffectType.EATING:
        this.name = 'Eating'
        this.graphic = TCOD_chars_t.TCOD_CHAR_ARROW_N
        this.color = TCODColor.orange
        this.cooldown = -1
        this.negative = false
        break
      case StatusEffectType.DRINKING:
        this.name = 'Drinking'
        this.graphic = TCOD_chars_t.TCOD_CHAR_ARROW_N
        this.color = TCODColor.blue
        this.cooldown = -1
        this.negative = false
        break
      case StatusEffectType.CARRYING:
        this.name = 'Carrying item'
        this.cooldown = -1
        this.negative = false
        break
      case StatusEffectType.WORKING:
        this.name = 'Working'
        this.cooldown = -1
        this.graphic = '+'
        this.color = TCODColor.grey
        this.negative = false
        break
      case StatusEffectType.BURNING:
        this.name = 'On fire!'
        this.cooldown = Constants.UPDATES_PER_SECOND * 10
        this.graphic = '!'
        this.color = TCODColor.red
        this.damage.second = 7
        this.damageType = DamageType.DAMAGE_FIRE
        break
      case StatusEffectType.CRACKEDSKULLEFFECT:
        this.name = 'Cracked skull'
        this.cooldown = -1
        this.graphic = 168
        this.color = TCODColor.grey
        this.visible = false
        break
      case StatusEffectType.INVIGORATED:
        this.name = 'Invigorated'
        this.cooldown = Constants.MONTH_LENGTH * 3
        this.graphic = 11
        this.color = new TCODColor(127, 255, 255)
        this.visible = false
        this.statChanges[NPCStat.STRENGTH] = 1.25
        this.statChanges[NPCStat.MOVESPEED] = 1.25
        this.statChanges[NPCStat.DODGE] = 1.25
        this.resistanceChanges[Resistance.POISON_RES] = 1.25
        this.negative = false
        break
      case StatusEffectType.DRUNK:
        this.name = 'Drunk'
        this.cooldown = Constants.MONTH_LENGTH
        this.graphic = 63
        this.color = new TCODColor(218, 255, 127)
        break
      case StatusEffectType.HEALING:
        this.name = 'Healing'
        this.cooldown = Constants.MONTH_LENGTH
        this.graphic = 241
        this.color = new TCODColor(0, 255, 0)
        this.damage.second = -10
        this.damageType = DamageType.DAMAGE_MAGIC
        this.negative = false
        break

      case StatusEffectType.HELPLESS:
        this.name = 'Helpless'
        this.cooldown = Constants.UPDATES_PER_SECOND * 10
        this.graphic = 168
        this.color = new TCODColor(130, 240, 255)
        this.statChanges[NPCStat.MOVESPEED] = 0
        this.statChanges[NPCStat.DODGE] = 0
        break
      case StatusEffectType.HIGHGROUND:
        this.name = 'Higher ground'
        this.cooldown = Constants.UPDATES_PER_SECOND / 2
        this.graphic = 23
        this.color = new TCODColor(100, 255, 255)
        this.visible = false
        this.negative = false
        break
      case StatusEffectType.TRIPPED:
        this.name = 'Tripped'
        this.cooldown = Constants.UPDATES_PER_SECOND * 2
        this.graphic = 31
        this.color = TCODColor.white
        this.statChanges[NPCStat.MOVESPEED] = 0.2
        this.statChanges[NPCStat.DODGE] = 0.2
        break
      case StatusEffectType.BRAVE:
        this.name = 'Brave'
        this.cooldown = Constants.UPDATES_PER_SECOND
        this.graphic = 30
        this.color = new TCODColor(0, 255, 255)
        this.negative = false
        this.visible = false
        break
      case StatusEffectType.COLLYWOBBLES:
        this.name = 'Collywobbles'
        this.cooldown = Constants.MONTH_LENGTH * 3
        this.graphic = 207
        this.color = new TCODColor(127, 106, 0)
        this.statChanges[NPCStat.STRENGTH] = 0.5
        this.statChanges[NPCStat.MOVESPEED] = 0.75
        this.contagionChance = 50
        this.applicableResistance = Resistance.DISEASE_RES
        break

      case StatusEffectType.DROOPS:
        this.name = 'Droops'
        this.cooldown = Constants.MONTH_LENGTH * 3
        this.graphic = 207
        this.color = new TCODColor(127, 106, 0)
        this.statChanges[NPCStat.STRENGTH] = 0.5
        this.statChanges[NPCStat.MOVESPEED] = 0.75
        this.contagionChance = 50
        this.applicableResistance = Resistance.DISEASE_RES
        break

      case StatusEffectType.RATTLES:
        this.name = 'Rattles'
        this.cooldown = Constants.MONTH_LENGTH * 3
        this.graphic = 207
        this.color = new TCODColor(127, 106, 0)
        this.statChanges[NPCStat.STRENGTH] = 0.5
        this.statChanges[NPCStat.MOVESPEED] = 0.75
        this.contagionChance = 50
        this.applicableResistance = Resistance.DISEASE_RES
        break

      case StatusEffectType.CHILLS:
        this.name = 'Chills'
        this.cooldown = Constants.MONTH_LENGTH * 3
        this.graphic = 207
        this.color = new TCODColor(127, 106, 0)
        this.statChanges[NPCStat.STRENGTH] = 0.5
        this.statChanges[NPCStat.MOVESPEED] = 0.75
        this.contagionChance = 50
        this.applicableResistance = Resistance.DISEASE_RES
        break

      default:
        break
    }
    this.cooldownDefault = this.cooldown
  }

  static IsApplyableStatusEffect (type) {
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
        return true
      default:
        return false
    }
  }

  static StringToStatusEffectType (str) {
    str = str.toLowerCase()
    if (str === 'hunger') {
      return StatusEffectType.HUNGER
    } else if (str === 'thirst') {
      return StatusEffectType.THIRST
    } else if (str === 'panic') {
      return StatusEffectType.PANIC
    } else if (str === 'concussion') {
      return StatusEffectType.CONCUSSION
    } else if (str === 'drowsy') {
      return StatusEffectType.DROWSY
    } else if (str === 'sleeping') {
      return StatusEffectType.SLEEPING
    } else if (str === 'poison') {
      return StatusEffectType.POISON
    } else if (str === 'bleeding') {
      return StatusEffectType.BLEEDING
    } else if (str === 'flying') {
      return StatusEffectType.FLYING
    } else if (str === 'sluggish') {
      return StatusEffectType.BADSLEEP
    } else if (str === 'rage') {
      return StatusEffectType.RAGE
    } else if (str === 'swimming') {
      return StatusEffectType.SWIM
    } else if (str === 'eating') {
      return StatusEffectType.EATING
    } else if (str === 'drinking') {
      return StatusEffectType.DRINKING
    } else if (str === 'carrying') {
      return StatusEffectType.CARRYING
    } else if (str === 'working') {
      return StatusEffectType.WORKING
    } else if (str === 'burning') {
      return StatusEffectType.BURNING
    } else if (str === 'crackedskull') {
      return StatusEffectType.CRACKEDSKULLEFFECT
    } else if (str === 'invigorated') {
      return StatusEffectType.INVIGORATED
    } else if (str === 'drunk') {
      return StatusEffectType.DRUNK
    } else if (str === 'healing') {
      return StatusEffectType.HEALING
    } else if (str === 'helpless') {
      return StatusEffectType.HELPLESS
    } else if (str === 'highground') {
      return StatusEffectType.HIGHGROUND
    } else if (str === 'tripped') {
      return StatusEffectType.TRIPPED
    } else if (str === 'brave') {
      return StatusEffectType.BRAVE
    } else if (str === 'collywobbles') {
      return StatusEffectType.COLLYWOBBLES
    } else if (str === 'droops') {
      return StatusEffectType.DROOPS
    } else if (str === 'rattles') {
      return StatusEffectType.RATTLES
    } else if (str === 'chills') {
      return StatusEffectType.CHILLS
    }
    return StatusEffectType.HUNGER
  }

  static StatusEffectTypeToString (type) {
    switch (type) {
      case StatusEffectType.HUNGER:
        return 'hunger'
      case StatusEffectType.THIRST:
        return 'thirst'
      case StatusEffectType.PANIC:
        return 'panic'
      case StatusEffectType.CONCUSSION:
        return 'concussion'
      case StatusEffectType.DROWSY:
        return 'drowsy'
      case StatusEffectType.SLEEPING:
        return 'sleeping'
      case StatusEffectType.POISON:
        return 'poison'
      case StatusEffectType.BLEEDING:
        return 'bleeding'
      case StatusEffectType.FLYING:
        return 'flying'
      case StatusEffectType.BADSLEEP:
        return 'sluggish'
      case StatusEffectType.RAGE:
        return 'rage'
      case StatusEffectType.SWIM:
        return 'swimming'
      case StatusEffectType.EATING:
        return 'eating'
      case StatusEffectType.DRINKING:
        return 'drinking'
      case StatusEffectType.CARRYING:
        return 'carrying'
      case StatusEffectType.WORKING:
        return 'working'
      case StatusEffectType.BURNING:
        return 'burning'
      case StatusEffectType.CRACKEDSKULLEFFECT:
        return 'crackedskull'
      case StatusEffectType.INVIGORATED:
        return 'invigorated'
      case StatusEffectType.DRUNK:
        return 'drunk'
      case StatusEffectType.HEALING:
        return 'healing'
      case StatusEffectType.HELPLESS:
        return 'helpless'
      case StatusEffectType.HIGHGROUND:
        return 'highground'
      case StatusEffectType.TRIPPED:
        return 'tripped'
      case StatusEffectType.BRAVE:
        return 'brave'
      case StatusEffectType.COLLYWOBBLES:
        return 'collywobbles'
      case StatusEffectType.DROOPS:
        return 'droops'
      case StatusEffectType.RATTLES:
        return 'rattles'
      case StatusEffectType.CHILLS:
        return 'chills'
      default:
        return ''
    }
  }

  serialize (ar, version) {
    ar.register_type(StatusEffectType)
    ar.register_type(DamageType)
    ar.register_type(Resistance)
    return {
      graphic: this.graphic,
      color: ar.serialize(this.color),
      name: this.name,
      type: ar.serialize(this.type),
      cooldown: this.cooldown,
      cooldownDefault: this.cooldownDefault,
      statChanges: this.statChanges,
      resistanceChanges: this.resistanceChanges,
      damage: this.damage,
      damageType: ar.serialize(this.damageType),
      visible: this.visible,
      negative: this.negative,
      contagionChance: this.contagionChance,
      applicableResistance: ar.serialize(this.applicableResistance)
    }
  }

  static deserialize (data, version, deserializer) {
    deserializer.register_type(StatusEffectType)
    deserializer.register_type(DamageType)
    deserializer.register_type(Resistance)
    const result = new StatusEffect(
      deserializer.deserialize(data.type),
      data.graphic,
      deserializer.deserialize(data.color))
    result.name = data.name
    result.cooldown = data.cooldown
    result.cooldownDefault = data.cooldownDefault
    result.statChanges = data.statChanges
    result.resistanceChanges = data.resistanceChanges
    result.damage = data.damage
    result.damageType = deserializer.deserialize(data.damageType)
    result.visible = data.visible
    result.negative = data.negative
    if (version >= 1) {
      result.contagionChance = data.contagionChance
      result.applicableResistance = deserializer.deserialize(data.applicableResistance)
    }
    return result
  }
}

StatusEffect.CLASS_VERSION = 1
// Version 1 = v0.2 - contagionChance
