import {
    ItemCat
} from "./ItemCat.js";
import {
    ItemPreset
} from "./ItemPreset.js";
import { Color } from "./libtcod.js";
import {
    PresetParser
} from "./PresetParser.js";

export class ItemListener extends PresetParser {
    /*preset[x] holds item names as strings untill all items have been
    read, and then they are converted into ItemTypes */
    presetGrowth = new Map();
    presetFruits = new Map();
    presetDecay = new Map();
    presetProjectile = new Map();
    presetCategoryParent = new Map();
    itemIndex = 0;
    categoryIndex = 0;
    Item = null;
    /**
     * 
     * @param {Item} store 
     */
    constructor(store, filename) {
        super(filename);
        this.Item = store;
    }
    parse(data) {
        super.parse(data["item category definitions"]);
        super.parse(data["item types"]);
        this.data = data;
    }
    parserNewStruct(str, nm) {
        let strName = nm.toUpperCase();
        if (nm && str.name === "category_type") {
            if (this.Item.itemCategoryNames.find(strName) != this.Item.itemCategoryNames.end()) {
                this.categoryIndex = this.Item.itemCategoryNames[strName];
                this.Item.Categories[this.categoryIndex] = new ItemCat();
                this.Item.Categories[this.categoryIndex].name = nm;
                this.presetCategoryParent[this.categoryIndex] = "";
            } else { //New category
                this.Item.Categories.push(new ItemCat());
                this.categoryIndex = this.Item.Categories.length - 1;
                ++Game.ItemCatCount;
                this.Item.Categories[this.Item.Categories.length - 1].name = nm;
                this.Item.itemCategoryNames.insert(std.make_pair(strName, Game.ItemCatCount - 1));
                this.presetCategoryParent.insert(std.make_pair(this.categoryIndex, ""));
            }
        } else if (nm && str.name === "item_type") {
            let strName = nm.toUpperCase();
            if (this.Item.itemTypeNames.has(strName)) {
                this.itemIndex = this.Item.itemTypeNames.get(strName);
                this.Item.Presets[this.itemIndex] = new ItemPreset();
                this.Item.Presets[this.itemIndex].name = nm;
                this.presetGrowth[this.itemIndex] = "";
                this.presetFruits[this.itemIndex] = [];
                this.presetDecay[this.itemIndex] = [];
                this.presetProjectile[this.itemIndex] = "";
            } else { //New item
                this.Item.Presets.push(new ItemPreset());
                this.itemIndex = this.Item.Presets.length - 1;
                this.presetGrowth.set(this.itemIndex, "");
                this.presetFruits.set(this.itemIndex, []);
                this.presetDecay.set(this.itemIndex, []);
                ++Game.ItemTypeCount;
                this.Item.Presets[this.Item.Presets.length - 1].name = nm;
                this.Item.itemTypeNames.set(strName, Game.ItemTypeCount - 1);
                this.presetProjectile.set(this.itemIndex, "");
            }
        } else if (nm && str.name === "attack") {}
        return true;
    }
    parserFlag(name, value) {
        if (name == "flammable") {
            this.Item.Categories[this.categoryIndex].flammable = value;
        }
        return true;
    }
    parserProperty(nm, value) {
        let name = nm.toLowerCase();
        if (name, "category") {
            for (let i = 0; i < value.length; ++i) {
                let cat = this.Item.StringToItemCategory(value[i]);
                this.Item.Presets[this.itemIndex].categories.insert(cat);
                this.Item.Presets[this.itemIndex].specificCategories.insert(cat);
            }
        } else if (name, "graphic") {
            this.Item.Presets[this.itemIndex].graphic = value;
        } else if (name, "col") {
            this.Item.Presets[this.itemIndex].color = value.col;
        } else if (name, "fallbackGraphicsSet") {
            this.Item.Presets[this.itemIndex].fallbackGraphicsSet = value.s;
        } else if (name, "components") {
            for (let i = 0; i < value.length; ++i) {
                this.Item.Presets[this.itemIndex].components.push(this.Item.StringToItemCategory(value[i]));
            }
        } else if (name, "containin") {
            this.Item.Presets[this.itemIndex].containInRaw = value.s;
        } else if (name, "nutrition") {
            this.Item.Presets[this.itemIndex].nutrition = Math.round(value * MONTH_LENGTH);
            this.Item.Presets[this.itemIndex].organic = true;
        } else if (name, "growth") {
            this.presetGrowth.set(this.itemIndex, value);
            this.Item.Presets[this.itemIndex].organic = true;
        } else if (name, "fruits") {
            // for (let i = 0; i < value.length; ++i) {
            this.presetFruits.set(this.itemIndex, value);
            // }
            this.Item.Presets[this.itemIndex].organic = true;
        } else if (name, "multiplier") {
            this.Item.Presets[this.itemIndex].multiplier = value;
        } else if (name, "containerSize") {
            this.Item.Presets[this.itemIndex].container = value;
        } else if (name, "fitsin") {
            this.Item.Presets[this.itemIndex].fitsInRaw = value;
        } else if (name, "constructedin") {
            this.Item.Presets[this.itemIndex].constructedInRaw = value;
        } else if (name, "decay") {
            this.Item.Presets[this.itemIndex].decays = true;
            // for (let i = 0; i < value.length; ++i) {
            this.presetDecay.set(this.itemIndex, value);
            // }
        } else if (name, "decaySpeed") {
            this.Item.Presets[this.itemIndex].decaySpeed = value;
            this.Item.Presets[this.itemIndex].decays = true;
        } else if (name, "type") {
            this.Item.Presets[this.itemIndex].attack.Type(Attack.StringToDamageType(value));
        } else if (name, "damage") {
            this.Item.Presets[this.itemIndex].attack.Amount(new Dice(value));
        } else if (name, "cooldown") {
            this.Item.Presets[this.itemIndex].attack.CooldownMax(value);
        } else if (name, "statusEffects") {
            for (let i = 0; i < value.length; ++i) {
                let type = StatusEffect.StringToStatusEffectType(value[i]);
                if (StatusEffect.IsApplyableStatusEffect(type))
                    this.Item.Presets[this.itemIndex].attack.StatusEffects().push([type, 100]);
            }
        } else if (name, "effectChances") {
            for (let i = 0; i < value.length; ++i) {
                this.Item.Presets[this.itemIndex].attack.StatusEffects()[i][1] = value[i];
            }
        } else if (name, "ammo") {
            this.presetProjectile.set(this.itemIndex, value);
        } else if (name, "parent") {
            this.presetCategoryParent.set(this.categoryIndex, value);
        } else if (name, "physical") {
            this.Item.Presets[this.itemIndex].resistances[Resistance.PHYSICAL_RES] = value;
        } else if (name, "magic") {
            this.Item.Presets[this.itemIndex].resistances[Resistance.MAGIC_RES] = value;
        } else if (name, "cold") {
            this.Item.Presets[this.itemIndex].resistances[Resistance.COLD_RES] = value;
        } else if (name, "fire") {
            this.Item.Presets[this.itemIndex].resistances[Resistance.FIRE_RES] = value;
        } else if (name, "poison") {
            this.Item.Presets[this.itemIndex].resistances[Resistance.POISON_RES] = value;
        } else if (name, "bleeding") {
            this.Item.Presets[this.itemIndex].resistances[Resistance.BLEEDING_RES] = value;
        } else if (name, "bulk") {
            this.Item.Presets[this.itemIndex].bulk = value;
        } else if (name, "durability") {
            this.Item.Presets[this.itemIndex].condition = value;
        } else if (name, "addStatusEffects") {
            for (let i = 0; i < value.length; ++i) {
                let type = StatusEffect.StringToStatusEffectType(value[i]);
                if (StatusEffect.IsApplyableStatusEffect(type))
                    this.Item.Presets[this.itemIndex].addsEffects.push([type, 100]);
            }
        } else if (name, "addEffectChances") {
            for (let i = 0; i < value.length; ++i) {
                this.Item.Presets[this.itemIndex].addsEffects[i][1] = value[i];
            }
        } else if (name, "removeStatusEffects") {
            for (let i = 0; i < value.length; ++i) {
                let type = StatusEffect.StringToStatusEffectType(value[i]);
                if (StatusEffect.IsApplyableStatusEffect(type))
                    this.Item.Presets[this.itemIndex].removesEffects.push([type, 100]);
            }
        } else if (name, "removeEffectChances") {
            for (let i = 0; i < value.length; ++i) {
                this.Item.Presets[this.itemIndex].removesEffects[i][1] = value[i];
            }
        }
        return true;
    }
    parserEndStruct(str, name) {
        if (str.name == "category_type") {
            if (this.presetCategoryParent[this.categoryIndex] == "")
                this.Item.ParentCategories.push(this.Item.Categories[this.categoryIndex]);
        }
        return true;
    }

    translateNames() {
        //Translate category parents
        for (let pati of this.presetCategoryParent.entries()) {
            if (pati[1] !== "") {
                this.Item.Categories[pati[0]].parent = this.Item.StringToItemCategory(pati[1]);
            }
        }

        //Growth items
        for (let growthi of this.presetGrowth.entries()) {
            if (growthi[1] != "")
                this.Item.Presets[growthi[0]].growth = this.Item.StringToItemType(growthi[1]);
            //We'll handle the items categories' parent categories while we're at it
            for (let cati of this.Item.Presets[growthi[0]].categories) {
                if (this.Item.Categories[cati].parent && !this.Item.Presets[growthi[0]].categories.has(this.Item.Categories[cati].parent)) {
                    this.Item.Presets[growthi[0]].categories.add(this.Item.StringToItemCategory(this.Item.Categories[this.Item.Categories[cati].parent].name));
                    // cati = this.Item.Presets[growthi[0]].categories.begin(); //Start from the beginning, inserting into a set invalidates the iterator
                }
            }
        }

        //Fruits
        for (let itemi of this.presetFruits.entries()) {
            for (let fruiti of itemi[1]) {
                this.Item.Presets[itemi[0]].fruits.push(this.Item.StringToItemType(fruiti));
            }
        }

        //Decay
        for (let itemi of this.presetDecay.entries()) {
            for (let decayi of itemi[1]) {
                if (decayi.toLowerCase() == "filth")
                    this.Item.Presets[itemi[0]].decayList.push(-1);
                else
                    this.Item.Presets[itemi[0]].decayList.push(this.Item.StringToItemType(decayi));
            }
        }

        //Projectiles
        for (let proji of this.presetProjectile.entries()) {
            this.Item.Presets[proji[0]].attack.Projectile(this.Item.StringToItemCategory(proji[1]));
        }
    }

}