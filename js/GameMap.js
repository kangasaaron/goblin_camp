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

import { CacheTile } from "./CacheTile.js";
import { Coordinate } from "./Coordinate.js";
import { Constants } from "./Constants.js";
import { TCODHeightMap } from "../fakeTCOD/libtcod.js";
import { Singletonify } from "./cplusplus/Singleton.js";
import { Serializable } from "./data/Serialization.js";
import { Tile } from "./Tile.js";
import { TileType } from "./TileType.js";
import { Weather } from "./Weather.js";

export class GameMap extends Serializable {
    constructor() {
        super();
        /** @type {Tile[][]} */
        this.tileMap = [];
        /** @type {CacheTile[][]} */
        this.cachedTileMap = [];

        for (let x = 0; x < HARDCODED_WIDTH; x++) {
            this.tileMap.push([]);
            this.cachedTileMap.push([]);
            for (let y = 0; y < HARDCODED_HEIGHT; y++) {
                this.tileMap[x].push(new Tile());
                this.cachedTileMap[x].push(new CacheTile());
            }
        }
        /** @type {TCODHeightMap *} */
        this.heightMap = new HeightMap(HARDCODED_WIDTH, HARDCODED_HEIGHT);
        /** @type {Coordinate} */
        this.extent = new Coordinate(HARDCODED_WIDTH, HARDCODED_HEIGHT);
        for (let i = 0; i < HARDCODED_WIDTH; ++i) {
            for (let e = 0; e < HARDCODED_HEIGHT; ++e) {
                this.tileMap[i][e].ResetType(TileType.TILEGRASS);
                this.cachedTileMap[i][e].x = i;
                this.cachedTileMap[i][e].y = e;
            }
        }
        /** @type {Number} (float) */
        this.waterlevel = -0.8;
        /** @type {Weather} (shared_ptr) */
        this.weather = new Weather(this);
        /** @type {int} **/
        this.overlayFlags = 0
        /** @type {std.list < std.pair < unsigned int, MapMarker > >} **/
        this.mapMarkers = []
        /** @type {unsigned int} **/
        this.markerids = 0;
        /** @type {boost.unordered_set < Coordinate >} **/
        this.changedTiles = new Set();
        /** @type {typedef std.list < std.pair < unsigned int, MapMarker > > .const_iterator} **/
        this.MarkerIterator = null;
        /** @type {mutable boost.shared_mutex} **/
        this.cacheMutex;
    }

    destructor() {
        this.heightMap = null;
    }

    tile(p) {
        return this.tileMap[p.X()][p.Y()];
    }
    cachedTile(p) {
        return this.cachedTileMap[p.X()][p.Y()];
    }

    Extent() { return this.extent; }
    Width() { return this.extent.X(); }
    Height() { return this.extent.Y(); }
    IsInside(p) {
        return p.insideExtent(Coordinate.zeroCoordinate, this.extent);
    }
    Shrink(p) {
        return p.shrinkExtent(Coordinate.zeroCoordinate, this.extent);
    }

    //we must keep the int-version of getWalkCost as an override of ITCODPathCallback, otherwise this is virtual
    getWalkCost_Coordinate_Coordinate_Ptr(from, to, ptr) {
        if ((ptr).IsFlying()) return 1.0;
        return this.cachedTile(to).GetMoveCost(ptr);
    }
    getWalkCost_int_int_int_int_ptr(fx, fy, tx, ty, ptr) {
        return this.getWalkCost(new Coordinate(fx, fy), new Coordinate(tx, ty), ptr);
    }
    getWalkCost(...args) {
        if (typeof args[0] === "number" && typeof args[1] === "number" && typeof args[2] === "number" && typeof args[3] === "number")
            return this.getWalkCost_int_int_int_int_ptr(...args);
        else
            return this.getWalkCost_Coordinate_Coordinate_Ptr(...args);
    }

    IsWalkable(...args){
        if(args.length === 2)
            return this.IsWalkable_p_ptr(args[0],args[1]);
        else
            return this.IsWalkable_p(args[0]);
    }
    //Simple version that doesn't take npc information into account
    IsWalkable_p(p) {
        return (this.IsInside(p) && this.tile(p).IsWalkable());
    }

    IsWalkable_p_ptr(p, ptr) {
        if ((ptr).HasEffect(FLYING)) return true;
        if (!(ptr).HasHands()) {
            let constructionId = Game.i.GetConstruction(p);
            if (constructionId >= 0) {
                let cons = Game.i.GetConstruction(constructionId).lock();
                if (cons) {
                    if (cons.HasTag(DOOR) && !boost.static_pointer_cast < Door > (cons).Open()) {
                        return false;
                    }
                }
            }
        }
        return IsWalkable(p);
    }
    SetWalkable(p, value) {
        if (this.IsInside(p)) {
            tile(p).SetWalkable(value);
            changedTiles.insert(p);
        }
    }

    IsBuildable(p) {
        return this.IsInside(p) && this.tile(p).IsBuildable();
    }

    SetBuildable(p, value) {
        if (this.IsInside(p))
            this.tile(p).SetBuildable(value);
    }

    GetType(p) {
        if (this.IsInside(p)) 
            return this.tile(p).GetType();
        return TileType.TILENONE;
    }
    //ResetType() resets all tile variables to defaults
    ResetType(p, ntype, tileHeight = 0.0) {
        if (this.IsInside(p)) {
            this.tile(p).ResetType(ntype, tileHeight);
            this.changedTiles.insert(p);
        }
    }
    //ChangeType() preserves information such as buildability
    ChangeType(p, ntype, tileHeight = 0.0) {
        if (this.IsInside(p)) {
            this.tile(p).ChangeType(ntype, tileHeight);
            this.changedTiles.insert(p);
        }
    }

    MoveTo(p, uid) {
        if (this.IsInside(p)) {
            this.tile(p).MoveTo(uid);
        }
    }

    MoveFrom(p, uid) {
        if (this.IsInside(p)) 
            this.tile(p).MoveFrom(uid);
    }

    SetConstruction(p, uid) {
        if (this.IsInside(p)) {
            this.tile(p).SetConstruction(uid);
            this.changedTiles.insert(p);
        }
    }
    GetConstruction(p) {
        if (this.IsInside(p)) 
            return this.tile(p).GetConstruction();
        return -1;
    }

    GetWater(p) {
        if (this.IsInside(p)) 
            return this.tile(p).GetWater();
        return null;
    }
    SetWater(p, value) {
        if (this.IsInside(p)) {
            this.tile(p).SetWater(value);
            this.changedTiles.insert(p);
        }
    }

    IsLow(p) {
        return this.IsInside(p) && this.tile(p).IsLow();
    }
    SetLow(p, value) {
        if (this.IsInside(p)) this.tile(p).SetLow(value);
    }

    BlocksWater(p) {
        return !this.IsInside(p) || this.tile(p).BlocksWater();
    }
    SetBlocksWater(p, value) {
        if (this.IsInside(p)) {
            tile(p).SetBlocksWater(value);
        }
    }

    NPCList(p) {
        if (this.IsInside(p)) return this.tile(p).npcList;
        return tileMap[0][0].npcList;
    }
    ItemList(p) {
        if (this.IsInside(p)) return this.tile(p).itemList;
        return tileMap[0][0].itemList;
    }

    GetGraphic(p) {
        if (this.IsInside(p)) return this.tile(p).GetGraphic();
        return '?';
    }
    GetForeColor(p) {
        if (this.IsInside(p)) return this.tile(p).GetForeColor();
        return Color.pink;
    }

    ForeColor(p, color) {
        if (this.IsInside(p)) {
            this.tile(p).originalForeColor = color;
            this.tile(p).foreColor = color;
        }
    }

    GetBackColor(p) {
        if (this.IsInside(p)) 
            return this.tile(p).GetBackColor();
        return TCODColor.yellow;
    }
    SetNatureObject(p, val) {
        if (this.IsInside(p)) {
            this.tile(p).SetNatureObject(val);
        }
    }
    GetNatureObject(p) {
        if (this.IsInside(p)) return this.tile(p).GetNatureObject();
        return -1;
    }

    GetFilth(p) {
        if (this.IsInside(p)) return this.tile(p).GetFilth();
        return null;
    }
    SetFilth(p, value) {
        if (this.IsInside(p)) {
            this.tile(p).SetFilth(value);
            this.changedTiles.insert(p);
        }
    }
    GetBlood(p) {
        if (this.IsInside(p)) return this.tile(p).GetBlood();
        return null;
    }
    SetBlood(p, value) {
        if (this.IsInside(p)) this.tile(p).SetBlood(value);
    }

    GetFire(p) {
        if (this.IsInside(p)) return this.tile(p).GetFire();
        return null;
    }
    SetFire(p, value) {
        if (this.IsInside(p)) {
            this.tile(p).SetFire(value);
            this.changedTiles.insert(p);
        }
    }
    BlocksLight(p) {
        if (this.IsInside(p)) return this.tile(p).BlocksLight();
        return true;
    }
    SetBlocksLight(p, val) {
        if (this.IsInside(p)) this.tile(p).SetBlocksLight(val);
    }
    LineOfSight(a, b) {
        TCODLine.init(a.X(), a.Y(), b.X(), b.Y());
        let p = a;
        do {
            if (this.BlocksLight(p)) return false;
        } while (!TCODLine.step(p.Xptr(), p.Yptr()) && p !== b);
        return true;
    }


    Mark(p) { this.tile(p).Mark(); }
    Unmark(p) { this.tile(p).Unmark(); }

    GroundMarked(p) { return this.tile(p).marked; }

    GetMoveModifier(p) {
        let modifier = 0;

        let construction;
        if (this.tile(p).construction >= 0) construction = Game.i.GetConstruction(this.tile(p).construction).lock();
        let bridge = false;
        if (construction) bridge = (construction.Built() && construction.HasTag(ConstructionTag.BRIDGE));

        if (this.tile(p).GetType() === TileType.TILEBOG && !bridge) modifier += 10;
        else if (this.tile(p).GetType() === TileType.TILEDITCH && !bridge) modifier += 4;
        else if (this.tile(p).GetType() === TileType.TILEMUD && !bridge) { //Mud adds 6 if there's no bridge
            modifier += 6;
        }
        let water = this.tile(p).GetWater().lock();
        if (water) { //Water adds 'depth' without a bridge
            if (!bridge) modifier += water.Depth();
        }

        //Constructions (except bridges) slow down movement
        if (construction && !bridge) modifier += construction.GetMoveSpeedModifier();

        //Other critters slow down movement
        if (this.tile(p).npcList.size() > 0) modifier += 2 + Random.i.Generate(this.tile(p).npcList.size() - 1);

        return modifier;
    }
    GetWaterlevel() { return this.waterlevel; }
    WalkOver(p) { if (this.IsInside(p)) this.tile(p).WalkOver(); }
    Naturify(p) {
        if (this.IsInside(p)) {
            if (this.tile(p).walkedOver > 0) --this.tile(p).walkedOver;
            if (this.tile(p).burnt > 0) this.tile(p).Burn(-1);
            if (this.tile(p).walkedOver === 0 && this.tile(p).natureObject < 0 && this.tile(p).construction < 0) {
                let natureObjects = 0;
                let begin = this.Shrink(p - 2);
                let end = this.Shrink(p + 2);
                for (let ix = begin.X(); ix <= end.X(); ++ix) {
                    for (let iy = begin.Y(); iy <= end.Y(); ++iy) {
                        if (tileMap[ix][iy].natureObject >= 0) ++natureObjects;
                    }
                }
                if (natureObjects < (this.tile(p).corruption < 100 ? 6 : 1)) { //Corrupted areas have less flora
                    Game.i.CreateNatureObject(p, natureObjects);
                }
            }
        }
    }
    Corrupt(pos, magnitude = 200) {
        let p = pos;
        for (let loops = 0; magnitude > 0 && loops < 2000; ++loops, p = Shrink(Random.ChooseInRadius(p, 1))) {
            if (this.tile(p).corruption < 300) {
                let difference = 300 - this.tile(p).corruption;
                if (magnitude - difference <= 0) {
                    this.tile(p).Corrupt(magnitude);
                    magnitude = 0;
                } else {
                    this.tile(p).Corrupt(difference);
                    magnitude -= difference;
                }

                if (this.tile(p).corruption >= 100) {
                    if (this.tile(p).natureObject >= 0 &&
                        !NatureObject.Presets[Game.i.natureList[this.tile(p).natureObject].Type()].evil &&
                        !boost.iequals(Game.i.natureList[this.tile(p).natureObject].Name(), "Withering tree") &&
                        !Game.i.natureList[this.tile(p).natureObject].IsIce()) {
                        let createTree = Game.i.natureList[this.tile(p).natureObject].Tree();
                        Game.i.RemoveNatureObject(Game.i.natureList[this.tile(p).natureObject]);
                        if (createTree && Random.i.Generate(6) < 1) Game.i.CreateNatureObject(p, "Withering tree");
                    }
                }
            }
        }
    }
    GetCorruption(p) {
        if (this.IsInside(p)) return this.tile(p).corruption;
        return 0;
    }
    IsTerritory(p) {
        return this.IsInside(p) && this.tile(p).territory;
    }

    SetTerritory(p, value) {
        if (this.IsInside(p)) this.tile(p).territory = value;
    }

    SetTerritoryRectangle(a, b, value) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                SetTerritory(Coordinate(x, y), value);
            }
        }
    }
    GetOverlayFlags() { return overlayFlags; }

    AddOverlay(flags) { overlayFlags |= flags; }
    RemoveOverlay(flags) { overlayFlags = overlayFlags & ~flags; }

    ToggleOverlay(flags) { overlayFlags ^= flags; }
    FindEquivalentMoveTarget(current, move, next, npc) {
        //We need to find a tile that is walkable, and adjacent to all 3 given tiles but not the same as move

        //Find the edges of a (low,high) bounding box for current, move and next
        let low = this.Shrink(Coordinate.min(Coordinate.min(current, move), next) - 1);
        let high = this.Shrink(Coordinate.max(Coordinate.max(current, move), next) + 1);

        //Find a suitable target
        for (let x = low.X(); x <= high.X(); ++x) {
            for (let y = low.Y(); y <= high.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (p !== move) {
                    if (IsWalkable(p, npc) && this.tile(p).npcList.size() === 0 && !IsUnbridgedWater(p) &&
                        !IsDangerous(p, (npc).GetFaction())) {
                        if (Game.i.Adjacent(p, current) && Game.i.Adjacent(p, move) && Game.i.Adjacent(p, next)) {
                            move = p;
                            return;
                        }
                    }
                }
            }
        }
    }
    IsUnbridgedWater(p) {
        if (this.IsInside(p)) {
            let water = this.tile(p).water;
            if (water) {
                let construction = Game.i.GetConstruction(this.tile(p).construction).lock();
                if (water.Depth() > 0 && (!construction || !construction.Built() || !construction.HasTag(BRIDGE))) return true;
            }
        }
        return false;
    }
    UpdateMarkers() {
        for (let markeri = mapMarkers.begin(); markeri !== mapMarkers.end();) {
            if (!markeri.second.Update()) {
                markeri = mapMarkers.erase(markeri);
            } else ++markeri;
        }
    }
    AddMarker(marker) {
        mapMarkers.push((markerids, marker));
        ++markerids;
        return markerids - 1;
    }
    RemoveMarker(markid) {
        for (markeri = mapMarkers.begin(); markeri !== mapMarkers.end(); ++markeri) {
            if (static_cast < int > (markeri.first) === markid) {
                mapMarkers.erase(markeri);
                return;
            }
        }
    }
    GetColor(p) {
        if (this.IsInside(p)) return this.tile(p).GetForeColor();
        return Color.white;
    }

    Burnt(p) {
        if (this.IsInside(p)) {
            return this.tile(p).burnt;
        }
        return 0;
    }

    MarkerBegin() {
        return mapMarkers.begin();
    }
    MarkerEnd() {
        return mapMarkers.end();
    }


    GetWindDirection() { return weather.GetWindDirection(); }
    RandomizeWind() { weather.RandomizeWind(); }
    ShiftWind() { weather.ShiftWind(); }
    GetWindAbbreviation() { return weather.GetWindAbbreviation(); }
    CalculateFlow(px, py) { //TODO use Coordinate

        let startDirectionA, startDirectionB, midDirectionA, midDirectionB, endDirectionA, endDirectionB;

        if (px[0] < px[1]) startDirectionA = EAST;
        else if (px[0] > px[1]) startDirectionA = WEST;
        else startDirectionA = Random.i.GenerateBool() ? EAST : WEST;
        if (py[0] < py[1]) startDirectionB = SOUTH;
        else if (py[0] > py[1]) startDirectionB = NORTH;
        else startDirectionB = Random.i.GenerateBool() ? SOUTH : NORTH;

        if (px[1] < px[2]) midDirectionA = EAST;
        else if (px[1] > px[2]) midDirectionA = WEST;
        else midDirectionA = Random.i.GenerateBool() ? EAST : WEST;
        if (py[1] < py[2]) midDirectionB = SOUTH;
        else if (py[1] > py[2]) midDirectionB = NORTH;
        else midDirectionB = Random.i.GenerateBool() ? SOUTH : NORTH;

        if (px[2] < px[3]) endDirectionA = EAST;
        else if (px[2] > px[3]) endDirectionA = WEST;
        else endDirectionA = Random.i.GenerateBool() ? EAST : WEST;
        if (py[2] < py[3]) endDirectionB = SOUTH;
        else if (py[2] > py[3]) endDirectionB = NORTH;
        else endDirectionB = Random.i.GenerateBool() ? SOUTH : NORTH;

        if (Random.i.GenerateBool()) { //Reverse?
            if (startDirectionA === EAST) startDirectionA = WEST;
            else startDirectionA = EAST;
            if (startDirectionB === SOUTH) startDirectionB = NORTH;
            else startDirectionB = SOUTH;
            if (midDirectionA === EAST) midDirectionA = WEST;
            else midDirectionA = EAST;
            if (midDirectionB === SOUTH) midDirectionB = NORTH;
            else midDirectionB = SOUTH;
            if (endDirectionA === EAST) endDirectionA = WEST;
            else endDirectionA = EAST;
            if (endDirectionB === SOUTH) endDirectionB = NORTH;
            else endDirectionB = SOUTH;
        }

        let beginning = new Coordinate(px[0], py[0]);

        /**boost.unordered_set < Coordinate > */
        let touched = new Set();
        /**std.priority_queue < std.pair < int, Coordinate > >*/
        let unfinished = [];

        unfinished.push((0, beginning));
        touched.insert(beginning);

        let flowDirectionA = startDirectionA,
            flowDirectionB = startDirectionB;
        let stage = 0;
        let favorA = false;
        let favorB = false;
        let distance1 = Coordinate.Distance(new Coordinate(px[0], py[0]), new Coordinate(px[1], py[1]));
        let distance2 = Coordinate.Distance(new Coordinate(px[1], py[1]), new Coordinate(px[2], py[2]));

        if (Math.abs(px[0] - px[1]) - Math.abs(py[0] - py[1]) > 15)
            favorA = true;
        else if (Math.abs(px[0] - px[1]) - Math.abs(py[0] - py[1]) < 15)
            favorB = true;

        while (!unfinished.empty()) {
            let current = unfinished.top().second;
            unfinished.pop();

            switch (stage) {
                case 0:
                    flowDirectionA = startDirectionA;
                    flowDirectionB = startDirectionB;
                    break;

                case 1:
                    flowDirectionA = midDirectionA;
                    flowDirectionB = midDirectionB;
                    break;

                case 2:
                    flowDirectionA = endDirectionA;
                    flowDirectionB = endDirectionB;
                    break;
            }

            let resultA = Random.i.Generate(favorA ? 3 : 1);
            let resultB = Random.i.Generate(favorB ? 3 : 1);
            if (resultA === resultB) Random.i.GenerateBool() ? resultA += 1 : resultB += 1;
            if (resultA > resultB)
                tileMap[current.X()][current.Y()].flow = flowDirectionA;
            else
                tileMap[current.X()][current.Y()].flow = flowDirectionB;

            for (let y = current.Y() - 1; y <= current.Y() + 1; ++y) {
                for (let x = current.X() - 1; x <= current.X() + 1; ++x) {
                let pos = new Coordinate(x, y);
                    if (IsInside(pos)) {
                        if (touched.find(pos) === touched.end() && tile(pos).water) {
                            let distance = Coordinate.Distance(beginning, pos);
                            touched.insert(pos);
                            unfinished.push((Number.MAX_SAFE_INTEGER - distance, pos));
                            if (stage === 0 && distance > distance1) {
                                stage = 1;
                                favorA = false;
                                favorB = false;
                                if (Math.abs(px[1] - px[2]) - Math.abs(py[1] - py[2]) > 15)
                                    favorA = true;
                                else if (Math.abs(px[1] - px[2]) - Math.abs(py[1] - py[2]) < 15)
                                    favorB = true;
                            }
                            if (stage === 1 && Coordinate.Distance(pos, new Coordinate(px[1], py[1])) > distance2) {
                                stage = 2;
                                favorA = false;
                                favorB = false;
                                if (Math.abs(px[2] - px[3]) - Math.abs(py[2] - py[3]) > 15)
                                    favorA = true;
                                else if (Math.abs(px[2] - px[3]) - Math.abs(py[2] - py[3]) < 15)
                                    favorB = true;
                            }
                        }
                    }
                }
            }
        }

        /* Calculate flow for all ground tiles

           'flow' is used for propagation of filth over time, and
           deplacement of objects in the river.

           Flow is determined by the heightmap: each tile flows to its
           lowest neighbor. When all neighbors have the same height,
           we choose to flow towards the river, by picking a random
           water tile and flowing toward it.

           For algorithmic reason, we build a "cache" of the water
           tiles list as a vector : picking a random water tile was
           O(N) with the water list, causing noticeable delays during
           this creation -- one minute or more -- while it is O(1) on
           water arrays.
         */
        /**std.vector < boost.weak_ptr < WaterNode > > */
        let waterArray = (Game.i.waterList.begin(), Game.i.waterList.end());

        for (let y = 0; y < Height(); ++y) {
            for (let x = 0; x < Width(); ++x) {
                let pos = new Coordinate(x, y);
                if (tile(pos).flow === NODIRECTION) {
                    let lowest = new Coordinate(x, y);
                    for (let iy = y - 1; iy <= y + 1; ++iy) {
                        for (let ix = x - 1; ix <= x + 1; ++ix) {
                            let candidate = new Coordinate(ix, iy);
                            if (IsInside(candidate)) {
                                if (heightMap.getValue(ix, iy) < heightMap.getValue(lowest.X(), lowest.Y())) {
                                    lowest = candidate;
                                }
                            }
                        }
                    }

                    if (lowest.X() < x) {
                        if (lowest.Y() < y)
                            tile(pos).flow = NORTHWEST;
                        else if (lowest.Y() === y)
                            tile(pos).flow = WEST;
                        else
                            tile(pos).flow = SOUTHWEST;
                    } else if (lowest.X() === x) {
                        if (lowest.Y() < y)
                            tile(pos).flow = NORTH;
                        else if (lowest.Y() > y)
                            tile(pos).flow = SOUTH;
                    } else {
                        if (lowest.Y() < y)
                            tile(pos).flow = NORTHEAST;
                        else if (lowest.Y() === y)
                            tile(pos).flow = EAST;
                        else
                            tile(pos).flow = SOUTHEAST;
                    }

                    if (tile(pos).flow === NODIRECTION && !waterArray.empty()) {
                        // No slope here, so approximate towards river
                        /**boost.weak_ptr < WaterNode >*/
                        let randomWater = Random.ChooseElement(waterArray);
                        let coord = randomWater.lock().Position();
                        if (coord.X() < x) {
                            if (coord.Y() < y)
                                tile(pos).flow = NORTHWEST;
                            else if (coord.Y() === y)
                                tile(pos).flow = WEST;
                            else
                                tile(pos).flow = SOUTHWEST;
                        } else if (coord.X() === x) {
                            if (coord.Y() < y)
                                tile(pos).flow = NORTH;
                            else if (coord.Y() > y)
                                tile(pos).flow = SOUTH;
                        } else {
                            if (coord.Y() < y)
                                tile(pos).flow = NORTHEAST;
                            else if (coord.Y() === y)
                                tile(pos).flow = EAST;
                            else
                                tile(pos).flow = SOUTHEAST;
                        }
                    }
                }
            }
        }
    }


    GetFlow(p) {
        if (this.IsInside(p))
            return tile(p).flow;
        return NODIRECTION;
    }



    IsDangerous(p, faction) {
        if (this.IsInside(p)) {
            if (tile(p).fire) return true;
            return Faction.factions[faction].IsTrapVisible(p);
        }
        return false;
    }
    IsDangerousCache(p, faction) {
        if (this.IsInside(p)) {
            if (cachedTile(p).fire) return true;
            if (faction >= 0 && faction < Faction.factions.size())
                return Faction.factions[faction].IsTrapVisible(p);
        }
        return false;
    }


    GetTerrainMoveCost(p) {
        if (this.IsInside(p))
            return tile(p).GetTerrainMoveCost();
        return 0;
    }

    Update() {
        if (Random.i.GenerateConstants.UPDATES_PER_SECOND * 1 === 0)
            Naturify(Random.ChooseInExtent(Extent()));
        UpdateMarkers();
        weather.Update();
        UpdateCache();
    }



    //Finds a tile close to 'center' that will give an advantage to a creature with a ranged weapon
    FindRangedAdvantage(center) {
        // std.vector < Coordinate > 
        let potentialPositions = [];
        for (let x = center.X() - 5; x <= center.X() + 5; ++x) {
            for (let y = center.Y() - 5; y <= center.Y() + 5; ++y) {
                let p = new Coordinate(x, y);
                if (this.IsInside(p) &&
                    tile(p).construction >= 0 &&
                    !tile(p).fire &&
                    Game.i.GetConstruction(tile(p).construction).lock() &&
                    Game.i.GetConstruction(tile(p).construction).lock().HasTag(RANGEDADVANTAGE) &&
                    tile(p).npcList.empty()) {
                    potentialPositions.push(p);
                }
            }
        }
        if (!potentialPositions.empty())
            return Random.ChooseElement(potentialPositions);
        return new Coordinate(-1, -1);
    }

    UpdateCache() {
        // boost.unique_lock < boost.shared_mutex > 
        let writeLock = (cacheMutex);
        for (let tilei = changedTiles.begin(); tilei !== changedTiles.end();) {
            cachedTile(tilei) = tile(tilei);
            tilei = changedTiles.erase(tilei);
        }
    }


    TileChanged(p) {
        if (this.IsInside(p)) {
            changedTiles.insert(p);
        }
    }

    save(ar, version) {
        for (let x = 0; x < tileMap.size(); ++x) {
            for (let y = 0; y < tileMap[x].size(); ++y) {
                ar & tileMap[x][y];
            }
        }
        const width = extent.X();
        const height = extent.Y();
        ar & width;
        ar & height;
        ar & mapMarkers;
        ar & markerids;
        ar & weather;
        for (let x = 0; x < tileMap.size(); ++x) {
            for (let y = 0; y < tileMap[x].size(); ++y) {
                let heightMapValue = heightMap.getValue(x, y);
                ar & heightMapValue;
            }
        }
    }

    load(ar, version) {
        for (let x = 0; x < tileMap.size(); ++x) {
            for (let y = 0; y < tileMap[x].size(); ++y) {
                ar & tileMap[x][y];
            }
        }
        let width, height;
        ar & width;
        ar & height;
        extent = Coordinate(width, height);
        ar & mapMarkers;
        ar & markerids;
        if (version === 0) {
            let unused;
            ar & unused;
        }
        if (version >= 1) {
            ar & weather;
        }
        if (version >= 2) {
            for (let x = 0; x < tileMap.size(); ++x) {
                for (let y = 0; y < tileMap[x].size(); ++y) {
                    let heightMapValue;
                    ar & heightMapValue;
                    heightMap.setValue(x, y, heightMapValue);

                    //Mark every tile as changed so the cached this gets completely updated on load
                    changedTiles.insert(Coordinate(x, y));
                }
            }
        }
    }
}

Singletonify(GameMap);

GameMap.CLASS_VERSION = 2;