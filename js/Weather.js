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


import { Serializable } from "./data/Serialization.js";
import { WeatherType } from "./WeatherType.js";
import { Direction } from "./Direction.js";
import { Generate, ChooseInExtent } from "./Random.js";
import { Season } from "./Season.js";
import { GameMap } from "./GameMap.js";
import { Game } from "./Game.js";
import { TileType } from "./TileType.js";
import { Coordinate } from "./Coordinate.js";
import { Constants } from "./Constants.js";

export class Weather extends Serializable {
    /** @param {GameMap} [vmap] */
    constructor(vmap = null) {
        super();
        this.map = vmap;
        this.windDirection = Direction.NORTH;
        this.prevailingWindDirection = Direction.NORTH;
        this.currentWeather = WeatherType.NORMALWEATHER;
        this.tileChange = false;
        this.changeAll = false;
        this.tileChangeRate = 0;
        this.changePosition = 0;
        this.currentTemperature = null;
        this.currentSeason = -1;
    }
    GetWindDirection() {
        return this.windDirection;
    }
    RandomizeWind() {
        this.prevailingWindDirection = Direction.values[Generate(7)];
        this.windDirection = this.prevailingWindDirection;
    }
    ShiftWind() {
        if (Generate(2) !== 0) return;

        this.windDirection = Direction.values[this.windDirection + Generate(-1, 1)];
        if (this.windDirection < 0) this.windDirection = Direction.NORTHWEST;
        if (this.windDirection > Direction.NORTHWEST) this.windDirection = Direction.NORTH;

        let distanceFromPrevailing = this.windDirection - this.prevailingWindDirection;

        if (distanceFromPrevailing === 3 || distanceFromPrevailing === 4 || distanceFromPrevailing === -5)
            this.windDirection = Direction.values[this.windDirection - 1];
        else if (distanceFromPrevailing === -3 || distanceFromPrevailing === -4 || distanceFromPrevailing === 5)
            this.windDirection = Direction.values[this.windDirection + 1];
        if (this.windDirection < 0) this.windDirection = Direction.NORTHWEST;
        if (this.windDirection > Direction.NORTHWEST) this.windDirection = Direction.NORTH;

    }
    GetWindAbbreviation() {
        switch (this.windDirection) {
            case Direction.NORTH:
                return "N";
            case Direction.NORTHEAST:
                return "NE";
            case Direction.EAST:
                return "E";
            case Direction.SOUTHEAST:
                return "SE";
            case Direction.SOUTH:
                return "S";
            case Direction.SOUTHWEST:
                return "SW";
            case Direction.WEST:
                return "W";
            case Direction.NORTHWEST:
                return "NW";
            default:
                return "?";
        }
    }
    ChangeWeather(newWeather) {
        this.currentWeather = newWeather;
    }
    ApplySeasonalEffects() {
        this.SeasonChange();
    }
    SeasonChange() {
        this.tileChange = false;
        this.changeAll = false;

        switch (Game.i.CurrentSeason()) {
            case Season.EarlySummer:
            case Season.Summer:
            case Season.LateSummer:
            case Season.EarlyFall:
            case Season.Fall:
                break;

            case Season.LateWinter:
                this.tileChange = true;
                this.tileChangeRate = 1;
                this.currentTemperature = 1;
                break;

            case Season.LateFall:
                this.tileChange = true;
                this.tileChangeRate = 1;
                this.currentTemperature = -1;
                break;

            case Season.EarlyWinter:
                this.tileChange = true;
                this.tileChangeRate = 200;
                this.currentTemperature = -1;
                break;

            case Season.Winter:
                this.tileChange = true;
                this.changeAll = true;
                this.tileChangeRate = 500;
                this.changePosition = 0;
                this.currentTemperature = -1;
                break;

            case Season.EarlySpring:
                this.tileChange = true;
                this.tileChangeRate = 100;
                this.currentTemperature = 1;
                break;

            case Season.Spring:
                this.tileChange = true;
                this.tileChangeRate = 200;
                this.currentTemperature = 1;
                break;

            case Season.LateSpring:
                this.tileChange = true;
                this.changeAll = true;
                this.tileChangeRate = 500;
                this.changePosition = 0;
                this.currentTemperature = 1;
                break;
        }
    }
    serialize(ar, version) {
        ar.register_type(GameMap);
        ar.register_type(Direction);
        ar.register_type(WeatherType);
        return {
            map: ar.serialize(this.map),
            windDirection: ar.serialize(this.windDirection),
            prevailingWindDirection: ar.serialize(this.prevailingWindDirection),
            currentWeather: ar.serialize(this.currentWeather),
            tileChange: this.tileChange,
            changeAll: this.changeAll,
            tileChangeRate: this.tileChangeRate,
            changePosition: this.changePosition,
            currentTemperature: this.currentTemperature,
        };
    }
    static deserialize(data, version, deserializer) {
        deserializer.register_type(GameMap);
        deserializer.register_type(Direction);
        deserializer.register_type(WeatherType);
        let result = new Weather(deserializer.deserialize(data.map));
        result.windDirection = deserializer.deserialize(data.windDirection);
        result.prevailingWindDirection = deserializer.deserialize(data.prevailingWindDirection);
        result.currentWeather = deserializer.deserializable(data.currentWeather);
        result.tileChange = data.tileChange;
        result.changeAll = data.changeAll;
        result.tileChangeRate = data.tileChangeRate;
        result.changePosition = data.changePosition;
        result.currentTemperature = data.currentTemperature;
    }
    Update() {
        if (Generate(Constants.MONTH_LENGTH) === 0) this.ShiftWind();
        if (Generate(Constants.MONTH_LENGTH) === 0) {
            if (Generate(2) < 2) {
                this.currentWeather = WeatherType.NORMALWEATHER;
            } else this.currentWeather = WeatherType.RAIN;
        }
        if (!this.tileChange && this.currentTemperature >= 0 && this.currentWeather === WeatherType.RAIN)
            Game.i.CreateWater(new Coordinate(Generate(this.map.Width() - 1), Generate(this.map.Height() - 1)), 1);

        if (Game.i.CurrentSeason() !== this.currentSeason) {
            this.currentSeason = Game.i.CurrentSeason();
            this.SeasonChange();
        }
        if (this.tileChange)
            this.ChangeTiles();
    }
    ChangeTile(p, tile) {
        if (this.map.GetType(p) === TileType.TILEGRASS || this.map.GetType(p) === TileType.TILESNOW) {
            this.map.ChangeType(p, tile, this.map.heightMap.getValue(p.X(), p.Y()));
        }
        if (this.currentTemperature < 0) {
            if (this.map.GetWater(p).lock() && this.map.GetWater(p).lock().IsCoastal()) {
                Game.i.CreateNatureObject(Coordinate(p), "Ice");
            }
        } else if (this.currentTemperature > 0) {
            if (this.map.GetNatureObject(p) >= 0) {
                if (Game.i.natureList[this.map.GetNatureObject(p)].IsIce()) {
                    Game.i.RemoveNatureObject(Game.i.natureList[this.map.GetNatureObject(p)]);
                }
            }
        }
    }
    ChangeSome(tile) {
        for (let i = 0; i < this.tileChangeRate; ++i) {
            let r = ChooseInExtent(this.map.Extent());
            this.ChangeTile(r, tile);
        }
        if (this.tileChangeRate < 300 && Generate(200) === 0) ++this.tileChangeRate;
    }
    ChangeAll(tile) {
        for (let i = 0; i < this.tileChangeRate; ++i) {
            for (let x = 0; x < 500; ++x) {
                let p = new Coordinate(x, this.changePosition);
                this.ChangeTile(p, tile);
            }
            ++this.changePosition;
            if (this.changePosition >= this.map.Height()) {
                this.changeAll = false;
                this.tileChangeRate = 1;
                break;
            }
        }
    }
    ChangeTiles() {
        let tile = this.currentTemperature > 0 ? TileType.TILEGRASS : TileType.TILESNOW;
        if (!this.changeAll)
            this.ChangeSome(tile);
        else
            this.ChangeAll(tile);
    }
}

Weather.CLASS_VERSION = 0;
