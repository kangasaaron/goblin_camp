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
    Drawable
} from "./Drawable.js";

import "libtcod.js";

export class Spinner extends Drawable {
    getter = null;
    setter = null;
    value = 0;
    min = 0;
    max = 0;
    constructor(x, y, nwidth, ...values, nmin = 0, nmax = Number.MAX_SAFE_INTEGER) {
        super(x, y, nwidth, 1);
        if (values.length === 2) {
            if (typeof values[0] === "function")
                this.getter = values[0];
            if (typeof values[1] === "function")
                this.setter = values[1];
        } else {
            if (typeof values[0] !== "undefined")
                this.value = value;
        }
        this.min = nmin;
        this.max = nmax;
    }

    Draw(x, y, the_console) {
        the_console.setAlignment(TCOD_CENTER);
        let val = this.value ? this.value : this.getter();
        the_console.print(x + this._x + this.width / 2, y + this._y, "- %d +", val);
    }

    Update(x, y, clicked, key) {
        if ((x >= this._x && x < this._x + this.width && y == this._y) || (key.vk == TCODK_KPADD || key.vk == TCODK_KPSUB)) {
            if (clicked || (key.vk == TCODK_KPADD || key.vk == TCODK_KPSUB)) {
                let curr = this.value ? this.value : this.getter();
                let adj = UI.ShiftPressed() ? 10 : 1;
                let strWidth = 4 + String(curr).length;
                if (x == this._x + this.width / 2 - strWidth / 2 || key.vk == TCODK_KPSUB) {
                    if (this.value) {
                        this.value = Math.max(this.min, curr - adj);
                    } else {
                        this.setter(Math.max(this.min, curr - adj));
                    }
                } else if (x == this._x + this.width / 2 + (strWidth - 1) / 2 || key.vk == TCODK_KPADD) {
                    if (this.value) {
                        this.value = Math.max(this.min, curr + adj);
                    } else {
                        this.setter(Math.max(this.min, curr + adj));
                    }
                }
            }
            return MenuResult.MENUHIT;
        }
        return MenuResult.NOMENUHIT;
    }

}