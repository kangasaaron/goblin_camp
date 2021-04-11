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


const TERRITORY_OVERLAY = (1 << 0);
const TERRAIN_OVERLAY = (2 << 0);
const HARDCODED_WIDTH = 500;
const HARDCODED_HEIGHT = 500;

class MapClass extends ITCODPathCallback {
    static CLASS_VERSION = 2;

    /** @type {boost.multi_array < Tile, 2 >} */
    tileMap;
    /** @type {boost.multi_array < CacheTile, 2 >} */
    cachedTileMap;
    /** @type {Coordinate} */
    extent; //X.width, Y.height
    //float 
    waterlevel = 0;
    //int 
    overlayFlags = 0
        // std.list < std.pair < unsigned int, MapMarker > > 
    mapMarkers = []
        // unsigned int 
    markerids = 0;
    // boost.unordered_set < Coordinate > 
    changedTiles = new Set();

    // typedef std.list < std.pair < unsigned int, MapMarker > > .const_iterator 
    MarkerIterator = null;

    // TCODHeightMap * 
    heightMap = null;
    // boost.shared_ptr < Weather > 
    weather;
    // mutable boost.shared_mutex 
    cacheMutex;

    tile(p) {
        return tileMap[p.X()][p.Y()];
    }
    cachedTile(p) {
        return cachedTileMap[p.X()][p.Y()];
    }
    tile(p) {
        return tileMap[p.X()][p.Y()];
    }
    cachedTile(p) {
        return cachedTileMap[p.X()][p.Y()];
    }

    constructor() {

        tileMap.resize(boost.extents[HARDCODED_WIDTH][HARDCODED_HEIGHT]);
        cachedTileMap.resize(boost.extents[HARDCODED_WIDTH][HARDCODED_HEIGHT]);
        heightMap = new TCODHeightMap(HARDCODED_WIDTH, HARDCODED_HEIGHT);
        extent = Coordinate(HARDCODED_WIDTH, HARDCODED_HEIGHT);
        for (let i = 0; i < HARDCODED_WIDTH; ++i) {
            for (let e = 0; e < HARDCODED_HEIGHT; ++e) {
                tileMap[i][e].ResetType(TILEGRASS);
                cachedTileMap[i][e].x = i;
                cachedTileMap[i][e].y = e;
            }
        }
        waterlevel = -0.8;
        weather = new Weather(this);
    }

    destructor() {
        delete heightMap;
    }
    Extent() { return extent; }
    Width() { return extent.X(); }
    Height() { return extent.Y(); }
    IsInside(p) {
        return p.insideExtent(zero, extent);
    }
    Shrink(p) {
        return p.shrinkExtent(zero, extent);
    }

    //we must keep the int-version of getWalkCost as an override of ITCODPathCallback, otherwise Map is virtual
    getWalkCost(from, to, ptr) {
        if ((ptr).IsFlying()) return 1.0;
        return cachedTile(to).GetMoveCost(ptr);
    }
    getWalkCost(fx, fy, tx, ty, ptr) {
        return Map.getWalkCost(Coordinate(fx, fy), Coordinate(tx, ty), ptr);
    }

    //Simple version that doesn't take npc information into account
    IsWalkable(p) {
        return (Map.IsInside(p) && tile(p).IsWalkable());
    }

    IsWalkable(p, ptr) {
        if ((ptr).HasEffect(FLYING)) return true;
        if (!(ptr).HasHands()) {
            let constructionId = GetConstruction(p);
            if (constructionId >= 0) {
                let cons;
                if (cons = Game.GetConstruction(constructionId).lock()) {
                    if (cons.HasTag(DOOR) && !boost.static_pointer_cast < Door > (cons).Open()) {
                        return false;
                    }
                }
            }
        }
        return IsWalkable(p);
    }
    SetWalkable(p, value) {
        if (Map.IsInside(p)) {
            tile(p).SetWalkable(value);
            changedTiles.insert(p);
        }
    }

    IsBuildable(p) {
        return Map.IsInside(p) && tile(p).IsBuildable();
    }

    SetBuildable(p, value) {
        if (Map.IsInside(p))
            tile(p).SetBuildable(value);
    }

    GetType(p) {
            if (Map.IsInside(p)) return tile(p).GetType();
            return TILENONE;
        }
        //ResetType() resets all tile variables to defaults
    ResetType(p, ntype, tileHeight = 0.0) {
            if (Map.IsInside(p)) {
                tile(p).ResetType(ntype, tileHeight);
                changedTiles.insert(p);
            }
        }
        //ChangeType() preserves information such as buildability
    ChangeType(p, ntype, tileHeight = 0.0) {
        if (Map.IsInside(p)) {
            tile(p).ChangeType(ntype, tileHeight);
            changedTiles.insert(p);
        }
    }

    MoveTo(p, uid) {
        if (Map.IsInside(p)) {
            tile(p).MoveTo(uid);
        }
    }

    MoveFrom(p, uid) {
        if (Map.IsInside(p)) tile(p).MoveFrom(uid);
    }

    SetConstruction(p, uid) {
        if (Map.IsInside(p)) {
            tile(p).SetConstruction(uid);
            changedTiles.insert(p);
        }
    }
    GetConstruction(p) {
        if (Map.IsInside(p)) return tile(p).GetConstruction();
        return -1;
    }

    GetWater(p) {
        if (Map.IsInside(p)) return tile(p).GetWater();
        return null;
    }
    SetWater(p, value) {
        if (Map.IsInside(p)) {
            tile(p).SetWater(value);
            changedTiles.insert(p);
        }
    }

    IsLow(p) {
        return Map.IsInside(p) && tile(p).IsLow();
    }
    SetLow(p, value) {
        if (Map.IsInside(p)) tile(p).SetLow(value);
    }

    BlocksWater(p) {
        return !Map.IsInside(p) || tile(p).BlocksWater();
    }
    SetBlocksWater(p, value) {
        if (Map.IsInside(p)) {
            tile(p).SetBlocksWater(value);
        }
    }

    NPCList(p) {
        if (Map.IsInside(p)) return tile(p).npcList;
        return tileMap[0][0].npcList;
    }
    ItemList(p) {
        if (Map.IsInside(p)) return tile(p).itemList;
        return tileMap[0][0].itemList;
    }

    GetGraphic(p) {
        if (Map.IsInside(p)) return tile(p).GetGraphic();
        return '?';
    }
    GetForeColor(p) {
        if (Map.IsInside(p)) return tile(p).GetForeColor();
        return TCODColor.pink;
    }

    ForeColor(p, color) {
        if (Map.IsInside(p)) {
            tile(p).originalForeColor = color;
            tile(p).foreColor = color;
        }
    }

    GetBackColor(p) {
        if (Map.IsInside(p)) return tile(p).GetBackColor();
        return TCODColor.yellow;
    }
    SetNatureObject(p, val) {
        if (Map.IsInside(p)) {
            tile(p).SetNatureObject(val);
        }
    }
    GetNatureObject(p) {
        if (Map.IsInside(p)) return tile(p).GetNatureObject();
        return -1;
    }

    GetFilth(p) {
        if (Map.IsInside(p)) return tile(p).GetFilth();
        return null;
    }
    SetFilth(p, value) {
        if (Map.IsInside(p)) {
            tile(p).SetFilth(value);
            changedTiles.insert(p);
        }
    }
    GetBlood(p) {
        if (Map.IsInside(p)) return tile(p).GetBlood();
        return null;
    }
    SetBlood(p, value) {
        if (Map.IsInside(p)) tile(p).SetBlood(value);
    }

    GetFire(p) {
        if (Map.IsInside(p)) return tile(p).GetFire();
        return null;
    }
    SetFire(p, value) {
        if (Map.IsInside(p)) {
            tile(p).SetFire(value);
            changedTiles.insert(p);
        }
    }
    BlocksLight(p) {
        if (Map.IsInside(p)) return tile(p).BlocksLight();
        return true;
    }
    SetBlocksLight(p, val) {
        if (Map.IsInside(p)) tile(p).SetBlocksLight(val);
    }
    LineOfSight(a, b) {
        TCODLine.init(a.X(), a.Y(), b.X(), b.Y());
        let p = a;
        do {
            if (BlocksLight(p)) return false;
        } while (!TCODLine.step(p.Xptr(), p.Yptr()) && p != b);
        return true;
    }

    static Reset() {
        delete Map;
        Map = new MapClass();
    }

    Mark(p) { tile(p).Mark(); }
    Unmark(p) { tile(p).Unmark(); }

    GroundMarked(p) { return tile(p).marked; }

    GetMoveModifier(p) {
        let modifier = 0;

        let construction;
        if (tile(p).construction >= 0) construction = Game.GetConstruction(tile(p).construction).lock();
        let bridge = false;
        if (construction) bridge = (construction.Built() && construction.HasTag(BRIDGE));

        if (tile(p).GetType() == TILEBOG && !bridge) modifier += 10;
        else if (tile(p).GetType() == TILEDITCH && !bridge) modifier += 4;
        else if (tile(p).GetType() == TILEMUD && !bridge) { //Mud adds 6 if there's no bridge
            modifier += 6;
        }
        let water;
        if (water = tile(p).GetWater().lock()) { //Water adds 'depth' without a bridge
            if (!bridge) modifier += water.Depth();
        }

        //Constructions (except bridges) slow down movement
        if (construction && !bridge) modifier += construction.GetMoveSpeedModifier();

        //Other critters slow down movement
        if (tile(p).npcList.size() > 0) modifier += 2 + Random.Generate(tile(p).npcList.size() - 1);

        return modifier;
    }
    GetWaterlevel() { return waterlevel; }
    WalkOver(p) { if (Map.IsInside(p)) tile(p).WalkOver(); }
    Naturify(p) {
        if (Map.IsInside(p)) {
            if (tile(p).walkedOver > 0) --tile(p).walkedOver;
            if (tile(p).burnt > 0) tile(p).Burn(-1);
            if (tile(p).walkedOver == 0 && tile(p).natureObject < 0 && tile(p).construction < 0) {
                let natureObjects = 0;
                let begin = Map.Shrink(p - 2);
                let end = Map.Shrink(p + 2);
                for (let ix = begin.X(); ix <= end.X(); ++ix) {
                    for (let iy = begin.Y(); iy <= end.Y(); ++iy) {
                        if (tileMap[ix][iy].natureObject >= 0) ++natureObjects;
                    }
                }
                if (natureObjects < (tile(p).corruption < 100 ? 6 : 1)) { //Corrupted areas have less flora
                    Game.CreateNatureObject(p, natureObjects);
                }
            }
        }
    }
    Corrupt(pos, magnitude = 200) {
        let p = pos;
        for (let loops = 0; magnitude > 0 && loops < 2000; ++loops, p = Shrink(Random.ChooseInRadius(p, 1))) {
            if (tile(p).corruption < 300) {
                let difference = 300 - tile(p).corruption;
                if (magnitude - difference <= 0) {
                    tile(p).Corrupt(magnitude);
                    magnitude = 0;
                } else {
                    tile(p).Corrupt(difference);
                    magnitude -= difference;
                }

                if (tile(p).corruption >= 100) {
                    if (tile(p).natureObject >= 0 &&
                        !NatureObject.Presets[Game.natureList[tile(p).natureObject].Type()].evil &&
                        !boost.iequals(Game.natureList[tile(p).natureObject].Name(), "Withering tree") &&
                        !Game.natureList[tile(p).natureObject].IsIce()) {
                        let createTree = Game.natureList[tile(p).natureObject].Tree();
                        Game.RemoveNatureObject(Game.natureList[tile(p).natureObject]);
                        if (createTree && Random.Generate(6) < 1) Game.CreateNatureObject(p, "Withering tree");
                    }
                }
            }
        }
    }
    GetCorruption(p) {
        if (Map.IsInside(p)) return tile(p).corruption;
        return 0;
    }
    IsTerritory(p) {
        return Map.IsInside(p) && tile(p).territory;
    }

    SetTerritory(p, value) {
        if (Map.IsInside(p)) tile(p).territory = value;
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
        let low = Map.Shrink(Coordinate.min(Coordinate.min(current, move), next) - 1);
        let high = Map.Shrink(Coordinate.max(Coordinate.max(current, move), next) + 1);

        //Find a suitable target
        for (let x = low.X(); x <= high.X(); ++x) {
            for (let y = low.Y(); y <= high.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (p != move) {
                    if (IsWalkable(p, npc) && tile(p).npcList.size() == 0 && !IsUnbridgedWater(p) &&
                        !IsDangerous(p, (npc).GetFaction())) {
                        if (Game.Adjacent(p, current) && Game.Adjacent(p, move) && Game.Adjacent(p, next)) {
                            move = p;
                            return;
                        }
                    }
                }
            }
        }
    }
    IsUnbridgedWater(p) {
        if (Map.IsInside(p)) {
            let water;
            if (water = tile(p).water) {
                let construction = Game.GetConstruction(tile(p).construction).lock();
                if (water.Depth() > 0 && (!construction || !construction.Built() || !construction.HasTag(BRIDGE))) return true;
            }
        }
        return false;
    }
    UpdateMarkers() {
        for (let markeri = mapMarkers.begin(); markeri != mapMarkers.end();) {
            if (!markeri.second.Update()) {
                markeri = mapMarkers.erase(markeri);
            } else ++markeri;
        }
    }
    AddMarker(marker) {
        mapMarkers.push_back((markerids, marker));
        ++markerids;
        return markerids - 1;
    }
    RemoveMarker(markid) {
        for (markeri = mapMarkers.begin(); markeri != mapMarkers.end(); ++markeri) {
            if (static_cast < int > (markeri.first) == markid) {
                mapMarkers.erase(markeri);
                return;
            }
        }
    }
    GetColor(p) {
        if (Map.IsInside(p)) return tile(p).GetForeColor();
        return TCODColor.white;
    }

    Burn(p, magnitude = 1) {
        if (Map.IsInside(p)) {
            tile(p).Burn(magnitude);
        }
    }

    Burnt(p) {
        if (Map.IsInside(p)) {
            return tile(p).burnt;
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
        else startDirectionA = Random.GenerateBool() ? EAST : WEST;
        if (py[0] < py[1]) startDirectionB = SOUTH;
        else if (py[0] > py[1]) startDirectionB = NORTH;
        else startDirectionB = Random.GenerateBool() ? SOUTH : NORTH;

        if (px[1] < px[2]) midDirectionA = EAST;
        else if (px[1] > px[2]) midDirectionA = WEST;
        else midDirectionA = Random.GenerateBool() ? EAST : WEST;
        if (py[1] < py[2]) midDirectionB = SOUTH;
        else if (py[1] > py[2]) midDirectionB = NORTH;
        else midDirectionB = Random.GenerateBool() ? SOUTH : NORTH;

        if (px[2] < px[3]) endDirectionA = EAST;
        else if (px[2] > px[3]) endDirectionA = WEST;
        else endDirectionA = Random.GenerateBool() ? EAST : WEST;
        if (py[2] < py[3]) endDirectionB = SOUTH;
        else if (py[2] > py[3]) endDirectionB = NORTH;
        else endDirectionB = Random.GenerateBool() ? SOUTH : NORTH;

        if (Random.GenerateBool()) { //Reverse?
            if (startDirectionA == EAST) startDirectionA = WEST;
            else startDirectionA = EAST;
            if (startDirectionB == SOUTH) startDirectionB = NORTH;
            else startDirectionB = SOUTH;
            if (midDirectionA == EAST) midDirectionA = WEST;
            else midDirectionA = EAST;
            if (midDirectionB == SOUTH) midDirectionB = NORTH;
            else midDirectionB = SOUTH;
            if (endDirectionA == EAST) endDirectionA = WEST;
            else endDirectionA = EAST;
            if (endDirectionB == SOUTH) endDirectionB = NORTH;
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
        let distance1 = Distance(new Coordinate(px[0], py[0]), new Coordinate(px[1], py[1]));
        let distance2 = Distance(new Coordinate(px[1], py[1]), new Coordinate(px[2], py[2]));

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

            let resultA = Random.Generate(favorA ? 3 : 1);
            let resultB = Random.Generate(favorB ? 3 : 1);
            if (resultA == resultB) Random.GenerateBool() ? resultA += 1 : resultB += 1;
            if (resultA > resultB)
                tileMap[current.X()][current.Y()].flow = flowDirectionA;
            else
                tileMap[current.X()][current.Y()].flow = flowDirectionB;

            for (let y = current.Y() - 1; y <= current.Y() + 1; ++y) {
                for (let x = current.X() - 1; x <= current.X() + 1; ++x) {
                    let pos = new Coordinate(x, y);
                    if (IsInside(pos)) {
                        if (touched.find(pos) == touched.end() && tile(pos).water) {
                            let distance = Distance(beginning, pos);
                            touched.insert(pos);
                            unfinished.push((Number.MAX_SAFE_INTEGER - distance, pos));
                            if (stage == 0 && distance > distance1) {
                                stage = 1;
                                favorA = false;
                                favorB = false;
                                if (Math.abs(px[1] - px[2]) - Math.abs(py[1] - py[2]) > 15)
                                    favorA = true;
                                else if (Math.abs(px[1] - px[2]) - Math.abs(py[1] - py[2]) < 15)
                                    favorB = true;
                            }
                            if (stage == 1 && Distance(pos, Coordinate(px[1], py[1])) > distance2) {
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
           map creation -- one minute or more -- while it is O(1) on
           water arrays.
         */
        /**std.vector < boost.weak_ptr < WaterNode > > */
        let waterArray = (Game.waterList.begin(), Game.waterList.end());

        for (let y = 0; y < Height(); ++y) {
            for (let x = 0; x < Width(); ++x) {
                let pos = new Coordinate(x, y);
                if (tile(pos).flow == NODIRECTION) {
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
                        else if (lowest.Y() == y)
                            tile(pos).flow = WEST;
                        else
                            tile(pos).flow = SOUTHWEST;
                    } else if (lowest.X() == x) {
                        if (lowest.Y() < y)
                            tile(pos).flow = NORTH;
                        else if (lowest.Y() > y)
                            tile(pos).flow = SOUTH;
                    } else {
                        if (lowest.Y() < y)
                            tile(pos).flow = NORTHEAST;
                        else if (lowest.Y() == y)
                            tile(pos).flow = EAST;
                        else
                            tile(pos).flow = SOUTHEAST;
                    }

                    if (tile(pos).flow == NODIRECTION && !waterArray.empty()) {
                        // No slope here, so approximate towards river
                        /**boost.weak_ptr < WaterNode >*/
                        let randomWater = Random.ChooseElement(waterArray);
                        let coord = randomWater.lock().Position();
                        if (coord.X() < x) {
                            if (coord.Y() < y)
                                tile(pos).flow = NORTHWEST;
                            else if (coord.Y() == y)
                                tile(pos).flow = WEST;
                            else
                                tile(pos).flow = SOUTHWEST;
                        } else if (coord.X() == x) {
                            if (coord.Y() < y)
                                tile(pos).flow = NORTH;
                            else if (coord.Y() > y)
                                tile(pos).flow = SOUTH;
                        } else {
                            if (coord.Y() < y)
                                tile(pos).flow = NORTHEAST;
                            else if (coord.Y() == y)
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
        if (Map.IsInside(p))
            return tile(p).flow;
        return NODIRECTION;
    }



    IsDangerous(p, faction) {
        if (Map.IsInside(p)) {
            if (tile(p).fire) return true;
            return Faction.factions[faction].IsTrapVisible(p);
        }
        return false;
    }
    IsDangerousCache(p, faction) {
        if (Map.IsInside(p)) {
            if (cachedTile(p).fire) return true;
            if (faction >= 0 && faction < Faction.factions.size())
                return Faction.factions[faction].IsTrapVisible(p);
        }
        return false;
    }


    GetTerrainMoveCost(p) {
        if (Map.IsInside(p))
            return tile(p).GetTerrainMoveCost();
        return 0;
    }

    Update() {
        if (Random.Generate(UPDATES_PER_SECOND * 1) == 0)
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
                if (Map.IsInside(p) &&
                    tile(p).construction >= 0 &&
                    !tile(p).fire &&
                    Game.GetConstruction(tile(p).construction).lock() &&
                    Game.GetConstruction(tile(p).construction).lock().HasTag(RANGEDADVANTAGE) &&
                    tile(p).npcList.empty()) {
                    potentialPositions.push_back(p);
                }
            }
        }
        if (!potentialPositions.empty())
            return Random.ChooseElement(potentialPositions);
        return Coordinate(-1, -1);
    }

    UpdateCache() {
        // boost.unique_lock < boost.shared_mutex > 
        let writeLock = (cacheMutex);
        for (let tilei = changedTiles.begin(); tilei != changedTiles.end();) {
            cachedTile(tilei) = tile(tilei);
            tilei = changedTiles.erase(tilei);
        }
    }


    TileChanged(p) {
        if (Map.IsInside(p)) {
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
        if (version == 0) {
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

                    //Mark every tile as changed so the cached map gets completely updated on load
                    changedTiles.insert(Coordinate(x, y));
                }
            }
        }
    }
}