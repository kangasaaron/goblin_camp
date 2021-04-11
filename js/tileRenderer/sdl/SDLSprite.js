/* Copyright 2011 Ilkka Halila
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


/****************/
// SDLSprite
// Description of a single tile that can be drawn. 
// Supports animation and connection maps in addition to just single tiles.
/****************/
class SDLSprite extends Sprite {
    /**SDLTilesetRenderer * **/
    renderer = null;
    /**boost.shared_ptr<TileSetTexture> **/
    texture = null;

    // void SDLSprite.DrawInternal(int screenX, int screenY, int tile) const
    DrawInternal(screenX, screenY, tile) {
        renderer.DrawSprite(screenX, screenY, texture, tile);
    }

    // void SDLSprite.DrawInternal(int screenX, int screenY, int tile, Corner corner) const {
    DrawInternal(screenX, screenY, tile, corner) {
        renderer.DrawSpriteCorner(screenX, screenY, texture, tile, corner);
    }


    // template < typename IterT > explicit SDLSprite(SDLTilesetRenderer * const renderer, boost.shared_ptr < TileSetTexture > tilesetTexture, IterT start, IterT end, bool connectionMap, int frameRate = 15, int frameCount = 1);
    // template < typename IterT > SDLSprite.SDLSprite(SDLTilesetRenderer * const renderer, boost.shared_ptr < TileSetTexture > tilesetTexture, IterT start, IterT end, bool connectionMap, int frameRate, int frames): Sprite(start, end, connectionMap, frameRate, frames),
    constructor(renderer, tilesetTexture, start, end, connectionMap, frameRate, frames) {
        Sprite(start, end, connectionMap, frameRate, frames);
        renderer(renderer);
        texture(tilesetTexture);
    }

    // explicit SDLSprite(SDLTilesetRenderer * const renderer, boost.shared_ptr < TileSetTexture > tilesetTexture, int tile);
    // SDLSprite.SDLSprite(SDLTilesetRenderer * const renderer, boost.shared_ptr < TileSetTexture > tilesetTexture, int tile): Sprite(tile),
    constructor(renderer, tilesetTexture, tile) {
        Sprite(tile);
        renderer(renderer);
        texture(tilesetTexture);
    }
}