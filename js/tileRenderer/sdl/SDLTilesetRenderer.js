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


import "tileRenderer/TileSetRenderer.js"
import "SDL.h "

class SDLTilesetRenderer extends TilesetRenderer {

    /**boost.shared_ptr < SDL_Surface > */
    mapSurface = null;

    // SDL_Rect CalcDest(int screenX, int screenY) const {
    CalcDest(screenX, screenY) {
        /**SDL_Rect*/
        let dstRect = [
            static_cast < Sint16 > (tileSet.TileWidth() * (screenX) + mapOffsetX + startPixelX),
            static_cast < Sint16 > (tileSet.TileHeight() * (screenY) + mapOffsetY + startPixelY),
            static_cast < Uint16 > (tileSet.TileWidth()),
            static_cast < Uint16 > (tileSet.TileHeight())
        ];
        return dstRect;
    }



    // boost.shared_ptr < TilesetRenderer > CreateSDLTilesetRenderer(int width, int height, TCODConsole * the_console, std.string tilesetName) {
    CreateSDLTilesetRenderer(width, height, the_console, tilesetName) {
        /**boost.shared_ptr < SDLTilesetRenderer > */
        let sdlRenderer = (new SDLTilesetRenderer(width, height, the_console));
        /**boost.shared_ptr < TileSet >*/
        let tileset = TileSetLoader.LoadTileSet(sdlRenderer, tilesetName);
        if (tileset.get() !== 0 && sdlRenderer.SetTileset(tileset)) {
            return sdlRenderer;
        }
        // return boost.shared_ptr < TilesetRenderer > ();
        return null;
    }

    // explicit SDLTilesetRenderer(int screenWidth, int screenHeight, TCODConsole * mapConsole = 0);
    // SDLTilesetRenderer.SDLTilesetRenderer(int screenWidth, int screenHeight, TCODConsole * mapConsole): 
    constructor(screenWidth, screenHeight, mapConsole = 0) {
        TilesetRenderer(screenWidth, screenHeight, mapConsole);

        TCODSystem.registerSDLRenderer(this /*, translucentUI*/ ); // FIXME
        /**Uint32*/
        let rmask, gmask, bmask, amask;
        if (SDL_BYTEORDER === SDL_BIG_ENDIAN) {
            rmask = 0xff000000;
            gmask = 0x00ff0000;
            bmask = 0x0000ff00;
            amask = 0x000000ff;
        } else /*#else */ {
            rmask = 0x000000ff;
            gmask = 0x0000ff00;
            bmask = 0x00ff0000;
            amask = 0xff000000;
        } /*#endif*/
        //SDL_Surface * 
        let temp = SDL_CreateRGBSurface(0, MathEx.NextPowerOfTwo(screenWidth), MathEx.NextPowerOfTwo(screenHeight), 32, rmask, gmask, bmask, amask);
        SDL_SetAlpha(temp, 0, SDL_ALPHA_OPAQUE);
        mapSurface = (SDL_DisplayFormat(temp), SDL_FreeSurface);
        SDL_FreeSurface(temp);

        if (!mapSurface) {
            LOG(SDL_GetError());
        }
    }

    destructor() {
        TCODSystem.registerSDLRenderer(0);
    }

    // SpritePtr CreateSprite(boost.shared_ptr < TileSetTexture > tilesetTexture, int tile);    
    // SpritePtr SDLTilesetRenderer.CreateSprite(boost.shared_ptr < TileSetTexture > tilesetTexture, int tile) {
    CreateSprite(tilesetTexture, tile) {
        return SpritePtr(new SDLSprite(this, tilesetTexture, tile));
    }

    // SpritePtr CreateSprite(boost.shared_ptr < TileSetTexture > tilesetTexture,
    //     const std.vector < int > & tiles, bool connectionMap, int frameRate = 15, int frameCount = 1);
    //     SpritePtr SDLTilesetRenderer.CreateSprite(boost.shared_ptr < TileSetTexture > tilesetTexture,
    //         const std.vector < int > & tiles, bool connectionMap, int frameRate, int frameCount) {
    CreateSprite(tilesetTexture, tiles, connectionMap, frameRate = 15, frameCount = 1) {
        return SpritePtr(new SDLSprite(this, tilesetTexture, tiles.begin(), tiles.end(), connectionMap, frameRate, frameCount));
    }

    // void DrawSprite(int screenX, int screenY, boost.shared_ptr < TileSetTexture > texture, int tile) const;
    // void SDLTilesetRenderer.DrawSprite(int screenX, int screenY, boost.shared_ptr < TileSetTexture > texture, int tile) const {
    DrawSprite(screenX, screenY, texture, tile) {
        let dstRect = CalcDest(screenX, screenY);
        texture.DrawTile(tile, mapSurface.get(), dstRect);
    }

    // void DrawSpriteCorner(int screenX, int screenY, boost.shared_ptr < TileSetTexture > texture, int tile, Corner corner) const;
    // void SDLTilesetRenderer.DrawSpriteCorner(int screenX, int screenY, boost.shared_ptr < TileSetTexture > texture, int tile, Corner corner) const {
    DrawSpriteCorner(screenX, screenY, texture, tile, corner) {
        let dstRect = CalcDest(screenX, screenY);
        texture.DrawTileCorner(tile, corner, mapSurface.get(), dstRect);
    }

    // void render(void * sdlSurface); // FIXME: inherited a virtual from ITCODSDLRenderer
    // FIXME
    // void SDLTilesetRenderer.render(void * surf) {}

    // void render(void * sdlSurface, void * sdlScreen);
    // void SDLTilesetRenderer.render(void * surf, void * sdl_screen) {
    render(surf, sdl_screen) {
        /**SDL_Surface * */
        let tcod = surf;
        /**SDL_Surface * */
        let screen = sdl_screen;

        let screenWidth = GetScreenWidth();
        let screenHeight = GetScreenHeight();
        let keyColor = GetKeyColor();

        let srcRect = [
            0,
            0,
            static_cast < Uint16 > (screenWidth),
            static_cast < Uint16 > (screenHeight)
        ];
        let dstRect = srcRect;

        if (translucentUI) {
            // Uint32 
            let keyColorVal = SDL_MapRGBA(tcod.format, keyColor.r, keyColor.g, keyColor.b, 255);
            if (SDL_MUSTLOCK(tcod)) {
                SDL_LockSurface(tcod);
            }
            for (let x = 0; x < screenWidth; ++x) {
                for (let y = 0; y < screenHeight; ++y) {
                    setPixelAlpha(tcod, x, y, keyColorVal);
                }
            }
            if (SDL_MUSTLOCK(tcod)) {
                SDL_UnlockSurface(tcod);
            }
        } else {
            SDL_SetColorKey(tcod, SDL_SRCCOLORKEY, SDL_MapRGBA(tcod.format, keyColor.r, keyColor.g, keyColor.b, 255));
        }
        SDL_LowerBlit(tcod, srcRect, mapSurface.get(), dstRect);
        SDL_LowerBlit(mapSurface.get(), srcRect, screen, dstRect);
    }
    SetTranslucentUI(translucent) {
            if (translucent !== translucentUI) {
                TCODSystem.registerSDLRenderer(this /*, translucent*/ ); // FIXME
            }
            translucentUI = translucent;
        }
        //protected:
    PreDrawMap(viewportX, viewportY, viewportW, viewportH) {
        let viewportRect = new SDL_Rect();
        viewportRect.x = viewportX;
        viewportRect.y = viewportY;
        viewportRect.w = viewportW;
        viewportRect.h = viewportH;
        SDL_SetClipRect(mapSurface.get(), viewportRect);
    }
    PostDrawMap() {
        SDL_SetClipRect(mapSurface.get(), 0);
    }
    DrawNullTile(screenX, screenY) {
        let dstRect = CalcDest(screenX, screenY);
        SDL_FillRect(mapSurface.get(), dstRect, 0);
    }


    // namespace {
    // inline void setPixelAlpha(SDL_Surface * surface, int x, int y, Uint32 keyColor) {
    setPixelAlpha(surface, x, y, keyColor) {
        let fmt = surface.format;
        let bpp = fmt.BytesPerPixel;
        if (bpp !== 4) return;

        let p = (surface.pixels + y * surface.pitch) + x;
        let c = (p | fmt.Amask);
        if (c === keyColor) {
            p = p & ~fmt.Amask;
        } else if (c === fmt.Amask) {
            p = (p & ~fmt.Amask) | (128 << fmt.Ashift);
        }
    }

    // }

}