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
along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/


import { TCODColor } from "../../fakeTCOD/libtcod.js";
import { Coordinate } from "../Coordinate.js";
import { Game } from "../Game.js";
import { Item } from "./Item.js";
import { Stockpile } from "../constructions/Stockpile.js";
import { TooltipEntry } from "../UI/TooltipEntry.js";

export class Container extends Item {
    static CLASS_VERSION = 0;

    items = [];
    capacity = 0;
    reservedSpace = 0;
    listeners = [];
    listenersAsUids = [];

    //Special cases for real liquids
    water = 0;
    filth = 0;

    constructor(
        pos = new Coordinate(0, 0),
        type = 0,
        capValue = 1000,
        faction = 0,
        components = [],
        nlisteners = []
    ) {
        super(pos, type, faction, components);
        this.capacity = capValue;
        this.listeners = nlisteners;
    }


    destructor() {
        while (this.items.length) {
            let item = this.GetFirstItem();
            this.RemoveItem(item);
            if (item.lock())
                item.lock().PutInContainer();
        }
        super.destructor();
    }


    AddItem(witem) {
        let item = witem.lock();
        if (!item) return false;
        if (this.capacity < Math.max(item.GetBulk(), 1)) return false;

        item.PutInContainer(this);
        this.items.push(item);
        this.capacity -= Math.max(item.GetBulk(), 1); //<- so that bulk=0 items take space
        for (let it of this.listeners) it.ItemAdded(item);

        if (item.Type() === Item.StringToItemType("water")) ++this.water;
        return true;
    }
    RemoveItem(item) {
        if (!this.items.includes(item)) return;
        this.items.erase(item);
        if (item.lock()) {
            this.capacity += Math.max(item.lock().GetBulk(), 1);
            if (item.lock().Type() === Item.StringToItemType("water")) --this.water;
        }
        for (let it of this.listeners) it.ItemRemoved(item);
    }
    ReserveSpace(res, bulk = 1) {
        if (res) this.reservedSpace += Math.max(1, bulk);
        else this.reservedSpace -= Math.max(1, bulk);
    }
    GetItem(item) {
        return this.items.find(item);
    }
    GetItems() {
        return this.items;
    }
    GetFirstItem() {
        if (this.items.length === 0) return null;
        return this.items[0];
    }
    empty() {
        return this.items.length === 0;
    }
    size() {
        return this.items.length;
    }
    Capacity() {
        return this.capacity - this.reservedSpace;
    }
    Full() {
        return this.capacity - this.reservedSpace <= 0;
    }
    AddListener(listener) {
        this.listeners.push(listener);
        if (listener instanceof Stockpile) {
            this.listenersAsUids.push(listener.Uid());
        }
    }
    RemoveListener(listener) {
        for (let n = 0; n < this.listeners.length; n++) {
            if (this.listeners[n] === listener) {
                this.listeners.splice(n, 1);
                if (n < this.listenersAsUids.length) this.listenersAsUids.splice(1, n);
                return;
            }
        }
    }
    GetTooltip(x, y, tooltip) {
        let capacityUsed = 0;
        for (let itemi of this.items) {
            if (itemi.lock())
                this.capacityUsed += Math.max(1, itemi.lock().GetBulk());
        }
        tooltip.AddEntry(
            new TooltipEntry(
                `${this.name} - ${this.size()} items (${capacityUsed}/${this.capacity + capacityUsed})`,
                TCODColor.white
            )
        );
    }
    TranslateContainerListeners() {
        this.listeners = [];
        for (let i = 0; i < this.listenersAsUids.length; ++i) {
            let cons = Game.i.GetConstruction(this.listenersAsUids[i]);
            if (cons.lock() && cons.lock() instanceof Stockpile) {
                this.listeners.push(cons.lock().get());
            }
        }
    }
    AddWater(amount) {
        if (!this.empty()) return;
        if (this.filth !== 0) return;

        for (let i = 0; i < amount; ++i) {
            let waterUid = Game.i.CreateItem(
                this.Position(),
                Item.StringToItemType("Water")
            );
            let waterItem = Game.i.GetItem(waterUid).lock();
            if (!this.AddItem(waterItem)) {
                Game.i.RemoveItem(waterItem);
                break;
            }
        }
    }
    RemoveWater(amount) {
        for (let i = 0; i < amount; ++i) {
            for (let itemi of this.items) {
                let waterItem = itemi.lock();
                if (waterItem && waterItem.Type() === Item.StringToItemType("water")) {
                    Game.i.RemoveItem(waterItem);
                    break;
                }
            }
        }
    }
    ContainsWater() {
        return this.water;
    }
    AddFilth(amount) {
        if (this.empty() && this.water === 0) this.filth += amount;
    }
    RemoveFilth(amount) {
        this.filth -= amount;
        if (this.filth < 0) this.filth = 0;
    }
    ContainsFilth() {
        return this.filth;
    }
    GetReservedSpace() {
        return this.reservedSpace;
    }

    Position(pos) {
        super.Position(pos);
        for (let itemi of this.items) {
            let item = itemi.lock();
            if (item) item.Position(pos);
        }

        return super.Position();
    }
    SetFaction(faction) {
        for (let itemi of this.items) {
            let item;
            if ((item = itemi.lock())) {
                item.SetFaction(faction);
            }
        }
        Item.SetFaction(faction);
    }
    Draw(upleft, the_console) {
        let screenx = (this.pos - upleft).X();
        let screeny = (this.pos - upleft).Y();
        if (
            screenx >= 0 &&
            screenx < the_console.getWidth() &&
            screeny >= 0 &&
            screeny < the_console.getHeight()
        ) {
            if (!this.items.empty() && this.items[0].lock())
                the_console.putCharEx(
                    screenx,
                    screeny,
                    this.items[0].lock().GetGraphic(),
                    this.items[0].lock().Color(),
                    this.color
                );
            else
                the_console.putCharEx(
                    screenx,
                    screeny,
                    this.graphic,
                    this.color,
                    GameMap.i.GetBackColor(this.pos)
                );
        }
    }
    serialize(ar, version) {
        ar.register_type(Item);
        let item = super.serialize(ar, version);
        item.items = ar.serialize(this.items);
        item.capacity = this.capacity;
        item.reservedSpace = this.reservedSpace;
        item.listenersAsUids = ar.serialize(this.listenersAsUids);
        item.water = this.water;
        item.filth = this.filth;
        return item;
    }
    static deserialize(data, version, deserializer) {
        deserializer.register_type(Item);
        let itemResult = Item.deserialize(data, version, deserializer);
        let result = new Container(
            itemResult.pos,
            itemResult.type,
            data.capacity,
            itemResult.faction,
            itemResult.components,
            deserializer.deserialize(data.listenersAsUids)
        );
        result.items = deserializer.deserialize(data.items);
        result.reservedSpace = data.reservedSpace;
        result.water = data.water;
        result.filth = data.filth;
        return result;
    }
}