/* Copyright 2011 Ilkka Halila
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


import "./Coordinate.js"
import "./tileRenderer/Corner.js"


// typedef boost.function < bool(Direction) > ConnectedFunction;
// typedef boost.function < int(Direction) > LayeredConnectedFunction;

// class Sprite extends private boost.noncopyable {
class Sprite {
    // std.vector < int > tiles;
    tiles = [];
    // SpriteType type;
    type = 0;
    // int frameTime;
    frameTime = 0;
    // int frameCount;
    frameCount = 0;


    // template < typename IterT > explicit Sprite(IterT start, IterT end, bool connectionMap, int frameRate = 15, int frameCount = 1);
    // template < typename IterT > Sprite.Sprite(IterT start, IterT end, bool connectionMap, int frameRate, int frames): 
    constructor(start, end, connectionMap, frameRate, frames) {
        tiles();
        type(SPRITE_Single);
        frameTime(1000 / frameRate);
        frameCount(frames > 0 ? frames : 1)
        let indices = [];
        for (; start !== end; ++start) {
            indices.push(start);
        }
        if (indices.size() === 0) {
            return;
        }

        // Assume all tiles are for animation if it isn't a connection map
        if (!connectionMap) {
            frameCount = indices.size();
            tiles.assign(indices.begin(), indices.end());
            type = (frameCount > 1) ? SPRITE_Animated : SPRITE_Single;
            return;
        }

        if (frameCount > static_cast < int > (indices.size())) {
            frameCount = static_cast < int > (indices.size());
        }
        let numTiles = indices.size() / frameCount;
        if (numTiles === 0) {
            frameCount = 0;
            return;
        }

        switch (numTiles) {
            case 47:
                type = SPRITE_ExtendedConnectionMap;
                break;
            case 19:
                type = SPRITE_TwoLayerConnectionMap;
                break;
            case 16:
                type = SPRITE_NormalConnectionMap;
                break;
            case 5:
                type = SPRITE_SimpleConnectionMap;
                break;
            default:
                type = SPRITE_Single;
                numTiles = 1;
                break;
        }

        if (frameCount > 1) {
            type = static_cast < SpriteType > (type | SPRITE_Animated);
        }

        for (let tile = 0; tile < numTiles; ++tile) {
            for (let frame = 0; frame < frameCount; ++frame) {
                tiles.push(indices[tile + frame * numTiles]);
            }
        }

    }

    // explicit Sprite();
    constructor() {
            tiles();
            type(SPRITE_Single);
            frameTime(15);
            frameCount(1);
        }
        // explicit Sprite(int tile);
    constructor(tile) {
        tiles();
        type(SPRITE_Single);
        frameTime(15);
        frameCount(1);
        tiles.push(tile);
    }

    CurrentFrame() {
        return (type & SPRITE_Animated) ? ((TCODSystem.getElapsedMilli() / frameTime) % frameCount) : 0;
    }

    IsConnectionMap() {
        return type & SPRITE_ConnectionMap;
    }

    IsTwoLayeredConnectionMap() {
        return (type & SPRITE_TwoLayerConnectionMap) === SPRITE_TwoLayerConnectionMap;
    }
    IsAnimated() {
        return type & SPRITE_Animated;
    }

    // void Draw(int screenX, int screenY) const;
    // void Sprite.Draw(int screenX, int screenY) const {
    Draw(screenX, screenY) {
        DrawInternal(screenX, screenY, tiles[CurrentFrame()]);
    }

    // void Draw(int screenX, int screenY, ConnectedFunction) const;
    // void Sprite.Draw(int screenX, int screenY, ConnectedFunction connected) const {
    Draw(screenX, screenY, connected) {
        if (IsConnectionMap()) {
            if ((type & SPRITE_ExtendedConnectionMap) === SPRITE_ExtendedConnectionMap) {
                let index = ExtConnectionIndex(connected);
                DrawInternal(screenX, screenY, tiles.at(CurrentFrame() + frameCount * index));
            } else if (type & SPRITE_NormalConnectionMap) {
                let index = ConnectionIndex(connected(NORTH), connected(EAST), connected(SOUTH), connected(WEST));
                DrawInternal(screenX, screenY, tiles.at(CurrentFrame() + frameCount * index));
            } else {
                DrawSimpleConnected(screenX, screenY, connected);
            }
        } else {
            Draw(screenX, screenY);
        }
    }

    // void Draw(int screenX, int screenY, int connectionLayer, LayeredConnectedFunction) const;
    // void Sprite.Draw(int screenX, int screenY, int connectionLayer, LayeredConnectedFunction connected) const {
    Draw(screenX, screenY, connectionLayer, connected) {
        if (((type & SPRITE_TwoLayerConnectionMap) === SPRITE_TwoLayerConnectionMap) && connectionLayer > 0) {
            /**boost.array < int, 2 > */
            let vertLayer = [
                connected(NORTH), connected(SOUTH)
            ];
            /**boost.array < int, 2 > */
            let horizLayer = [
                connected(WEST), connected(EAST)
            ];
            /**boost.array < int, 4 > */
            let cornerLayer = [
                connected(NORTHWEST), connected(NORTHEAST), connected(SOUTHWEST), connected(SOUTHEAST)
            ];

            for (let vertDirection = 0; vertDirection < 2; ++vertDirection) {
                for (let horizDirection = 0; horizDirection < 2; ++horizDirection) {
                    let corner = static_cast < Corner > (horizDirection + 2 * vertDirection);
                    let index = SecondLayerConnectionIndex(vertLayer[vertDirection], horizLayer[horizDirection], cornerLayer[corner]);
                    DrawInternal(screenX, screenY, tiles[CurrentFrame() + frameCount * index], corner);
                }
            }
        } else {
            Draw(screenX, screenY, connected);
        }

    }

    // void DrawSimpleConnected(int screenX, int screenY, Sprite.ConnectedFunction) const;
    // void Sprite.DrawSimpleConnected(int screenX, int screenY, ConnectedFunction connected) const {
    DrawSimpleConnected(screenX, screenY, connected) {
        /**boost.array < bool, 2 >*/
        let vertConnected = [
            connected(NORTH), connected(SOUTH)
        ];

        /**boost.array < bool, 2 >*/
        let horizConnected = [
            connected(WEST), connected(EAST)
        ];

        /**boost.array < bool, 4 >*/
        let cornerConnected = [
            connected(NORTHWEST), connected(NORTHEAST), connected(SOUTHWEST), connected(SOUTHEAST)
        ];


        for (let vertDirection = 0; vertDirection < 2; ++vertDirection) {
            for (let horizDirection = 0; horizDirection < 2; ++horizDirection) {
                let corner = static_cast < Corner > (horizDirection + 2 * vertDirection);
                let index = (vertConnected[vertDirection] ? 1 : 0) + (horizConnected[horizDirection] ? 2 : 0);
                if (index === 3 && cornerConnected[corner]) {
                    index++;
                }
                DrawInternal(screenX, screenY, tiles[CurrentFrame() + frameCount * index], corner);
            }
        }
    }

    // virtual void DrawInternal(int screenX, int screenY, int tile) const = 0;
    // void Sprite.DrawInternal(int screenX, int screenY, int tile) const {}
    DrawInternal(screenX, screenY, tile) {}

    // virtual void DrawInternal(int screenX, int screenY, int tile, Corner corner) const = 0;
    // void Sprite.DrawInternal(int screenX, int screenY, int tile, Corner corner) const {}
    DrawInternal(screenX, screenY, tile, corner) {}

    //    inline int ConnectionIndex(bool connectNorth, bool connectEast, bool connectSouth, bool connectWest) {
    ConnectionIndex(connectNorth, connectEast, connectSouth, connectWest) {
        let index = 0;
        if (connectNorth) index += 8;
        if (connectNorth !== connectSouth) index += 4;
        if (connectWest) index += 2;
        if (connectEast !== connectWest) index += 1;
        return index;
    }

    // static boost.array < short, 256 > BuildExtendedConnectionLookupTable() {
    BuildExtendedConnectionLookupTable() {
            /*boost.array < short, 15 > */
            let lookupTable4Sides = [
                34, // None
                42, // NE
                44, // SE
                32, // NE + SE
                43, // SW
                46, // NE + SW
                24, // SE + SW
                22, // NE + SE + SW
                41, // NW
                29, // NE + NW
                45, // SE + NW
                27, // NE + SE + NW
                33, // SW + NW
                28, // NE + SW + NW
                23 // SE + SW + NW
            ];
            /**boost.array < short, 12 > */
            let lookupTable3Sides = [
                19, // !N, !SE + !SW
                17, // !N, !SW
                18, // !N, !SE
                35, // !E, !SW + !NW
                25, // !E, !NW
                30, // !E, !SW
                39, // !S, !NE + !NW
                37, // !S, !NW
                38, // !S, !NE
                31, // !W, !NE + !SE
                26, // !W, !SE
                21 // !W, !NE		
            ];

            /**boost.array < short, 256 >*/
            result;
            for (let i = 0; i < 256; i++) {
                let connectN = i & 0x1;
                let connectE = i & 0x2;
                let connectS = i & 0x4;
                let connectW = i & 0x8;
                let connectNE = i & 0x10;
                let connectSE = i & 0x20;
                let connectSW = i & 0x40;
                let connectNW = i & 0x80;

                if ((connectN && connectE && !connectNE) ||
                    (connectE && connectS && !connectSE) ||
                    (connectS && connectW && !connectSW) ||
                    (connectW && connectN && !connectNW)) {
                    let sides = ((connectN) ? 1 : 0) + ((connectS) ? 1 : 0) + ((connectE) ? 1 : 0) + ((connectW) ? 1 : 0);

                    if (sides === 4) {
                        let cornerScore = ((connectNE) ? 1 : 0) + ((connectSE) ? 2 : 0) + ((connectSW) ? 4 : 0) + ((connectNW) ? 8 : 0);
                        result[i] = lookupTable4Sides[cornerScore];
                    } else if (sides === 3) {
                        if (!connectN) {
                            result[i] = lookupTable3Sides[(connectSE ? 1 : 0) + (connectSW ? 2 : 0)];
                        } else if (!connectE) {
                            result[i] = lookupTable3Sides[3 + (connectSW ? 1 : 0) + (connectNW ? 2 : 0)];
                        } else if (!connectS) {
                            result[i] = lookupTable3Sides[6 + (connectNE ? 1 : 0) + (connectNW ? 2 : 0)];
                        } else {
                            result[i] = lookupTable3Sides[9 + (connectNE ? 1 : 0) + (connectSE ? 2 : 0)];
                        }
                    } else {
                        let index = 16;
                        if (connectW) index += 4;
                        if (connectN) index += 20;
                        result[i] = index;
                    }
                } else {
                    result[i] = ConnectionIndex(connectN, connectE, connectS, connectW);
                }
            }
            return result;
        }
        /**static boost.array < short, 256 >*/

    lookupTable = (BuildExtendedConnectionLookupTable());
    // inline int ExtConnectionIndex(Sprite.ConnectedFunction connected) {
    ExtConnectionIndex(connected) {

        let index = (connected(NORTH) << 0) +
            (connected(EAST) << 1) +
            (connected(SOUTH) << 2) +
            (connected(WEST) << 3) +
            (connected(NORTHEAST) << 4) +
            (connected(SOUTHEAST) << 5) +
            (connected(SOUTHWEST) << 6) +
            (connected(NORTHWEST) << 7);
        return lookupTable[index];
    }

    // inline int SecondLayerConnectionIndex(int vert, int horiz, int corner) {
    SecondLayerConnectionIndex(vert, horiz, corner) {
        /**static boost.array < short, 27 > */
        let lookupTable = [

            // Vert Layer, Horiz Layer, Corner Layer
            5, // 0         , 0          , 0
            5, // 0         , 0          , 1
            5, // 0         , 0          , 2
            6, // 1         , 0          , 0
            6, // 1         , 0          , 1
            6, // 1         , 0          , 2
            7, // 2         , 0          , 0
            7, // 2         , 0          , 1
            7, // 2         , 0          , 2
            8, // 0         , 1          , 0
            8, // 0         , 1          , 1
            8, // 0         , 1          , 2
            10, // 1         , 1          , 0
            11, // 1         , 1          , 1
            11, // 1         , 1          , 2
            12, // 2         , 1          , 0
            13, // 2         , 1          , 1
            13, // 2         , 1          , 2
            9, // 0         , 2          , 0
            9, // 0         , 2          , 1
            9, // 0         , 2          , 2
            14, // 1         , 2          , 0
            15, // 1         , 2          , 1
            15, // 1         , 2          , 2
            16, // 2         , 2          , 0
            17, // 2         , 2          , 1
            18, // 2         , 2          , 2

        ];
        return lookupTable[corner + vert * 3 + horiz * 9];
    }

}