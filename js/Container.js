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


import "set"

import "boost/weak_ptr.js"
import "boost/shared_ptr.js"

import "Item.js"
import "data/Serialization.js"

class ContainerListener {
	ItemAdded() {}
	ItemRemoved() {}
}

class Container extends Item {
	static CLASS_VERSION = 0;

	items = [];
	capacity = 0;
	reservedSpace = 0;
	listeners = [];
	listenersAsUids = [];

	//Special cases for real liquids
	water = 0;
	filth = 0;

	constructor(pos = Coordinate(0, 0), type = 0, capValue = 1000, faction = 0, components = [], nlisteners = []) {
		super(pos, type, faction, components);
		this.capacity = capValue;
		this.listeners = nlisteners;
	}

	/*
	destructor() {
		while (!items.empty()) {
			boost.weak_ptr < Item > item = GetFirstItem();
			RemoveItem(item);
			if (item.lock()) item.lock().PutInContainer();
		}
	}
	*/

	AddItem(witem) {
		let item = witem.lock();
		if (!item) return false;
		if (this.capacity < Math.max(item.GetBulk(), 1)) return false;

		item.PutInContainer(this);
		this.items.push(item);
		this.capacity -= Math.max(item.GetBulk(), 1); //<- so that bulk=0 items take space
		for (let it of this.listeners)
			it.ItemAdded(item);

		if (item.Type() == Item.StringToItemType("water")) ++this.water;
		return true;
	}
	RemoveItem(item) {
		if (!this.items.includes(item)) return;
		this.items.erase(item);
		if (item.lock()) {
			this.capacity += Math.max(item.lock().GetBulk(), 1);
			if (item.lock().Type() == Item.StringToItemType("water")) --this.water;
		}
		for (let it of this.listeners)
			it.ItemRemoved(item);
	}
	ReserveSpace(res, bulk = 1) {
		if (res)
			this.reservedSpace += Math.max(1, bulk);
		else
			this.reservedSpace -= Math.max(1, bulk);
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
		return (this.capacity - this.reservedSpace <= 0);
	}
	AddListener(listener) {
		this.listeners.push(listener);
		if (listener instanceof Stockpile) {
			this.listenersAsUids.push(listener.Uid());
		}
	}
	RemoveListener(listener) {
		for (let n = 0; n < this.listeners.length; n++) {
			if (this.listeners[n] == listener) {
				this.listeners.splice(n, 1);
				if (n < this.listenersAsUids.length)
					this.listenersAsUids.splice(1, n);
				return;
			}
		}
	}
	GetTooltip(x, y, tooltip) {
		let capacityUsed = 0;
		for (let itemi of this.items) {
			if (itemi.lock()) this.capacityUsed += Math.max(1, itemi.lock().GetBulk());
		}
		tooltip.AddEntry(new TooltipEntry((boost.format("%s - %d items (%d/%d)") % this.name % this.size() % capacityUsed % (this.capacity + capacityUsed)).str(), TCODColor.white));
	}
	TranslateContainerListeners() {
		this.listeners = [];
		for (let i = 0; i < this.listenersAsUids.length; ++i) {
			let cons = Game.Inst().GetConstruction(this.listenersAsUids[i]);
			if (cons.lock() && cons.lock() instanceof Stockpile) {
				this.listeners.push(cons.lock().get());
			}
		}
	}
	AddWater(amount) {
		if (!this.empty()) return;
		if (this.filth !== 0) return;

		for (let i = 0; i < amount; ++i) {
			let waterUid = Game.Inst().CreateItem(this.Position(), Item.StringToItemType("Water"));
			let waterItem = Game.Inst().GetItem(waterUid).lock();
			if (!this.AddItem(waterItem)) {
				Game.Inst().RemoveItem(waterItem);
				break;
			}
		}
	}
	RemoveWater(amount) {
		for (let i = 0; i < amount; ++i) {
			for (let itemi of this.items) {
				let waterItem = itemi.lock();
				if (waterItem && waterItem.Type() == Item.StringToItemType("water")) {
					Game.Inst().RemoveItem(waterItem);
					break;
				}
			}
		}
	}
	ContainsWater() {
		return this.water;
	}
	AddFilth(amount) {
		if (this.empty() && this.water == 0) this.filth += amount;
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
			if (item = itemi.lock()) {
				item.SetFaction(faction);
			}
		}
		Item.SetFaction(faction);
	}
	Draw(upleft, the_console) {
		let screenx = (this.pos - upleft).X();
		let screeny = (this.pos - upleft).Y();
		if (screenx >= 0 && screenx < the_console.getWidth() && screeny >= 0 && screeny < the_console.getHeight()) {
			if (!this.items.empty() && this.items[0].lock())
				the_console.putCharEx(screenx, screeny, this.items[0].lock().GetGraphic(), this.items[0].lock().Color(), this.color);
			else
				the_console.putCharEx(screenx, screeny, this.graphic, this.color, Map.Inst().GetBackColor(this.pos));
		}
	}
	save(ar, version) {
		super.save(ar, version);
		ar.save(this, "items");
		ar.save(this, "capacity");
		ar.save(this, "reservedSpace");
		ar.save(this, "listenersAsUids");
		ar.save(this, "water");
		ar.save(this, "filth");
	}
	load(ar, version) {
		super.load(ar, version);
		this.items = ar.items;
		this.capacity = ar.capacity;
		this.reservedSpace = ar.reservedSpace;
		this.listenersAsUids = ar.listenersAsUids;
		this.water = ar.water;
		this.filth = ar.filth;
	}
}