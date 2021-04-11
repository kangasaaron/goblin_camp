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


import "tileRenderer/TileSetRenderer.js"
import "tileRenderer/TileSetTexture.js"
import "tileRenderer/ogl/OGLViewportLayer.js"
import "boost/multi_array.js"

class ConsoleTexureTypes extends Enum { // enum
    static Character;
    static ForeCol;
    static BackCol;
    static ConsoleTextureTypesCount;
}
ConsoleTexureTypes.enumify();

class RawTileData {
    /**unsigned int */
    tile = 0;
    /**boost.shared_ptr < TileSetTexture > */
    texture = null;
};


class RenderTile {
    /**int*/
    x = 0;
    /**int*/
    y = 0;
    /**unsigned int*/
    tile = 0;

    // RenderTile(int x, int y, unsigned int tile)
    constructor(x, y, tile) {
        x(x);
        y(y);
        tile(tile);
    }
};
// FIXME
// class TCODLIB_API ITCODOGLRenderer {
//     public extends
//     virtual~ITCODOGLRenderer() {}
//     virtual void render() = 0;
// };

class OGLTilesetRenderer extends TilesetRenderer {
    //private:
    /**std.vector < RawTileData > */
    rawTiles = [];
    // typedef std.vector < RawTileData > .iterator rawTileIterator;

    // Tiles texture
    /**boost.shared_ptr < const unsigned int > tilesTexture;*/
    tilesTexture = null;
    /**unsigned int */
    tilesTextureW = 0;
    /**unsigned int */
    tilesTextureH = 0;

    // UI Font
    /**boost.shared_ptr < const unsigned int > */
    fontTexture = null;
    /**unsigned int*/
    fontCharW = 0;
    /**unsigned int*/
    fontCharH = 0;
    /**unsigned int*/
    fontTexW = 0;
    /**unsigned int*/
    fontTexH = 0;

    // Console Rendering
    /**boost.shared_ptr < const unsigned int > */
    the_consoleProgram = null;

    /**boost.array < boost.shared_ptr <const unsigned int > , ConsoleTextureTypesCount > */
    the_consoleTextures = [];
    /**unsigned int */
    the_consoleTexW = 0;
    /**unsigned int */
    the_consoleTexH = 0;
    /**boost.array < std.vector < unsigned char > , ConsoleTextureTypesCount >*/
    the_consoleData = [];
    static /**boost.array < unsigned char, ConsoleTextureTypesCount >*/ the_consoleDataAlignment = [];

    // Viewports
    renderInProgress = false;
    static VIEWPORT_LAYERS = 5;
    /**boost.array < ViewportLayer, VIEWPORT_LAYERS >*/
    viewportLayers = [];
    /**boost.array < boost.shared_ptr <const unsigned int > , VIEWPORT_LAYERS >*/
    viewportTextures = [];

    /**std.vector < RenderTile > */
    renderQueue = [];
    viewportW = 0;
    viewportH = 0;
    viewportTexW = 0;
    viewportTexH = 0;
    /**boost.shared_ptr <const unsigned int > */
    viewportProgram = null;

    // explicit OGLTilesetRenderer(int screenWidth, int screenHeight, TCODConsole * mapConsole = 0);
    // OGLTilesetRenderer.OGLTilesetRenderer(int screenWidth, int screenHeight, TCODConsole * mapConsole): TilesetRenderer(screenWidth, screenHeight, mapConsole),
    constructor(screenWidth, screenHeight, mapConsole = 0) {
        TilesetRenderer(screenWidth, screenHeight, mapConsole);
        TCODSystem.registerOGLRenderer(this);

        let rmask = 0,
            gmask = 0,
            bmask = 0,
            amask = 0;
        if (SDL_BYTEORDER == SDL_BIG_ENDIAN) {
            rmask = 0xff000000;
            gmask = 0x00ff0000;
            bmask = 0x0000ff00;
            amask = 0x000000ff;
        } else {
            rmask = 0x000000ff;
            gmask = 0x0000ff00;
            bmask = 0x00ff0000;
            amask = 0xff000000;
        }

        /**boost.shared_ptr < SDL_Surface >*/
        fontSurface = (IMG_Load(Paths.Get(Path.Font).string().c_str()), SDL_FreeSurface);
        fontCharW = fontSurface.w / 16;
        fontCharH = fontSurface.h / 16;
        fontTexW = MathEx.NextPowerOfTwo(fontCharW * 16);
        fontTexH = MathEx.NextPowerOfTwo(fontCharH * 16);

        SDL_SetColorKey(fontSurface.get(), SDL_SRCCOLORKEY, SDL_MapRGB(fontSurface.format, 0, 0, 0));
        boost.shared_ptr < SDL_Surface > tempAlpha(SDL_DisplayFormatAlpha(fontSurface.get()), SDL_FreeSurface);
        SDL_SetAlpha(tempAlpha.get(), 0, SDL_ALPHA_TRANSPARENT);

        boost.shared_ptr < SDL_Surface > temp(SDL_CreateRGBSurface(SDL_SWSURFACE, fontTexW, fontTexH, 32, bmask, gmask, rmask, amask), SDL_FreeSurface);
        SDL_BlitSurface(tempAlpha.get(), null, temp.get(), null);

        fontTexture = CreateOGLTexture();
        glBindTexture(GL_TEXTURE_2D, fontTexture);
        SDL_LockSurface(temp.get());

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, temp.w, temp.h, 0, GL_BGRA, GL_UNSIGNED_BYTE, temp.pixels);
        SDL_UnlockSurface(temp.get());

        the_consoleTexW = MathEx.NextPowerOfTwo(screenWidth / fontCharW);
        the_consoleTexH = MathEx.NextPowerOfTwo(screenHeight / fontCharH);
    }

    destructor() {
        TCODSystem.registerOGLRenderer(0);
    }



    // SpritePtr CreateSprite(boost.shared_ptr < TileSetTexture > tilesetTexture, int tile);
    //     SpritePtr OGLTilesetRenderer.CreateSprite(boost.shared_ptr < TileSetTexture > tilesetTexture, int tile) {
    CreateSprite(tilesetTexture, tile) {
        if (tilesetTexture.Count() <= tile) {
            return SpritePtr();
        }
        let rawTile = new RawTileData(tile, tilesetTexture);
        let existing = std.find(rawTiles.begin(), rawTiles.end(), rawTile);
        if (existing != rawTiles.end()) {
            return SpritePtr(new OGLSprite(this, existing - rawTiles.begin()));
        } else {
            let id = (rawTiles.size());
            rawTiles.push_back(rawTile);
            return SpritePtr(new OGLSprite(this, id));
        }
    }

    // SpritePtr CreateSprite(boost.shared_ptr < TileSetTexture > tilesetTexture, const std.vector < int > & tiles, bool connectionMap, int frameRate = 15, int frameCount = 1);
    // SpritePtr OGLTilesetRenderer.CreateSprite(boost.shared_ptr < TileSetTexture > tilesetTexture,const std.vector < int > & tiles, bool connectionMap, int frameRate, int frameCount) {
    CreateSprite(tilesetTexture, tiles, connectionMap, frameRate = 15, frameCount = 1) {
        if (tiles.empty())
            return SpritePtr();

        /**std.vector < int >*/
        let tileIds = [];
        for (let tileIter = tiles.begin(); tileIter != tiles.end(); ++tileIter) {
            if (tileIter < tilesetTexture.Count()) {
                let rawTile = new RawTileData(tileIter, tilesetTexture);
                let existing = std.find(rawTiles.begin(), rawTiles.end(), rawTile);
                if (existing != rawTiles.end()) {
                    tileIds.push_back(existing - rawTiles.begin());
                } else {
                    tileIds.push_back(rawTiles.size());
                    rawTiles.push_back(rawTile);
                }
            } else {
                tileIds.push_back(-1);
            }
        }
        return SpritePtr(new OGLSprite(this, tileIds.begin(), tileIds.end(), connectionMap, frameRate, frameCount));
    }


    DrawSprite(screenX, screenY, tile) {
        DrawSpriteCorner(screenX, screenY, tile, TopLeft);
        DrawSpriteCorner(screenX, screenY, tile, TopRight);
        DrawSpriteCorner(screenX, screenY, tile, BottomLeft);
        DrawSpriteCorner(screenX, screenY, tile, BottomRight);
    };

    // void DrawSpriteCorner(int screenX, int screenY, int tile, Corner corner);
    // void OGLTilesetRenderer.DrawSpriteCorner(int screenX, int screenY, int tile, Corner corner) {
    DrawSpriteCorner(screenX, screenY, tile, corner) {
        let x = 2 * screenX + (corner & 0x1);
        let y = 2 * screenY + ((corner & 0x2) >> 1);
        for (let i = 0; i < viewportLayers.size(); ++i) {
            if (!viewportLayers[i].IsTileSet(x, y)) {
                viewportLayers[i].SetTile(x, y, tile);
                return;
            }
        }
        renderQueue.push_back(new RenderTile(x, y, tile));
    }
    render() {
        if (renderInProgress) {
            RenderViewport();
            renderInProgress = false;
        } else {
            glClearColor(0, 0, 0, 255);
            glClear(GL_COLOR_BUFFER_BIT);
        }
        RenderConsole();
    }

    //protected:
    // void PreDrawMap(int viewportX, int viewportY, int viewportW, int viewportH);
    // void OGLTilesetRenderer.PreDrawMap(int viewportX, int viewportY, int viewportW, int viewportH) {
    PreDrawMap(viewportX, viewportY, viewportW, viewportH) {
        if (renderInProgress) {
            RenderViewport();
        } else {
            glClearColor(0, 0, 0, 255);
            glClear(GL_COLOR_BUFFER_BIT);
        }
        for (let i = 0; i < viewportLayers.size(); ++i) {
            viewportLayers[i].Reset();
        }

        renderQueue.clear();
        renderInProgress = true;
    }

    PostDrawMap() {}
    DrawNullTile(screenX, screenY) {}

    TilesetChanged() {
        if (!AssembleTextures()) {
            return false;
        }

        viewportW = CeilToInt.convert(boost.numeric_cast < float > (GetScreenWidth()) / tileSet.TileWidth()) + 2;
        viewportH = CeilToInt.convert(boost.numeric_cast < float > (GetScreenHeight()) / tileSet.TileHeight()) + 2;

        // Twice the viewport size, so we can have different corners
        for (let i = 0; i < viewportLayers.size(); ++i) {
            viewportLayers[i] = ViewportLayer(2 * viewportW, 2 * viewportH);
        }

        InitialiseConsoleTextures();

        if (TCODSystem.getRenderer() == TCOD_RENDERER_GLSL) {
            viewportTexW = MathEx.NextPowerOfTwo(2 * viewportW);
            viewportTexH = MathEx.NextPowerOfTwo(2 * viewportH);
            for (let i = 0; i < viewportTextures.size(); ++i) {
                viewportTextures[i] = CreateOGLTexture();
                glBindTexture(GL_TEXTURE_2D, viewportTextures[i]);

                glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
                glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
                glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, viewportTexW, viewportTexH, 0, GL_RGBA, GL_UNSIGNED_BYTE, 0);
                CheckGL_Error("glTexImage2D", __FILE__, __LINE__);
            }

            InitialiseConsoleShaders();

            viewportProgram = CreateOGLShaderProgram(tiles_vertex_shader, tiles_frag_shader);
            if (!viewportProgram) {
                LOG("Failed to load tiles shader");
                return false;
            }
        }
        return true;
    }

    InitialiseConsoleTextures() {
        /* Generate Textures */
        for (let i = 0; i < ConsoleTextureTypesCount; ++i) {
            if (TCODSystem.getRenderer() == TCOD_RENDERER_GLSL || i == BackCol) {
                the_consoleTextures[i] = CreateOGLTexture();
            }
            the_consoleData[i] = (the_consoleDataAlignment[i] * tcodConsole.getWidth() * tcodConsole.getHeight());
        }

        /* BackCol Texture */
        glBindTexture(GL_TEXTURE_2D, the_consoleTextures[BackCol]);

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, the_consoleTexW, the_consoleTexH, 0, GL_RGBA, GL_UNSIGNED_BYTE, 0);

        glBindTexture(GL_TEXTURE_2D, 0);

        if (TCODSystem.getRenderer() == TCOD_RENDERER_GLSL) {
            /* Character Texture */
            glBindTexture(GL_TEXTURE_2D, the_consoleTextures[Character]);

            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
            glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, the_consoleTexW, the_consoleTexH, 0, GL_LUMINANCE, GL_UNSIGNED_BYTE, 0);

            /* ForeCol Texture */
            glBindTexture(GL_TEXTURE_2D, the_consoleTextures[ForeCol]);

            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

            glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, the_consoleTexW, the_consoleTexH, 0, GL_RGB, GL_UNSIGNED_BYTE, 0);
        }
        return true;
    }

    InitialiseConsoleShaders() {
        the_consoleProgram = CreateOGLShaderProgram(TCOD_con_vertex_shader, TCOD_con_pixel_shader);
        if (!the_consoleProgram) return false;

        return true;
    }

    RenderViewport() {
        glUseProgramObjectARB(0);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        glEnable(GL_CLIP_PLANE0);
        glEnable(GL_CLIP_PLANE1);
        glEnable(GL_CLIP_PLANE2);
        glEnable(GL_CLIP_PLANE3);

        /**GLdouble*/
        let eqn0 = [-1.0, 0.0, 0.0, ((startPixelX + pixelW) / fontCharW)];
        /**GLdouble*/
        let eqn1 = [1.0, 0.0, 0.0, -(startPixelX / fontCharW)];
        /**GLdouble*/
        let eqn2 = [0.0, -1.0, 0.0, ((GetScreenHeight() - startPixelY) / fontCharH)];
        /**GLdouble*/
        let eqn3 = [0.0, 1.0, 0.0, -((GetScreenHeight() - startPixelY - pixelH) / fontCharH)];

        glClipPlane(GL_CLIP_PLANE0, eqn0);
        glClipPlane(GL_CLIP_PLANE1, eqn1);
        glClipPlane(GL_CLIP_PLANE2, eqn2);
        glClipPlane(GL_CLIP_PLANE3, eqn3);

        // currently unused
        // float texCoordTileW = 0.5f / tilesTextureW;
        // float texCoordTileH = 0.5f / tilesTextureH;

        // float offsetX = (float)mapOffsetX + startPixelX;
        // float offsetY = (float)mapOffsetY + startPixelY;

        if (TCODSystem.getRenderer() == TCOD_RENDERER_GLSL) {
            RenderGLSLViewport();
        } else {
            RenderOGLViewport();
        }

        glDisable(GL_CLIP_PLANE0);
        glDisable(GL_CLIP_PLANE1);
        glDisable(GL_CLIP_PLANE2);
        glDisable(GL_CLIP_PLANE3);
        glDisable(GL_BLEND);
        glBindTexture(GL_TEXTURE_2D, 0);
    }

    RenderOGLViewport() {
        let texCoordTileW = 0.5 / tilesTextureW;
        let texCoordTileH = 0.5 / tilesTextureH;

        let sizeX = 0.5 * tileSet.TileWidth();
        let sizeY = 0.5 * tileSet.TileHeight();

        let offsetX = (mapOffsetX + startPixelX);
        let offsetY = (mapOffsetY + startPixelY);

        let factorX = 1.0 / fontCharW;
        let factorY = 1.0 / fontCharH;

        glBindTexture(GL_TEXTURE_2D, tilesTexture);
        CheckGL_Error("glBindTexture", __FILE__, __LINE__);
        glBegin(GL_QUADS);
        glColor4f(1.0, 1.0, 1.0, 1.0);
        for (let x = 0; x < 2 * viewportW; ++x) {
            for (let y = 0; y < 2 * viewportH; ++y) {
                for (let i = 0; i < viewportLayers.size(); ++i) {
                    if (viewportLayers[i].IsTileSet(x, y)) {
                        /**unsigned int*/
                        let srcX = 2 * (viewportLayers[i].GetTile(x, y) % tilesTextureW);
                        /**unsigned int*/
                        let srcY = 2 * (viewportLayers[i].GetTile(x, y) / tilesTextureH);
                        srcX += (x & 0x1);
                        srcY += (y & 0x1);
                        glTexCoord2f(srcX * texCoordTileW, srcY * texCoordTileH);
                        glVertex2f(factorX * (offsetX + x * sizeX), factorY * (y * sizeY + offsetY));
                        glTexCoord2f(srcX * texCoordTileW, (srcY + 1) * texCoordTileH);
                        glVertex2f(factorX * (offsetX + x * sizeX), factorY * ((y + 1) * sizeY + offsetY));
                        glTexCoord2f((srcX + 1) * texCoordTileW, (srcY + 1) * texCoordTileH);
                        glVertex2f(factorX * (offsetX + (x + 1) * sizeX), factorY * ((y + 1) * sizeY + offsetY));
                        glTexCoord2f((srcX + 1) * texCoordTileW, srcY * texCoordTileH);
                        glVertex2f(factorX * (offsetX + (x + 1) * sizeX), factorY * (y * sizeY + offsetY));
                    }
                }
            }
        }
        glEnd();
        CheckGL_Error("Render Viewport Layers", __FILE__, __LINE__);

        glBindTexture(GL_TEXTURE_2D, tilesTexture);
        CheckGL_Error("glBindTexture", __FILE__, __LINE__);

        glBegin(GL_QUADS);
        glColor4f(1.0, 1.0, 1.0, 1.0);
        for (let queuedTile = renderQueue.begin(); queuedTile != renderQueue.end(); ++queuedTile) {
            /**unsigned int */
            let srcX = 2 * (queuedTile.tile % tilesTextureW);
            /**unsigned int */
            let srcY = 2 * (queuedTile.tile / tilesTextureH);
            srcX += (queuedTile.x & 0x1);
            srcY += (queuedTile.y & 0x1);
            glTexCoord2f(srcX * texCoordTileW, srcY * texCoordTileH);
            glVertex2f(factorX * (offsetX + queuedTile.x * sizeX), factorY * (queuedTile.y * sizeY + offsetY));
            glTexCoord2f(srcX * texCoordTileW, (srcY + 1) * texCoordTileH);
            glVertex2f(factorX * (offsetX + queuedTile.x * sizeX), factorY * ((queuedTile.y + 1) * sizeY + offsetY));
            glTexCoord2f((srcX + 1) * texCoordTileW, (srcY + 1) * texCoordTileH);
            glVertex2f(factorX * (offsetX + (queuedTile.x + 1) * sizeX), factorY * ((queuedTile.y + 1) * sizeY + offsetY));
            glTexCoord2f((srcX + 1) * texCoordTileW, srcY * texCoordTileH);
            glVertex2f(factorX * (offsetX + (queuedTile.x + 1) * sizeX), factorY * (queuedTile.y * sizeY + offsetY));
        }
        glEnd();
        CheckGL_Error("render", __FILE__, __LINE__);
    }
    RenderGLSLViewport() {
            for (let i = 0; i < viewportLayers.size(); ++i) {
                glBindTexture(GL_TEXTURE_2D, viewportTextures[i]);
                glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, 2 * viewportW, 2 * viewportH, GL_RGBA, GL_UNSIGNED_BYTE, viewportLayers[i]);
            }

            let sizeX = 2.0 * viewportW * tileSet.TileWidth() / GetScreenWidth();
            let sizeY = 2.0 * viewportH * tileSet.TileHeight() / GetScreenHeight();

            let startX = 2.0 * startPixelX / GetScreenWidth();
            let startY = 2.0 * startPixelY / GetScreenHeight();

            let vertOffsetX = 2.0 * mapOffsetX / GetScreenWidth();
            let vertOffsetY = 2.0 * mapOffsetY / GetScreenHeight();

            glUseProgramObjectARB(viewportProgram);

            glUniform2fARB(glGetUniformLocationARB(viewportProgram, "termsize"), viewportW, viewportH);
            glUniform2fARB(glGetUniformLocationARB(viewportProgram, "termcoef"), 2.0 / viewportTexW, 2.0 / viewportTexH);
            glUniform1fARB(glGetUniformLocationARB(viewportProgram, "tilew"), tilesTextureW);
            glUniform2fARB(glGetUniformLocationARB(viewportProgram, "tilecoef"), 1.0 / tilesTextureW, 1.0 / tilesTextureH);

            for (let i = 0; i < viewportTextures.size(); ++i) {
                glActiveTexture(GL_TEXTURE0);
                glBindTexture(GL_TEXTURE_2D, tilesTexture);
                glUniform1iARB(glGetUniformLocationARB(viewportProgram, "tilesheet"), 0);

                glActiveTexture(GL_TEXTURE1);
                glBindTexture(GL_TEXTURE_2D, viewportTextures[i]);
                glUniform1iARB(glGetUniformLocationARB(viewportProgram, "tiles"), 1);

                glBegin(GL_QUADS);
                glTexCoord2f(0.0, 1.0);
                glVertex3f(vertOffsetX + startX - 1.0, 1.0 - vertOffsetY - startY - sizeY, 0.0);
                glTexCoord2f(1.0, 1.0);
                glVertex3f(vertOffsetX + startX + sizeX - 1.0, 1.0 - vertOffsetY - startY - sizeY, 0.0);
                glTexCoord2f(1.0, 0.0);
                glVertex3f(vertOffsetX + startX + sizeX - 1.0, 1.0 - vertOffsetY - startY, 0.0);
                glTexCoord2f(0.0, 0.0);
                glVertex3f(vertOffsetX + startX - 1.0, 1.0 - vertOffsetY - startY, 0.0);
                glEnd();
            }

            glActiveTexture(GL_TEXTURE0);
            glBindTexture(GL_TEXTURE_2D, 0);
            glUseProgramObjectARB(0);

            CheckGL_Error("Shader Render Viewport Layers", __FILE__, __LINE__);

            let texCoordTileW = 0.5 / tilesTextureW;
            let texCoordTileH = 0.5 / tilesTextureH;

            sizeX = 0.5 * tileSet.TileWidth();
            sizeY = 0.5 * tileSet.TileHeight();

            let offsetX = boost.numeric_cast < float > (mapOffsetX + startPixelX);
            let offsetY = boost.numeric_cast < float > (mapOffsetY + startPixelY);

            let factorX = 1.0 / fontCharW;
            let factorY = 1.0 / fontCharH;

            glBindTexture(GL_TEXTURE_2D, tilesTexture);
            CheckGL_Error("glBindTexture", __FILE__, __LINE__);

            glBegin(GL_QUADS);
            glColor4f(1.0, 1.0, 1.0, 1.0);
            for (letqueuedTile = renderQueue.begin(); queuedTile != renderQueue.end(); ++queuedTile) {
                /**unsigned int*/
                let srcX = 2 * (queuedTile.tile % tilesTextureW);
                /**unsigned int*/
                let srcY = 2 * (queuedTile.tile / tilesTextureH);
                srcX += (queuedTile.x & 0x1);
                srcY += (queuedTile.y & 0x1);
                glTexCoord2f(srcX * texCoordTileW, srcY * texCoordTileH);
                glVertex2f(factorX * (offsetX + queuedTile.x * sizeX), factorY * (GetScreenHeight() - queuedTile.y * sizeY - offsetY));
                glTexCoord2f(srcX * texCoordTileW, (srcY + 1) * texCoordTileH);
                glVertex2f(factorX * (offsetX + queuedTile.x * sizeX), factorY * (GetScreenHeight() - (queuedTile.y + 1) * sizeY - offsetY));
                glTexCoord2f((srcX + 1) * texCoordTileW, (srcY + 1) * texCoordTileH);
                glVertex2f(factorX * (offsetX + (queuedTile.x + 1) * sizeX), factorY * (GetScreenHeight() - (queuedTile.y + 1) * sizeY - offsetY));
                glTexCoord2f((srcX + 1) * texCoordTileW, srcY * texCoordTileH);
                glVertex2f(factorX * (offsetX + (queuedTile.x + 1) * sizeX), factorY * (GetScreenHeight() - queuedTile.y * sizeY - offsetY));
            }
            glEnd();
            CheckGL_Error("render", __FILE__, __LINE__);
        }
        // void RenderGLSLTile(int tile, int x, int y);
        // void RenderOGLTile(int tile, int x, int y);


    RenderConsole() {
        let the_consoleW = TCODConsole.root.getWidth();
        let the_consoleH = TCODConsole.root.getHeight();
        // static_cast < void > (the_consoleH);
        // Update the_console data
        for (let x = 0; x < TCODConsole.root.getWidth(); ++x) {
            for (let y = 0; y < TCODConsole.root.getHeight(); ++y) {
                let backCol = TCODConsole.root.getCharBackground(x, y);
                /**unsigned char */
                let alpha = (backCol == GetKeyColor()) ? 0 : ((translucentUI && backCol == TCODColor.black) ? 128 : 255);
                the_consoleData[BackCol][4 * (x + y * the_consoleW)] = backCol.r;
                the_consoleData[BackCol][4 * (x + y * the_consoleW) + 1] = backCol.g;
                the_consoleData[BackCol][4 * (x + y * the_consoleW) + 2] = backCol.b;
                the_consoleData[BackCol][4 * (x + y * the_consoleW) + 3] = alpha;

                /**unsigned char */
                let c = TCODConsole.root.getCharCode(x, y);
                if (c == -1) c = TCODSystem.asciiToTCOD(TCODConsole.root.getChar(x, y));
                the_consoleData[Character][x + y * the_consoleW] = c;
                if (c != 0) {
                    let foreCol = TCODConsole.root.getCharForeground(x, y);
                    the_consoleData[ForeCol][3 * (x + y * the_consoleW)] = foreCol.r;
                    the_consoleData[ForeCol][3 * (x + y * the_consoleW) + 1] = foreCol.g;
                    the_consoleData[ForeCol][3 * (x + y * the_consoleW) + 2] = foreCol.b;
                } else {
                    the_consoleData[Character][x + y * the_consoleW] = 0;
                }
            }
        }
        if (TCODSystem.getRenderer() == TCOD_RENDERER_GLSL) {
            RenderGLSLConsole();
        } else {
            RenderOGLConsole();
        }
    }
    RenderGLSLConsole() {
        glBindTexture(GL_TEXTURE_2D, the_consoleTextures[Character]);
        glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, tcodConsole.getWidth(), tcodConsole.getHeight(), GL_RED, GL_UNSIGNED_BYTE, the_consoleData[Character][0]);

        glBindTexture(GL_TEXTURE_2D, the_consoleTextures[ForeCol]);
        glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, tcodConsole.getWidth(), tcodConsole.getHeight(), GL_RGB, GL_UNSIGNED_BYTE, the_consoleData[ForeCol][0]);

        glBindTexture(GL_TEXTURE_2D, the_consoleTextures[BackCol]);
        glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, tcodConsole.getWidth(), tcodConsole.getHeight(), GL_RGBA, GL_UNSIGNED_BYTE, the_consoleData[BackCol][0]);

        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

        /* rendering the_console */
        glUseProgramObjectARB(the_consoleProgram);

        /* Technically all these glUniform calls can be moved to SFConsole() when the shader is loaded */
        /* None of these change */
        /* The Textures still need to bind to the same # Activetexture throughout though */
        glUniform2fARB(glGetUniformLocationARB(the_consoleProgram, "termsize"), tcodConsole.getWidth(), tcodConsole.getHeight());
        glUniform2fARB(glGetUniformLocationARB(the_consoleProgram, "termcoef"), 1.0 / the_consoleTexW, 1.0 / the_consoleTexH);
        glUniform1fARB(glGetUniformLocationARB(the_consoleProgram, "fontw"), 16);
        glUniform2fARB(glGetUniformLocationARB(the_consoleProgram, "fontcoef"), (fontCharW) / (fontTexW), (fontCharH) / (fontTexH));

        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, fontTexture);
        glUniform1iARB(glGetUniformLocationARB(the_consoleProgram, "font"), 0);

        glActiveTexture(GL_TEXTURE1);
        glBindTexture(GL_TEXTURE_2D, the_consoleTextures[Character]);
        glUniform1iARB(glGetUniformLocationARB(the_consoleProgram, "term"), 1);

        glActiveTexture(GL_TEXTURE2);
        glBindTexture(GL_TEXTURE_2D, the_consoleTextures[ForeCol]);
        glUniform1iARB(glGetUniformLocationARB(the_consoleProgram, "termfcol"), 2);

        glActiveTexture(GL_TEXTURE3);
        glBindTexture(GL_TEXTURE_2D, the_consoleTextures[BackCol]);
        glUniform1iARB(glGetUniformLocationARB(the_consoleProgram, "termbcol"), 3);

        glBegin(GL_QUADS);
        glTexCoord2f(0.0, 1.0);
        glVertex3f(-1.0, -1.0, 0.0);
        glTexCoord2f(1.0, 1.0);
        glVertex3f(1.0, -1.0, 0.0);
        glTexCoord2f(1.0, 0.0);
        glVertex3f(1.0, 1.0, 0.0);
        glTexCoord2f(0.0, 0.0);
        glVertex3f(-1.0, 1.0, 0.0);
        glEnd();

        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, 0);
        glDisable(GL_BLEND);
        glUseProgramObjectARB(0);
    }

    RenderOGLConsole() {
        let the_consoleW = TCODConsole.root.getWidth();
        let the_consoleH = TCODConsole.root.getHeight();

        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        glBindTexture(GL_TEXTURE_2D, the_consoleTextures[BackCol]);
        glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, tcodConsole.getWidth(), tcodConsole.getHeight(), GL_RGBA, GL_UNSIGNED_BYTE, the_consoleData[BackCol][0]);

        /* fixed pipeline for video cards without pixel shader support */
        /* draw the background as a single quad */
        let texw = the_consoleW / the_consoleTexW;
        let texh = the_consoleH / the_consoleTexH;
        let fonw = fontCharW / (fontTexW);
        let fonh = fontCharH / (fontTexH);
        glBindTexture(GL_TEXTURE_2D, the_consoleTextures[BackCol]);
        CheckGL_Error("glBindTexture", __FILE__, __LINE__);
        glBegin(GL_QUADS);
        glColor3f(1.0, 1.0, 1.0);
        glTexCoord2f(0.0, 0.0);
        glVertex2i(0, 0);
        glTexCoord2f(0.0, texh);
        glVertex2i(0, the_consoleH);
        glTexCoord2f(texw, texh);
        glVertex2i(the_consoleW, the_consoleH);
        glTexCoord2f(texw, 0.0);
        glVertex2i(the_consoleW, 0);
        glEnd();
        glBindTexture(GL_TEXTURE_2D, 0);
        CheckGL_Error("Render Console Background", __FILE__, __LINE__);
        /* draw the characters (one quad per cell) */
        glBindTexture(GL_TEXTURE_2D, fontTexture);


        let fColorIter = (the_consoleData[ForeCol].begin());
        let characterIter = (the_consoleData[Character].begin());
        glBegin(GL_QUADS);
        for (let y = 0; y < the_consoleH; y++) {
            for (let x = 0; x < the_consoleW; x++) {
                if (characterIter != 0 && characterIter != ' ') {
                    /**unsigned char */
                    let foreR = (fColorIter++);
                    /**unsigned char */
                    let foreG = (fColorIter++);
                    /**unsigned char */
                    let foreB = (fColorIter++);

                    let srcx, srcy, destx, desty;
                    destx = x;
                    desty = y;
                    if (TCODConsole.root.isFullscreen()) {
                        let offX, offY;
                        TCODSystem.getFullscreenOffsets(offX, offY);
                        destx += offX / fontCharW;
                        desty += offY / fontCharH;
                    }
                    // draw foreground 
                    /**unsigned char */
                    let character = characterIter++;
                    srcx = (character % 16);
                    srcy = (character / 16);

                    glColor3f((GLfloat)(foreR / 255.0), (GLfloat)(foreG / 255.0), (GLfloat)(foreB / 255.0));
                    glTexCoord2f(srcx * fonw, srcy * fonh);
                    glVertex2i(destx, desty);
                    glTexCoord2f(srcx * fonw, (srcy + 1) * fonh);
                    glVertex2i(destx, desty + 1);
                    glTexCoord2f((srcx + 1) * fonw, (srcy + 1) * fonh);
                    glVertex2i(destx + 1, desty + 1);
                    glTexCoord2f((srcx + 1) * fonw, srcy * fonh);
                    glVertex2i(destx + 1, desty);
                }
            }
        }
        glEnd();
        glBindTexture(GL_TEXTURE_2D, 0);
        glDisable(GL_BLEND);
    }

    AssembleTextures() {
        /**boost.shared_ptr <const unsigned int >*/
        let tempTex = (CreateOGLTexture());
        /**GLint* */
        let texSize;
        glGetIntegerv(GL_MAX_TEXTURE_SIZE, texSize);

        /**GLint* */
        let width = (0);
        while (width == 0 && texSize > tileSet.TileWidth()) {
            glTexImage2D(GL_PROXY_TEXTURE_2D, 0, GL_RGBA, texSize, texSize, 0, GL_BGRA, GL_UNSIGNED_BYTE, null);
            glGetTexLevelParameteriv(GL_PROXY_TEXTURE_2D, 0, GL_TEXTURE_WIDTH, width);
            if (width == 0)
                texSize /= 2;
        }
        if (width == 0)
            return false;

        // Get initial horizontal tiles (based on tex size)
        tilesTextureW = Math.min(texSize / tileSet.TileWidth(), (rawTiles.size()));
        let widthPixels = Math.min(texSize, MathEx.NextPowerOfTwo(tileSet.TileWidth() * tilesTextureW));
        // Final horizontal tiles
        tilesTextureW = widthPixels / tileSet.TileWidth();

        // Vertical size calculated based on size needed based on width.
        let heightPixels = Math.min(texSize, MathEx.NextPowerOfTwo(CeilToInt.convert(rawTiles.size() / tilesTextureW) * tileSet.TileHeight()));
        tilesTextureH = heightPixels / tileSet.TileHeight();

        if (tilesTextureH * tilesTextureW < rawTiles.size())
            return false;

        // Build texture
        /**Uint32 */
        let rmask, gmask, bmask, amask;
        if (SDL_BYTEORDER == SDL_BIG_ENDIAN) {
            rmask = 0xff000000;
            gmask = 0x00ff0000;
            bmask = 0x0000ff00;
            amask = 0x000000ff;
        } else {
            rmask = 0x000000ff;
            gmask = 0x0000ff00;
            bmask = 0x00ff0000;
            amask = 0xff000000;
        }
        /**boost.shared_ptr < SDL_Surface > */
        let tempSurface = (SDL_CreateRGBSurface(SDL_SWSURFACE, tileSet.TileWidth(), tileSet.TileHeight(), 32, bmask, gmask, rmask, amask), SDL_FreeSurface);
        if (tempSurface.get() == null) {
            LOG("CreateRGBSurface failed: " << SDL_GetError());
            return false;
        }

        tilesTexture = CreateOGLTexture();
        /**boost.scoped_array < unsigned char > */
        let rawData = (new Array(4 * widthPixels * heightPixels));

        glBindTexture(GL_TEXTURE_2D, tilesTexture);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, widthPixels, heightPixels, 0, GL_BGRA, GL_UNSIGNED_BYTE, rawData.get());
        CheckGL_Error("glBindTexture", __FILE__, __LINE__);

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

        let tile = 0;
        for (let y = 0; y < static_cast < int > (tilesTextureH) && tile < static_cast < int > (rawTiles.size()); ++y) {
            for (let x = 0; x < static_cast < int > (tilesTextureW) && tile < static_cast < int > (rawTiles.size()); ++x) {
                let srcRect = new SDL_Rect(
                    0,
                    0,
                    static_cast < Uint16 > (tileSet.TileWidth()),
                    static_cast < Uint16 > (tileSet.TileHeight())
                );
                SDL_SetAlpha(rawTiles[tile].texture.GetInternalSurface().get(), 0, SDL_ALPHA_OPAQUE);
                rawTiles[tile].texture.DrawTile(rawTiles[tile].tile, tempSurface.get(), srcRect);

                if (SDL_MUSTLOCK(tempSurface.get())) {
                    SDL_LockSurface(tempSurface.get());
                }
                glTexSubImage2D(GL_TEXTURE_2D, 0, x * tileSet.TileWidth(), y * tileSet.TileHeight(), tileSet.TileWidth(), tileSet.TileHeight(), GL_BGRA, GL_UNSIGNED_BYTE, tempSurface.pixels);
                if (SDL_MUSTLOCK(tempSurface.get())) {
                    SDL_UnlockSurface(tempSurface.get());
                }

                tile++;
            }
        }

        if (!CheckGL_Error("glTexImage2D", __FILE__, __LINE__)) {
            return false;
        }
        rawTiles.clear();
        return true;
    }



    // using namespace OGLFunctionExtension;

    // Note: Libtcod swaps the vertical axis depending on whether the renderer is GLSL or OpenGL.

    // boost.shared_ptr < TilesetRenderer > CreateOGLTilesetRenderer(int width, int height, TCODConsole * the_console, std.string tilesetName) {
    CreateOGLTilesetRenderer(width, the_console, tilesetName) {
        /**boost.shared_ptr < OGLTilesetRenderer > */
        let oglRenderer = (new OGLTilesetRenderer(width, height, the_console));
        /**boost.shared_ptr < TileSet >*/
        let tileset = TileSetLoader.LoadTileSet(oglRenderer, tilesetName);
        if (tileset.get() != 0 && oglRenderer.SetTileset(tileset)) {
            return oglRenderer;
        }
        return null; //boost.shared_ptr < TilesetRenderer > ();
    }

    static equals(lhs, rhs) {
        return lhs.tile == rhs.tile && lhs.texture == rhs.texture;
    }




    // bool CheckGL_Error(const char * GLcall,
    //     const char * file,
    //         const int line) {
    CheckGL_Error(GLcall, file, line) {
        let errCode;
        if ((errCode = glGetError()) != GL_NO_ERROR) {
            LOG("" << file << "(" << line << "): error " << errCode << ": " << GLcall << std.endl);
            return false;
        }
        return true;
    }

    static TCOD_con_vertex_shader = `
            ${ (NDEBUG === undefined)  ? "#version 110\n" : ""} 
uniform vec2 termsize; 

void main(void) 
{ 

   gl_Position = gl_Vertex; 

   gl_TexCoord[0] = gl_MultiTexCoord0; 
   gl_TexCoord[0].x = gl_TexCoord[0].x*termsize.x; 
   gl_TexCoord[0].y = gl_TexCoord[0].y*termsize.y; 
} `;

    static TCOD_con_pixel_shader = `
            ${(NDEBUG === undefined) ? "#version 110\n" : ""}
uniform sampler2D font;
uniform sampler2D term;
uniform sampler2D termfcol;
uniform sampler2D termbcol;

uniform float fontw;
uniform vec2 fontcoef;
uniform vec2 termsize;
uniform vec2 termcoef;

void main(void)
{
   vec2 rawCoord = gl_TexCoord[0].xy;  /* varying from [0, termsize) in x and y */
   vec2 conPos = floor(rawCoord); /* the_console integer position */
   vec2 pixPos = fract(rawCoord);  /* pixel offset within the_console position */
   pixPos = vec2(pixPos.x*fontcoef.x,pixPos.y*fontcoef.y);  /* Correct pixel offset for font tex location */

   vec2 address = vec2(conPos.x*termcoef.x,conPos.y*termcoef.y); 
	address=address+vec2(0.001, 0.001); 
   float inchar = texture2D(term, address).r*256.0;  /* character */
   vec4 tcharfcol = texture2D(termfcol, address);  /* front color */
   vec4 tcharbcol = texture2D(termbcol, address);  /* back color */

   vec4 tchar = vec4(mod(floor(inchar),floor(fontw)),floor(inchar/fontw), 0.0, 0.0);  /* 1D index to 2D index map for character */

   gl_FragColor = texture2D(font, vec2((tchar.x*fontcoef.x),(tchar.y*fontcoef.y))+pixPos.xy);  /* magic func: finds pixel value in font file */

   gl_FragColor=gl_FragColor.a*tcharfcol+(1.0-gl_FragColor.a)*tcharbcol;   /* Coloring stage */
} `;

    static tiles_vertex_shader = `
             ${(NDEBUG === undefined) ? "#version 110\n" : ""}
uniform vec2 termsize; 

void main(void) 
{ 

   gl_Position = gl_Vertex; 

   gl_TexCoord[0] = gl_MultiTexCoord0; 
   gl_TexCoord[0].x = gl_TexCoord[0].x*termsize.x; 
   gl_TexCoord[0].y = gl_TexCoord[0].y*termsize.y; 
} `;

    static tiles_frag_shader = `
            ${ (NDEBUG === undefined) ? "#version 110\n" : ""}
uniform sampler2D tilesheet; 
uniform sampler2D tiles; 

uniform float tilew; 
uniform vec2 tilecoef; 
uniform vec2 termsize; 
uniform vec2 termcoef; 

void main(void) 
{ 
   vec2 rawCoord = gl_TexCoord[0].xy;  /* varying from [0, termsize) in x and y */
   vec2 conPos = floor(rawCoord);  /* the_console integer position */
   vec2 pixPos = fract(rawCoord);  /* pixel offset within the_console position */
   pixPos = vec2(pixPos.x*tilecoef.x,pixPos.y*tilecoef.y);  /* Correct pixel offset for font tex location */

   vec2 address = vec2(rawCoord.x*termcoef.x,rawCoord.y*termcoef.y); 
   vec4 tileInfo = texture2D(tiles, address); 
   float inchar = tileInfo.r*255.0 + tileInfo.g * 256.0 * 255.0 + tileInfo.b * 65536.0 * 255.0; 
   vec2 tchar = vec2(mod(floor(inchar),floor(tilew)),floor(inchar/tilew));  /* 1D index to 2D index map for character */

   gl_FragColor = texture2D(tilesheet, vec2((tchar.x*tilecoef.x),(tchar.y*tilecoef.y))+pixPos.xy);  /* magic func: finds pixel value in font file */
   gl_FragColor *= tileInfo.a; 
} `;


    // boost.array < unsigned char, OGLTilesetRenderer.ConsoleTextureTypesCount > OGLTilesetRenderer.the_consoleDataAlignment = {
    //     { 1, 3, 4 }
    // };
    static the_consoleDataAlignment = [
        1, 3, 4
    ];


}