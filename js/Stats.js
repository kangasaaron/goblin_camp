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


class Statistics {
	static CLASS_VERSION = 0;
	points = 0;
	itemsBurned = 0;
	filthCreated = 0;
	filthOutsideMap = 0;
	constructions = 0;
	production = 0;
	deaths = new Map();
	constructionsBuilt = new Map();
	itemsBuilt = new Map();

	AddPoints(amount = 1) {
		this.points += amount;
	}
	GetPoints() {
		return this.points;
	}

	FilthCreated(amount = 1) {
		this.filthCreated += amount;
	}
	GetFilthCreated() {
		return this.filthCreated;
	}
	FilthFlowsOffEdge(amount = 1) {
		this.filthOutsideMap += amount;
		this.AddPoints(amount);
	}
	GetFilthFlownOff() {
		return this.filthOutsideMap;
	}
	ConstructionBuilt(name) {
		this.constructionsBuilt.set(name, (this.constructionsBuilt.get(name) || 0) + 1);
		++this.constructions;
		this.AddPoints(10);
	}
	GetConstructionsBuilt() {
		return this.constructions;
	}
	ItemBuilt(name) {
		this.itemsBuilt.set(name, (this.itemsBuilt.get(name) || 0) + 1);
		++this.production;
		this.AddPoints();
	}
	GetItemsBuilt() {
		return this.production;
	}
	ItemBurned(amount = 1) {
		this.itemBurned += amount;
	}
	GetItemsBurned() {
		return this.itemBurned;
	}

	static Reset() {
		Stats = new Statistics();
	}

	save(ar, version) {
		ar.save(this, "points");

		SerializeUnorderedMap(this.deaths, ar);
		SerializeUnorderedMap(this.constructionsBuilt, ar);
		SerializeUnorderedMap(this.itemsBuilt, ar);

		ar.save(this, "itemsBurned");
		ar.save(this, "filthCreated");
		ar.save(this, "filthOutsideMap");
		ar.save(this, "constructions");
		ar.save(this, "production");
	}

	load(ar, version) {
		this.points = ar.points;

		UnserializeUnorderedMap(this.deaths, ar);
		UnserializeUnorderedMap(this.constructionsBuilt, ar);
		UnserializeUnorderedMap(this.itemsBuilt, ar);

		this.itemsBurned = ar.itemsBurned;
		this.filthCreated = ar.filthCreated;
		this.filthOutsideMap = ar.filthOutsideMap;
		this.constructions = ar.constructions;
		this.production = ar.production;
	}
}

export let Stats = new Statistics();

function SerializeUnorderedMap(map, ar) {
	ar.save(map, "size");
	let i = 0;
	for (let iter of map.entries()) {
		ar.save(map, `key_${i}`, iter[0])
		ar.save(map, iter[0], iter[1]);
	}
}

function UnserializeUnorderedMap(map, ar) {
	let size = ar.get();
	for (let i = 0; i < size; ++i) {
		let key = ar[`key_${i}`];
		map.set(key, ar[key]);
	}
}