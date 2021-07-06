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


import { TCODColor, TCOD_chars_t } from "../../fakeTCOD/libtcod.js";
import { Constants } from "../Constants.js";
import { Coordinate } from "../Coordinate.js";
import { Direction } from "../Direction.js";
import { Game } from "../Game.js";
import { GameMap } from "../GameMap.js";
import { Generate } from "../Random.js";
import { Serializable } from "../data/Serialization.js";
import { Stats } from "../Stats.js";
import { TileType } from "../TileType.js";

export class WaterNode extends Serializable {

    constructor(pos = Coordinate.undefinedCoordinate, vdepth = 0, time = 0) {
        super()
        this.pos = pos;
        this.depth = vdepth;
        this.color = new Color(0, 128, 255);
        this.timeFromRiverBed = time;
        this.graphic = '?';
        this.inertCounter = 0;
        this.inert = false;
        this.timeFromRiverBed = 0;
        this.filth = 0;
        this.coastal = false;
        this.UpdateGraphic();
    }

    Position(p) {
        if (p !== undefined && p instanceof Coordinate)
            this.pos = p;
        return this.pos;
    }

    X(x) {
        return this.pos.X(x);
    }
    Y(y) {
        return this.pos.Y(y);
    }


    MakeInert() {
        this.inert = true;
    }
    DeInert() {
        this.inert = false;
    }
    Depth(newDepth) {
        if (newDepth !== undefined && Number.isFinite(Number(newDepth))) {
            //20 because water can't add more cost to pathing calculations
            if (this.depth <= 20 && newDepth <= 20 && this.depth !== newDepth)
                GameMap.i.TileChanged(this.pos);
            this.depth = newDepth;
            this.UpdateGraphic();
        }
        return this.depth;
    }
    AddFilth(newFilth) {
        this.filth += newFilth;
    }
    GetFilth() {
        return this.filth;
    }
    GetGraphic() {
        return this.graphic;
    }
    GetColor() {
        return this.color;
    }
    IsCoastal() {
        return this.coastal;
    }
    UpdateGraphic() {
        if (this.depth === 0) {
            this.graphic = ' ';
        } else if (this.depth === 2) {
            this.graphic = TCOD_chars_t.TCOD_CHAR_BLOCK3;
        } else if (this.depth === 1) {
            this.graphic = '.';
        } else {
            this.graphic = 219;
        }

        let col = Math.max(255 - Math.round(this.depth / 25), 140);
        if (this.color.b < Math.max(col - (this.filth * 20), 0)) ++this.color.b;
        if (this.color.b > Math.max(col - (this.filth * 20), 0)) --this.color.b;

        if (this.color.g < Math.max(col / 4, Math.min(this.filth * 10, 150))) ++this.color.g;
        if (this.color.g > Math.max(col / 4, Math.min(this.filth * 10, 150))) --this.color.g;

        if (this.color.g < Math.min(this.filth * 10, 190)) this.color.g += 10;
        if (this.color.g > Math.min(this.filth * 10, 190)) this.color.g -= 10;

        if (Generate(39) === 0 && this.color.b < 200) this.color.b += 20;
        if (Generate(9999) === 0 && this.color.g < 225) this.color.g += Generate(24);
    }

    //Returns true if this WaterNode should be destroyed
    Update() {
        let divided = 0;

        if (this.inert) {
            ++this.inertCounter;
        }

        if (this.inert && this.inertCounter <= Constants.UPDATES_PER_SECOND) return;
        // if (!inert || inertCounter > Constants.UPDATES_PER_SECOND * 1)) {

        if (GameMap.i.GetType(this.pos) === TileType.TILERIVERBED) {
            this.timeFromRiverBed = 1000;
            if (this.depth < Constants.RIVERDEPTH) this.depth = Constants.RIVERDEPTH;
        }

        this.inertCounter = 0;
        if (this.depth <= 1) {
            let soakage = 500;
            let type = GameMap.i.GetType(this.pos);
            if (type === TileType.TILEGRASS)
                soakage = 10;
            else if (type === TileType.TILEBOG)
                soakage = 0;
            if (Generate(soakage) === 0) {
                this.depth = 0;
                return true; //Water has evaporated
            }
            return false;
        }


        if (this.timeFromRiverBed === 0 && Generate(100) === 0) this.depth -= 1; //Evaporation
        if (this.timeFromRiverBed > 0 && this.depth < Constants.RIVERDEPTH) this.depth += 10; //Water rushing from the river

        let waterList = [];
        let coordList = [];
        let depthSum = 0;

        //Check if any of the surrounding tiles are low, this only matters if this tile is not low
        let onlyLowTiles = false;
        if (!GameMap.i.IsLow(this.pos)) {
            for (let ix = this.pos.X() - 1; ix <= this.pos.X() + 1; ++ix) {
                for (let iy = this.pos.Y() - 1; iy <= this.pos.Y() + 1; ++iy) {
                    let p = new Coordinate(ix, iy);
                    if (GameMap.i.IsInside(p)) {
                        if (p.isNotEqualTo(this.pos) && GameMap.i.IsLow(p)) {
                            onlyLowTiles = true;
                            break;
                        }
                    } else if (this.filth > 0) { //Filth dissipates at borderwaters
                        --this.filth;
                    }
                }
            }
        }

        this.coastal = false; //Have to always check if this water is coastal, terrain can change
        for (let ix = this.pos.X() - 1; ix <= this.pos.X() + 1; ++ix) {
            for (let iy = this.pos.Y() - 1; iy <= this.pos.Y() + 1; ++iy) {
                let p = new Coordinate(ix, iy);
                if (GameMap.i.IsInside(p)) {
                    if (!this.coastal) {
                        let tile = GameMap.i.GetType(p);
                        if (tile !== TileType.TILENONE && tile !== TileType.TILEDITCH && tile !== TileType.TILERIVERBED) this.coastal = true;
                        if (GameMap.i.GetNatureObject(p)) this.coastal = true;
                    }
                    /*Choose the surrounding tiles that:
                    Are the same height or low
                    or in case of [onlyLowTiles] are low
                    depth > Constants.RIVERDEPTH*3 at which point it can overflow upwards*/
                    if (((!onlyLowTiles && GameMap.i.IsLow(this.pos) === GameMap.i.IsLow(p)) ||
                            this.depth > Constants.RIVERDEPTH * 3 || GameMap.i.IsLow(p)) &&
                        !GameMap.i.BlocksWater(p)) {
                        //If we're choosing only low tiles, then this tile should be ignored completely
                        if (!onlyLowTiles || p !== this.pos) {
                            waterList.push(GameMap.i.GetWater(p));
                            coordList.push(p);
                            if (waterList[waterList.length - 1].lock())
                                depthSum += waterList[waterList.length - 1].lock().depth;
                        }
                    }
                }
            }
        }

        if (this.timeFromRiverBed > 0) --this.timeFromRiverBed;
        divided = depthSum / waterList.length;

        let item;
        if (!GameMap.i.ItemList(this.pos).empty())
            item = Game.i.GetItem(GameMap.i.ItemList(this.pos)[0]).lock();

        //Filth and items flow off the map
        let flow = GameMap.i.GetFlow(this.pos);
        let flowTarget = Coordinate.DirectionToCoordinate(flow) + this.pos;
        if (!(GameMap.i.IsInside(flowTarget))) {
            if (this.filth > 0) {
                Stats.FilthFlowsOffEdge(Math.min(this.filth, 10));
                this.filth -= Math.min(this.filth, 10);
            }
            if (item) {
                Game.i.RemoveItem(item);
                item.reset();
            }
        }

        //Loop through neighbouring waternodes
        for (let i = 0; i < waterList.length; ++i) {
            let water = waterList[i].lock();
            if (water) {
                water.depth = divided;
                water.timeFromRiverBed = this.timeFromRiverBed;
                water.UpdateGraphic();

                //So much filth it'll go anywhere
                if (this.filth > 10 && Generate(3) === 0) {
                    this.filth -= 5;
                    water.filth += 5;
                }
                //Filth and items go with the flow
                //TODO factorize
                let x = this.pos.X(),
                    y = this.pos.Y(),
                    doTheFlow = false;
                switch (flow) {
                    case Direction.NORTH:
                        if (coordList[i].Y() < y) doTheFlow = true;
                        break;
                    case Direction.NORTHEAST:
                        if (coordList[i].Y() < y && coordList[i].X() > x) doTheFlow = true;
                        break;

                    case Direction.EAST:
                        if (coordList[i].X() > x) doTheFlow = true;
                        break;

                    case Direction.SOUTHEAST:
                        if (coordList[i].Y() > y && coordList[i].X() > x) doTheFlow = true;
                        break;

                    case Direction.SOUTH:
                        if (coordList[i].Y() > y) doTheFlow = true;
                        break;

                    case Direction.SOUTHWEST:
                        if (coordList[i].Y() > y && coordList[i].X() < x) doTheFlow = true;
                        break;

                    case Direction.WEST:
                        if (coordList[i].X() < x) doTheFlow = true;
                        break;

                    case Direction.NORTHWEST:
                        if (coordList[i].Y() < y && coordList[i].X() < x) doTheFlow = true;
                        break;

                    default:
                        if (this.filth > 0) {
                            if (water.filth < this.filth && GenerateBool()) {
                                --this.filth;
                                ++water.filth;
                            }
                        }
                        break;
                }
                if (doTheFlow) {
                    if (this.filth > 0) {
                        --this.filth;
                        ++water.filth;
                    }
                    if (item && Generate(item.GetBulk()) === 0) {
                        item.Position(water.Position());
                        item.reset();
                    }
                }
            } else {
                Game.i.CreateWater(coordList[i], divided, this.timeFromRiverBed);
            }
        }
        if (onlyLowTiles) {
            this.depth = 1; //All of the water has flown to a low tile
        }
        return false;
    }

    serialize(ar, version) {
        ar.register_type(Coordinate);
        return {
            'pos': ar.serialize(this.pos),
            'depth': this.depth,
            'graphic': this.graphic,
            'color': ar.serialize(this.color),
            'inertCounter': this.inertCounter,
            'inert': this.inert,
            'filth': this.filth
        };
    }
    static deserialize(data, version, deserializer) {
        deserializer.register_type(Coordinate);
        let result = new WaterNode(
            deserializer.deserialize(data.pos),
            data.depth,
            data.timeFromRiverBed
        );
        result.graphic = data.graphic;
        result.color = deserializer.deserialize(data.color);
        result.inertCounter = data.inertCounter;
        result.inert = data.inert;
        result.filth = data.filth;
        return result;
    }
}

WaterNode.CLASS_VERSION = 0;