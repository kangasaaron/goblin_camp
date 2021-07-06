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

import { Coordinate } from "./Coordinate.js";
import { NPCPreset } from "./NPCPreset.js";
import { ItemPreset } from "./ItemPreset.js";
import { CursorType } from "./UI/CursorType.js";

/**
 * @class {TCODMapRenderer}
 */
export class TCODMapRenderer {
    the_console = null;
    cursorChar = 'X';
    upleft = Coordinate.zero;

    /**
     * @param {TCODConsole} mapConsole
     */
    constructor(mapConsole) {
        this.the_console = mapConsole;
    }
    PreparePrefabs() {}
    SetTranslucentUI() {}
    ScrollRate() {
        return 1.0;
    }
    SetCursorMode(arg) {
        if (arg instanceof NPCPreset || arg instanceof ItemPreset)
            this.cursorChar = arg.graphic;
        else if (arg instanceof CursorType) {
            switch (arg) {
                case CursorType.Cursor_Construct:
                    this.cursorChar = 'C';
                    break;
                case CursorType.Cursor_Stockpile:
                    this.cursorChar = '=';
                    break;
                case CursorType.Cursor_TreeFelling:
                case CursorType.Cursor_Order:
                    this.cursorChar = 'X';
                    break;
                case CursorType.Cursor_Harvest:
                    this.cursorChar = 'H';
                    break;
                case CursorType.Cursor_Tree:
                    this.cursorChar = 'T';
                    break;
                case CursorType.Cursor_Dismantle:
                    this.cursorChar = 'D';
                    break;
                case CursorType.Cursor_Undesignate:
                    this.cursorChar = 'U';
                    break;
                case CursorType.Cursor_Bog:
                    this.cursorChar = 'B';
                    break;
                case CursorType.Cursor_Dig:
                    this.cursorChar = '_';
                    break;
                case CursorType.Cursor_AddTerritory:
                    this.cursorChar = '+';
                    break;
                case CursorType.Cursor_RemoveTerritory:
                    this.cursorChar = '-';
                    break;
                case CursorType.Cursor_Gather:
                    this.cursorChar = 'G';
                    break;
                default:
                    this.cursorChar = 'X';
                    break;
            }
        } else if (typeof arg === "number") {
            this.cursorChar = arg;
        }
    }

    /**
    @param {number} x
    @param {number} y
    @param {number} focusX
    @param {number} focusY
    @param {number} viewportX
    @param {number} viewportY
    @param {number} viewportW
    @param {number} viewportH
    
     */
    TileAt(x, y, focusX, focusY, viewportX, viewportY, viewportW, viewportH) {
        // Convert viewport to tile space
        let { charX, charY } = TCODSystem.getCharSize();
        if (viewportW === -1) {
            viewportW = this.the_console.getWidth();
        } else {
            viewportW /= charX;
        }
        if (viewportH === -1) {
            viewportH = this.the_console.getHeight();
        } else {
            viewportH /= charY;
        }
        viewportX /= charX;
        viewportY /= charY;

        return new Coordinate(Math.floor(focusX) - (viewportW / 2) + (x - viewportX) / charX, Math.floor(focusY) - (viewportH / 2) + (y - viewportY) / charY);
    }

    DrawCursor(...args) {
            if (args[0] instanceof Coordinate) {
                if (args[1] instanceof Coordinate) {
                    if (typeof args[2] === "boolean")
                        return this.DrawCursorStartEnd(args[0], args[1], args[2]);
                } else if (typeof args[1] === "boolean") {
                    return this.DrawCursorPos(args[0], args[1]);
                }
            }
        }
        /**
         * @param {Coordinate} start
         * @param {Coordinate} end
         * @param {boolean} placeable
         */
    DrawCursorStartEnd(start, end, placeable) {
        for (let x = Math.max(0, start.X() - this.upleft.X()); x <= Math.min(this.the_console.getWidth() - 1, end.X() - this.upleft.X()); ++x) {
            for (let y = Math.max(0, start.Y() - this.upleft.Y()); y <= Math.min(this.the_console.getHeight() - 1, end.Y() - this.upleft.Y()); ++y) {
                if (!placeable) this.the_console.putCharEx(x, y, cursorChar, Color.red, Color.black);
                else this.the_console.putCharEx(x, y, cursorChar, Color.green, Color.black);
            }
        }
    }

    /**
     * @param {Coordinate} pos
     * @param {boolean} placeable
     */
    DrawCursorPos(pos, placeable) {
        if (pos.X() - this.upleft.X() >= 0 && pos.X() - this.upleft.X() < this.the_console.getWidth() &&
            pos.Y() - this.upleft.Y() >= 0 && pos.Y() - this.upleft.Y() < this.the_console.getHeight()) {
            if (!placeable) this.the_console.putCharEx(pos.X() - this.upleft.X(), pos.Y() - this.upleft.Y(), cursorChar, Color.red, Color.black);
            else this.the_console.putCharEx(pos.X() - this.upleft.X(), pos.Y() - this.upleft.Y(), cursorChar, Color.green, Color.black);
        }
    }


    //TODO: Optimize. This causes the biggest performance hit by far right now 
    DrawMap(map, focusX, focusY, viewportX, viewportY, viewportW, viewportH) {
        let { charX, charY } = TCODSystem.getCharSize();
        if (viewportW === -1) {
            viewportW = this.the_console.getWidth();
        } else {
            viewportW /= charX;
        }
        if (viewportH === -1) {
            viewportH = this.the_console.getHeight();
        } else {
            viewportH /= charY;
        }
        viewportX /= charX;
        viewportY /= charY;

        this.upleft = new Coordinate(Math.floor(focusX) - (viewportW / 2), Math.floor(focusY) - (viewportH / 2));

        let screenDeltaX = this.upleft.X();
        let screenDeltaY = this.upleft.Y();
        let minimap = new TCODConsole(viewportW, viewportH);
        for (let y = this.upleft.Y(); y < this.upleft.Y() + minimap.getHeight(); ++y) {
            for (let x = this.upleft.X(); x < this.upleft.X() + minimap.getWidth(); ++x) {
                let xy = new Coordinate(x, y);
                if (!map.IsInside(xy)) {
                    minimap.putCharEx(x - screenDeltaX, y - screenDeltaY, TCOD_CHAR_BLOCK3, Color.black, Color.white);
                    continue;
                }
                minimap.putCharEx(x - screenDeltaX, y - (screenDeltaY), map.GetGraphic(xy), map.GetForeColor(xy), map.GetBackColor(xy));

                if (!(map.GetOverlayFlags() & TERRAIN_OVERLAY)) {
                    let wwater = map.GetWater(xy);
                    if (water = wwater.lock()) {
                        if (water.Depth() > 0)
                            minimap.putCharEx(x - screenDeltaX, y - screenDeltaY, water.GetGraphic(), water.GetColor(), Color.black);
                    }
                    let wfilth = map.GetFilth(xy);
                    if (filth = wfilth.lock()) {
                        if (filth.Depth() > 0)
                            minimap.putCharEx(x - screenDeltaX, y - screenDeltaY, filth.GetGraphic(), filth.GetColor(), Color.black);
                    }
                    let natNum = map.GetNatureObject(xy);
                    if (natNum >= 0) {
                        Game.i.natureList[natNum].Draw(this.upleft, minimap);
                    }
                }
                if (map.GetOverlayFlags() & TERRITORY_OVERLAY) {
                    minimap.setCharBackground(x - screenDeltaX, y - screenDeltaY, map.IsTerritory(xy) ? new Color(45, 85, 0) : new Color(80, 0, 0));
                }

            }
        }

        if (!(map.GetOverlayFlags() & TERRAIN_OVERLAY)) {
            this.InternalDrawMapItems("static constructions", Game.i.staticConstructionList, this.upleft, minimap);
            this.InternalDrawMapItems("dynamic constructions", Game.i.dynamicConstructionList, this.upleft, minimap);
            //TODO: Make this consistent
            for (let itemi of Game.itemList.entries()) {
                if (!itemi[1]) {
                    let tmp = itemi;
                    ++itemi;
                    Game.itemList.delete(tmp[0]);
                    continue;
                } else if (!itemi[1].ContainedIn().lock()) {
                    itemi[1].Draw(this.upleft, minimap);
                }
                ++itemi;
            }
        }

        for (let markeri of map.MarkerBegin) {
            let markerX = markeri[1].X();
            let markerY = markeri[1].Y();
            if (markerX >= this.upleft.X() && markerX < this.upleft.X() + viewportW &&
                markerY >= this.upleft.Y() && markerY < this.upleft.Y() + viewportH) {
                minimap.putCharEx(markerX - this.upleft.X(), markerY - this.upleft.Y(), markeri[1].Graphic(), markeri[1].Color(), Color.black);
            }
        }


        this.InternalDrawMapItems("NPCs", Game.i.npcList, this.upleft, minimap);
        for (let firei of Game.i.fireNodes) {
            if (firei.lock()) firei.lock().Draw(this.upleft, minimap);
        }
        for (let spelli of Game.i.spells) {
            spelli.Draw(this.upleft, minimap);
        }

        TCODConsole.blit(minimap, 0, 0, viewportW, viewportH, this.the_console, viewportX, viewportY);
    }
    InternalDrawMapItems(name, map, upleft, buffer) {
        for (let it of map.entries()) {
            let ptr = it[1];

            if (ptr.get() !== null) {
                ptr.Draw(upleft, buffer);
                ++it;
            } else {
                if (Globals.DEBUG) {
                    console.error("!!! null POINTER !!! " + name + " ; id " + it[0]);
                }
                let tmp = it;
                ++it;
                map.delete(tmp[0]);
            }
        }
    }
}