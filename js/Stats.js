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
	Serializable
} from "./data/Serialization.js";


export class Stats extends Serializable {
	static instance;
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

	constructor() {
		if (Stats.instance) return Stats.instance;
		super();
		return this;
	}
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
		this.instance = null;
		this.instance = new Stats();
	}
	serialize(ar, version) {
		return {
			points: this.points,
			deaths: ar.serialize(this.deaths),
			constructionsBuilt: ar.serialize(this.constructionsBuilt),
			itemsBuilt: ar.serialize(this.itemsBuilt),
			itemsBurned: this.itemsBurned,
			filthCreated: this.filthCreated,
			filthOutsideMap: this.filthOutsideMap,
			constructions: this.constructions,
			production: this.production
		}
	}
	deserialize(data, version, deserializer) {
		let result = new Statistics();
		result.points = data.points;
		result.deaths = deserializer.deserialize(data.deaths);
		result.constructionsBuilt = deserializer.deserialize(data.constructionsBuilt);
		result.itemsBuilt = deserializer.deserialize(data.itemsBuilt);
		result.itemsBurned = data.itemsBurned;
		result.filthCreated = data.filthCreated;
		result.filthOutsideMap = data.filthOutsideMap;
		result.constructions = data.constructions;
		result.production = data.production;
		return result;
	}
}


