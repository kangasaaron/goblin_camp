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
    ItemPreset
} from "./ItemPreset.js";
import {
    ItemListener
} from "./ItemListener.js";
import {
    ItemCategory
} from "./ItemCategory.js";
import {
    ItemType
} from "./ItemType.js";

export class Item extends Entity {
    static CLASS_VERSION = 0;

    /**
     * @type {ItemPreset}[]
     */
    static Presets = [];
    /**
     * @type {ItemCategory}[]
     */
    static Categories = [];
    /**
     * @type {ItemCategory}[]
     */
    static ParentCategories = [];
    static itemTypeNames = new Map();
    static itemCategoryNames = new Map();
    static EffectRemovers = new Map(); // multimap - i.e. a map of arrays
    static GoodEffectAdders = new Map(); // multimap - i.e. a map of arrays

    resistances = new Array(Resistance.RES_COUNT).fill(0);

    type = 0;
    categories = new Set();
    flammable = false;
    decayCounter = -1;

    attemptedStore = false;
    attack = null;
    condition = 0;
    color = new Color();
    graphic = 0;
    container = null;
    internal = false;

    constructor(startPos = zero, typeval = -1, owner = -1, components = []) {
        super();
        this.type = typeVal;

        this.SetFaction(owner);
        this.pos = startPos;

        //Remember that the components are destroyed after this constructor!
        if (this.type < 0 || this.type >= (Item.Presets.length)) return;

        this.name = Item.Presets[this.type].name;
        this.categories = Item.Presets[this.type].categories;
        this.graphic = Item.Presets[this.type].graphic;
        this.color = Item.Presets[this.type].color;
        if (Item.Presets[this.type].decays) this.decayCounter = Item.Presets[this.type].decaySpeed;

        this.attack = Item.Presets[this.type].attack;

        for (let i = 0; i < Resistance.RES_COUNT; ++i) {
            this.resistances[i] = Item.Presets[this.type].resistances[i];
        }

        this.bulk = Item.Presets[this.type].bulk;
        this.condition = Item.Presets[this.type].condition;
        this.calculateFlammability();
    }



    destructor() {
        if (DEBUG) {
            console.log(`${this.name} (${this.uid}) destroyed`);
        }
        if (this.faction == PLAYERFACTION) {
            StockManager.UpdateQuantity(this.type, -1);
        }
    }


    calculateFlammability() {
        //Calculate flammability based on categorical flammability, and then modify it based on components
        let flame = 0;
        for (let cati of this.categories) {
            if (cati.flammable) flame += 2;
            else --flame;
        }

        if (this.components.length > 0) {
            for (let i = 0; i < this.components.length; ++i) {
                if (this.components[i].lock()) {
                    this.color = Color.lerp(this.color, this.components[i].lock().Color(), 0.35);
                    if (this.components[i].lock().IsFlammable()) flame += 2;
                    else --flame;
                }
            }
        } else if (Item.Presets[this.type].components.length > 0) {
            /*This item was created without real components
            ie. not in a workshop. We still should approximate
            flammability so that it behaves like on built in a 
            workshop would*/
            for (let i = 0; i < Item.Presets[this.type].components.length; ++i) {
                if (Item.Categories[Item.Presets[this.type].components[i]].flammable) flame += 3;
                else --flame;
            }
        }

        if (flame > 0) {
            this.flammable = true;
            if (DEBUG) {
                console.log("Created flammable object " + flame);
            }
        } else {
            if (DEBUG) {
                console.log("Created not flammable object " + flame);
            }
        }
    }
    GetGraphicsHint() {
        if (this.type > 0)
            return Item.Presets[this.type].graphicsHint;
        return 0;
    }
    Draw(upleft, the_console) {
        let screenx = (this.pos.minus(upleft)).X();
        let screeny = (this.pos.minus(upleft)).Y();
        if (screenx >= 0 && screenx < the_console.getWidth() && screeny >= 0 && screeny < the_console.getHeight()) {
            the_console.putCharEx(screenx, screeny, this.graphic, this.color, map.GetBackColor(this.pos));
        }
    }
    Type() {
        return this.type;
    }
    IsCategory(category) {
        return (this.categories.includes(category));
    }
    Color(col) {
        if (typeof col !== "undefined")
            this.color = col;
        return this.color;
    }
    Position(p) {
        if (typeof p !== "undefined") {
            if (!map.IsInside(p)) {
                if (!this.internal && !this.container.lock()) map.ItemList(this.pos).erase(this.uid);
                this.pos = p;
                if (!this.internal && !this.container.lock()) map.ItemList(this.pos).insert(this.uid);
            }
        }

        if (this.container.lock())
            return this.container.lock().Position();
        return this.Entity.Position();
    }

    Reserve(value) {
        this.reserved = value;
        if (!this.reserved && !this.container.lock() && !this.attemptedStore) {
            this.attemptedStore = true;
            Game.StockpileItem(this);
        }
    }

    PutInContainer(con) {
        this.container = con;
        this.attemptedStore = false;

        Game.ItemContained(this, !!this.container.lock());

        if (!this.container.lock() && !this.reserved) {
            Game.StockpileItem(this);
            this.attemptedStore = true;
        }
    }
    ContainedIn() {
        return this.container;
    }
    GetGraphic() {
        return this.graphic;
    }
    GetAttack() {
        return this.attack;
    }
    /**
     * 
     * @param {ItemType} type 
     * @returns {string} name of Item type
     */
    static ItemTypeToString(type) {
        if (type >= 0 && type < Item.Presets.length)
            return Item.Presets[this.type].name;
        return "None";
    }
    /**
     * 
     * @param {string} str name of Item type
     * @returns {ItemType}
     */
    static StringToItemType(str) {
        str = str.toUpperCase();
        if (!this.itemTypeNames.has(str)) {
            return -1;
        }
        return this.itemTypeNames.get(str);
    }
    /**
     * 
     * @param {ItemCategory} category 
     * @returns {string} name of category
     */
    static ItemCategoryToString(category) {
        if (category >= 0 && category < Item.Categories.length)
            return Item.Categories[category].name;
        return "None";
    }
    /**
     * 
     * @param {string} str name of Item Category
     * @returns {ItemCategory}
     */
    static StringToItemCategory(str) {
        boost.to_upper(str);
        if (!this.itemCategoryNames.has(str)) {
            return -1;
        }
        return Item.itemCategoryNames.get(str);
    }
    static Components(type, index) {
        if (type > 0) {
            if (typeof index === "undefined")
                return Item.Presets[this.type].components;
            return Item.Presets[this.type].components[index];
        }
        return [];
    }
    SetFaction(val) {
        if (val == PLAYERFACTION && this.faction != PLAYERFACTION) { //Transferred to player
            StockManager.UpdateQuantity(this.type, 1);
        } else if (val != PLAYERFACTION && faction == PLAYERFACTION) { //Transferred from player
            StockManager.UpdateQuantity(this.type, -1);
        }
        this.faction = val;
    }
    SetInternal() {
        this.internal = true;
    }
    GetDecay() {
        return this.decayCounter;
    }
    IsFlammable() {
        return this.flammable;
    }
    DecreaseCondition() { //Only decreases condition, does NOT handle item removal or debris creation!
        if (this.condition > 0) --this.condition;
        return this.condition;
    }
    GetFaction() {
        return this.faction;
    }
    RelativeValue() {
        let amount = this.attack.Amount();
        let minDamage = (amount.nb_rolls + amount.addsub);
        let maxDamage = ((amount.nb_rolls * amount.nb_faces) + amount.addsub);
        return (minDamage + maxDamage) / 2;
    }
    Resistance(i) {
        return this.resistances[i];
    }

    static ResolveContainers() {
        for (let it of Item.Presets) {
            let preset = it;
            if (preset.fitsInRaw) {
                preset.fitsin = Item.StringToItemCategory(preset.fitsInRaw);
            }
            if (preset.containInRaw) {
                preset.containIn = Item.StringToItemCategory(preset.containInRaw);
                preset.components.push(preset.containIn);
            }
            preset.fitsInRaw = "";
            preset.containInRaw = "";
        }
    }
    SetVelocity(speed) {
        this.velocity = speed;
        if (speed > 0) {
            Game.flyingItems.push(this);
            return;
        }

        //The item has moved before but has now stopped
        Game.stoppedItems.push(this);

        if (map.IsWalkable(this.pos)) return;

        for (let radius = 1; radius < 10; ++radius) {
            //TODO consider using something more believable here; the item would jump over 9 walls?
            for (let ix = this.pos.X() - radius; ix <= this.pos.X() + radius; ++ix) {
                for (let iy = this.pos.Y() - radius; iy <= this.pos.Y() + radius; ++iy) {
                    let p = new Coordinate(ix, iy);
                    if (!map.IsWalkable(p)) continue;
                    this.Position(p);
                    return;
                }
            }
        }
    }
    Impact(speedChange) {
        this.SetVelocity(0);
        this.flightPath = [];

        if (speedChange >= 10 && Random.Generate(9) < 7)
            this.DecreaseCondition(); //A sudden impact will damage the item
        if (this.condition == 0) { //Note that condition < 0 means that it is not damaged by impacts
            //The item has impacted and broken. Create debris owned by no one
            let component = [1, this];

            Game.CreateItem(this.Position(), Item.StringToItemType("debris"), false, -1, component);
            //Game.Update removes all condition==0 items in the stopped items list, which is where this item will be
        }
    }
    CollisionDetection() {
        let t = this.flightPath[this.flightPath.length - 1].coord;

        if (map.BlocksWater(t) || !map.IsWalkable(t)) { //We've hit an obstacle
            let attack = this.GetAttack();
            if (map.GetConstruction(t) > -1) {
                let construct;
                if (construct = Game.GetConstruction(map.GetConstruction(t)).lock()) {
                    construct.Damage(attack);
                }
            }
            this.Impact(velocity);
            return true;
        }
        if (map.NPCList(t).length > 0) { //Hit a creature
            if (Random.Generate(Math.max(1, this.flightPath[this.flightPath - 1].height) - 1) < (2 + map.NPCList(t).length)) {
                let attack = this.GetAttack();
                let npc = Game.GetNPC(map.NPCList(t)[0]);
                npc.Damage(attack);

                this.Position(this.flightPath[this.flightPath - 1].coord);
                this.Impact(this.velocity);
                return true;
            }
        }
        return false;
    }
    UpdateVelocity() {
        if (this.velocity <= 0) return;

        this.nextVelocityMove += this.velocity;
        while (this.nextVelocityMove > 100) {
            this.nextVelocityMove -= 100;
            if (this.flightPath.length <= 0) {
                this.Impact(this.velocity);
                return;
            } //No more flightpath

            if (this.flightPath[this.flightPath.length - 1].height < ENTITYHEIGHT) { //We're flying low enough to hit things
                let impacted = this.CollisionDetection();
                if (impacted) return;
            }

            this.Position(this.flightPath[this.flightPath.length - 1].coord);

            if (this.flightPath[this.flightPath.length - 1].height <= 0) { //Hit the ground early
                this.Impact(this.velocity);
                return;
            }
            this.flightPath.pop();
        }
    }
    static UpdateEffectItems() {
        let index = -1;
        for (let itemi of this.Presets) {
            ++index;
            for (let remEffi of itemi.removesEffects) {
                this.EffectRemovers.set(remEffi[0], new ItemType(index));
            }
            for (let addEffi of itemi.addsEffects) {
                let effect = new StatusEffect(addEffi[0]);
                if (!effect.negative) {
                    this.GoodEffectAdders.set(addEffi[0], new ItemType(index));
                }
            }
        }
    }

    static LoadPresets(filename) {
        let itemListener = new ItemListener(Item);
        itemListener.fetch(filename)
            .then(function (data) {
                itemListener.parse(data);
                itemListener.translateNames();
                Item.UpdateEffectItems();
            });
    }

    serialize(ar, version) {
        ar.register_type(Entity);
        ar.register_type(Color);
        let result = super.serialize(ar, version);
        result.graphic = this.graphic;
        result.type = this.type;
        result.itemType = Item.ItemTypeToString(this.type);
        result.color = ar.serialize(this.color);
        result.categories = ar.serialize(this.categories.map(c => Item.ItemCategoryToString(c)));
        result.flammable = this.flammable;
        result.faction = this.faction;
        result.components = ar.serialize(this.components);
        result.attemptedStore = this.attemptedStore;
        result.decayCounter = this.decayCounter;
        result.attack = this.attack;
        result.resistances = this.resistances;
        result.condition = this.condition;
        result.container = this.container;
        result.internal = this.internal;
    }
    static deserialize(data, version, deserializer) {
        let result = new Item(deserializer.deserialize(data.pos), data.type, data.faction, deserializer.deserialize(data.components));
        result.graphic = data.graphic;
        result.type = Item.StringToItemType(data.itemType)
        let failedToFindType = false;
        if (result.type == -1) {
            result.type = Item.StringToItemType("debris");
            failedToFindType = true;
        }
        result.color = deserializer.deserialize(data.color);
        result.categories = deserializer.deserialize(data.categories);
        if (!result.categories.length)
            result.categories.push(Item.StringToItemCategory("garbage"));
        result.flammable = data.flammable;
        if (failedToFindType)
            result.flammable = true; //Just so you can get rid of it
        result.attemptedStore = data.attemptedStore;
        result.decayCounter = data.decayCounter;
        result.attack = data.attack;
        result.resistances = data.resistances;
        result.condition = data.condition;
        result.container = data.container;
        result.internal = data.internal;
    }
};