import { GameScreen } from "./GameScreen.js";
import { BlendMode } from "./BlendMode.js";
import { Alignment } from "./Alignment.js";
import { gameVersion } from "../Version.js";
import { Color } from "../color/Color.js";
import { Data } from "../data/Data.js";

class MainMenuEntry {
    label = "";
    shortcut = "";
    /** @type {function} */
    isActive = null;
    /** @type {function} */
    func = null;
    selected = 0;
    constructor(l, s, a, f) {
        this.label = l;
        this.shortcut = s;
        this.isActive = a;
        this.func = f;
    }
}

export class MainMenuScreen extends GameScreen {
    selected_index = 0;
    entries = [];
    constructor(GCamp) {
        super();
        this.GCamp = GCamp;
        this.Game = GCamp.Game;
        this.entries = [
            new MainMenuEntry(
                "New Game",
                'n',
                true,
                this.GCamp.ConfirmStartNewGame.bind(this.GCamp)
            ),
            new MainMenuEntry(
                "Continue",
                'c',
                this.Game.Running(),
                this.GCamp.MainLoop.bind(this.GCamp)
            ),
            new MainMenuEntry(
                "Load",
                'l',
                Data.CountSavedGames() > 0,
                this.GCamp.LoadMenu.bind(this.GCamp)
            ),
            new MainMenuEntry(
                "Save",
                's',
                this.Game.Running(),
                this.GCamp.SaveMenu.bind(this.GCamp)
            ),
            new MainMenuEntry(
                "Settings",
                'o',
                true,
                this.GCamp.SettingsMenu.bind(this.GCamp)
            ),
            new MainMenuEntry(
                "Keys",
                'k',
                true,
                this.GCamp.KeysMenu.bind(this.GCamp)
            ),
            new MainMenuEntry(
                "Mods",
                'm',
                true,
                this.GCamp.ModsMenu.bind(this.GCamp)
            ),
            new MainMenuEntry(
                "Tilesets",
                't',
                true,
                this.GCamp.TilesetsMenu.bind(this.GCamp)
            ),
            new MainMenuEntry(
                "Exit",
                'q',
                false,
                null
            )
        ];
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
        requestAnimationFrame(this.render.bind(this));
    }
    get selected() {
        return this.selected_index;
    }
    render() {
        const entryCount = this.entries.length;

        let exit = false;

        this.width = 20;
        this.edgex = Math.round(this.Game.ScreenWidth() / 2 - this.width / 2);
        this.height = (entryCount * 2) + 2;
        this.edgey = Math.round(this.Game.ScreenHeight() / 2 - this.height / 2);
        this.Game.buffer.printFrame(this.edgex, this.edgey, this.width, this.height, true, BlendMode.BKGND_DEFAULT, "Main Menu");

        this.Game.buffer.setAlignment(Alignment.CENTER);
        this.Game.buffer.setBackgroundFlag(BlendMode.BKGND_SET);

        this.Game.buffer.setDefaultForeground(Color.celadon);
        this.Game.buffer.print(Math.round(this.edgex + this.width / 2), this.edgey - 3, gameVersion);
        this.Game.buffer.setDefaultForeground(Color.white);

        for (let idx = 0; idx < entryCount; ++idx) {
            const entry = this.entries[idx];

            if (entry.selected) {
                this.Game.buffer.setDefaultForeground(Color.black);
                this.Game.buffer.setDefaultBackground(Color.white);
            } else {
                this.Game.buffer.setDefaultForeground(Color.white);
                this.Game.buffer.setDefaultBackground(Color.black);
            }

            if (!entry.isActive) {
                this.Game.buffer.setDefaultForeground(Color.grey);
            }

            this.Game.buffer.print(Math.round(this.edgex + this.width / 2), this.edgey + ((idx + 1) * 2), entry.label);
            entry.row = this.edgey + ((idx + 1) * 2);
        }

        this.Game.buffer.flush();
    }
    eventHandler(e) {
        // console.log(e.type, e);
        // mouseover - highlight -- TODO
        // left-click, touch, point on active label line OR shortcut key of active label line - run function
        if (e instanceof PointerEvent && e.type === "pointerup") {
            this.click(e);
        }
        else if (e instanceof PointerEvent && e.type === "pointermove") {
            this.hover(e);
        }
        else if (e instanceof KeyboardEvent && e.type === "keyup") {
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
                if (row == entry.row && entry.isActive) {
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
                if (row == entry.row) {
                    me.selected = i;
                    setTimeout(entry.func, 500);
                }
            });
        }
    }
}
