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


/*******************/
// TileSetTexture
//
// Encapsulates a texture containing equally-sized
// tiles, allowing them to be drawn by an index. The index
// is row wise (i.e. left to right, top to bottom)
/******************/
class TileSetTexture {
    tileWidth = 0;
    tileHeight = 0;
    tileXDim = 0;
    tileYDim = 0;
    tileCount = 0;
    /**boost.shared_ptr<SDL_Surface> */
    tiles = [];
    //public extends 

    //private:

    /**
    	explicit TileSetTexture(boost.filesystem.path path, int tileWidth, int tileHeight);

    TileSetTexture.TileSetTexture(boost.filesystem.path path, int tileW, int tileH)*/
    constructor(path, tileW, tileH) {
        tileWidth = (tileW);
        tileHeight = (tileH);
        /**SDL_Surface * */
        let temp = IMG_Load(path.string().c_str());
        if (temp !== null) {
            tiles = boost.shared_ptr < SDL_Surface > (SDL_DisplayFormatAlpha(temp), SDL_FreeSurface);
            SDL_FreeSurface(temp);
        }
        if (tiles) {
            tileXDim = (tiles.w / tileWidth);
            tileYDim = (tiles.h / tileHeight);
            tileCount = tileXDim * tileYDim;
        } else {
            LOG(SDL_GetError());
            tileCount = 0;
        }
    }



    Count() {
        return tileCount;
    }


    /* Be aware that DrawTile and DrawTileCorner both propagate
       SDL_BlitSurface semantics of modifying the dstRect reference to
       store the final blit rectangle:

         http://sdl.beuc.net/sdl.wiki/SDL_BlitSurface
      
       Client code should be careful to do a value copy of the
       SDL_Rect if they don't want modifications to be propagated.
     */
    // void DrawTile(int tile, SDL_Surface * dst, SDL_Rect * dstRect) const;
    // void DrawTileCorner(int tile, Corner corner, SDL_Surface * dst, SDL_Rect * dstRect) const;
    // dstRect may be modified by BlitSurface; this is documented
    DrawTile(tile, dst, dstRect) {
        if (tile < tileCount) {
            let xCoord = tile % tileXDim;
            let yCoord = tile / tileXDim;
            let srcRect = [
                static_cast < Sint16 > (xCoord * tileWidth),
                static_cast < Sint16 > (yCoord * tileHeight),
                static_cast < Uint16 > (tileWidth),
                static_cast < Uint16 > (tileHeight)
            ];
            SDL_BlitSurface(tiles.get(), srcRect, dst, dstRect);
        }
    }

    // dstRect may be modified by BlitSurface; this is documented
    // void TileSetTexture.DrawTileCorner(int tile, Corner corner, SDL_Surface * dst, SDL_Rect * dstRect) const {
    DrawTileCorner(tile, corner, dst, dstRect) {
        if (tile < tileCount) {
            let xCoord = tile % tileXDim;
            let yCoord = tile / tileXDim;
            let halfWidth = tileWidth >> 1;
            let halfHeight = tileHeight >> 1;
            let srcRect = [
                static_cast < Sint16 > (xCoord * tileWidth),
                static_cast < Sint16 > (yCoord * tileHeight),
                static_cast < Uint16 > (halfWidth),
                static_cast < Uint16 > (halfHeight)
            ];

            dstRect.h = halfHeight;
            if (corner & 0x1) {
                srcRect.x += halfWidth;
                dstRect.x += halfWidth;
                srcRect.w = tileWidth - halfWidth;
                dstRect.w = tileWidth - halfWidth;
            } else {
                dstRect.w = halfWidth;
            }
            if (corner & 0x2) {
                srcRect.y += halfHeight;
                dstRect.y += halfHeight;
                srcRect.h = tileHeight - halfHeight;
                dstRect.h = tileHeight - halfHeight;
            } else {
                dstRect.h = halfHeight;
            }

            SDL_BlitSurface(tiles.get(), srcRect, dst, dstRect);
        }
    }

    // boost.shared_ptr < SDL_Surface > GetInternalSurface();
    GetInternalSurface() {
        return tiles;
    }
}