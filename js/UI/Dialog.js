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


import {
    Panel
} from './Panel.js';

export class Dialog extends Panel {
    title = "";
    contents = [];
    constructor(ncontents, ntitle, nwidth, nheight) {
        super(nwidth, nheight)
        this.title = ntitle;
        this.contents = ncontents;
        this._x = (Game.i.ScreenWidth() - nwidth) / 2;
        this._y = (Game.i.ScreenHeight() - nheight) / 2;
    }
    SetTitle(ntitle) {
        this.title = ntitle;
    }
    SetHeight(nheight) {
        this.height = nheight;
        this._x = (Game.i.ScreenWidth() - this.width) / 2;
        this._y = (Game.i.ScreenHeight() - this.height) / 2;
    }
    Draw(x, y, the_console) {
        the_console.printFrame(this._x, this._y, this.width, this.height, true, TCOD_bkgnd_flag_t.TCOD_BKGND_SET, (this.title.length === 0) ? "" : this.title);
        this.contents.Draw(this._x, this._y, the_console);
    }
    Update(x, y, clicked, key) {
        return this.contents.Update(x - this._x, y - this._y, clicked, key);
    }
    GetTooltip(x, y, tooltip) {
        super.GetTooltip(x, y, tooltip);
        this.contents.GetTooltip(x - this._x, y - this._y, tooltip);
    }
}
