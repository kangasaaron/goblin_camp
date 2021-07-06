import { TCOD_bkgnd_flag_t, TCOD_alignment_t, TCODColor} from "../../fakeTCOD/libtcod.js";
import { gameVersion } from "../Version.js";
import { Data } from "../data/Data.js";
import { Game } from "../Game.js";
import { GameScreen } from "./GameScreen.js";
import { GCamp } from "../GCamp.js";

/**
 * @typedef window
 */

class MainMenuEntry {
    constructor(l, s, a, f) {
    /** @type {String} */
        this.label = l;
    /** @type {String} */
        this.shortcut = s;
    /** @type {function} */
        this.isActive = a;
    /** @type {function} */
        this.func = f;
    /** @type {int} */
        this.selected = 0;
    }
}

export class MainMenuScreen extends GameScreen {
    constructor() {
        super();
        /** @type {Array{MainMenuEntry}} */
        this.entries = [
            new MainMenuEntry(
                "New Game",
                'n',
                true,
                GCamp.i.ConfirmStartNewGame.i.bind(GCamp.i)
            ),
            new MainMenuEntry(
                "Continue",
                'c',
                Game.i.Running(),
                GCamp.i.MainLoop.bind(GCamp.i)
            ),
            new MainMenuEntry(
                "Load",
                'l',
                Data.CountSavedGames() > 0,
                GCamp.i.LoadMenu.bind(GCamp.i)
            ),
            new MainMenuEntry(
                "Save",
                's',
                Game.i.Running(),
                GCamp.i.SaveMenu.bind(GCamp.i)
            ),
            new MainMenuEntry(
                "Settings",
                'o',
                true,
                GCamp.i.SettingsMenu.bind(GCamp.i)
            ),
            new MainMenuEntry(
                "Keys",
                'k',
                true,
                GCamp.i.KeysMenu.bind(GCamp.i)
            ),
            new MainMenuEntry(
                "Mods",
                'm',
                true,
                GCamp.i.ModsMenu.bind(GCamp.i)
            ),
            new MainMenuEntry(
                "Tilesets",
                't',
                true,
                GCamp.i.TilesetsMenu.bind(GCamp.i)
            ),
            new MainMenuEntry(
                "Exit",
                'q',
                false,
                null
            )
        ];
        /** @type {number} */
        this.selected_index = 0;

        this.selected = this.entries.findIndex(function (entry) {
            return entry.isActive;
        });
        this.entries[this.selected].selected = 1;
    }
    set selected(s) {
        if (s >= 0 && s < this.entries.length) {
            this.selected_index = s;
            this.entries.forEach(function (entry, index) {
                entry.selected = index === s;
            });
        }
        window.requestAnimationFrame(this.render.bind(this));
    }
    get selected() {
        return this.selected_index;
    }
    render() {
        const entryCount = this.entries.length;

        let exit = false;

        this.width = 20;
        this.edgex = Math.round(Game.i.ScreenWidth() / 2 - this.width / 2);
        this.height = (entryCount * 2) + 2;
        this.edgey = Math.round(Game.i.ScreenHeight() / 2 - this.height / 2);
        Game.i.buffer.printFrame(this.edgex, this.edgey, this.width, this.height, true, TCOD_bkgnd_flag_t.TCOD_.BKGND_DEFAULT, "Main Menu");

        Game.i.buffer.setAlignment(TCOD_alignment_t.TCOD_CENTER);
        Game.i.buffer.setBackgroundFlag(TCOD_bkgnd_flag_t.TCOD_.BKGND_SET);

        Game.i.buffer.setDefaultForeground(TCODColor.celadon);
        Game.i.buffer.print(Math.round(this.edgex + this.width / 2), this.edgey - 3, gameVersion);
        Game.i.buffer.setDefaultForeground(TCODColor.white);

        for (let idx = 0; idx < entryCount; ++idx) {
            const entry = this.entries[idx];

            if (entry.selected) {
                Game.i.buffer.setDefaultForeground(TCODColor.black);
                Game.i.buffer.setDefaultBackground(TCODColor.white);
            } else {
                Game.i.buffer.setDefaultForeground(TCODColor.white);
                Game.i.buffer.setDefaultBackground(TCODColor.black);
            }

            if (!entry.isActive) {
                Game.i.buffer.setDefaultForeground(TCODColor.grey);
            }

            Game.i.buffer.print(Math.round(this.edgex + this.width / 2), this.edgey + ((idx + 1) * 2), entry.label);
            entry.row = this.edgey + ((idx + 1) * 2);
        }

        Game.i.buffer.flush();
    }
    eventHandler(e) {
        // console.log(e.type, e);
        // mouseover - highlight -- TODO
        // left-click, touch, point on active label line OR shortcut key of active label line - run function
        if (e instanceof window.PointerEvent && e.type === "pointerup") {
            this.click(e);
        }
        else if (e instanceof window.PointerEvent && e.type === "pointermove") {
            this.hover(e);
        }
        else if (e instanceof window.KeyboardEvent && e.type === "keyup") {
            if (e.key === "ArrowDown") {
                this.selected = (this.selected + 1) % this.entries.length;
                while (!this.entries[this.selected].isActive) {
                    this.selected = (this.selected + 1) % this.entries.length;
                }
            }
            else if (e.key === "ArrowUp") {
                this.selected = (this.selected - 1);
                if (this.selected < 0) this.selected = this.entries.length - 1;
                while (!this.entries[this.selected].isActive) {
                    this.selected = (this.selected - 1);
                    if (this.selected < 0) this.selected = this.entries.length - 1;
                }
            }
        }
    }
    parseCellName(cell_name) {
        let hit_underscore = 0;
        let column = "";
        let row = "";
        for (let i = 0; i < cell_name.length; i++) {
            let c = cell_name.charAt(i);
            if (c === "_") {
                hit_underscore++;
            }
            if (c.match(/[0-9]/)) {
                if (hit_underscore === 1) {
                    column += c;
                }
                else if (hit_underscore === 2) {
                    row += c;
                }
            }
        }
        column = parseInt(column, 10);
        row = parseInt(row, 10);
        return [row, column];
    }
    hover(e) {
        let c = this.parseCellName(e.target.id);
        let row = c[0];
        let column = c[1];
        if (column >= this.edgex && column <= this.edgex + this.width) {
            let me = this;
            this.entries.forEach(function (entry, i) {
                if (row === entry.row && entry.isActive) {
                    me.selected = i;
                }
            });
        }
    }
    click(e) {
        let c = this.parseCellName(e.target.id);
        let row = c[0];
        let column = c[1];

        if (column >= this.edgex && column <= this.edgex + this.width) {
            let me = this;
            this.entries.forEach(function (entry, i) {
                if (row === entry.row) {
                    me.selected = i;
                    window.setTimeout(entry.func, 500);
                }
            });
        }
    }
}
