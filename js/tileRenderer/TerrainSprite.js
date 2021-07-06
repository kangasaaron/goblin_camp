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



import "./tileRenderer/Sprite.js"
import "./tileRenderer/PermutationTable.js";
import "./tileRenderer/TileSetTexture.js"

class TerrainSprite {

    //private:	
    /**std.vector < SpritePtr >*/
    sprites = [];
    /**std.vector < SpritePtr >*/
    snowSprites = [];
    /**std.vector < float >*/
    heightSplits = [];
    edge = new SpritePtr();
    snowEdge = new SpritePtr();
    /**std.vector < SpritePtr >*/
    details = [];
    /**std.vector < SpritePtr >*/
    burntDetails = [];
    /**std.vector < SpritePtr >*/
    snowedDetails = [];
    /**std.vector < SpritePtr >*/
    corruptedDetails = [];
    detailsChance = 0;
    corruption = new SpritePtr();
    corruptionOverlay = new SpritePtr();
    burntOverlay = new SpritePtr();

    // Just a little spice to separate details from normal sprites
    static detailPermOffset = 42;
    numSprites = 0;



    constructor(sprite) {
        edge(sprite);
        detailsChance(1);
        numSprites(0)
    }

    // TerrainSprite.TerrainSprite(std.vector < SpritePtr > sprites,
    //         std.vector < SpritePtr > snowSprites,
    //         std.vector < float > heightSplits,
    //         SpritePtr edge,
    //         SpritePtr snowEdge,
    //         std.vector < SpritePtr > details,
    //         std.vector < SpritePtr > burntDetails,
    //         std.vector < SpritePtr > snowedDetails,
    //         std.vector < SpritePtr > corruptedDetails,
    //         int detailsChance,
    //         SpritePtr corruption,
    //         SpritePtr corruptionOverlay,
    //         SpritePtr burntOverlay): 
    constructor(sprites,
        snowSprites,
        heightSplits,
        edge,
        snowEdge,
        details,
        burntDetails,
        snowedDetails,
        corruptedDetails,
        detailsChance,
        corruption,
        corruptionOverlay,
        burntOverlay) {
        sprites(sprites);
        snowSprites(snowSprites);
        heightSplits(heightSplits);
        edge(edge);
        snowEdge(snowEdge);
        details(details);
        burntDetails(burntDetails);
        snowedDetails(snowedDetails);
        corruptedDetails(corruptedDetails);
        detailsChance(detailsChance);
        corruption(corruption);
        corruptionOverlay(corruptionOverlay);
        burntOverlay(burntOverlay);
        numSprites(sprites.size() / (heightSplits.size() + 1))
    }

    Exists() {
        return numSprites > 0 || edge.Exists();
    }

    // Connection map draw
    // void Draw(int screenX, int screenY, Coordinate coords,
    //     const PermutationTable & permTable, float height, Sprite.ConnectedFunction terrainConnected) const;
    // void TerrainSprite.Draw(int screenX, int screenY, Coordinate coords,
    //     const PermutationTable & permTable, float height, Sprite.ConnectedFunction terrainConnected) const {
    Draw(screenX, screenY, coords, permTable, height, terrainConnected) {
        if (Exists()) {
            DrawBaseLayer(screenX, screenY, coords, permTable, height);
            edge.Draw(screenX, screenY, terrainConnected);
            DrawDetails(screenX, screenY, details, coords, permTable);
        }
    }


    // void DrawCorrupted(int screenX, int screenY, Coordinate coords,
    //     const PermutationTable & permTable, float height, Sprite.ConnectedFunction terrainConnected, Sprite.ConnectedFunction corruptConnected) const;
    // void TerrainSprite.DrawCorrupted(int screenX, int screenY, Coordinate coords,
    //     const PermutationTable & permTable, float height, Sprite.ConnectedFunction terrainConnected, Sprite.ConnectedFunction corruptConnected) const {
    DrawCorrupted(screenX, screenY, coords, permTable, height, terrainConnected, corruptConnected) {
            if (Exists()) {
                if (sprites.empty()) {
                    edge.Draw(screenX, screenY, terrainConnected);
                    corruption.Draw(screenX, screenY, corruptConnected);
                } else {
                    DrawBaseLayer(screenX, screenY, coords, permTable, height);
                    corruption.Draw(screenX, screenY, corruptConnected);
                    edge.Draw(screenX, screenY, terrainConnected);
                }
                if (!corruptedDetails.empty()) {
                    DrawDetails(screenX, screenY, corruptedDetails, coords, permTable);
                } else {
                    DrawDetails(screenX, screenY, details, coords, permTable);
                }
            }
        }
        // void DrawBurnt(int screenX, int screenY, Coordinate coords,
        //     const PermutationTable & permTable, float height, Sprite.ConnectedFunction terrainConnected, Sprite.ConnectedFunction burntConnected) const;
        // void TerrainSprite.DrawBurnt(int screenX, int screenY, Coordinate coords,
        //     const PermutationTable & permTable, float height, Sprite.ConnectedFunction terrainConnected, Sprite.ConnectedFunction burntConnected) const {
    DrawBurnt(screenX, screenY, coords, permTable, height, terrainConnected, burntConnected) {
        if (Exists()) {
            DrawBaseLayer(screenX, screenY, coords, permTable, height);
            burntOverlay.Draw(screenX, screenY, burntConnected);
            edge.Draw(screenX, screenY, terrainConnected);
            if (!burntDetails.empty()) {
                DrawDetails(screenX, screenY, burntDetails, coords, permTable);
            } else {
                DrawDetails(screenX, screenY, details, coords, permTable);
            }
        }
    }

    // void DrawSnowed(int screenX, int screenY, Coordinate coords,
    //     const PermutationTable & permTable, float height, Sprite.ConnectedFunction terrainConnected, Sprite.ConnectedFunction snowConnected) const;
    // void TerrainSprite.DrawSnowed(int screenX, int screenY, Coordinate coords,
    //     const PermutationTable & permTable, float height, Sprite.ConnectedFunction terrainConnected, Sprite.ConnectedFunction snowConnected) const {
    DrawSnowed(screenX, screenY, coords, permTable, height, terrainConnected, snowConnected) {
            if (Exists() && (snowSprites.size() > 0 || snowEdge.Exists())) {
                DrawSnowLayer(screenX, screenY, coords, permTable, height, terrainConnected, snowConnected);
                if (!snowedDetails.empty()) {
                    DrawDetails(screenX, screenY, snowedDetails, coords, permTable);
                } else {
                    DrawDetails(screenX, screenY, details, coords, permTable);
                }
            } else {
                Draw(screenX, screenY, coords, permTable, height, terrainConnected);
            }
        }
        // void DrawSnowedAndCorrupted(int screenX, int screenY, Coordinate coords,
        //     const PermutationTable & permTable, float height, Sprite.ConnectedFunction terrainConnected, Sprite.ConnectedFunction snowConnected, Sprite.ConnectedFunction corruptConnected) const;
        // void TerrainSprite.DrawSnowedAndCorrupted(int screenX, int screenY, Coordinate coords,
        //     const PermutationTable & permTable, float height, Sprite.ConnectedFunction terrainConnected, Sprite.ConnectedFunction snowConnected, Sprite.ConnectedFunction corruptConnected) const {
    DrawSnowedAndCorrupted(screenX, screenY, coords, permTable, height, terrainConnected, snowConnected, corruptConnected) {
        if (Exists() && snowSprites.size() > 0) {
            DrawSnowLayer(screenX, screenY, coords, permTable, height, terrainConnected, snowConnected, true, corruptConnected);
            if (!corruptedDetails.empty()) {
                DrawDetails(screenX, screenY, corruptedDetails, coords, permTable);
            } else if (!snowedDetails.empty()) {
                DrawDetails(screenX, screenY, snowedDetails, coords, permTable);
            } else {
                DrawDetails(screenX, screenY, details, coords, permTable);
            }
        } else {
            DrawCorrupted(screenX, screenY, coords, permTable, height, terrainConnected, corruptConnected);
        }
    }

    // void DrawCorruptionOverlay(int screenX, int screenY, Sprite.ConnectedFunction) const;
    // void TerrainSprite.DrawCorruptionOverlay(int screenX, int screenY, Sprite.ConnectedFunction connected) const {
    DrawCorruptionOverlay(screenX, screenY, connected) {
        corruptionOverlay.Draw(screenX, screenY, connected);
    }

    // void DrawBaseLayer(int screenX, int screenY, Coordinate coords, const PermutationTable & permTable, float height) const;
    // void TerrainSprite.DrawBaseLayer(int screenX, int screenY, Coordinate coords, const PermutationTable & permTable, float height) const {
    DrawBaseLayer(screenX, screenY, coords, permTable, height) {
        if (sprites.size() > 0) {
            // Calculate height layer
            let heightLayer = 0;
            for (let i = 0; i < heightSplits.size(); ++i) {
                if (height >= heightSplits[i]) {
                    heightLayer++;
                } else {
                    break;
                }
            }

            // Base Layer
            if (numSprites > 1) {
                sprites[heightLayer * numSprites + permTable.Hash(permTable.Hash(coords.X()) + coords.Y()) % numSprites].Draw(screenX, screenY);
            } else {
                if (sprites[heightLayer].IsConnectionMap()) {
                    sprites[heightLayer].Draw(screenX, screenY, boost.bind(WangConnected, permTable, coords, _1));
                } else {
                    sprites[heightLayer].Draw(screenX, screenY);
                }
            }
        }
    }

    //     void DrawSnowLayer(int screenX, int screenY, Coordinate coords,
    //         const PermutationTable & permTable, float height, Sprite.ConnectedFunction terrainConnected, Sprite.ConnectedFunction snowConnected, bool corrupt = false, Sprite.ConnectedFunction corruptConnect = 0) const;
    //    void TerrainSprite.DrawSnowLayer(int screenX, int screenY, Coordinate coords,
    //         const PermutationTable & permTable, float height, Sprite.ConnectedFunction terrainConnected, Sprite.ConnectedFunction snowConnected, bool corrupt, Sprite.ConnectedFunction corruptConnected) const {
    DrawSnowLayer(screenX, screenY, coords, permTable, height, terrainConnected, snowConnected, corrupt, corruptConnected) {
        // If we don't have a snow edge or entirely connected, just render the snow sprites.
        if ((!snowEdge.Exists() && sprites.size() > 0) || (snowConnected(NORTH) && snowConnected(EAST) && snowConnected(SOUTH) && snowConnected(WEST) && snowConnected(NORTHEAST) && snowConnected(NORTHWEST) && snowConnected(SOUTHEAST) && snowConnected(SOUTHWEST))) {
            if (snowSprites.size() > 1) {
                snowSprites.at(permTable.Hash(permTable.Hash(coords.X()) + coords.Y()) % snowSprites.size()).Draw(screenX, screenY);
            } else if (snowSprites.size() === 1) {
                if (snowSprites[0].IsConnectionMap()) {
                    snowSprites[0].Draw(screenX, screenY, boost.bind(WangConnected, permTable, coords, _1));
                } else {
                    snowSprites.at(0).Draw(screenX, screenY);
                }
            } else {
                // snowEdge is being used to render everything
                snowEdge.Draw(screenX, screenY, snowConnected);
            }
            if (corrupt) {
                corruption.Draw(screenX, screenY, corruptConnected);
            }
        } else {
            DrawBaseLayer(screenX, screenY, coords, permTable, height);
            edge.Draw(screenX, screenY, terrainConnected);
            snowEdge.Draw(screenX, screenY, snowConnected);
            if (sprites.empty()) {
                snowEdge.Draw(screenX, screenY, snowConnected);
                if (corrupt) {
                    corruption.Draw(screenX, screenY, corruptConnected);
                }
                edge.Draw(screenX, screenY, terrainConnected);
            } else {
                DrawBaseLayer(screenX, screenY, coords, permTable, height);
                snowEdge.Draw(screenX, screenY, snowConnected);
                if (corrupt) {
                    corruption.Draw(screenX, screenY, corruptConnected);
                }
                edge.Draw(screenX, screenY, terrainConnected);
            }
        }
    }

    // void DrawDetails(int screenX, int screenY,
    //     const std.vector < SpritePtr > & detailSprites, Coordinate coords,
    //         const PermutationTable & permTable) const;
    // void TerrainSprite.DrawDetails(int screenX, int screenY,
    //     const std.vector < SpritePtr > & detailSprites, Coordinate coords,
    //         const PermutationTable & permTable) const {
    DrawDetails(screenX, screenY, detailSprites, coords, permTable) {
        if (detailsChance !== 0 && !detailSprites.empty()) {
            let detailChoice = permTable.Hash(permTable.Hash(coords.X() + detailPermOffset) + coords.Y()) % (detailsChance * detailSprites.size());
            let detailIndex = static_cast < size_t > (detailChoice);
            if (detailIndex < detailSprites.size()) {
                detailSprites[detailIndex].Draw(screenX, screenY);
            }
        }
    }

    SetCorruption(sprite) {
        corruption = sprite;
    }
    SetCorruptionOverlay(sprite) {
        corruptionOverlay = sprite;
    }

    // WangConnected(const PermutationTable * permTable, Coordinate pos, Direction dir) {
    WangConnected(permTable, pos, dir) {
        switch (dir) {
            case NORTH:
                return (permTable.Hash(permTable.Hash(pos.X()) + pos.Y()) & 0x1);
            case EAST:
                return (permTable.Hash((pos.X() + 1) + permTable.Hash(2 * pos.Y())) & 0x1);
            case SOUTH:
                return (permTable.Hash(permTable.Hash(pos.X()) + pos.Y() + 1) & 0x1);
            case WEST:
                return (permTable.Hash(pos.X() + permTable.Hash(2 * pos.Y())) & 0x1);
            default:
                return false;
        }
    }

}