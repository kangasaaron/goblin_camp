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

import { Paths } from "./data/Paths.js";
import { gameVersion } from "./Version.js";
import { Constants } from "./Constants.js";
import { Globals } from "./data/Globals.js";
import { Random } from "./Random.js";
import { MainMenuScreen } from "./other/MainMenuScreen.js";
import { BlendMode } from "./other/BlendMode.js";
import { Alignment } from "./other/Alignment.js";
import { Color } from "./color/Color.js";
import { Config } from "./data/Config.js";
// import { Engine } from "./scripting/Engine.js";
import { Data } from "./data/Data.js";
import { Game } from "./Game.js";
import { Mods } from "./data/Mods.js";
import { Announce } from "./Announce.js";
import { MessageBox } from "./UI/MessageBox.js";

// XXX: No, really.
class SettingRenderer {
    label = "";
    renderer = new TCOD_renderer_t();
    useTileset = false;
}

class SettingField {
    label = "";
    value = "";
}
// XXX: This really needs serious refactoring.


class Main {
    screens = {};
    eventQueue = [];
    constructor() {
        this.Game = new Game();
        this.Announce = new Announce();
        this.Data = new Data();
        this.Random = new Random();
        this.Config = new Config();
    }
    checkForEvent() {
        let e, m, k;
        if (this.eventQueue.length) {
            let e = this.eventQueue.shift(),
                m = { cx: 0, cy: 0 },
                k = " ";
        }
        return {
            event: e,
            mouse: m,
            key: k
        };
    }
    eventHandler(e) {
        // this.eventQueue.push(e);
        if (this.currentScreen && this.currentScreen.eventHandler)
            this.currentScreen.eventHandler(e);
        // e.stopPropagation();
    }
    Init(args) {
        let exitcode = 0;
        window.addEventListener('auxclick', this.eventHandler.bind(this));
        window.addEventListener('click', this.eventHandler.bind(this));
        window.addEventListener("contextmenu", this.eventHandler.bind(this));
        window.addEventListener("dblclick", this.eventHandler.bind(this));
        window.addEventListener('mousedown', this.eventHandler.bind(this));
        window.addEventListener('mouseenter', this.eventHandler.bind(this));
        window.addEventListener('mouseleave', this.eventHandler.bind(this));
        window.addEventListener('mousemove', this.eventHandler.bind(this));
        window.addEventListener('mouseover', this.eventHandler.bind(this));
        window.addEventListener('mouseup', this.eventHandler.bind(this));
        window.addEventListener('wheel', this.eventHandler.bind(this));

        window.addEventListener('touchcancel', this.eventHandler.bind(this));
        window.addEventListener('touchend', this.eventHandler.bind(this));
        window.addEventListener('touchmove', this.eventHandler.bind(this));
        window.addEventListener('touchstart', this.eventHandler.bind(this));

        window.addEventListener('gotpointercapture', this.eventHandler.bind(this));
        window.addEventListener('lostpointercapture', this.eventHandler.bind(this));
        window.addEventListener('pointercancel', this.eventHandler.bind(this));
        window.addEventListener('pointerdown', this.eventHandler.bind(this));
        window.addEventListener('pointerenter', this.eventHandler.bind(this));
        window.addEventListener('pointerleave', this.eventHandler.bind(this));
        window.addEventListener('pointerlockchange', this.eventHandler.bind(this));
        window.addEventListener('pointerlockerror', this.eventHandler.bind(this));
        window.addEventListener('pointermove', this.eventHandler.bind(this));
        window.addEventListener('pointerout', this.eventHandler.bind(this));
        window.addEventListener('pointerover', this.eventHandler.bind(this));
        window.addEventListener('pointerup', this.eventHandler.bind(this));

        window.addEventListener('keydown', this.eventHandler.bind(this));
        window.addEventListener("keypress", this.eventHandler.bind(this));
        window.addEventListener('keyup', this.eventHandler.bind(this));

        //
        // Bootstrap phase.
        //

        let me = this;
        let paths = new Paths();
        paths.Init()
            .then(me.Random.Init.bind(me.Random))
            .then(me.Config.Init.bind(me.Config))
            // .then(Script.Init)
            // TCOD_sys_startup();
            .then(me.Data.LoadConfig.bind(me.Data))
            // .then(Data.LoadFont.bind(Data))//TODO
            // .then(Game.LoadingScreen.bind(Game, Mods.Load.bind(Mods))) //TODO 
            .then(function () {
                // Parse command line.
                //
                console.log("args.length ", Array.from(args.values()).length);

                let bootTest = false;
                Globals.noDumpMode = false;

                for (let arg of args.entries()) {
                    if (arg[0] === "boottest") {
                        bootTest = true;
                    } else if (arg[0] === "dev") {
                        this.Game.EnableDevMode();
                    } else if (arg[0] === "nodumps") {
                        Globals.noDumpMode = true;
                    }
                }

                if (bootTest) {
                    console.logs("Bootstrap test, going into shutdown.");
                    return;
                }
                return me.MainMenu();
            })
            .catch(function (e) {
                console.error(e);
                //
                // Shutdown.
                //
                // Script.Shutdown();//TODO

                if (Globals.CHK_MEMORY_LEAKS) {
                    // Pull down the singletons. Unnecessary but eases memory leak detection
                    // delete Game;
                    // delete Tooltip;
                    // delete UI;
                    // delete Camp;
                    // delete Announce;
                    // delete StockManager;
                    // delete JobManager;
                    // delete Map;
                }
                console.warn("crashing", e);
                return exitcode;
            });
    }

    MainLoop() {
        if (!this.Game.Running()) {
            this.Announce.AddMsg("Press 'h' for keyboard shortcuts", Color.cyan);
        }
        this.Game.Running(true);

        let update = -1;
        if (Config.GetCVar("halfRendering")) update = 0;

        let elapsedMilli;
        let targetMilli = 1000 / (Constants.UPDATES_PER_SECOND);
        let startMilli = Date.now()
        while (this.Game.Running()) {
            if (this.Game.ToMainMenu()) {
                this.Game.ToMainMenu(false);
                return;
            }

            UI.Update();
            if (!this.Game.Paused()) {
                this.Game.Update();
                this.Announce.Update();
            }

            if (update <= 0) {
                this.Game.Draw();
                this.Game.FlipBuffer();
                if (update == 0) update = 1;
            } else if (update == 1) update = 0;

            elapsedMilli = Date.now() - startMilli;
            startMilli = Date.now();
            if (this.Game.Running()) {
                if (elapsedMilli < targetMilli)
                    setTimeout(this.MainLoop.bind(this), targetMilli - elapsedMilli);
                else
                    setTimeout(this.MainLoop.bind(this), 0);
            }
            return;
        }

        // Script.Event.GameEnd(); TODO
    }


    StartNewGame() {
        this.Game.Reset();
        this.Game = this.Game;

        this.Game.GenerateMap(time(0));
        this.Game.SetSeason(EarlySpring);

        // std.priority_queue < std.pair < int, Coordinate > > 
        let spawnCenterCandidates = new Map();

        for (let tries = 0; tries < 20; ++tries) {
            /**std.pair < int, Coordinate >*/
            let candidate = [0, Random.ChooseInExtent(zero + 100, Map.Extent() - 100)];

            let riverDistance = 1000,
                hillDistance = 1000;
            for (let i = 0; i < 4; ++i) {
                let dirs = [
                    WEST,
                    EAST,
                    NORTH,
                    SOUTH
                ];
                let distance = 200;
                let p = candidate.second + Coordinate.DirectionToCoordinate(dirs[i]) * distance;
                TCODLine.init(p.X(), p.Y(), candidate.second.X(), candidate.second.Y());
                do {
                    if (Map.IsInside(p)) {
                        if (Map.GetType(p) == TILEDITCH || Map.GetType(p) == TILERIVERBED) {
                            if (distance < riverDistance) riverDistance = distance;
                            if (distance < 25) riverDistance = 2000;
                        } else if (Map.GetType(p) == TILEROCK) {
                            if (distance < hillDistance) hillDistance = distance;
                        }
                    }
                    --distance;
                } while (!TCODLine.step(p.Xptr(), p.Yptr()));
            }

            candidate.first = -hillDistance - riverDistance;
            if (Map.GetType(candidate.second) != TILEGRASS) candidate.first -= 10000;
            spawnCenterCandidates.push(candidate);
        }

        let spawnTopCorner = spawnCenterCandidates.top().second - 20;
        let spawnBottomCorner = spawnCenterCandidates.top().second + 20;

        //Clear starting area
        for (let x = spawnTopCorner.X(); x < spawnBottomCorner.X(); ++x) {
            for (let y = spawnTopCorner.Y(); y < spawnBottomCorner.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (Map.GetNatureObject(p) >= 0 && Random.Generate(2) < 2) {
                    this.Game.RemoveNatureObject(this.Game.natureList[Map.GetNatureObject(p)]);
                }
            }
        }

        //we use Top+15, Bottom-15 to restrict the spawning zone of goblin&orc to the very center, instead of spilled over the whole camp
        this.Game.CreateNPCs(15, NPC.StringToNPCType("goblin"), spawnTopCorner + 15, spawnBottomCorner - 15);
        this.Game.CreateNPCs(6, NPC.StringToNPCType("orc"), spawnTopCorner + 15, spawnBottomCorner - 15);

        this.Game.CreateItems(30, Item.StringToItemType("Bloodberry seed"), spawnTopCorner, spawnBottomCorner);
        this.Game.CreateItems(5, Item.StringToItemType("Blueleaf seed"), spawnTopCorner, spawnBottomCorner);
        this.Game.CreateItems(30, Item.StringToItemType("Nightbloom seed"), spawnTopCorner, spawnBottomCorner);
        this.Game.CreateItems(20, Item.StringToItemType("Bread"), spawnTopCorner, spawnBottomCorner);

        //we place two corpses on the map
        let corpseLoc = Array(2);

        //find suitable location
        for (let c = 0; c < 2; ++c) {
            let p = new Coordinate();
            do {
                p = Random.ChooseInRectangle(spawnTopCorner, spawnBottomCorner);
            } while (!Map.IsWalkable(p));
            corpseLoc[c] = p;
        }

        //initialize corpses
        for (let c = 0; c < 2; ++c) {
            this.Game.CreateItem(corpseLoc[c], Item.StringToItemType("stone axe"));
            this.Game.CreateItem(corpseLoc[c], Item.StringToItemType("shovel"));
            let corpseuid = this.Game.CreateItem(corpseLoc[c], Item.StringToItemType("corpse"));
            // boost.shared_ptr < Item > 
            let corpse = this.Game.itemList[corpseuid];
            corpse.Name("Corpse(Human woodsman)");
            corpse.Color(Color.white);
            for (let i = 0; i < 6; ++i)
                this.Game.CreateBlood(Random.ChooseInRadius(corpseLoc[c], 2));
        }

        Camp.SetCenter(spawnCenterCandidates.top().second);
        this.Game.CenterOn(spawnCenterCandidates.top().second);

        Map.SetTerritoryRectangle(spawnTopCorner, spawnBottomCorner, true);

        Map.weather.ApplySeasonalEffects();

        for (let i = 0; i < 10; ++i)
            this.Game.events.SpawnBenignFauna();
    }


    ConfirmStartNewGame() {

        let run = this.Game.LoadingScreen.bind(this.Game, this.StartNewGame.bind(this));

        if (this.Game.Running()) {
            MessageBox.ShowMessageBox(
                "A game is already running, are you sure you want to start a new one?",
                run, "Yes", null, "No"
            );
        } else {
            run();
        }

        // Script.Event.GameStart();//TODO
        this.MainLoop();
    }
    render() {
        let needsRenderLoop = false;
        if (this.currentScreen)
            needsRenderLoop = this.currentScreen.render(this);
        if (needsRenderLoop)
            requestAnimationFrame(this.render.bind(this));
    }

    MainMenu() {
        if (!("MainMenu" in this.screens)) {
            this.screens.MainMenu = new MainMenuScreen(this);
        }
        this.currentScreen = this.screens.MainMenu;
        requestAnimationFrame(this.render.bind(this));
        return;
        // const unsigned int 
        // const entryCount = sizeof(entries) / sizeof(MainMenuEntry);
        const entryCount = entries.length;
        // void( * function)() = null;
        let func = null;

        let exit = false;
        let width = 20;
        let edgex = this.Game.ScreenWidth() / 2 - width / 2;
        let height = (entryCount * 2) + 2;
        let edgey = this.Game.ScreenHeight() / 2 - height / 2;
        let selected = -1;
        let endCredits = false;
        let lButtonDown = false;


        let key, mouse, event;

        while (!exit) {
            // FIXME: event checking before the_console flushing, should be other way around
            let result = this.checkForEvent();
            key = result.key,
                mouse = result.mouse,
                event = result.event;


            for (let idx = 0; idx < entryCount; ++idx) {
                const entry = entries[idx];


                // FIXME: checking here because of seemingly poor menu drawing procedure
                if (event instanceof KeyboardEvent) {
                    if (key.c == entry.shortcut && entry.isActive()) {
                        exit = (entry.func == null);

                        func = entry.func;
                    }
                }
            }

            // if (!endCredits) {
            //     endCredits = TCODConsole.renderCredits(edgex + 5, edgey + 25, true);
            // }


            if (document.visibilityState !== "visible") break;

            // FIXME: probably redundant
            if (event instanceof PointerEvent || event instanceof TouchEvent || event instanceof MouseEvent) {
                mouse = TCODMouse.getStatus();
                if (mouse.lbutton) {
                    lButtonDown = true;
                }
            }

            // FIXME: don't put this into an event clause until the whole method is properly rewritten with libtcod events
            if (func != null) {
                func();
            } else {
                if (mouse && mouse.cx > edgex && mouse.cx < edgex + width) {
                    selected = mouse.cy - (edgey + 2);
                } else selected = -1;

                if (mouse && !mouse.lbutton && lButtonDown) {
                    lButtonDown = false;
                    let entry = Math.floor(selected / 2.0);

                    if (entry >= 0 && entry < Math.round(entryCount) && entries[entry].isActive()) {
                        if (entries[entry].func == null) {
                            exit = true;
                        } else {
                            entries[entry].func();
                        }
                    }
                }
            }
        }

        return 0;
    }

    LoadMenu() {
        //std.vector < Data.Save > 
        let list = [];
        Data.GetSavedGames(list);

        // sort by last modification, newest on top
        std.sort(list.begin(), list.end(), std.greater(Data.Save));

        let width = 59; // 2 for borders, 20 for filename, 2 spacer, 20 for date, 2 spacer, 13 for filesize
        let edgex = this.Game.ScreenWidth() / 2 - width / 2;
        let height = list.size() + 4;
        let edgey = this.Game.ScreenHeight() / 2 - height / 2;
        let selected = -1;

        this.Game.buffer.setAlignment(Alignment.LEFT);

        let key = new TCOD_key_t();
        let mouse = new TCOD_mouse_t();
        let event = new TCOD_event_t();

        while (true) {
            this.Game.buffer.clear();

            this.Game.buffer.printFrame(edgex, edgey, width, height, true, BlendMode.BKGND_SET, "Saved games");

            this.Game.buffer.setAlignment(Alignment.CENTER);
            this.Game.buffer.print(edgex + (width / 2), edgey + 1, "ESC to cancel.");
            this.Game.buffer.setAlignment(Alignment.LEFT);

            for (let i = 0; i < static_cast < int > (list.size()); ++i) {
                if (selected == i) {
                    this.Game.buffer.setDefaultForeground(Color.black);
                    this.Game.buffer.setDefaultBackground(Color.white);
                } else {
                    this.Game.buffer.setDefaultForeground(Color.white);
                    this.Game.buffer.setDefaultBackground(Color.black);
                }

                let label = list[i].filename;
                if (label.size() > 20) {
                    label = label.substr(0, 17) + "...";
                }
                this.Game.buffer.print(edgex + 1, edgey + 3 + i, "%-20s", label.c_str());
                this.Game.buffer.setDefaultForeground(Color.azure);

                // last modification date
                this.Game.buffer.print(edgex + 1 + 20 + 2, edgey + 3 + i, "%-20s", list[i].date.c_str());

                // filesize
                this.Game.buffer.print(edgex + 1 + 20 + 2 + 20 + 2, edgey + 3 + i, "%s", list[i].size.c_str());
            }

            this.Game.buffer.setDefaultForeground(Color.white);
            this.Game.buffer.setDefaultBackground(Color.black);

            this.Game.buffer.flush();

            let result = this.checkForEvent();
            key = result.key,
                mouse = result.mouse,
                event = result.event;


            if (event & TCOD_EVENT_KEY_PRESS) {
                if (key.vk == TCODK_ESCAPE) {
                    break;
                }
            }

            if (event & TCOD_EVENT_MOUSE) {
                mouse = TCODMouse.getStatus();
            }

            if (event & TCOD_EVENT_MOUSE_MOVE) {
                if (mouse.cx > edgex && mouse.cx < edgex + width) {
                    selected = mouse.cy - (edgey + 3);
                } else selected = -1;
            }

            if (event & TCOD_EVENT_MOUSE_PRESS) {
                if (mouse.lbutton) {
                    if (selected < static_cast < int > (list.size()) && selected >= 0) {
                        if (!Data.LoadGame(list[selected].filename)) {
                            this.Game.buffer.setDefaultForeground(Color.white);
                            this.Game.buffer.setDefaultBackground(Color.black);
                            this.Game.buffer.setAlignment(Alignment.CENTER);
                            this.Game.buffer.clear();

                            this.Game.buffer.print(
                                this.Game.ScreenWidth() / 2, this.Game.ScreenHeight() / 2,
                                "Could not load the game. Refer to the logfile."
                            );

                            this.Game.buffer.print(
                                this.Game.ScreenWidth() / 2, this.Game.ScreenHeight() / 2 + 1,
                                "Press any key to return to the main menu."
                            );

                            this.Game.buffer.flush();
                            TCODConsole.waitForKeypress(true);
                            return;
                        }

                        this.MainLoop();
                        break;
                    }
                }
            }
        }
    }


    SaveMenu() {
        if (!this.Game.Running()) return;
        let saveName;
        this.Game.buffer.setDefaultForeground(Color.white);
        this.Game.buffer.setDefaultBackground(Color.black);

        // TODO: allow picking from list of previous saves (and choosing it with the mouse!)
        let key = new TCOD_key_t();
        let mouse = new TCOD_mouse_t();
        let event = new TCOD_event_t();

        while (true) {
            this.Game.buffer.clear();
            this.Game.buffer.printFrame(this.Game.ScreenWidth() / 2 - 15,
                this.Game.ScreenHeight() / 2 - 3, 30, 3, true, BlendMode.BKGND_SET, "Save name");
            this.Game.buffer.setDefaultBackground(Color.darkGrey);
            this.Game.buffer.rect(this.Game.ScreenWidth() / 2 - 14, this.Game.ScreenHeight() / 2 - 2, 28, 1, true);
            this.Game.buffer.setDefaultBackground(Color.black);
            this.Game.buffer.print(this.Game.ScreenWidth() / 2,
                this.Game.ScreenHeight() / 2 - 2, "%s", saveName.c_str());
            this.Game.buffer.flush();

            let result = this.checkForEvent();
            key = result.key,
                mouse = result.mouse,
                event = result.event;


            if (event & TCOD_EVENT_KEY_PRESS) {
                if (key.c >= ' ' && key.c <= '}' && saveName.size() < 28) {
                    saveName.push_back(key.c);
                } else if (key.vk == TCODK_BACKSPACE && saveName.size() > 0) {
                    saveName.erase(saveName.end() - 1);
                }

                if (key.vk == TCODK_ESCAPE) {
                    break;
                } else if (key.vk == TCODK_ENTER || key.vk == TCODK_KPENTER) {
                    savesCount = -1;
                    if (!Data.SaveGame(saveName)) {
                        this.Game.buffer.setDefaultForeground(Color.white);
                        this.Game.buffer.setDefaultBackground(Color.black);
                        this.Game.buffer.setAlignment(Alignment.CENTER);
                        this.Game.buffer.clear();

                        this.Game.buffer.print(
                            this.Game.ScreenWidth() / 2, this.Game.ScreenHeight() / 2,
                            "Could not save the game. Refer to the logfile."
                        );

                        this.Game.buffer.print(
                            this.Game.ScreenWidth() / 2, this.Game.ScreenHeight() / 2 + 1,
                            "Press any key to return to the main menu."
                        );

                        this.Game.buffer.flush();
                        TCODConsole.waitForKeypress(true);
                        return;
                    }
                    break;
                }
            }
        }
        return;
    }



    // TODO: split into smaller functions?
    SettingsMenu() {
        let width = Config.GetStringCVar("resolutionX");
        let height = Config.GetStringCVar("resolutionY");
        let renderer = new TCOD_renderer_t(Config.GetCVar < int > ("renderer"));
        let useTileset = Config.GetCVar < bool > ("useTileset");
        let fullscreen = Config.GetCVar < bool > ("fullscreen");
        let tutorial = Config.GetCVar < bool > ("tutorial");
        let translucentUI = Config.GetCVar < bool > ("translucentUI");
        let compressSaves = Config.GetCVar < bool > ("compressSaves");
        let autosave = Config.GetCVar < bool > ("autosave");
        let pauseOnDanger = Config.GetCVar < bool > ("pauseOnDanger");

        this.Game.buffer.setAlignment(Alignment.LEFT);

        const w = 40;
        const h = 29;
        const x = this.Game.ScreenWidth() / 2 - (w / 2);
        const y = this.Game.ScreenHeight() / 2 - (h / 2);

        let renderers = [
            new SettingRenderer(
                "GLSL Tileset",
                TCOD_RENDERER_GLSL,
                true
            ),
            new SettingRenderer(
                "OpenGL Tileset",
                TCOD_RENDERER_OPENGL,
                true
            ),
            new SettingRenderer(
                "Tileset",
                TCOD_RENDERER_SDL,
                true
            ),
            new SettingRenderer(
                "GLSL",
                TCOD_RENDERER_GLSL,
                false
            ),
            new SettingRenderer(
                "OpenGL",
                TCOD_RENDERER_OPENGL,
                false
            ),
            new SettingRenderer(
                "SDL",
                TCOD_RENDERER_SDL,
                false
            )
        ];

        let fields = [
            new SettingField(
                "Resolution (width)",
                width
            ),
            new SettingField(
                "Resolution (height)",
                height
            ),
        ];

        // SettingField * 
        let focus = fields[0];
        const rendererCount = renderers.length; //sizeof(renderers) / sizeof(SettingRenderer);
        const fieldCount = fields.length; //sizeof(fields) / sizeof(SettingField);

        let key = new TCOD_key_t();
        let mouse = new TCOD_mouse_t();
        let event = new TCOD_event_t();

        let clicked = (false);

        while (true) {
            this.Game.buffer.clear();

            this.Game.buffer.setDefaultForeground(Color.white);
            this.Game.buffer.setDefaultBackground(Color.black);

            this.Game.buffer.printFrame(x, y, w, h, true, BlendMode.BKGND_SET, "Settings");
            this.Game.buffer.print(x + 1, y + 1, "ENTER to save changes, ESC to discard.");

            let currentY = y + 3;

            for (let idx = 0; idx < fieldCount; ++idx) {
                if (focus == fields[idx]) {
                    this.Game.buffer.setDefaultForeground(Color.green);
                }
                this.Game.buffer.print(x + 1, currentY, fields[idx].label);

                this.Game.buffer.setDefaultForeground(Color.white);
                this.Game.buffer.setDefaultBackground(Color.darkGrey);
                this.Game.buffer.rect(x + 3, currentY + 1, w - 7, 1, true);
                this.Game.buffer.print(x + 3, currentY + 1, "%s", fields[idx].value.c_str());
                this.Game.buffer.setDefaultBackground(Color.black);

                currentY += 3;
            }

            this.Game.buffer.setDefaultForeground((fullscreen ? Color.green : Color.grey));
            this.Game.buffer.print(x + 1, currentY, "Fullscreen mode");

            currentY += 2;
            this.Game.buffer.setDefaultForeground((tutorial ? Color.green : Color.grey));
            this.Game.buffer.print(x + 1, currentY, "Tutorial");

            currentY += 2;
            this.Game.buffer.setDefaultForeground((translucentUI ? Color.green : Color.grey));
            this.Game.buffer.print(x + 1, currentY, "Translucent UI");

            currentY += 2;
            this.Game.buffer.setDefaultForeground((compressSaves ? Color.green : Color.grey));
            this.Game.buffer.print(x + 1, currentY, "Compress saves");

            currentY += 2;
            this.Game.buffer.setDefaultForeground((autosave ? Color.green : Color.grey));
            this.Game.buffer.print(x + 1, currentY, "Autosave");

            currentY += 2;
            this.Game.buffer.setDefaultForeground((pauseOnDanger ? Color.green : Color.grey));
            this.Game.buffer.print(x + 1, currentY, "Pause on danger");

            currentY += 2;
            this.Game.buffer.setDefaultForeground(Color.white);
            this.Game.buffer.print(x + 1, currentY, "Renderer");

            for (let idx = 0; idx < rendererCount; ++idx) {
                if (renderer == renderers[idx].renderer && useTileset == renderers[idx].useTileset) {
                    this.Game.buffer.setDefaultForeground(Color.green);
                } else {
                    this.Game.buffer.setDefaultForeground(Color.grey);
                }
                this.Game.buffer.print(x + 3, currentY + idx + 1, renderers[idx].label);
            }

            this.Game.buffer.flush();

            let result = this.checkForEvent();
            key = result.key,
                mouse = result.mouse,
                event = result.event;


            if (event & TCOD_EVENT_KEY_PRESS) {
                if (key.vk == TCODK_ESCAPE) return;
                else if (key.vk == TCODK_ENTER || key.vk == TCODK_KPENTER) break;

                // TODO: if field had 'mask' property it would be bit more generic..
                if (focus != null) {
                    let str = focus.value;

                    if (key.c >= '0' && key.c <= '9' && str.size() < (w - 7)) {
                        str.push_back(key.c);
                    } else if (key.vk == TCODK_BACKSPACE && str.size() > 0) {
                        str.erase(str.end() - 1);
                    }
                }
            }

            // FIXME: don't use 'clicked', use events
            if (event & TCOD_EVENT_MOUSE) {
                mouse = TCODMouse.getStatus();
                if (mouse.lbutton) {
                    clicked = true;
                }

                if (clicked && !mouse.lbutton && mouse.cx > x && mouse.cx < x + w && mouse.cy > y && mouse.cy < y + h) {
                    clicked = false;
                    let whereY = mouse.cy - y - 1;
                    let rendererY = currentY - y - 1;
                    let fullscreenY = rendererY - 12;
                    let tutorialY = rendererY - 10;
                    let translucentUIY = rendererY - 8;
                    let compressSavesY = rendererY - 6;
                    let autosaveY = rendererY - 4;
                    let pauseOnDangerY = rendererY - 2;

                    if (whereY > 1 && whereY < fullscreenY) {
                        let whereFocus = (Math.floor((whereY - 2) / 3.0));
                        if (whereFocus >= 0 && whereFocus < static_cast < int > (fieldCount)) {
                            focus = fields[whereFocus];
                        }
                    } else if (whereY == fullscreenY) {
                        fullscreen = !fullscreen;
                    } else if (whereY == tutorialY) {
                        tutorial = !tutorial;
                    } else if (whereY == translucentUIY) {
                        translucentUI = !translucentUI;
                    } else if (whereY == compressSavesY) {
                        compressSaves = !compressSaves;
                    } else if (whereY == autosaveY) {
                        autosave = !autosave;
                    } else if (whereY == pauseOnDangerY) {
                        pauseOnDanger = !pauseOnDanger;
                    } else if (whereY > rendererY) {
                        let whereRenderer = whereY - rendererY - 1;
                        if (whereRenderer >= 0 && whereRenderer < static_cast < int > (rendererCount)) {
                            renderer = renderers[whereRenderer].renderer;
                            useTileset = renderers[whereRenderer].useTileset;
                        }
                    }
                }
            }
        }

        Config.SetStringCVar("resolutionX", width);
        Config.SetStringCVar("resolutionY", height);
        Config.SetCVar("renderer", renderer);
        Config.SetCVar("useTileset", useTileset);
        Config.SetCVar("fullscreen", fullscreen);
        Config.SetCVar("tutorial", tutorial);
        Config.SetCVar("translucentUI", translucentUI);
        Config.SetCVar("compressSaves", compressSaves);
        Config.SetCVar("autosave", autosave);
        Config.SetCVar("pauseOnDanger", pauseOnDanger);

        try {
            Config.Save();
        } catch (e) {
            LOG("Could not save configuration! " << e.what());
        }
        if (this.Game.Renderer()) {
            this.Game.Renderer().SetTranslucentUI(translucentUI);
        }
    }

    // Possible TODO: toggle mods on and off.
    ModsMenu() {
        this.Game.buffer.setAlignment(Alignment.LEFT);

        const w = 60;
        const h = 20;
        const x = this.Game.ScreenWidth() / 2 - (w / 2);
        const y = this.Game.ScreenHeight() / 2 - (h / 2);

        // const std.list < Mods.Metadata > & 
        const modList = Mods.GetLoaded();
        const subH = static_cast < int > (modList.size()) * 9;
        let sub = new TCODConsole(w - 2, Math.max(1, subH));

        let currentY = 0;

        modList.forEach(function (mod) {
            sub.setDefaultBackground(Color.black);

            sub.setAlignment(Alignment.CENTER);
            sub.setDefaultForeground(Color.azure);
            sub.print(w / 2, currentY, "%s", mod.mod.c_str());

            sub.setAlignment(Alignment.LEFT);
            sub.setDefaultForeground(Color.white);
            sub.print(3, currentY + 2, "Name:    %s", mod.name.c_str());
            sub.print(3, currentY + 4, "Author:  %s", mod.author.c_str());
            sub.print(3, currentY + 6, "Version: %s", mod.version.c_str());

            currentY += 9;
        });

        let key = new TCOD_key_t();
        let mouse = new TCOD_mouse_t();
        let event = new TCOD_event_t();

        let scroll = 0;
        let clicked = false;

        while (true) {
            this.Game.buffer.clear();

            this.Game.buffer.setDefaultForeground(Color.white);
            this.Game.buffer.setDefaultBackground(Color.black);

            this.Game.buffer.printFrame(x, y, w, h, true, BlendMode.BKGND_SET, "Loaded mods");
            TCODConsole.blit(sub, 0, scroll, w - 2, h - 3, this.Game.buffer, x + 1, y + 2);

            this.Game.buffer.putChar(x + w - 2, y + 1, TCOD_CHAR_ARROW_N, BlendMode.BKGND_SET);
            this.Game.buffer.putChar(x + w - 2, y + h - 2, TCOD_CHAR_ARROW_S, BlendMode.BKGND_SET);

            this.Game.buffer.flush();

            let result = this.checkForEvent();
            key = result.key,
                mouse = result.mouse,
                event = result.event;


            if (event & TCOD_EVENT_KEY_PRESS) {
                if (key.vk == TCODK_ESCAPE) return;
            }

            if (event & TCOD_EVENT_MOUSE) {
                mouse = TCODMouse.getStatus();
                if (mouse.lbutton) {
                    clicked = true;
                }

                if (clicked && !mouse.lbutton) {
                    if (mouse.cx == x + w - 2) {
                        if (mouse.cy == y + 1) {
                            scroll = Math.max(0, scroll - 1);
                        } else if (mouse.cy == y + h - 2) {
                            scroll = Math.min(subH - h + 3, scroll + 1);
                        }
                    }
                    clicked = false;
                }
            }
        }
    }


    TilesetsMenu() {
        this.Game.buffer.setAlignment(Alignment.LEFT);

        let screenWidth = this.Game.buffer.getWidth();
        let screenHeight = this.Game.buffer.getHeight();

        let listWidth = screenWidth / 3;

        // const std.vector < TileSetMetadata > 
        const tilesetsList = Tilesets.LoadTilesetMetadata();

        // const int 
        const subH = static_cast < int > (tilesetsList.size());

        let sub = new TCODConsole(listWidth - 2, Math.max(1, subH));

        let currentY = 0;

        tilesetsList.forEach(function (tileset) {
            sub.setDefaultBackground(Color.black);

            sub.setAlignment(Alignment.LEFT);
            sub.setDefaultForeground(Color.azure);
            sub.print(0, currentY, "%s", tileset.name.c_str());
            currentY += 1;
        });

        let key = new TCOD_key_t();
        let mouse = new TCOD_mouse_t();
        let event = new TCOD_event_t();

        let originalSelection = -1;
        let selection = 0;
        let tilesetDir = Config.GetStringCVar("tileset");
        if (tilesetDir.size() === 0) {
            tilesetDir = "default";
        }
        for (let i = 0; i < tilesetsList.size(); ++i) {
            if (boost.iequals(tilesetDir, tilesetsList.at(i).path.filename().string())) {
                selection = static_cast < int > (i);
                originalSelection = static_cast < int > (i);
                break;
            }
        }

        let scroll = 0;
        let clicked = false;

        while (true) {
            this.Game.buffer.clear();

            this.Game.buffer.setDefaultForeground(Color.white);
            this.Game.buffer.setDefaultBackground(Color.black);

            // Left frame
            this.Game.buffer.printFrame(0, 0, listWidth, screenHeight, true, BlendMode.BKGND_SET, "Tilesets");
            TCODConsole.blit(sub, 0, scroll, listWidth - 2, screenHeight - 4, this.Game.buffer, 1, 2);

            if (scroll > 0) {
                this.Game.buffer.putChar(listWidth - 2, 1, TCOD_CHAR_ARROW_N, BlendMode.BKGND_SET);
            }
            if (scroll < subH - screenHeight + 3) {
                this.Game.buffer.putChar(listWidth - 2, screenHeight - 2, TCOD_CHAR_ARROW_S, BlendMode.BKGND_SET);
            }

            // Right frame
            this.Game.buffer.printFrame(listWidth, 0, screenWidth - listWidth, screenHeight, true, BlendMode.BKGND_SET, "Details");

            if (selection < static_cast < int > (tilesetsList.size())) {
                this.Game.buffer.print(listWidth + 3, 2, "Name:    %s", tilesetsList.at(selection).name.c_str());
                this.Game.buffer.print(listWidth + 3, 4, "Size:    %dx%d", tilesetsList.at(selection).width, tilesetsList.at(selection).height);
                this.Game.buffer.print(listWidth + 3, 6, "Author:  %s", tilesetsList.at(selection).author.c_str());
                this.Game.buffer.print(listWidth + 3, 8, "Version: %s", tilesetsList.at(selection).version.c_str());
                this.Game.buffer.print(listWidth + 3, 10, "Description:");
                this.Game.buffer.printRect(listWidth + 3, 12, screenWidth - listWidth - 6, screenHeight - 19, "%s", tilesetsList.at(selection).description.c_str());
            }

            // Buttons
            let buttonDist = (screenWidth - listWidth) / 3;
            this.Game.buffer.printFrame(listWidth + buttonDist - 4, screenHeight - 6, 8, 3);
            this.Game.buffer.print(listWidth + buttonDist - 1, screenHeight - 5, "Ok");
            this.Game.buffer.printFrame(listWidth + 2 * buttonDist - 4, screenHeight - 6, 8, 3);
            this.Game.buffer.print(listWidth + 2 * buttonDist - 3, screenHeight - 5, "Cancel");

            this.Game.buffer.flush();

            let result = this.checkForEvent();
            key = result.key,
                mouse = result.mouse,
                event = result.event;


            if (event & TCOD_EVENT_KEY_PRESS) {
                if (key.vk == TCODK_ESCAPE) return;
            }

            if (event & TCOD_EVENT_MOUSE) {
                mouse = TCODMouse.getStatus();
                if (mouse.lbutton) {
                    clicked = true;
                }

                if (clicked && !mouse.lbutton) {
                    // Left frame click checks
                    if (mouse.cx == listWidth - 2) {
                        if (mouse.cy == 1) {
                            scroll = Math.max(0, scroll - 1);
                        } else if (mouse.cy == screenHeight - 2) {
                            scroll = Math.max(0, Math.min(subH - screenHeight + 3, scroll + 1));
                        }
                    } else if (mouse.cx > 1 && mouse.cx < listWidth - 2 && mouse.cy > 1 && mouse.cy < screenHeight - 2 &&
                        mouse.cy - 2 + scroll < static_cast < int > (tilesetsList.size())) {
                        selection = scroll + mouse.cy - 2;
                    }

                    // Button clicks
                    else if (mouse.cy >= screenHeight - 6 && mouse.cy < screenHeight - 3) {
                        if (mouse.cx >= listWidth + buttonDist - 4 && mouse.cx < listWidth + buttonDist + 4) {
                            if (selection != originalSelection) {
                                Config.SetStringCVar("tileset", tilesetsList.at(selection).path.filename().string());
                            }
                            this.Game.ResetRenderer();
                            return;
                        } else if (mouse.cx >= listWidth + 2 * buttonDist - 4 && mouse.cx < listWidth + 2 * buttonDist + 4) {
                            return;
                        }
                    }
                    clicked = false;
                }
            }
        }
    }

    KeysMenu() {
        // Config.KeyMap & 
        let keyMap = Config.GetKeyMap();
        // std.vector < std.string > 
        let labels = new Array(keyMap.size());
        // labels.reserve(keyMap.size());

        this.Game.buffer.setAlignment(Alignment.LEFT);

        let w = 40;
        const h = static_cast < int > (keyMap.size()) + 4;

        for (let pair of keyMap.entries()) {
            w = Math.max(w, pair[0].size() + 7); // 2 for borders, 5 for [ X ]
            labels.push_back(pair[0]);
        }

        const x = this.Game.ScreenWidth() / 2 - (w / 2);
        const y = this.Game.ScreenHeight() / 2 - (h / 2);

        let key = new TCOD_key_t();
        let mouse = new TCOD_mouse_t();
        let event = new TCOD_event_t();

        let focus = 0;

        while (true) {
            this.Game.buffer.clear();

            this.Game.buffer.setDefaultForeground(Color.white);
            this.Game.buffer.setDefaultBackground(Color.black);

            this.Game.buffer.printFrame(x, y, w, h, true, BlendMode.BKGND_SET, "Keys");
            this.Game.buffer.print(x + 1, y + 1, "ENTER to save changes, ESC to discard.");

            for (let idx = 0; idx < static_cast < int > (labels.size()); ++idx) {
                if (focus == idx) {
                    this.Game.buffer.setDefaultForeground(Color.green);
                }
                this.Game.buffer.print(x + 1, y + idx + 3, labels[idx].c_str());

                let key = keyMap[labels[idx]];
                this.Game.buffer.print(x + w - 6, y + idx + 3, (key == ' ' ? "[SPC]" : "[ %c ]"), key);

                this.Game.buffer.setDefaultForeground(Color.white);
            }

            this.Game.buffer.flush();

            let result = this.checkForEvent();
            key = result.key,
                mouse = result.mouse,
                event = result.event;


            if (event & TCOD_EVENT_KEY_PRESS) {
                if (key.vk == TCODK_ESCAPE) return;
                else if (key.vk == TCODK_ENTER || key.vk == TCODK_KPENTER) break;

                if (key.c >= ' ' && key.c <= '~') {
                    keyMap[labels[focus]] = key.c;
                }
            }

            if (event & TCOD_EVENT_MOUSE_MOVE) {
                mouse = TCODMouse.getStatus();

                if (mouse.lbutton && mouse.cx > x && mouse.cx < x + w && mouse.cy >= y + 3 && mouse.cy < y + h - 1) {
                    focus = mouse.cy - y - 3;
                }
            }
        }

        try {
            Config.Save();
        } catch (e) {
            LOG("Could not save keymap! " << e.what());
        }
    }
}


let main = new Main();

export function GCMain(args) {
    return main.Init(args);
}
