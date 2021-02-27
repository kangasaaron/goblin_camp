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
	Coordinate
} from "Coordinate.js";

import {
	TileType
} from "./TileType.js";

export class FireNode {
	static CLASS_VERSION = 1;

	pos = Coordinate.zero;
	graphic = 0;
	color = [, , ];
	temperature = null;
	waterJob = null;

	constructor(pos = Coordinate.zero, vtemp = 0) {
		this.pos = pos;
		this.temperature = vtemp;
		this.color = [
			Random.Generate(225, 255),
			Random.Generate(0, 250),
			0
		];
		this.graphic = Random.Generate(176, 178);
	}

	/*
	destructor(){
		if(this.waterJob.lock())
			JobManager.Inst().RemoveJob(waterJob);
	}
	*/

	Position() {
		return this.pos;
	}
	AddHeat(value) {
		this.temperature += value;
	}

	GetHeat() {
		return this.temperature;
	}

	SetHeat(value) {
		this.temperature = value;
	}
	Draw(upleft, the_console) {
		let screenX = (this.pos - upleft).X();
		let screenY = (this.pos - upleft).Y();

		if (screenX >= 0 && screenX < the_console.getWidth() &&
			screenY >= 0 && screenY < the_console.getHeight()) {
			the_console.putCharEx(screenX, screenY, this.graphic, this.color, TCODColor.black);
		}
	}
	steam(water) {
		this.temperature = 0;
		water.Depth(water.Depth() - 1);
		let steam = Game.Inst().CreateSpell(this.pos, Spell.StringToSpellType("steam"));

		let direction = new Coordinate();
		let wind = Map.Inst().GetWindDirection();
		if (wind == Direction.NORTH || wind == Direction.NORTHEAST || wind == Direction.NORTHWEST)
			direction.Y(Random.Generate(1, 7));
		if (wind == Direction.SOUTH || wind == Direction.SOUTHEAST || wind == Direction.SOUTHWEST)
			direction.Y(Random.Generate(-7, -1));
		if (wind == Direction.EAST || wind == Direction.NORTHEAST || wind == Direction.SOUTHEAST)
			direction.X(Random.Generate(-7, -1));
		if (wind == Direction.WEST || wind == Direction.SOUTHWEST || wind == Direction.NORTHWEST)
			direction.X(Random.Generate(1, 7));
		direction += Random.ChooseInRadius(1);
		steam.CalculateFlightPath(this.pos.addCoordinate(direction), 5, 1);
	}
	spark() {
		let inverseSparkChance = 150 - Math.max(0, ((this.temperature - 50) / 8));

		if (Random.Generate(inverseSparkChance) != 0) return;

		let spark = Game.Inst().CreateSpell(this.pos, Spell.StringToSpellType("spark"));
		let distance = Random.Generate(0, 15);
		if (distance < 12) {
			distance = 1;
		} else if (distance < 14) {
			distance = 2;
		} else {
			distance = 3;
		}

		let direction = new Coordinate();
		let wind = Map.Inst().GetWindDirection();
		if (wind == Direction.NORTH || wind == Direction.NORTHEAST || wind == Direction.NORTHWEST) direction.Y(distance);
		if (wind == Direction.SOUTH || wind == Direction.SOUTHEAST || wind == Direction.SOUTHWEST) direction.Y(-distance);
		if (wind == Direction.EAST || wind == Direction.NORTHEAST || wind == Direction.SOUTHEAST) direction.X(-distance);
		if (wind == Direction.WEST || wind == Direction.SOUTHWEST || wind == Direction.NORTHWEST) direction.X(distance);
		if (Random.Generate(9) < 8) direction += Random.ChooseInRadius(1);
		else direction += Random.ChooseInRadius(3);

		spark.CalculateFlightPath(this.pos.addCoordinate(direction), 50, 1);
	}
	smoke() {
		if (Random.Generate(60) !== 0) return;
		let smoke = Game.Inst().CreateSpell(this.pos, Spell.StringToSpellType("smoke"));
		let direction = new Coordinate();
		let wind = Map.Inst().GetWindDirection();
		if (wind == Direction.NORTH || wind == Direction.NORTHEAST || wind == Direction.NORTHWEST) direction.Y(Random.Generate(25, 75));
		if (wind == Direction.SOUTH || wind == Direction.SOUTHEAST || wind == Direction.SOUTHWEST) direction.Y(Random.Generate(-75, -25));
		if (wind == Direction.EAST || wind == Direction.NORTHEAST || wind == Direction.SOUTHEAST) direction.X(Random.Generate(-75, -25));
		if (wind == Direction.WEST || wind == Direction.SOUTHWEST || wind == Direction.NORTHWEST) direction.X(Random.Generate(25, 75));
		direction += Random.ChooseInRadius(3);
		smoke.CalculateFlightPath(this.pos.addCoordinate(direction), 5, 1);
	}
	burnNPCs() {
		//Burn npcs on the ground
		for (let npci of Map.Inst().NPCList(this.pos)) {
			if (!Game.Inst().GetNPC(npci).HasEffect(StatusEffects.FLYING) && Random.Generate(10) == 0)
				Game.Inst().GetNPC(npci).AddEffect(StatusEffects.BURNING);
		}
	}
	burnItems() {
		//Burn items
		for (let itemi of Map.Inst().ItemList(this.pos)) {
			let item = Game.Inst().GetItem(itemi).lock();
			if (item && item.IsFlammable()) {
				Game.Inst().CreateItem(item.Position(), Item.StringToItemType("ash"));
				Game.Inst().RemoveItem(item);
				this.temperature += 250;
				Stats.Inst().ItemBurned();
				break;
			}
		}
	}
	burnFlammableConstruction(construct) {
		if (Random.Generate(29) == 0) {
			let fire = new Attack();
			let dice = new dice();
			dice.addsub = 1;
			dice.multiplier = 1;
			dice.nb_rolls = 1;
			dice.nb_faces = 1;
			fire.Amount(dice);
			fire.Type(DAMAGE_FIRE);
			construct.Damage(fire);
		}
		if (this.temperature < 15)
			this.temperature += 5;
	}
	burnStockpile(construct) {
		/*Stockpiles are a special case. Not being an actual building, fire won't touch them.
				Instead fire should be able to burn the items stored in the stockpile*/
		let container = construct.Storage(this.pos).lock();
		if (!container) return;
		let item = container.GetFirstItem().lock();
		if (item && item.IsFlammable()) {
			container.RemoveItem(item);
			item.PutInContainer();
			Game.Inst().CreateItem(item.Position(), Item.StringToItemType("ash"));
			Game.Inst().RemoveItem(item);
			this.temperature += 250;
		}

	}
	burnConstructions() {
		//Burn constructions
		let cons = Map.Inst().GetConstruction(this.pos);
		if (!cons) return;
		let construct = Game.Inst().GetConstruction(cons).lock();
		if (!construct) return;
		if (construct.IsFlammable()) {
			this.burnFlammableConstruction(construct);
		} else if (construct.HasTag(STOCKPILE) || construct.HasTag(FARMPLOT)) {
			this.burnStockpile(construct);
		} else if (construct.HasTag(SPAWNINGPOOL)) {
			construct.Burn();
			if (this.temperature < 15)
				this.temperature += 5;
		}
	}
	burnPlantLife() {
		//Burn plantlife
		let natureObject = Map.Inst().GetNatureObject(this.pos);
		if (!natureObject) return;
		if (Game.Inst().natureList[natureObject].Name() === "Scorched tree") return;

		let tree = Game.Inst().natureList[natureObject].Tree();
		Game.Inst().RemoveNatureObject(Game.Inst().natureList[natureObject]);
		if (tree && Random.Generate(4) == 0) {
			Game.Inst().CreateNatureObject(this.pos, "Scorched tree");
		}
		this.temperature += tree ? 500 : 100;
	}
	pourWater() {
		//Create pour water job here if in player territory
		if (!Map.Inst().IsTerritory(this.pos)) return;
		if (this.waterJob.lock()) return;
		let pourWaterJob = new Job("Douse flames", JobPriority.VERYHIGH);
		Job.CreatePourWaterJob(pourWaterJob, this.pos);
		if (pourWaterJob) {
			pourWaterJob.MarkGround(this.pos);
			this.waterJob = pourWaterJob;
			JobManager.Inst().AddJob(pourWaterJob);
		}
	}
	burn() {
		if (Random.Generate(10) == 0) {
			--this.temperature;
			Map.Inst().Burn(this.pos);
		}

		if (Map.Inst().GetType(this.pos) != TileType.TILEGRASS) --this.temperature;
		if (Map.Inst().Burnt(this.pos) >= 10) --this.temperature;

		this.spark();

		this.smoke();

		if (this.temperature <= 1) return;
		if (Random.Generate(9) >= 4) return;
		// if (temperature > 1 && Random.Generate(9) < 4) {

		this.burnNPCs();

		this.burnItems();

		this.burnConstructions();

		this.burnPlantLife();

		this.pourWater();
	}
	Update() {
		this.graphic = Random.Generate(176, 178);
		this.color[0] = Random.Generate(225, 255);
		this.color[1] = Random.Generate(0, 250);

		if (this.temperature > 800)
			this.temperature = 800;

		let water = Map.Inst().GetWater(this.pos).lock();

		if (water && water.Depth() > 0 && Map.Inst().IsUnbridgedWater(this.pos)) {
			this.steam(water);
		} else if (this.temperature > 0) {
			this.burn();
		}
	}

	save(ar, version) {
		ar.register_type(Coordinate);
		ar.save(this, 'pos');
		ar.save(this, 'r', this.color[0]);
		ar.save(this, 'g', this.color[1]);
		ar.save(this, 'b', this.color[2]);
		ar.save(this, "temperature");
		ar.save(this, "waterJob");
	}

	load(ar, version) {
		this.pos = new Coordinate(ar.x, ar.y);
		this.color = [ar.r, ar.g, ar.b];
		this.temperature = ar.temperature;
		if (version >= 1) {
			this.waterJob = ar.load(waterJob);
		}
	}
}