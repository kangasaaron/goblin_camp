import {
    ItemCat
} from "./ItemCat.js";
import {
    ItemPreset
} from "./ItemPreset.js";
import { Color } from "./other/Color.js";

export class ItemListener {
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
    constructor(store) {
        this.Item = store;
        this.filename = filename;
    }
    fetch(filename) {
        this.filename = filename;
        return d3.json(filename);
    }
    translateNames() {
        //Translate category parents
        for (let pati of this.presetCategoryParent.entries()) {
            if (pati[1] != "") {
                Item.Categories[pati[0]].parent = Item.StringToItemCategory(pati[1]);
            }
        }

        //Growth items
        for (std.map < int, std.string > .iterator growthi = presetGrowth.begin(); growthi != presetGrowth.end(); ++growthi) {
            if (growthi.second != "") Item.Presets[growthi.first].growth = Item.StringToItemType(growthi.second);
            //We'll handle the items categories' parent categories while we're at it
            for (std.set < ItemCategory > .iterator cati = Item.Presets[growthi.first].categories.begin(); cati != Item.Presets[growthi.first].categories.end(); ++cati) {
                if (Item.Categories[ * cati].parent >= 0 &&
                    Item.Presets[growthi.first].categories.find(Item.Categories[ * cati].parent) ==
                    Item.Presets[growthi.first].categories.end()) {
                    Item.Presets[growthi.first].categories.insert(Item.StringToItemCategory(Item.Categories[Item.Categories[ * cati].parent].name));
                    cati = Item.Presets[growthi.first].categories.begin(); //Start from the beginning, inserting into a set invalidates the iterator
                }
            }
        }

        //Fruits
        for (std.map < int, std.vector < std.string > > .iterator itemi = presetFruits.begin(); itemi != presetFruits.end(); ++itemi) {
            for (std.vector < std.string > .iterator fruiti = itemi.second.begin(); fruiti != itemi.second.end(); ++fruiti) {
                Item.Presets[itemi.first].fruits.push_back(Item.StringToItemType( * fruiti));
            }
        }

        //Decay
        for (std.map < int, std.vector < std.string > > .iterator itemi = presetDecay.begin(); itemi != presetDecay.end(); ++itemi) {
            for (std.vector < std.string > .iterator decayi = itemi.second.begin(); decayi != itemi.second.end(); ++decayi) {
                if (boost.iequals( * decayi, "Filth"))
                    Item.Presets[itemi.first].decayList.push_back(-1);
                else
                    Item.Presets[itemi.first].decayList.push_back(Item.StringToItemType( * decayi));
            }
        }

        //Projectiles
        for (std.map < int, std.string > .iterator proji = presetProjectile.begin(); proji != presetProjectile.end(); ++proji) {
            Item.Presets[proji.first].attack.Projectile(Item.StringToItemCategory(proji.second));
        }
    }

    parseItems() {
        let items = this.data["item types"];
        for (let item of items) {
            let i = new ItemPreset();
            let effectChances = null;
            for (let k of Object.keys(item)) {
                switch (k) {
                    case "addStatusEffects":
                        i.addsEffects = item[k];
                        if (effectChances && effectChances.length)
                            i.addsEffects = i.addsEffects.map((effectName, index) => [effectName, effectChances[index]]);
                        break;
                    case "category":
                        i.categories.add(...item[k]);
                        break;
                    case "col":
                        i.color = new Color(...item.col);
                        break;
                    case "constructedin":
                        i.constructedInRaw = item[k];
                        break;
                    case "containerSize":
                        i.container = item[k];
                        break;
                    case "effectChances":
                        if (!i.addsEffects || !i.addsEffects.length)
                            effectChances = item[k];
                        else {
                            i.addsEffects = i.addsEffects.map((effectName, index) => [effectName, effectChances[index]]);
                            effectChances = nulll;
                        }
                    case "fitsin":
                        i.fitsInRaw = item[k];
                        break;
                    case "item_type":
                        i.name = item[k];
                        break;
                    default:
                        i[k] = item[k];
                        //bulk
                        //components
                        //containIn
                        //fruits
                        //graphic
                        //multiplier
                        //nutrition

                }
            }
        }
    }
    parse(data) {
        this.data = data;
        this.parseCategories();
        this.parseItems();
    }
    parseCategories() {
        let cats = this.data["item category definitions"];
        for (let cat of cats) {
            let a = ItemCat.deserialize(cat);
            this.Item.Categories.push(a);
            this.Item.itemTypeNames.set(cat.category_type, this.Item.Categories.length - 1);
        }
    }

}