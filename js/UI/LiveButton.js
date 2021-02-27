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

import {
    Button
} from "./Button.js";

export class LiveButton extends Button {
    textFunc = null;
    constructor(ntextFunc, ncallback, x, y, nwidth, nshortcut = '') {
        super("", ncallback, x, y, nwidth, nshortcut);
        this.textFunc = ntextFunc;
    }

    Draw(x, y, the_console) {
        super.Draw(x, y, the_console);
        if (this.selected) {
            the_console.setDefaultForeground(TCODColor.black);
            the_console.setDefaultBackground(TCODColor.white);
        } else {
            the_console.setDefaultForeground(TCODColor.white);
            the_console.setDefaultBackground(TCODColor.black);
        }
        the_console.print(x + this._x + this.width / 2, y + this._y + 1, this.textFunc());
        the_console.setDefaultForeground(TCODColor.white);
        the_console.setDefaultBackground(TCODColor.black);
    }
}