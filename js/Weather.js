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


import "vector.js";

import "Coordinate.js"
import "data/Serialization.js"

class Map;

import {
    WeatherType
} from "./WeatherType.js";
import {
    Direction
} from "./Direction.js";

class Weather {
    static CLASS_VERSION = 0;

    map = null;
    windDirection = Direction.NORTH;
    prevailingWindDirection = Direction.NORTH;
    currentWeather = WeatherType.NORMALWEATHER;
    tileChange = false;
    changeAll = false;
    tileChangeRate = 0;
    changePosition = 0;
    currentTemperature = null;
    currentSeason = -1;

    constructor(vmap = null) {
        this.map = vmap;
    }
    GetWindDirection() {
        return this.windDirection;
    }
    RandomizeWind() {
        this.prevailingWindDirection = Direction.values[Random.Generate(7)];
        this.windDirection = this.prevailingWindDirection;
    }
    ShiftWind() {
        if (Random.Generate(2) !== 0) return;

        this.windDirection = Direction.values[windDirection + Random.Generate(-1, 1)];
        if (this.windDirection < 0) this.windDirection = Direction.NORTHWEST;
        if (this.windDirection > Direction.NORTHWEST) this.windDirection = Direction.NORTH;

        let distanceFromPrevailing = this.windDirection - this.prevailingWindDirection;

        if (distanceFromPrevailing == 3 || distanceFromPrevailing == 4 || distanceFromPrevailing == -5)
            this.windDirection = Direction.values[this.windDirection - 1];
        else if (distanceFromPrevailing == -3 || distanceFromPrevailing == -4 || distanceFromPrevailing == 5)
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

        switch (Game.Inst().CurrentSeason()) {
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
    save(ar.version) {
        ar.save(this, "map");
        ar.save(this, "windDirection");
        ar.save(this, "prevailingWindDirection");
        ar.save(this, "currentWeather");
        ar.save(this, "tileChange");
        ar.save(this, "changeAll");
        ar.save(this, "tileChangeRate");
        ar.save(this, "changePosition");
        ar.save(this, "currentTemperature");
    }
    load(ar, version) {
        this.map = ar.map;
        this.windDirection = ar.windDirection;
        this.prevailingWindDirection = ar.prevailingWindDirection;
        this.currentWeather = ar.currentWeather;
        this.tileChange = ar.tileChange;
        this.changeAll = ar.changeAll;
        this.tileChangeRate = ar.tileChangeRate;
        this.changePosition = ar.changePosition;
        this.currentTemperature = ar.currentTemperature;
    }
    Update() {
        if (Random.Generate(MONTH_LENGTH) == 0) this.ShiftWind();
        if (Random.Generate(MONTH_LENGTH) == 0) {
            if (Random.Generate(2) < 2) {
                this.currentWeather = WeatherType.NORMALWEATHER;
            } else this.currentWeather = WeatherType.RAIN;
        }
        if (!this.tileChange && this.currentTemperature >= 0 && this.currentWeather == WeatherType.RAIN)
            Game.Inst().CreateWater(Coordinate(Random.Generate(this.map.Width() - 1), Random.Generate(this.map.Height() - 1)), 1);

        if (Game.Inst().CurrentSeason() != this.currentSeason) {
            this.currentSeason = Game.Inst().CurrentSeason();
            this.SeasonChange();
        }
        if (this.tileChange)
            this.ChangeTiles();
    }
    ChangeTile(p, tile) {
        if (this.map.GetType(p) == TileType.TILEGRASS || this.map.GetType(p) == TileType.TILESNOW) {
            this.map.ChangeType(p, tile, this.map.heightMap.getValue(p.X(), p.Y()));
        }
        if (this.currentTemperature < 0) {
            if (this.map.GetWater(p).lock() && this.map.GetWater(p).lock().IsCoastal()) {
                Game.Inst().CreateNatureObject(Coordinate(p), "Ice");
            }
        } else if (this.currentTemperature > 0) {
            if (this.map.GetNatureObject(p) >= 0) {
                if (Game.Inst().natureList[this.map.GetNatureObject(p)].IsIce()) {
                    Game.Inst().RemoveNatureObject(Game.Inst().natureList[this.map.GetNatureObject(p)]);
                }
            }
        }
    }
    ChangeSome(tile) {
        for (let i = 0; i < this.tileChangeRate; ++i) {
            let r = Random.ChooseInExtent(this.map.Extent());
            this.ChangeTile(r, tile);
        }
        if (this.tileChangeRate < 300 && Random.Generate(200) == 0) ++this.tileChangeRate;
    }
    ChangeAll(tile) {
        for (let i = 0; i < tileChangeRate; ++i) {
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