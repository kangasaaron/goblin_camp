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


import {Attack} from "../Attack.js";
import {TCODColor} from "../../fakeTCOD/libtcod.js";
import {ConstructionTag} from "../constructions/ConstructionTag.js";
import {Coordinate} from "../Coordinate.js";
import {DamageType} from "../DamageType.js";
import {Dice, Generate} from "../Random.js";
import {Direction} from "../Direction.js";
import {Game} from "../Game.js";
import {Item} from "../items/Item.js";
import {Job} from "../jobs/Job.js";
import {JobManager} from "../jobs/JobManager.js";
import {JobPriority} from "../jobs/JobPriority.js";
import {Serializable} from "../data/Serialization.js";
import {Spell} from "../Spell.js";
import {Stats} from "../Stats.js";
import {StatusEffect} from "../StatusEffect.js";
import {TileType} from "../TileType.js";

export class FireNode extends Serializable {
    static CLASS_VERSION = 1;

    pos = Coordinate.zero;
    graphic = 0;
    color = new Color();
    temperature = null;
    waterJob = null;

    constructor(pos = Coordinate.zero, vtemp = 0) {
        this.pos = pos;
        this.temperature = vtemp;
        this.color = new TCODColor(
            Generate(225, 255),
            Generate(0, 250),
            0
        );
        this.graphic = Generate(176, 178);
    }


    destructor() {
        if (this.waterJob.lock())
            JobManager.RemoveJob(this.waterJob);
    }


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
        let steam = Game.i.CreateSpell(this.pos, Spell.StringToSpellType("steam"));

        let direction = new Coordinate();
        let wind = GameMap.i.GetWindDirection();
        if (wind === Direction.NORTH || wind === Direction.NORTHEAST || wind === Direction.NORTHWEST)
            direction.Y(Generate(1, 7));
        if (wind === Direction.SOUTH || wind === Direction.SOUTHEAST || wind === Direction.SOUTHWEST)
            direction.Y(Generate(-7, -1));
        if (wind === Direction.EAST || wind === Direction.NORTHEAST || wind === Direction.SOUTHEAST)
            direction.X(Generate(-7, -1));
        if (wind === Direction.WEST || wind === Direction.SOUTHWEST || wind === Direction.NORTHWEST)
            direction.X(Generate(1, 7));
        direction += Random.ChooseInRadius(1);
        steam.CalculateFlightPath(this.pos.addCoordinate(direction), 5, 1);
    }
    spark() {
        let inverseSparkChance = 150 - Math.max(0, ((this.temperature - 50) / 8));

        if (Generate(inverseSparkChance) !== 0) return;

        let spark = Game.i.CreateSpell(this.pos, Spell.StringToSpellType("spark"));
        let distance = Generate(0, 15);
        if (distance < 12) {
            distance = 1;
        } else if (distance < 14) {
            distance = 2;
        } else {
            distance = 3;
        }

        let direction = new Coordinate();
        let wind = GameMap.i.GetWindDirection();
        if (wind === Direction.NORTH || wind === Direction.NORTHEAST || wind === Direction.NORTHWEST) direction.Y(distance);
        if (wind === Direction.SOUTH || wind === Direction.SOUTHEAST || wind === Direction.SOUTHWEST) direction.Y(-distance);
        if (wind === Direction.EAST || wind === Direction.NORTHEAST || wind === Direction.SOUTHEAST) direction.X(-distance);
        if (wind === Direction.WEST || wind === Direction.SOUTHWEST || wind === Direction.NORTHWEST) direction.X(distance);
        if (Generate(9) < 8) direction += Random.ChooseInRadius(1);
        else direction += Random.ChooseInRadius(3);

        spark.CalculateFlightPath(this.pos.addCoordinate(direction), 50, 1);
    }
    smoke() {
        if (Generate(60) !== 0) return;
        let smoke = Game.i.CreateSpell(this.pos, Spell.StringToSpellType("smoke"));
        let direction = new Coordinate();
        let wind = GameMap.i.GetWindDirection();
        if (wind === Direction.NORTH || wind === Direction.NORTHEAST || wind === Direction.NORTHWEST) direction.Y(Generate(25, 75));
        if (wind === Direction.SOUTH || wind === Direction.SOUTHEAST || wind === Direction.SOUTHWEST) direction.Y(Generate(-75, -25));
        if (wind === Direction.EAST || wind === Direction.NORTHEAST || wind === Direction.SOUTHEAST) direction.X(Generate(-75, -25));
        if (wind === Direction.WEST || wind === Direction.SOUTHWEST || wind === Direction.NORTHWEST) direction.X(Generate(25, 75));
        direction += Random.ChooseInRadius(3);
        smoke.CalculateFlightPath(this.pos.addCoordinate(direction), 5, 1);
    }
    burnNPCs() {
        //Burn npcs on the ground
        for (let npci of GameMap.i.NPCList(this.pos)) {
            if (!Game.i.GetNPC(npci).HasEffect(StatusEffect.FLYING) && Generate(10) === 0)
                Game.i.GetNPC(npci).AddEffect(StatusEffect.BURNING);
        }
    }
    burnItems() {
        //Burn items
        for (let itemi of GameMap.i.ItemList(this.pos)) {
            let item = Game.i.GetItem(itemi).lock();
            if (item && item.IsFlammable()) {
                Game.i.CreateItem(item.Position(), Item.StringToItemType("ash"));
                Game.i.RemoveItem(item);
                this.temperature += 250;
                Stats.ItemBurned();
                break;
            }
        }
    }
    burnFlammableConstruction(construct) {
        if (Generate(29) === 0) {
            let fire = new Attack();
            let dice = new Dice();
            dice.addsub = 1;
            dice.multiplier = 1;
            dice.nb_rolls = 1;
            dice.nb_faces = 1;
            fire.Amount(dice);
            fire.Type(DamageType.DAMAGE_FIRE);
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
            Game.i.CreateItem(item.Position(), Item.StringToItemType("ash"));
            Game.i.RemoveItem(item);
            this.temperature += 250;
        }

    }
    burnConstructions() {
        //Burn constructions
        let cons = GameMap.i.GetConstruction(this.pos);
        if (!cons) return;
        let construct = Game.i.GetConstruction(cons).lock();
        if (!construct) return;
        if (construct.IsFlammable()) {
            this.burnFlammableConstruction(construct);
        } else if (construct.HasTag(ConstructionTag.STOCKPILE) || construct.HasTag(ConstructionTag.FARMPLOT)) {
            this.burnStockpile(construct);
        } else if (construct.HasTag(ConstructionTag.SPAWNINGPOOL)) {
            construct.Burn();
            if (this.temperature < 15)
                this.temperature += 5;
        }
    }
    burnPlantLife() {
        //Burn plantlife
        let natureObject = GameMap.i.GetNatureObject(this.pos);
        if (!natureObject) return;
        if (Game.i.natureList[natureObject].Name() === "Scorched tree") return;

        let tree = Game.i.natureList[natureObject].Tree();
        Game.i.RemoveNatureObject(Game.i.natureList[natureObject]);
        if (tree && Generate(4) === 0) {
            Game.i.CreateNatureObject(this.pos, "Scorched tree");
        }
        this.temperature += tree ? 500 : 100;
    }
    pourWater() {
        //Create pour water job here if in player territory
        if (!GameMap.i.IsTerritory(this.pos)) return;
        if (this.waterJob.lock()) return;
        let pourWaterJob = new Job("Douse flames", JobPriority.VERYHIGH);
        Job.CreatePourWaterJob(pourWaterJob, this.pos);
        if (pourWaterJob) {
            pourWaterJob.MarkGround(this.pos);
            this.waterJob = pourWaterJob;
            JobManager.AddJob(pourWaterJob);
        }
    }
    burn() {
        if (Generate(10) === 0) {
            --this.temperature;
            GameMap.i.Burn(this.pos);
        }

        if (GameMap.i.GetType(this.pos) !== TileType.TILEGRASS) --this.temperature;
        if (GameMap.i.Burnt(this.pos) >= 10) --this.temperature;

        this.spark();

        this.smoke();

        if (this.temperature <= 1) return;
        if (Generate(9) >= 4) return;
        // if (temperature > 1 && Generate(9) < 4) {

        this.burnNPCs();

        this.burnItems();

        this.burnConstructions();

        this.burnPlantLife();

        this.pourWater();
    }
    Update() {
        this.graphic = Generate(176, 178);
        this.color.r = Generate(225, 255);
        this.color.g = Generate(0, 250);

        if (this.temperature > 800)
            this.temperature = 800;

        let water = GameMap.i.GetWater(this.pos).lock();

        if (water && water.Depth() > 0 && GameMap.i.IsUnbridgedWater(this.pos)) {
            this.steam(water);
        } else if (this.temperature > 0) {
            this.burn();
        }
    }

    serialize(ar, version) {
        ar.register_type(Coordinate);
        ar.register_type(Job);
        ar.register_type(TCODColor);
        return {
            pos: ar.serialize(this.pos),
            color: ar.serialize(this.color),
            temperature: this.temperature,
            waterJob: ar.serialize(this.waterJob)
        };
    }

    static deserialize(data, version, deserializer) {
        deserializer.register_type(Coordinate);
        deserializer.register_type(Job);
        deserializer.register_type(TCODColor);
        let result = new FireNode(
            deserializer.deserialize(data.pos),
            data.temperature
        );
        result.color = deserializer.deserialize(data.color);
        if (version >= 1) {
            result.waterJob = deserializer.deserialize(data.waterJob);
        }
    }
}