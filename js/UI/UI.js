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

// import { Announce  } from "../Announce.js";
// import { AnnounceDialog } from "./AnnounceDialog.js";
// import { Camp } from "../Camp.js";
// import { TCODColor, console_types } from "../../fakeTCOD/libtcod.js";
// import { Config } from "../data/Config.js";
// import { ConstructionDialog } from "./ConstructionDialog.js";
// import { Coordinate } from "../Coordinate.js";
// import { Data } from "./data/Data.js";
// import { DevConsole } from "./DevConsole.js";
// import { Entity } from "../Entity.js";
// import { Farmplot } from "../Farmplot.js";
// import { Game } from "../Game.js";
// import { GameMap } from "../GameMap.js";
// import { GCamp } from "../GCamp.js";
// import { Job } from "../Job.js";
// import { JobDialog } from "./JobDialog.js";
// import { Menu } from "./Menu.js";
// import { MenuResult } from "./MenuResult.js";
// import { Random } from "../Random.js";
// import { SideBar } from "./SideBar.js";
// import { Singletonify } from "../cplusplus/Singleton.js";
// import { SquadsDialog } from "./SquadsDialog.js";
// import { StockManagerDialog } from "./StockManagerDialog.js";
// import { Stockpile } from "../Stockpile.js";
// import { Tooltip  } from "./Tooltip.js";
// import { TooltipEntry}  from "./TooltipEntry.js";
// import { UIState } from "./UIState.js";

const NO_KEY = new console_types.TCOD_key_t(
    console_types.TCOD_keycode_t.TCODK_NONE,
    0,
    false,
    false,
    false,
    false,
    false,
    false
);

class UI extends  {
    menuOpen = false;
    placeable = false;
    lbuttonPressed = false;
    draggingViewport = false;
    textMode = false;
    drawCursor = false;
    mbuttonPressed = false;
    rbuttonPressed = false;
    draggingPlacement = false;
    
    menuX = 0;
    menuY = 0;
    keyHelpTextColor = 0;
    inputStringLimit = 0;
    inputString = "";
    extraTooltip = "";
    
    /** @type {function (Coordinate)} */
    callback;
    /** @type {function (Coordinate, Coordinate)} */
    rectCallback;
    /** @type {function (Coordinate, Coordinate)} @returns {boolean} */
    placementCallback;
    /** @type {Coordinate} */
    _blueprint;
    /** @type {Coordinate} */
    a;
    /** @type {Coordinate} */
    b;
    /** @type {Panel *} */
    currentMenu;
    /** @type {TCOD_key_t} */
    key;
    /** @type {TCOD_mouse_t} */
    mouseInput;
    /** @type {TCOD_event_t} */
    event;
    /** @type {UIState} */
    _state;
    /** @type {std.vector < Panel * >} **/
    menuHistory;
    /** @type {std.list < boost.weak_ptr < Entity > >} **/
    underCursor;
    /** @type {TCOD_mouse_t} **/
    oldMouseInput;
    /** @type {SideBar} **/
    sideBar;
    /** @type {boost.weak_ptr < Entity > **/
    currentStrobeTarget;

    constructor() {
        this._state = UIState.UINORMAL;
        this._blueprint = new Coordinate(1, 1);
        this.this.underCursor = [];
        this.currentStrobeTarget = null;
        this.currentMenu = Menu.MainMenu();
        this.menuHistory.reserve(10);
        this.placementCallback = Game.i.CheckPlacement.bind(Game, undefined, undefined, new Set());
        this.callback = Game.i.PlaceConstruction.bind(Game, undefined, 0);
        this.rectCallback = Game.i.PlaceStockpile.bind(Game, undefined, undefined, 0, 0);
        this.event = TCOD_EVENT_NONE; // FIXME: bug Doryen to have TCOD_EVENT_NONE
        this.mouseInput = TCODMouse.getStatus();
        this.oldMouseInput = this.mouseInput;
    }

    Update() {
        if (this.keyHelpTextColor > 0) this.keyHelpTextColor -= 2;
        if (this.keyHelpTextColor < 0) this.keyHelpTextColor = 0;

        // FIXME: should probably be elsewhere
        this.event = TCODSystem.checkForEvent(TCOD_EVENT_ANY, this.key, this.mouseInput);

        if (this.event & TCOD_EVENT_KEY_PRESS)
            this.HandleKeyboard();
        if (this.event & TCOD_EVENT_MOUSE)
            this.HandleMouse();
    }

    HandleKeyboard() {
        /** @type {Config.KeyMap &} */
        let keyMap = Config.GetKeyMap();

        let diffX = 0;
        let diffY = 0;

        //TODO: This isn't pretty, but it works.
        //key = TCODConsole.checkForKeypress(TCOD_KEY_PRESSED);
        if (!this.currentMenu || !(this.currentMenu.Update(-1, -1, false, this.key) & KEYRESPOND)) {
            if (!this.textMode) {
                if (this.key.c === keyMap.Exit) {
                    Game.i.Exit();
                } else if (this.key.c === keyMap.Basics) {
                    this.menuX = this.mouseInput.cx;
                    this.menuY = this.mouseInput.cy;
                    this.ChangeMenu(Menu.BasicsMenu());
                } else if (this.key.c === keyMap.Workshops) {
                    this.menuX = this.mouseInput.cx;
                    this.menuY = this.mouseInput.cy;
                    this.ChangeMenu(Menu.WorkshopsMenu());
                } else if (this.key.c === keyMap.Permanent) {
                    this.menuX = this.mouseInput.cx;
                    this.menuY = this.mouseInput.cy;
                    this.ChangeMenu(Menu.ConstructionCategoryMenu("Permanent"));
                } else if (this.key.c === keyMap.Orders) {
                    this.menuX = this.mouseInput.cx;
                    this.menuY = this.mouseInput.cy;
                    this.ChangeMenu(Menu.OrdersMenu());
                } else if (this.key.c === keyMap.StockManager) {
                    this.ChangeMenu(StockManagerDialog.StocksDialog());
                } else if (this.key.c === keyMap.Furniture) {
                    this.menuX = this.mouseInput.cx;
                    this.menuY = this.mouseInput.cy;
                    this.ChangeMenu(Menu.FurnitureMenu());
                } else if (this.key.c === keyMap.Squads) {
                    this.ChangeMenu(SquadsDialog.SquadDialog());
                } else if (this.key.c === keyMap.Announcements) {
                    this.ChangeMenu(AnnounceDialog.AnnouncementsDialog());
                } else if (this.key.c === keyMap.Center) {
                    Game.i.CenterOn(Camp.i.Center());
                } else if (this.key.c === keyMap.Help) {
                    this.keyHelpTextColor = 855;
                } else if (this.key.c === keyMap.Pause) {
                    Game.i.Pause();
                } else if (this.key.c === keyMap.Jobs) {
                    this.ChangeMenu(JobDialog.JobListingDialog());
                } else if (Game.i.DevMode() && this.key.c === keyMap.DevConsole) {
                    this.ShowDevConsole();
                } else if (this.key.c === keyMap.TerrainOverlay) {
                    if (GameMap.GetOverlayFlags() & TERRAIN_OVERLAY) GameMap.RemoveOverlay(TERRAIN_OVERLAY);
                    else GameMap.AddOverlay(TERRAIN_OVERLAY);
                }

                let addition = 1;
                if (this.ShiftPressed()) addition *= 10;
                if (this.key.vk === TCODK_UP) {
                    diffY -= addition;
                } else if (this.key.vk === TCODK_DOWN) {
                    diffY += addition;
                } else if (this.key.vk === TCODK_LEFT) {
                    diffX -= addition;
                } else if (this.key.vk === TCODK_RIGHT) {
                    diffX += addition;
                } else if (this.key.vk === TCODK_KP1) {
                    TCODMouse.showCursor(false);
                    this.drawCursor = true;
                    this.mouseInput.x -= Game.i.CharWidth() * addition;
                    this.mouseInput.cx -= addition;
                    this.mouseInput.y += Game.i.CharHeight() * addition;
                    this.mouseInput.cy += addition;
                } else if (this.key.vk === TCODK_KP2) {
                    this.TCODMouse.showCursor(false);
                    this.drawCursor = true;
                    this.mouseInput.y += Game.i.CharHeight() * addition;
                    this.mouseInput.cy += addition;
                } else if (this.key.vk === TCODK_KP3) {
                    this.TCODMouse.showCursor(false);
                    this.drawCursor = true;
                    this.mouseInput.x += Game.i.CharWidth() * addition;
                    this.mouseInput.cx += addition;
                    this.mouseInput.y += Game.i.CharHeight() * addition;
                    this.mouseInput.cy += addition;
                } else if (this.key.vk === TCODK_KP4) {
                    this.TCODMouse.showCursor(false);
                    this.drawCursor = true;
                    this.mouseInput.x -= Game.i.CharWidth() * addition;
                    this.mouseInput.cx -= addition;
                } else if (this.key.vk === TCODK_KP6) {
                    this.TCODMouse.showCursor(false);
                    this.drawCursor = true;
                    this.mouseInput.x += Game.i.CharWidth() * addition;
                    this.mouseInput.cx += addition;
                } else if (this.key.vk === TCODK_KP7) {
                    this.TCODMouse.showCursor(false);
                    this.drawCursor = true;
                    this.mouseInput.x -= Game.i.CharWidth() * addition;
                    this.mouseInput.cx -= addition;
                    this.mouseInput.y -= Game.i.CharHeight() * addition;
                    this.mouseInput.cy -= addition;
                } else if (this.key.vk === TCODK_KP8) {
                    this.TCODMouse.showCursor(false);
                    this.drawCursor = true;
                    this.mouseInput.y -= Game.i.CharHeight() * addition;
                    this.mouseInput.cy -= addition;
                } else if (this.key.vk === TCODK_KP9) {
                    this.TCODMouse.showCursor(false);
                    this.drawCursor = true;
                    this.mouseInput.x += Game.i.CharWidth() * addition;
                    this.mouseInput.cx += addition;
                    this.mouseInput.y -= Game.i.CharHeight() * addition;
                    this.mouseInput.cy -= addition;
                } else if (this.key.vk === TCODK_ENTER || this.key.vk === TCODK_KPENTER) {
                    this.lbuttonPressed = true;
                } else if (this.key.vk === TCODK_PRINTSCREEN) {
                    Data.SaveScreenshot();
                }

                if (this.key.vk >= TCODK_F1 && this.key.vk <= TCODK_F12) {
                    if (this.ShiftPressed()) {
                        Game.i.SetMark(this.key.vk - TCODK_F1);
                    } else {
                        Game.i.ReturnToMark(this.key.vk - TCODK_F1);
                    }
                }
            } else {
                if (this.key.c >= ' ' && this.key.c <= '}' && this.key.c !== '+' && this.key.c !== '-' && this.inputString.length < this.inputStringLimit) {
                    this.inputString += this.key.c;
                } else if (this.key.vk === TCODK_BACKSPACE) {
                    if (this.inputString.length > 0) this.inputString.erase(this.inputString.end() - 1);
                }
            }
            if (this.key.vk === TCODK_ESCAPE) {
                this.extraTooltip = "";
                if (this.menuOpen) {
                    this.rbuttonPressed = true;
                } else {
                    TCODMouse.showCursor(true);
                    Game.i.ToMainMenu(true);
                }
            }
        }

        if (this.mouseInput.x < 0) {
            diffX += this.mouseInput.cx;
            this.mouseInput.x = 0;
            this.mouseInput.cx = 0;
        } else if (this.mouseInput.cx >= Game.i.ScreenWidth()) {
            diffX += this.mouseInput.cx - (Game.i.ScreenWidth() - 1);
            this.mouseInput.cx = Game.i.ScreenWidth() - 1;
            this.mouseInput.x = (Game.i.ScreenWidth() - 1) * Game.i.CharWidth();
        }
        if (this.mouseInput.y < 0) {
            diffY += this.mouseInput.cy;
            this.mouseInput.y = 0;
            this.mouseInput.cy = 0;
        } else if (this.mouseInput.cy >= Game.i.ScreenHeight()) {
            diffY += this.mouseInput.cy - (Game.i.ScreenHeight() - 1);
            this.mouseInput.cy = Game.i.ScreenHeight() - 1;
            this.mouseInput.y = (Game.i.ScreenHeight() - 1) * Game.i.CharHeight();
        }

        Game.i.MoveCam(diffX, diffY);
    }

    HandleMouse() {
        let tmp;
        let menuResult = MenuResult.NOMENUHIT;
        let xswap = false, yswap = false;

        if (TCODConsole.isWindowClosed()) 
            Game.i.Exit();

        let newMouseInput = TCODMouse.getStatus();
        if (newMouseInput.x !== this.oldMouseInput.x || newMouseInput.y !== this.oldMouseInput.y) {
            this.mouseInput = newMouseInput;
            this.drawCursor = false;
            TCODMouse.showCursor(true);
        }

        if (newMouseInput.lbutton_pressed) this.lbuttonPressed = true;
        if (newMouseInput.mbutton_pressed) this.mbuttonPressed = true;
        if (newMouseInput.rbutton_pressed) this.rbuttonPressed = true;

        if (this._state === UIState.UINORMAL) {
            this.HandleUnderCursor(Game.i.TileAt(this.mouseInput.x, this.mouseInput.y), this.underCursor);
        }

        if (this._state === UIState.UIPLACEMENT || this._state === UIState.UIABPLACEMENT || this._state === UIState.UIRECTPLACEMENT) {
            this.placeable = this.placementCallback(Game.i.TileAt(this.mouseInput.x, this.mouseInput.y), this._blueprint);
        }

        if (this._state === UIState.UIABPLACEMENT || this._state === UIState.UIRECTPLACEMENT) {
            this.b = Game.i.TileAt(this.mouseInput.x, this.mouseInput.y);
        }

        this.currentMenu.Update(this.mouseInput.cx, this.mouseInput.cy, false, NO_KEY);

        if (this.lbuttonPressed) {
            if (this.draggingViewport) {
                this.draggingViewport = false;
            } else {
                menuResult = MenuResult.NOMENUHIT;
                if (!this.draggingPlacement) {
                    menuResult = this.sideBar.Update(this.mouseInput.cx, this.mouseInput.cy, true);
                    if (menuResult & MenuResult.NOMENUHIT) {
                        menuResult = Announce.Update(this.mouseInput.cx, this.mouseInput.cy, true);
                        if (menuResult & MenuResult.NOMENUHIT) {
                            if (this.menuOpen) {
                                menuResult = this.currentMenu.Update(this.mouseInput.cx, this.mouseInput.cy, true, NO_KEY);
                                this.lbuttonPressed = false;
                            }
                        }
                    }
                }
                if (menuResult & MenuResult.NOMENUHIT) {
                    if (this.menuOpen && this._state === UIState.UINORMAL) {
                        this.CloseMenu();
                    }
                    if (this._state === UIState.UIPLACEMENT && this.placeable) {
                        this.callback(Game.i.TileAt(this.mouseInput.x, this.mouseInput.y));
                    } else if (this._state === UIState.UIABPLACEMENT && this.placeable) {
                        if (this.a.X() === 0) {
                            this.a = Game.i.TileAt(this.mouseInput.x, this.mouseInput.y);
                        } else if (!this.draggingPlacement || this.a.X() !== this.b.X() || this.a.Y() !== this.b.Y()) {
                            //Place construction from a.b
                            if (this.a.X() > this.b.X()) {
                                tmp = this.a.X();
                                this.a.X(this.b.X());
                                this.b.X(tmp);
                                xswap = true;
                            }
                            if (this.a.Y() > this.b.Y()) {
                                tmp = this.a.Y();
                                this.a.Y(this.b.Y());
                                this.b.Y(tmp);
                                yswap = true;
                            }
                            for (let ix = this.a.X(); ix <= this.b.X(); ++ix) {
                                if (!yswap) {
                                    if (this.placementCallback(new Coordinate(ix, this.a.Y()), this._blueprint))
                                        this.callback(new Coordinate(ix, this.a.Y()));
                                } else {
                                    if (this.placementCallback(new Coordinate(ix, this.b.Y()), this._blueprint))
                                        this.callback(new Coordinate(ix, this.b.Y()));
                                }
                            }
                            for (let iy = this.a.Y(); iy <= this.b.Y(); ++iy) {
                                if (!xswap) {
                                    if (this.placementCallback(new Coordinate(this.b.X(), iy), this._blueprint))
                                        this.callback(new Coordinate(this.b.X(), iy));
                                } else {
                                    if (this.placementCallback(new Coordinate(this.a.X(), iy), this._blueprint))
                                        this.callback(new Coordinate(this.a.X(), iy));
                                }
                            }
                            this.a.X(0);
                            this.a.Y(0);
                            this.b.X(0);
                            this.b.Y(0);
                        }
                    } else if (this._state === UIState.UIRECTPLACEMENT && this.placeable) {
                        if (this.a.X() === 0) {
                            this.a = Game.i.TileAt(this.mouseInput.x, this.mouseInput.y);
                        } else if (!this.draggingPlacement || this.a.X() !== this.b.X() || this.a.Y() !== this.b.Y()) {
                            //Place construction from a.b
                            if (this.a.X() > this.b.X()) {
                                tmp = this.a.X();
                                this.a.X(this.b.X());
                                this.b.X(tmp);
                                xswap = true;
                            }
                            if (this.a.Y() > this.b.Y()) {
                                tmp = this.a.Y();
                                this.a.Y(this.b.Y());
                                this.b.Y(tmp);
                                yswap = true;
                            }

                            /*I removed the placement call from here, it causes unnecessary cancelations
                            Callbacks should check tile validity anyway*/
                            this.rectCallback(this.a, this.b);

                            this.a.X(0);
                            this.a.Y(0);
                            this.b.X(0);
                            this.b.Y(0);
                        }
                    } else { //Current state is not any kind of placement, so open construction/npc context menu if over one
                        if (!this.underCursor.empty()) this.sideBar.SetEntity( this.underCursor.begin());
                        else this.sideBar.SetEntity(/*boost.weak_ptr < Entity > ()*/null);
                    }
                }
            }
            this.draggingPlacement = false;
        } else if (newMouseInput.lbutton && !this.oldMouseInput.lbutton) {
            menuResult = this.sideBar.Update(this.mouseInput.cx, this.mouseInput.cy, false);
            if (menuResult & MenuResult.NOMENUHIT) {
                if (this.menuOpen) {
                    menuResult = this.currentMenu.Update(this.mouseInput.cx, this.mouseInput.cy, false, NO_KEY);
                }
                if (menuResult & MenuResult.NOMENUHIT) {
                    if (this._state === UIState.UIABPLACEMENT && this.placeable) {
                        if (this.a.X() === 0) {
                            this.a = Game.i.TileAt(this.mouseInput.x, this.mouseInput.y);
                            this.draggingPlacement = true;
                        }
                    } else if (this._state === UIState.UIRECTPLACEMENT && this.placeable) {
                        if (this.a.X() === 0) {
                            this.a = Game.i.TileAt(this.mouseInput.x, this.mouseInput.y);
                            this.draggingPlacement = true;
                        }
                    }
                }
            }
        }

        if (this.rbuttonPressed) {
            this.menuX = this.mouseInput.cx;
            this.menuY = this.mouseInput.cy;
            this.menuOpen = !this.menuOpen;
            this.currentMenu.selected(-1);
            if (!this.menuOpen || this._state !== UIState.UINORMAL) {
                this.CloseMenu();
            }
            this.currentMenu = 0;
            if (!this.underCursor.empty()) {
                if (this.underCursor.begin().lock()) {
                    if (this.underCursor.begin().lock()) {
                        if (!(this.underCursor.begin().lock()).DismantlingOrdered())
                            this.currentMenu = this.underCursor.begin().lock().GetContextMenu();
                    } else {
                        this.currentMenu = this.underCursor.begin().lock().GetContextMenu();
                    }
                }
            }
            if (!this.currentMenu) {
                this.currentMenu = Menu.MainMenu();
            }
            if (this.menuOpen) this.currentMenu.Open();
            this.menuHistory.clear();
            this.extraTooltip = "";
        }

        if (this.mbuttonPressed && this.menuOpen && !this.menuHistory.empty()) {
            this.currentMenu.selected(-1);
            this._state = UIState.UINORMAL;
            this.a.X(0);
            this.a.Y(0);
            this.currentMenu.Close();
            this.currentMenu = this.menuHistory.back();
            this.currentMenu.Open();
            this.menuHistory.pop_back();
        }

        if (newMouseInput.lbutton && this._state === UIState.UINORMAL) {
            Game.i.MoveCam(-(newMouseInput.dx / 3.0), -(newMouseInput.dy / 3.0));
            if (newMouseInput.dx > 0 || newMouseInput.dy > 0) this.draggingViewport = true;
        }

        this.lbuttonPressed = false;
        this.mbuttonPressed = false;
        this.rbuttonPressed = false;
        this.oldMouseInput = newMouseInput;
    }
    /** 
     * @param {TCODConsole *} the_console
     */
    Draw( the_console) {
        let tmp;
        let xswap = false, yswap = false;

        this.DrawTopBar(the_console);

        if (this.menuOpen) {
            this.currentMenu.Draw(this.menuX, this.menuY, the_console);
        }

        let mouseTile = new Coordinate(Game.i.TileAt(this.mouseInput.x, this.mouseInput.y));

        // boost.shared_ptr < MapRenderer > 
        let renderer = Game.i.Renderer();

        if (this._state === UIState.UIPLACEMENT || ((this._state === UIState.UIABPLACEMENT || this._state === UIState.UIRECTPLACEMENT) && this.a.X() === 0)) {
            renderer.DrawCursor(mouseTile, new Coordinate(mouseTile.X() + this._blueprint.X() - 1, mouseTile.Y() + this._blueprint.Y() - 1), this.placeable);
        } else if (this._state === UIState.UIABPLACEMENT && this.a.X() > 0) {
            if (this.a.X() > this.b.X()) {
                tmp = this.a.X();
                this.a.X(this.b.X());
                this.b.X(tmp);
                xswap = true;
            }
            if (this.a.Y() > this.b.Y()) {
                tmp = this.a.Y();
                this.a.Y(this.b.Y());
                this.b.Y(tmp);
                yswap = true;
            }
            for (let ix = this.a.X(); ix <= this.b.X(); ++ix) {
                if (!yswap) {
                    renderer.DrawCursor(new Coordinate(ix, this.a.Y()), this.placeable);
                } else {
                    renderer.DrawCursor(new Coordinate(ix, this.b.Y()), this.placeable);
                }
            }
            for (let iy = this.a.Y(); iy <= this.b.Y(); ++iy) {
                if (!xswap) {
                    renderer.DrawCursor(new Coordinate(this.b.X(), iy), this.placeable);
                } else {
                    renderer.DrawCursor(new Coordinate(this.a.X(), iy), this.placeable);
                }
            }
            if (xswap) {
                tmp = this.a.X();
                this.a.X(this.b.X());
                this.b.X(tmp);
            }
            if (yswap) {
                tmp = this.a.Y();
                this.a.Y(this.b.Y());
                this.b.Y(tmp);
            }
        } else if (this._state === UIState.UIRECTPLACEMENT && this.a.X() > 0) {
            if (this.a.X() > this.b.X()) {
                tmp = this.a.X();
                this.a.X(this.b.X());
                this.b.X(tmp);
                xswap = true;
            }
            if (this.a.Y() > this.b.Y()) {
                tmp = this.a.Y();
                this.a.Y(this.b.Y());
                this.b.Y(tmp);
                yswap = true;
            }
            renderer.DrawCursor(this.a, this.b, this.placeable);
            if (xswap) {
                tmp = this.a.X();
                this.a.X(this.b.X());
                this.b.X(tmp);
            }
            if (yswap) {
                tmp = this.a.Y();
                this.a.Y(this.b.Y());
                this.b.Y(tmp);
            }
        }

        if (this.drawCursor) renderer.DrawCursor(mouseTile, true);

        Announce.Draw(the_console);
        this.sideBar.Draw(the_console);

        Tooltip.Clear();

        if (this.extraTooltip !== "") Tooltip.AddEntry(new TooltipEntry(this.extraTooltip, Color.white));
        if (this.menuOpen) {
            this.currentMenu.GetTooltip(this.mouseInput.cx, this.mouseInput.cy, Tooltip);
        }

        this.sideBar.GetTooltip(this.mouseInput.cx, this.mouseInput.cy, Tooltip, the_console);

        if (this._state === UIState.UINORMAL && (!this.menuOpen || (this.currentMenu.Update(this.mouseInput.cx, this.mouseInput.cy, false, NO_KEY) & MenuResult.NOMENUHIT)) &&
            (this.sideBar.Update(this.mouseInput.cx, this.mouseInput.cy, false) & MenuResult.NOMENUHIT) &&
            (Announce.Update(this.mouseInput.cx, this.mouseInput.cy, false) & MenuResult.NOMENUHIT) &&
            !this.underCursor.empty()) {

            let strobeEntity = this.currentStrobeTarget.lock();
            if (strobeEntity) {
                strobeEntity.Strobe();
            }
            for (let ucit = this.underCursor.begin(); ucit !== this.underCursor.end(); ++ucit) {
                let entity = ucit.lock();
                if (entity) {
                    let mouseLoc = Game.i.TileAt(this.mouseInput.x, this.mouseInput.y);
                    entity.GetTooltip(mouseLoc.X(), mouseLoc.Y(), Tooltip);

                    if (entity.CanStrobe()) {
                        let strobeTarget = this.currentStrobeTarget.lock();
                        if (strobeTarget) {
                            if (entity !== strobeTarget) {
                                strobeTarget.ResetStrobe();
                            }
                        }
                        this.currentStrobeTarget = entity;
                    }

                }
            }
        } else{
            let strobeEntity = this.currentStrobeTarget.lock();
            if (strobeEntity) {
                strobeEntity.ResetStrobe();
                this.currentStrobeTarget.reset();
            }
        }


        Tooltip.Draw(this.mouseInput.cx, this.mouseInput.cy, the_console);
    }

    /**
     * @returns {int}
     * @param {TCODConsole *} the_console
     * @param {int} x
     * @param {int} y
     * @param {std.string} shortcut
     */
    DrawShortcutHelp(the_console, x, y, shortcut) {
        let keyMap = Config.GetKeyMap();
        let out = "";
        let found = false;
        for (let it = shortcut.begin(); it !== shortcut.end(); it++) {
            if (!found && it.toLowerCase() === keyMap[shortcut]) {
                out.push(TCOD_COLCTRL_1);
                out.push(it);
                out.push(TCOD_COLCTRL_STOP);
                found = true;
            } else {
                out.push(it);
            }
        }

        if (!found) {
            if (keyMap[shortcut] === ' ') {
                out.insert(0, `${TCOD_COLCTRL_1}Space${TCOD_COLCTRL_STOP}-`);
            } else {
                out.insert(0, `${TCOD_COLCTRL_1}${toupper(keyMap[shortcut])}${TCOD_COLCTRL_STOP}-`);
            }
        }

        out.push(' ');
        the_console.print(x, y, out.c_str());
        return out.length() - 2;
    }

    /**
     * 
     * @param {TCODConsole *} the_console
     */
    DrawTopBar(the_console) {
        the_console.setAlignment(TCOD_alignment_t.TCOD_CENTER);
        the_console.setDefaultForeground(Color.white);
        the_console.print(the_console.getWidth() / 2, 0, 
            `w(${GameMap.GetWindAbbreviation()})  -  ${Camp.i.GetName()}  -  Orcs: ${Game.i.OrcCount()}   Goblins: ${Game.i.GoblinCount()}  -  Year ${Game.i.GetAge()}, ${Game.i.SeasonToString(Game.i.CurrentSeason())}  FPS: ${TCODSystem.getFps()}`
        );

        if (Game.i.Paused()) {
            the_console.setDefaultForeground(Color.red);
            the_console.print(Game.i.ScreenWidth() / 2, 1, "- - - - PAUSED - - - -");
        }
        the_console.setAlignment((TCOD_alignment_t.TCOD_LEFT));

        if (this.keyHelpTextColor > 0) {
            the_console.setDefaultForeground(new Color(Math.min(255, this.keyHelpTextColor), Math.min(255, this.keyHelpTextColor), Math.min(255, this.keyHelpTextColor)));
            the_console.setColorControl(TCOD_COLCTRL_1, new Color(0, Math.min(255, this.keyHelpTextColor), 0), Color.black);
            let x = 10;
            x += this.DrawShortcutHelp(the_console, x, 3, "Exit");
            x += this.DrawShortcutHelp(the_console, x, 3, "Basics");
            x += this.DrawShortcutHelp(the_console, x, 3, "Workshops");
            x += this.DrawShortcutHelp(the_console, x, 3, "Orders");
            x += this.DrawShortcutHelp(the_console, x, 3, "Furniture");
            x += this.DrawShortcutHelp(the_console, x, 3, "StockManager");
            x += this.DrawShortcutHelp(the_console, x, 3, "Squads");
            x += this.DrawShortcutHelp(the_console, x, 3, "Announcements");
            x += this.DrawShortcutHelp(the_console, x, 3, "Jobs");
            x = 10;
            the_console.print(x, 5, 
                `${TCOD_COLCTRL_1}Shift+F1-F12${TCOD_COLCTRL_STOP} Set Mark  ${TCOD_COLCTRL_1}F1-F12${TCOD_COLCTRL_STOP} Return To Mark  `
            );
            x = 56;
            x += this.DrawShortcutHelp(the_console, x, 5, "Center");
            the_console.print(x, 5, "Camp");
            x = 10;
            x += this.DrawShortcutHelp(the_console, x, 7, "Pause");
        }

        the_console.setDefaultForeground(Color.white);
    }

    /**
     * 
     * @param {const Coordinate &} newBlue 
     */
    blueprint(newBlue) {
        this._blueprint = newBlue;
    }
    /**
     * 
     * @param {UIState} newState
     */
    state(newState) {
        this._state = newState;
    }

    /**
     * @param {Panel *}
     */
    static ChangeMenu(menu) {
        if (UI.CurrentMenu()) {
            UI.CurrentMenu().Close();
        }
        UI.CurrentMenu().selected(-1);
        UI.AddToHistory(UI.CurrentMenu());
        UI.CurrentMenu(menu);
        UI.menuOpen = true;
        menu.Open();
    }

    /**
     * @param {Panel *}
     */
    AddToHistory(menu) {
        this.menuHistory.push(menu);
    }

    /**
     * @param {Panel *}
     */
    CurrentMenu(menu) {
        if(menu)
            this.currentMenu = menu;
        return this.currentMenu;
    }

    /**
     * @param {boost.function<void(Coordinate)>)} newCallback
     */
    SetCallback(newCallback) {
        this.callback = newCallback;
    }

    /**
     * @param {boost.function<void(Coordinate)>)} newCallback
     */
    SetRectCallback(newCallback) {
        this.rectCallback = newCallback;
    }

    /**
     * @param {boost.function<void(Coordinate)>)} newCallback
     */
    SetPlacementCallback(newCallback) {
        this.placementCallback = newCallback;
    }

    /**
     * @param {ConstructionType} construct
     * @param {UIState} state
     */
    static ChooseConstruct(construct, state) {
        UI.SetCallback(boost.bind(Game.i.PlaceConstruction, _1, construct));
        UI.SetPlacementCallback(boost.bind(Game.i.CheckPlacement, _1, _2, Construction.Presets[construct].tileReqs));
        UI.blueprint(Construction.Blueprint(construct));
        UI.state(state);
        Game.i.Renderer().SetCursorMode(Cursor_Construct);
        UI.HideMenu();
        UI.SetExtraTooltip(Construction.Presets[construct].name);
    }

    static ChooseStockpile(ConstructionType stockpile) {
        let stockpileSymbol = '%';
        if (Construction.Presets[stockpile].tags[ConstructionTags.STOCKPILE]) {
            UI.SetCallback(boost.bind(Game.i.PlaceStockpile, _1, _1, stockpile, stockpileSymbol));
            UI.state(UIState.UIPLACEMENT);
        } else {
            UI.SetRectCallback(boost.bind(Game.i.PlaceStockpile, _1, _2, stockpile, stockpileSymbol));
            UI.state(UIState.UIRECTPLACEMENT);
        }
        UI.SetPlacementCallback(boost.bind(Game.i.CheckPlacement, _1, _2, Construction.Presets[stockpile].tileReqs));
        UI.blueprint(Construction.Blueprint(stockpile));
        Game.i.Renderer().SetCursorMode(Cursor_Stockpile);
        UI.HideMenu();
        UI.SetExtraTooltip(Construction.Presets[stockpile].name);
    }

    static ChooseTreeFelling() {
        UI.state(UIState.UIRECTPLACEMENT);
        UI.SetRectCallback(boost.bind(Game.i.FellTree, _1, _2));
        UI.SetPlacementCallback(boost.bind(Game.i.CheckTree, _1, _2));
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(Cursor_TreeFelling);
        UI.HideMenu();
        UI.SetExtraTooltip("Fell trees");
    }

    static ChoosePlantHarvest() {
        UI.state(UIState.UIRECTPLACEMENT);
        UI.SetRectCallback(boost.bind(Game.i.HarvestWildPlant, _1, _2));
        UI.SetPlacementCallback(boost.bind(Game.i.CheckTree, _1, _2));
        UI.blueprint(Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(Cursor_Harvest);
        UI.HideMenu();
        UI.SetExtraTooltip("Harvest plants");
    }

    /**
     * @param {boost.shared_ptr < Squad >} squad
     * @param {Order} order
     */
    static ChooseOrderTargetCoordinate(squad, order) {
        UI.state(UIState.UIPLACEMENT);
        let autoClose = true;
        if (order === Order.PATROL) {
            autoClose = false;
            order = Order.GUARD;
        }
        UI.SetCallback(boost.bind(Game.i.SetSquadTargetCoordinate, order, _1, squad, autoClose));
        UI.SetPlacementCallback(boost.bind(Game.i.CheckTree, _1, new Coordinate(1, 1)));
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(CursorType.Cursor_Order);
    }

    /**
     * @param {boost.shared_ptr < Squad >} squad
     * @param {Order} order
     */
    static ChooseOrderTargetEntity( squad,  order) {
        UI.state(UIState.UIPLACEMENT);
        UI.SetCallback(boost.bind(Game.i.SetSquadTargetEntity, order, _1, squad));
        UI.SetPlacementCallback(boost.bind(Game.i.CheckTree, _1, new Coordinate(1, 1)));
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(CursorType.Cursor_Order);
    }

    static ChooseDesignateTree() {
        UI.state(UIState.UIRECTPLACEMENT);
        UI.SetRectCallback(boost.bind(Game.i.DesignateTree, _1, _2));
        UI.SetPlacementCallback(boost.bind(Game.i.CheckTree, _1, _2));
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(Cursor_Tree);
        UI.HideMenu();
        UI.SetExtraTooltip("Designate trees");
    }

    static ChooseDismantle() {
        UI.state(UIState.UIRECTPLACEMENT);
        UI.SetRectCallback(boost.bind(Game.i.DismantleConstruction, _1, _2));
        UI.SetPlacementCallback(boost.bind(Game.i.CheckTree, _1, _2));
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(Cursor_Dismantle);
        UI.HideMenu();
        UI.SetExtraTooltip("Dismantle");
    }

    static ChooseUndesignate() {
        UI.state(UIState.UIRECTPLACEMENT);
        UI.SetRectCallback(boost.bind(Game.i.Undesignate, _1, _2));
        UI.SetPlacementCallback(boost.bind(Game.i.CheckTree, _1, _2));
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(Cursor_Undesignate);
        UI.HideMenu();
        UI.SetExtraTooltip("Undesignate");
    }

    static ChooseDesignateBog() {
        UI.state(UIState.UIRECTPLACEMENT);
        UI.SetRectCallback(boost.bind(Game.i.DesignateBog, _1, _2));
        UI.SetPlacementCallback(boost.bind(Game.i.CheckTileType, TILEBOG, _1, _2));
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(Cursor_Bog);
        UI.HideMenu();
        UI.SetExtraTooltip("Designate bog");
    }

    /**
     * @function GetEntity
     * @param {Coordinate} pos (reference)
     * @returns {Entity} (weak pointer to it)
     */
    GetEntity(pos) {
        if (pos.X() >= 0 && pos.X() < GameGameMap.i.Width() && pos.Y() >= 0 && pos.Y() < GameGameMap.i.Height()) {
            /** @type {Set{number)} */
            let npcList = GameGameMap.i.NPCList(pos);
            if (!npcList.empty()) return Game.i.GetNPC(( npcList.begin()));

            /** @type {Set{number)} */
            let itemList = GameMap.ItemList(pos);
            if (!itemList.empty()) {
                let itemi = Game.i.freeItemsSet.find(Game.itemList[itemList.begin()]);
                if (itemi !== Game.i.freeItemsSet.end()) {
                    return itemi;
                }
            }

            let entity = GameMap.GetNatureObject(pos);
            if (entity > -1) return (Game.i.natureList[entity]);

            entity = GameMap.GetConstruction(pos);
            if (entity > -1) return Game.i.GetConstruction(entity);
        }
        return null;
    }

    /**
     * @function HandleUnderCursor
     * @param {Coordinate} pos
     * @param {Array{Entity}} result -- pass by reference
     */
    HandleUnderCursor(pos, result) {
        result.clear();

        if (GameGameMap.i.IsInside(pos)) {
            /** @type {Set{int}} */
            let npcList = GameGameMap.i.NPCList(pos);
            if (!npcList.empty()) {
                for (let npci = npcList.begin(); npci !== npcList.end(); ++npci) {
                    result.push(Game.i.GetNPC( npci));
                }
            }

            /** @type {Set{int}} */
            let itemList = GameMap.ItemList(pos);
            if (!itemList.empty()) {
                for (let itemi = itemList.begin(); itemi !== itemList.end(); ++itemi) {
                    result.push(Game.itemList[ itemi]);
                }
            }

            let entity = GameMap.GetNatureObject(pos);
            if (entity > -1) {
                result.push(Game.i.natureList[entity]);
            }

            entity = GameMap.GetConstruction(pos);
            if (entity > -1) {
                result.push(Game.i.GetConstruction(entity));
            }
        }
        return result;
    }

    KeyHelpTextColor() {
        return this.keyHelpTextColor;
    }

    SetTextMode(val, limit = 50) {
        this.textMode = val;
        if (!this.textMode) 
            this.inputString = "";
        this.inputStringLimit = limit;
    }

    InputString(value){
        if(value)
            this.InputString_set(value);
        else
            return this.InputString_get();
    }
    InputString_set(value){
        this.inputString = value;
    }
    InputString_get(){
        return this.inputString;
    }

    HideMenu() {
        this.menuOpen = false;
        this.textMode = false;
    }

    CloseMenu() {
        this.menuOpen = false;
        this._state = UIState.UINORMAL;
        this.a.X(0);
        this.a.Y(0);
        this.textMode = false;
        if (this.currentMenu) this.currentMenu.Close();
        this.currentMenu = Menu.MainMenu();
        this.extraTooltip = "";
    }

    ShiftPressed() {
        return this.TCODConsole.isKeyPressed(TCODK_SHIFT);
    }
    getKey() {
        return this.key;
    }

    static ChooseCreateNPC() {
        let npc;
        let NPCChoiceMenu = new Menu([], "NPC");
        NPCChoiceMenu.AddChoice(new MenuChoice("None", () => (npc) = -1));
        for (let i = 0; i < NPC.Presets.size(); ++i) {
            NPCChoiceMenu.AddChoice(new MenuChoice(NPC.Presets[i].name, () => (npc) = i));
        }
        NPCChoiceMenu.ShowModal();

        if (npc >= 0) {
            this.instance.state(UIState.UIPLACEMENT);
            this.instance.SetCallback(Game.i.CreateNPC.bind(Game, new NPCType(npc)));
            this.instance.SetPlacementCallback(Game.i.CheckTree.bind(Game), new Coordinate(1, 1));
            this.instance.blueprint(new Coordinate(1, 1));
            this.instance.Game.i.Renderer().SetCursorMode(NPC.Presets[npc]);
        }
    }

    static ChooseCreateItem() {
        let item, category;
        let ItemCategoryMenu = new Menu([], "Categories");
        for (let i = 0; i < Item.Categories.size(); ++i) {
            if (Item.Categories[i].parent < 0)
                ItemCategoryMenu.AddChoice(MenuChoice(Item.Categories[i].name, () => (category) = i));
        }
        ItemCategoryMenu.ShowModal();

        let ItemChoiceMenu = new Menu([], "Item");
        ItemChoiceMenu.AddChoice(MenuChoice("None", () => (item) = -1));
        for (let i = 0; i < Item.Presets.size(); ++i) {
            if (Item.Presets[i].categories.find(category) !== Item.Presets[i].categories.end())
                ItemChoiceMenu.AddChoice(MenuChoice(Item.Presets[i].name, () => (item) = i));
        }
        ItemChoiceMenu.ShowModal();

        if (item >= 0) {
            this.instance.state(UIState.UIPLACEMENT);
            this.instance.SetCallback(this.instance.Game.i.CreateItem.bind(this.instance.Game, new ItemType(item), false, 0, [], []));
            this.instance.SetPlacementCallback(this.instance.Game.i.CheckTree.bind(this.instance.Game,new Coordinate(1, 1)));
            this.instance.blueprint(new Coordinate(1, 1));
            this.instance.Game.i.Renderer().SetCursorMode(Item.Presets[item]);
        }

    }

    static ChooseDig() {
        UI.state(UIState.UIRECTPLACEMENT);
        UI.SetRectCallback(boost.bind(Game.i.Dig, _1, _2));
        UI.SetPlacementCallback(boost.bind(Game.i.CheckPlacement, _1, _2, new Set()));
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(CursorType.Cursor_Dig);
        UI.HideMenu();
        UI.SetExtraTooltip("Dig");
    }

    static ChooseNaturify() {
        for (let i = 0; i < 10000; ++i) {
            GameMap.Naturify(Random.ChooseInExtent(GameMap.Extent()));
        }
    }

    static ChooseChangeTerritory(bool add) {
        if (Camp.i.IsAutoTerritoryEnabled() && !add) {
            Camp.i.DisableAutoTerritory();
            Announce.i.AddMsg("Automatic territory handling disabled", Color.cyan);
        }
        UI.state(UIState.UIRECTPLACEMENT);
        UI.SetRectCallback(boost.bind( GameMap.SetTerritoryRectangle, GameMap, _1, _2, add));
        UI.SetPlacementCallback(boost.bind(Game.i.CheckTree, _1, _2));
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(add ? Cursor_AddTerritory : Cursor_RemoveTerritory);
        UI.HideMenu();
        UI.SetExtraTooltip(add ? "Expand" : "Shrink");
    }

    static ChooseGatherItems() {
        UI.state(UIState.UIRECTPLACEMENT);
        UI.SetRectCallback(boost.bind( Game.i.GatherItems, Game.i, _1, _2));
        UI.SetPlacementCallback(boost.bind(Game.i.CheckTree, _1, _2));
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(Cursor_Gather);
        UI.HideMenu();
        UI.SetExtraTooltip("Gather items");
    }

    /**
     * 
     * @param {boost.function < void(Coordinate) >} callback
     * @param {boost.function < bool(Coordinate, Coordinate) >} placement
     * @param {int} cursor
     * @param {std.string} optionalTooltip
     */
    static ChooseNormalPlacement( callback,  placement, cursor, optionalTooltip = "") {
        UI.state(UIState.UIPLACEMENT);
        UI.SetCallback(callback);
        UI.SetPlacementCallback(placement);
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(cursor);
        if (optionalTooltip.length > 0) {
            UI.HideMenu();
            UI.SetExtraTooltip(optionalTooltip);
        }
    }

    /**
     * @param {boost.function < void(Coordinate, Coordinate) >} rectCallback
     * @param {boost.function < bool(Coordinate, Coordinate) >} placement
     * @param {int} cursor
     * @param {std.string} optionalTooltip
     */
    static ChooseRectPlacement(rectCallback, placement,  cursor,  optionalTooltip = "") {
        UI.state(UIState.UIRECTPLACEMENT);
        UI.SetRectCallback(rectCallback);
        UI.SetPlacementCallback(placement);
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(cursor);
        if (optionalTooltip.length > 0) {
            UI.HideMenu();
            UI.SetExtraTooltip(optionalTooltip);
        }
    }

    /**
     * @param {boost.function < void(Coordinate, Coordinate) >} rectCallback
     * @param {boost.function < bool(Coordinate, Coordinate) >} placement
     * @param {CursorType} cursor
     */
    static ChooseRectPlacementCursor(rectCallback, placement,  cursor) {
        UI.state(UIState.UIRECTPLACEMENT);
        UI.SetRectCallback(rectCallback);
        UI.SetPlacementCallback(placement);
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(cursor);
    }

    /**
     * @param {boost.function < void(Coordinate) >} callback
     * @param {boost.function < bool(Coordinate, Coordinate) >} placement
     * @param {int} cursor
     * @param {std.string} optionalTooltip
     */
    static ChooseABPlacement(callback, placement, cursor, optionalTooltip = "") {
        UI.state(UIState.UIABPLACEMENT);
        UI.SetCallback(callback);
        UI.SetPlacementCallback(placement);
        UI.blueprint(new Coordinate(1, 1));
        Game.i.Renderer().SetCursorMode(cursor);
        if (optionalTooltip.length > 0) {
            UI.HideMenu();
            UI.SetExtraTooltip(optionalTooltip);
        }
    }

    static SetExtraTooltip(tooltip) {
        this.extraTooltip = tooltip;
    }

}

Singletonify(UI);