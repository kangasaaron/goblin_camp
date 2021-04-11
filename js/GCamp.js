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
import { Globals } from "./data/Globals.js";
import { Random } from "./Random.js";
import { Config } from "./data/Config.js";
// import { Engine } from "./scripting/Engine.js";
import { Data } from "./data/Data.js";
import { Game } from "./Game.js";
import { Mods } from "./data/Mods.js";

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

class MainMenuEntry {
    label = "";
    shortcut = "";
    /** @type {function} */
    isActive = null;
    /** @type {function} */
    func = null;
    constructor(l, s, a, f) {
        this.label = l;
        this.shortcut = s;
        this.isActive = a;
        this.func = f;
    }
}

function ActiveAlways() {
    return true;
}

function ActiveIfRunning() {
    return Game.Running();
}

let savesCount = -1;

function ActiveIfHasSaves() {
    if (savesCount == -1) savesCount = Data.CountSavedGames();
    return savesCount > 0;
}

class Main {
    eventQueue = [];
    checkForEvent() {
        return this.eventQueue.shift();
    }
    eventHandler(e) {
        this.eventQueue.push(e);
        e.stopPropagation();
    }
    Init(args) {
        let exitcode = 0;
        window.addEventListener('click', this.eventHandler.bind(this));
        window.addEventListener("dblclick", this.eventHandler.bind(this));
        window.addEventListener("mouseup", this.eventHandler.bind(this));
        window.addEventListener('mousedown', this.eventHandler.bind(this));
        window.addEventListener('wheel', this.eventHandler.bind(this));

        window.addEventListener('keydown', this.eventHandler.bind(this));
        window.addEventListener("keypress", this.eventHandler.bind(this));
        window.addEventListener('keyup', this.eventHandler.bind(this));

        window.addEventListener("touchstart", this.eventHandler.bind(this));
        window.addEventListener('touchend', this.eventHandler.bind(this));
        window.addEventListener('touchcancel', this.eventHandler.bind(this));
        window.addEventListener("touchmove", this.eventHandler.bind(this));

        //
        // Bootstrap phase.
        //

        let me = this;
        Paths.Init()
            .then(Random.Init.bind(Random))
            .then(Config.Init.bind(Config))
            // .then(Script.Init)
            // TCOD_sys_startup();
            .then(Data.LoadConfig.bind(Data))
            // .then(Data.LoadFont.bind(Data))//TODO
            .then(Game.LoadingScreen.bind(Game, Mods.Load))
            .then(function() {
                // Parse command line.
                //
                console.log("args.length ", Array.from(args.values()).length);

                let bootTest = false;
                Globals.noDumpMode = false;

                for (let arg of args.entries()) {
                    if (arg[0] === "boottest") {
                        bootTest = true;
                    } else if (arg[0] === "dev") {
                        Game.EnableDevMode();
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
            .catch(function(e) {
                console.warn(e);
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

                return exitcode;
            });
    }

    MainLoop() {
        if (!Game.Running()) {
            Announce.AddMsg("Press 'h' for keyboard shortcuts", Color.cyan);
        }
        Game.Running(true);

        let update = -1;
        if (Config.GetCVar("halfRendering")) update = 0;

        let elapsedMilli;
        let targetMilli = 1000 / (UPDATES_PER_SECOND);
        let startMilli = TCODSystem.getElapsedMilli();
        while (Game.Running()) {
            if (Game.ToMainMenu()) {
                Game.ToMainMenu(false);
                return;
            }

            UI.Update();
            if (!Game.Paused()) {
                Game.Update();
                Announce.Update();
            }

            if (update <= 0) {
                Game.Draw();
                Game.FlipBuffer();
                if (update == 0) update = 1;
            } else if (update == 1) update = 0;

            elapsedMilli = TCODSystem.getElapsedMilli() - startMilli;
            startMilli = TCODSystem.getElapsedMilli();
            if (elapsedMilli < targetMilli) TCODSystem.sleepMilli(targetMilli - elapsedMilli);
        }

        Script.Event.GameEnd();
    }


    StartNewGame() {
        Game.Reset();
        Game = Game;

        Game.GenerateMap(time(0));
        Game.SetSeason(EarlySpring);

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
                    Game.RemoveNatureObject(Game.natureList[Map.GetNatureObject(p)]);
                }
            }
        }

        //we use Top+15, Bottom-15 to restrict the spawning zone of goblin&orc to the very center, instead of spilled over the whole camp
        Game.CreateNPCs(15, NPC.StringToNPCType("goblin"), spawnTopCorner + 15, spawnBottomCorner - 15);
        Game.CreateNPCs(6, NPC.StringToNPCType("orc"), spawnTopCorner + 15, spawnBottomCorner - 15);

        Game.CreateItems(30, Item.StringToItemType("Bloodberry seed"), spawnTopCorner, spawnBottomCorner);
        Game.CreateItems(5, Item.StringToItemType("Blueleaf seed"), spawnTopCorner, spawnBottomCorner);
        Game.CreateItems(30, Item.StringToItemType("Nightbloom seed"), spawnTopCorner, spawnBottomCorner);
        Game.CreateItems(20, Item.StringToItemType("Bread"), spawnTopCorner, spawnBottomCorner);

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
            Game.CreateItem(corpseLoc[c], Item.StringToItemType("stone axe"));
            Game.CreateItem(corpseLoc[c], Item.StringToItemType("shovel"));
            let corpseuid = Game.CreateItem(corpseLoc[c], Item.StringToItemType("corpse"));
            // boost.shared_ptr < Item > 
            let corpse = Game.itemList[corpseuid];
            corpse.Name("Corpse(Human woodsman)");
            corpse.Color(Color.white);
            for (let i = 0; i < 6; ++i)
                Game.CreateBlood(Random.ChooseInRadius(corpseLoc[c], 2));
        }

        Camp.SetCenter(spawnCenterCandidates.top().second);
        Game.CenterOn(spawnCenterCandidates.top().second);

        Map.SetTerritoryRectangle(spawnTopCorner, spawnBottomCorner, true);

        Map.weather.ApplySeasonalEffects();

        for (let i = 0; i < 10; ++i)
            Game.events.SpawnBenignFauna();
    }


    ConfirmStartNewGame() {
        //boost.function < void(void) > 
        let run = (boost.bind(Game.LoadingScreen, StartNewGame));

        if (Game.Running()) {
            MessageBox.ShowMessageBox(
                "A game is already running, are you sure you want  to start a new one?",
                run, "Yes", null, "No"
            );
        } else {
            run();
        }

        // Script.Event.GameStart();//TODO
        this.MainLoop();
    }

    MainMenu() {
        let entries = [
            new MainMenuEntry(
                "New Game",
                'n',
                ActiveAlways,
                this.ConfirmStartNewGame.bind(this)
            ),
            new MainMenuEntry(
                "Continue",
                'c',
                ActiveIfRunning,
                this.MainLoop.bind(this)
            ),
            new MainMenuEntry(
                "Load",
                'l',
                ActiveIfHasSaves,
                this.LoadMenu.bind(this)
            ),
            new MainMenuEntry(
                "Save",
                's',
                ActiveIfRunning,
                this.SaveMenu.bind(this)
            ),
            new MainMenuEntry(
                "Settings",
                'o',
                ActiveAlways,
                this.SettingsMenu.bind(this)
            ),
            new MainMenuEntry(
                "Keys",
                'k',
                ActiveAlways,
                this.KeysMenu.bind(this)
            ),
            new MainMenuEntry(
                "Mods",
                'm',
                ActiveAlways,
                this.ModsMenu.bind(this)
            ),
            new MainMenuEntry(
                "Tilesets",
                't',
                ActiveAlways,
                this.TilesetsMenu.bind(this)
            ),
            new MainMenuEntry(
                "Exit",
                'q',
                ActiveAlways,
                null
            )
        ];

        // const unsigned int 
        // const entryCount = sizeof(entries) / sizeof(MainMenuEntry);
        const entryCount = entries.length;
        // void( * function)() = null;
        let func = null;

        let exit = false;
        let width = 20;
        let edgex = Game.ScreenWidth() / 2 - width / 2;
        let height = (entryCount * 2) + 2;
        let edgey = Game.ScreenHeight() / 2 - height / 2;
        let selected = -1;
        let endCredits = false;
        let lButtonDown = false;


        let key, mouse, event;

        while (!exit) {
            // FIXME: event checking before the_console flushing, should be other way around
            event = this.checkForEvent();

            TCODConsole.root.printFrame(edgex, edgey, width, height, true, TCOD_BKGND_DEFAULT, "Main Menu");

            TCODConsole.root.setAlignment(TCOD_CENTER);
            TCODConsole.root.setBackgroundFlag(TCOD_BKGND_SET);

            TCODConsole.root.setDefaultForeground(Color.celadon);
            TCODConsole.root.print(edgex + width / 2, edgey - 3, Globals.gameVersion);
            TCODConsole.root.setDefaultForeground(Color.white);

            for (let idx = 0; idx < entryCount; ++idx) {
                const entry = entries[idx];

                if (selected === (idx * 2)) {
                    TCODConsole.root.setDefaultForeground(Color.black);
                    TCODConsole.root.setDefaultBackground(Color.white);
                } else {
                    TCODConsole.root.setDefaultForeground(Color.white);
                    TCODConsole.root.setDefaultBackground(Color.black);
                }

                if (!entry.isActive()) {
                    TCODConsole.root.setDefaultForeground(Color.grey);
                }

                TCODConsole.root.print(edgex + width / 2, edgey + ((idx + 1) * 2), entry.label);

                // FIXME: checking here because of seemingly poor menu drawing procedure
                if (event & TCOD_EVENT_KEY_PRESS) {
                    if (key.c == entry.shortcut && entry.isActive()) {
                        exit = (entry.func == null);

                        func = entry.func;
                    }
                }
            }

            if (!endCredits) {
                endCredits = TCODConsole.renderCredits(edgex + 5, edgey + 25, true);
            }

            TCODConsole.root.flush();

            if (TCODConsole.isWindowClosed()) break;

            // FIXME: probably redundant
            if (event & TCOD_EVENT_MOUSE) {
                mouse = TCODMouse.getStatus();
                if (mouse.lbutton) {
                    lButtonDown = true;
                }
            }

            // FIXME: don't put this into an event clause until the whole method is properly rewritten with libtcod events
            if (func != null) {
                func();
            } else {
                if (mouse.cx > edgex && mouse.cx < edgex + width) {
                    selected = mouse.cy - (edgey + 2);
                } else selected = -1;

                if (!mouse.lbutton && lButtonDown) {
                    lButtonDown = false;
                    let entry = static_cast < int > (floor(selected / 2.));

                    if (entry >= 0 && entry < static_cast < int > (entryCount) && entries[entry].isActive()) {
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
        let edgex = Game.ScreenWidth() / 2 - width / 2;
        let height = list.size() + 4;
        let edgey = Game.ScreenHeight() / 2 - height / 2;
        let selected = -1;

        TCODConsole.root.setAlignment(TCOD_LEFT);

        let key = new TCOD_key_t();
        let mouse = new TCOD_mouse_t();
        let event = new TCOD_event_t();

        while (true) {
            TCODConsole.root.clear();

            TCODConsole.root.printFrame(edgex, edgey, width, height, true, TCOD_BKGND_SET, "Saved games");

            TCODConsole.root.setAlignment(TCOD_CENTER);
            TCODConsole.root.print(edgex + (width / 2), edgey + 1, "ESC to cancel.");
            TCODConsole.root.setAlignment(TCOD_LEFT);

            for (let i = 0; i < static_cast < int > (list.size()); ++i) {
                if (selected == i) {
                    TCODConsole.root.setDefaultForeground(Color.black);
                    TCODConsole.root.setDefaultBackground(Color.white);
                } else {
                    TCODConsole.root.setDefaultForeground(Color.white);
                    TCODConsole.root.setDefaultBackground(Color.black);
                }

                let label = list[i].filename;
                if (label.size() > 20) {
                    label = label.substr(0, 17) + "...";
                }
                TCODConsole.root.print(edgex + 1, edgey + 3 + i, "%-20s", label.c_str());
                TCODConsole.root.setDefaultForeground(Color.azure);

                // last modification date
                TCODConsole.root.print(edgex + 1 + 20 + 2, edgey + 3 + i, "%-20s", list[i].date.c_str());

                // filesize
                TCODConsole.root.print(edgex + 1 + 20 + 2 + 20 + 2, edgey + 3 + i, "%s", list[i].size.c_str());
            }

            TCODConsole.root.setDefaultForeground(Color.white);
            TCODConsole.root.setDefaultBackground(Color.black);

            TCODConsole.root.flush();

            event = TCODSystem.checkForEvent(TCOD_EVENT_ANY, key, mouse);

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
                            TCODConsole.root.setDefaultForeground(Color.white);
                            TCODConsole.root.setDefaultBackground(Color.black);
                            TCODConsole.root.setAlignment(TCOD_CENTER);
                            TCODConsole.root.clear();

                            TCODConsole.root.print(
                                Game.ScreenWidth() / 2, Game.ScreenHeight() / 2,
                                "Could not load the game. Refer to the logfile."
                            );

                            TCODConsole.root.print(
                                Game.ScreenWidth() / 2, Game.ScreenHeight() / 2 + 1,
                                "Press any key to return to the main menu."
                            );

                            TCODConsole.root.flush();
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
        if (!Game.Running()) return;
        let saveName;
        TCODConsole.root.setDefaultForeground(Color.white);
        TCODConsole.root.setDefaultBackground(Color.black);

        // TODO: allow picking from list of previous saves (and choosing it with the mouse!)
        let key = new TCOD_key_t();
        let mouse = new TCOD_mouse_t();
        let event = new TCOD_event_t();

        while (true) {
            TCODConsole.root.clear();
            TCODConsole.root.printFrame(Game.ScreenWidth() / 2 - 15,
                Game.ScreenHeight() / 2 - 3, 30, 3, true, TCOD_BKGND_SET, "Save name");
            TCODConsole.root.setDefaultBackground(Color.darkGrey);
            TCODConsole.root.rect(Game.ScreenWidth() / 2 - 14, Game.ScreenHeight() / 2 - 2, 28, 1, true);
            TCODConsole.root.setDefaultBackground(Color.black);
            TCODConsole.root.print(Game.ScreenWidth() / 2,
                Game.ScreenHeight() / 2 - 2, "%s", saveName.c_str());
            TCODConsole.root.flush();

            event = TCODSystem.checkForEvent(TCOD_EVENT_ANY, key, mouse);

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
                        TCODConsole.root.setDefaultForeground(Color.white);
                        TCODConsole.root.setDefaultBackground(Color.black);
                        TCODConsole.root.setAlignment(TCOD_CENTER);
                        TCODConsole.root.clear();

                        TCODConsole.root.print(
                            Game.ScreenWidth() / 2, Game.ScreenHeight() / 2,
                            "Could not save the game. Refer to the logfile."
                        );

                        TCODConsole.root.print(
                            Game.ScreenWidth() / 2, Game.ScreenHeight() / 2 + 1,
                            "Press any key to return to the main menu."
                        );

                        TCODConsole.root.flush();
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

        TCODConsole.root.setAlignment(TCOD_LEFT);

        const w = 40;
        const h = 29;
        const x = Game.ScreenWidth() / 2 - (w / 2);
        const y = Game.ScreenHeight() / 2 - (h / 2);

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
            TCODConsole.root.clear();

            TCODConsole.root.setDefaultForeground(Color.white);
            TCODConsole.root.setDefaultBackground(Color.black);

            TCODConsole.root.printFrame(x, y, w, h, true, TCOD_BKGND_SET, "Settings");
            TCODConsole.root.print(x + 1, y + 1, "ENTER to save changes, ESC to discard.");

            let currentY = y + 3;

            for (let idx = 0; idx < fieldCount; ++idx) {
                if (focus == fields[idx]) {
                    TCODConsole.root.setDefaultForeground(Color.green);
                }
                TCODConsole.root.print(x + 1, currentY, fields[idx].label);

                TCODConsole.root.setDefaultForeground(Color.white);
                TCODConsole.root.setDefaultBackground(Color.darkGrey);
                TCODConsole.root.rect(x + 3, currentY + 1, w - 7, 1, true);
                TCODConsole.root.print(x + 3, currentY + 1, "%s", fields[idx].value.c_str());
                TCODConsole.root.setDefaultBackground(Color.black);

                currentY += 3;
            }

            TCODConsole.root.setDefaultForeground((fullscreen ? Color.green : Color.grey));
            TCODConsole.root.print(x + 1, currentY, "Fullscreen mode");

            currentY += 2;
            TCODConsole.root.setDefaultForeground((tutorial ? Color.green : Color.grey));
            TCODConsole.root.print(x + 1, currentY, "Tutorial");

            currentY += 2;
            TCODConsole.root.setDefaultForeground((translucentUI ? Color.green : Color.grey));
            TCODConsole.root.print(x + 1, currentY, "Translucent UI");

            currentY += 2;
            TCODConsole.root.setDefaultForeground((compressSaves ? Color.green : Color.grey));
            TCODConsole.root.print(x + 1, currentY, "Compress saves");

            currentY += 2;
            TCODConsole.root.setDefaultForeground((autosave ? Color.green : Color.grey));
            TCODConsole.root.print(x + 1, currentY, "Autosave");

            currentY += 2;
            TCODConsole.root.setDefaultForeground((pauseOnDanger ? Color.green : Color.grey));
            TCODConsole.root.print(x + 1, currentY, "Pause on danger");

            currentY += 2;
            TCODConsole.root.setDefaultForeground(Color.white);
            TCODConsole.root.print(x + 1, currentY, "Renderer");

            for (let idx = 0; idx < rendererCount; ++idx) {
                if (renderer == renderers[idx].renderer && useTileset == renderers[idx].useTileset) {
                    TCODConsole.root.setDefaultForeground(Color.green);
                } else {
                    TCODConsole.root.setDefaultForeground(Color.grey);
                }
                TCODConsole.root.print(x + 3, currentY + idx + 1, renderers[idx].label);
            }

            TCODConsole.root.flush();

            event = TCODSystem.checkForEvent(TCOD_EVENT_ANY, key, mouse);

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
        if (Game.Renderer()) {
            Game.Renderer().SetTranslucentUI(translucentUI);
        }
    }

    // Possible TODO: toggle mods on and off.
    ModsMenu() {
        TCODConsole.root.setAlignment(TCOD_LEFT);

        const w = 60;
        const h = 20;
        const x = Game.ScreenWidth() / 2 - (w / 2);
        const y = Game.ScreenHeight() / 2 - (h / 2);

        // const std.list < Mods.Metadata > & 
        const modList = Mods.GetLoaded();
        const subH = static_cast < int > (modList.size()) * 9;
        let sub = new TCODConsole(w - 2, Math.max(1, subH));

        let currentY = 0;

        modList.forEach(function(mod) {
            sub.setDefaultBackground(Color.black);

            sub.setAlignment(TCOD_CENTER);
            sub.setDefaultForeground(Color.azure);
            sub.print(w / 2, currentY, "%s", mod.mod.c_str());

            sub.setAlignment(TCOD_LEFT);
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
            TCODConsole.root.clear();

            TCODConsole.root.setDefaultForeground(Color.white);
            TCODConsole.root.setDefaultBackground(Color.black);

            TCODConsole.root.printFrame(x, y, w, h, true, TCOD_BKGND_SET, "Loaded mods");
            TCODConsole.blit(sub, 0, scroll, w - 2, h - 3, TCODConsole.root, x + 1, y + 2);

            TCODConsole.root.putChar(x + w - 2, y + 1, TCOD_CHAR_ARROW_N, TCOD_BKGND_SET);
            TCODConsole.root.putChar(x + w - 2, y + h - 2, TCOD_CHAR_ARROW_S, TCOD_BKGND_SET);

            TCODConsole.root.flush();

            event = TCODSystem.checkForEvent(TCOD_EVENT_ANY, key, mouse);

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
        TCODConsole.root.setAlignment(TCOD_LEFT);

        let screenWidth = TCODConsole.root.getWidth();
        let screenHeight = TCODConsole.root.getHeight();

        let listWidth = screenWidth / 3;

        // const std.vector < TileSetMetadata > 
        const tilesetsList = Tilesets.LoadTilesetMetadata();

        // const int 
        const subH = static_cast < int > (tilesetsList.size());

        let sub = new TCODConsole(listWidth - 2, Math.max(1, subH));

        let currentY = 0;

        tilesetsList.forEach(function(tileset) {
            sub.setDefaultBackground(Color.black);

            sub.setAlignment(TCOD_LEFT);
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
            TCODConsole.root.clear();

            TCODConsole.root.setDefaultForeground(Color.white);
            TCODConsole.root.setDefaultBackground(Color.black);

            // Left frame
            TCODConsole.root.printFrame(0, 0, listWidth, screenHeight, true, TCOD_BKGND_SET, "Tilesets");
            TCODConsole.blit(sub, 0, scroll, listWidth - 2, screenHeight - 4, TCODConsole.root, 1, 2);

            if (scroll > 0) {
                TCODConsole.root.putChar(listWidth - 2, 1, TCOD_CHAR_ARROW_N, TCOD_BKGND_SET);
            }
            if (scroll < subH - screenHeight + 3) {
                TCODConsole.root.putChar(listWidth - 2, screenHeight - 2, TCOD_CHAR_ARROW_S, TCOD_BKGND_SET);
            }

            // Right frame
            TCODConsole.root.printFrame(listWidth, 0, screenWidth - listWidth, screenHeight, true, TCOD_BKGND_SET, "Details");

            if (selection < static_cast < int > (tilesetsList.size())) {
                TCODConsole.root.print(listWidth + 3, 2, "Name:    %s", tilesetsList.at(selection).name.c_str());
                TCODConsole.root.print(listWidth + 3, 4, "Size:    %dx%d", tilesetsList.at(selection).width, tilesetsList.at(selection).height);
                TCODConsole.root.print(listWidth + 3, 6, "Author:  %s", tilesetsList.at(selection).author.c_str());
                TCODConsole.root.print(listWidth + 3, 8, "Version: %s", tilesetsList.at(selection).version.c_str());
                TCODConsole.root.print(listWidth + 3, 10, "Description:");
                TCODConsole.root.printRect(listWidth + 3, 12, screenWidth - listWidth - 6, screenHeight - 19, "%s", tilesetsList.at(selection).description.c_str());
            }

            // Buttons
            let buttonDist = (screenWidth - listWidth) / 3;
            TCODConsole.root.printFrame(listWidth + buttonDist - 4, screenHeight - 6, 8, 3);
            TCODConsole.root.print(listWidth + buttonDist - 1, screenHeight - 5, "Ok");
            TCODConsole.root.printFrame(listWidth + 2 * buttonDist - 4, screenHeight - 6, 8, 3);
            TCODConsole.root.print(listWidth + 2 * buttonDist - 3, screenHeight - 5, "Cancel");

            TCODConsole.root.flush();

            event = TCODSystem.checkForEvent(TCOD_EVENT_ANY, key, mouse);

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
                            Game.ResetRenderer();
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

        TCODConsole.root.setAlignment(TCOD_LEFT);

        let w = 40;
        const h = static_cast < int > (keyMap.size()) + 4;

        for (let pair of keyMap.entries()) {
            w = Math.max(w, pair[0].size() + 7); // 2 for borders, 5 for [ X ]
            labels.push_back(pair[0]);
        }

        const x = Game.ScreenWidth() / 2 - (w / 2);
        const y = Game.ScreenHeight() / 2 - (h / 2);

        let key = new TCOD_key_t();
        let mouse = new TCOD_mouse_t();
        let event = new TCOD_event_t();

        let focus = 0;

        while (true) {
            TCODConsole.root.clear();

            TCODConsole.root.setDefaultForeground(Color.white);
            TCODConsole.root.setDefaultBackground(Color.black);

            TCODConsole.root.printFrame(x, y, w, h, true, TCOD_BKGND_SET, "Keys");
            TCODConsole.root.print(x + 1, y + 1, "ENTER to save changes, ESC to discard.");

            for (let idx = 0; idx < static_cast < int > (labels.size()); ++idx) {
                if (focus == idx) {
                    TCODConsole.root.setDefaultForeground(Color.green);
                }
                TCODConsole.root.print(x + 1, y + idx + 3, labels[idx].c_str());

                let key = keyMap[labels[idx]];
                TCODConsole.root.print(x + w - 6, y + idx + 3, (key == ' ' ? "[SPC]" : "[ %c ]"), key);

                TCODConsole.root.setDefaultForeground(Color.white);
            }

            TCODConsole.root.flush();

            event = TCODSystem.checkForEvent(TCOD_EVENT_ANY, key, mouse);

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