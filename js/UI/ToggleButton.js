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
    Button
} from "./Button.js";

export class ToggleButton extends Button {
    isOn = null;
    constructor(ntext, ncallback, nisOn, x, y, nwidth, nshortcut = '') {
        super(ntext, ncallback, x, y, nwidth, nshortcut);
        this.isOn = nisOn;
    }
    Draw(x, y, the_console) {
        the_console.setBackgroundFlag(TCOD_bkgnd_flag_t.TCOD_BKGND_SET);
        if (selected) {
            the_console.setDefaultForeground(Color.black);
            the_console.setDefaultBackground(Color.white);
        } else {
            the_console.setDefaultForeground(Color.white);
            the_console.setDefaultBackground(this.isOn() ? Color.blue : Color.black);
        }
        the_console.setAlignment(TCOD_alignment_t.TCOD_CENTER);
        the_console.printFrame(x + this._x, y + this._y, this.width, 3);
        the_console.print(x + this._x + this.width / 2, y + this._y + 1, this.text);
        the_console.setDefaultForeground(Color.white);
        the_console.setDefaultBackground(Color.black);
    }
}