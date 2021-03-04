import { Color } from "./other/Color.js";
import { Attack } from "./Attack.js";
import { DamageType } from "./DamageType.js";
import { Dice } from "./Dice.js";
import { Resistance } from "./Resistance.js";

export class ItemPreset {
    graphic = '?';
    color = Color.pink;
    name = "Preset default";
    specificCategories = new Set();
    categories = new Set();
    nutrition = -1;
    growth = -1;
    fruits = [];
    components = [];
    organic = false;
    container = 0;
    multiplier = 1;
    fitsInRaw = "";
    containInRaw = "";
    constructedInRaw = "";
    fitsin = -1;
    containIn = -1;
    decays = false;
    decaySpeed = 0;
    decayList = [];
    attack = new Attack();
    resistances = new Array(RES_COUNT).fill(0);
    bulk = 1;
    condition = 1;
    fallbackGraphicsSet = "";
    graphicsHint = -1;
    addsEffects = [];
    removesEffects = [];
    static deserialize(data) {
        let result = new ItemPreset();
        if ("attack" in data) {
            let attack = new Attack();
            if ("damageType" in data.attack) attack.damageType = Attack.StringToDamageType(data.attack.type);
            if ("damageAmount" in data.attack) attack.damageAmount = new Dice(data.damageAmount);
            if ("cooldown" in data.attack) attack.cooldownMax = data.cooldown;
            if ("statusEffects" in data.attack && "effectChances" in data.attack) {
                let index = -1;
                for (let e of data.statusEffects) {
                    index++;
                    attack.statusEffects.push([data.attack.statusEffects[index], data.attack.effectChances[index]]);
                }
            }
            if ("name" in data.attack) attack.name = data.projectile;
            if ("ammo" in data.attack) attack.projectile = data.projectile;
            result.attack = attack;
        }
        if ("bulk" in data) result.bulk = data.bulk;
        if ("category" in data) data.categories.map(category => result.categories.add(category));
        if ("col" in data) result.color = Color.deserialize(data.col);
        if ("components" in data) result.components = data.components;
        if ("constructedin" in data) result.constructedInRaw = data.constructedin;
        if ("containerSize" in data) result.container = data.containerSize;
        if ("containIn" in data) result.containInRaw = data.containIn;
        if ("decay" in data) {
            result.decayList = data.decay;
            result.decays = true;
        }
        if ("decaySpeed" in data) {
            result.decaySpeed = data.decaySpeed;
            result.decays = true;
        }
        if ("durability" in data) result.condition = data.durability;
        if ("fitsin" in data) result.fitsInRaw = data.fitsin;
        if ("fruits" in data) result.fruits = data.fruits;
        if ("graphic" in data) result.graphic = data.graphic;
        if ("growth" in data) result.growth = data.growth;
        if ("item_type" in data) result.name = data.item_type;
        if ("multiplier" in data) result.multiplier = data.multiplier;
        if ("nutrition" in data) result.nutrition = data.nutrition;
        if ("removeStatusEffects" in data) result.removesEffects = data.removeStatusEffects;
        if ("resistances" in data) {
            let index = 0;
            for (let res of Object.keys(data)) {
                switch (res) {
                    case "physical":
                        index = 0;
                        break;
                    case "magic":
                        index = 1;
                        break;
                    case "poison":
                        index = 2;
                        break;
                    case "cold":
                        index = 3;
                        break;
                    case "fire":
                        index = 4;
                        break;
                    case "disease":
                        index = 5;
                        break;
                    case "bleeding":
                        index = 6;
                        break;
                }
                result.resistances[index] = data[res];
            }
        }
        return result;
    }
}