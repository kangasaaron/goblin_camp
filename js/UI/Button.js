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

import "libtcod.js"

import {
	Drawable
} from "./Drawable.js";

export class Button extends Drawable {
	text = "";
	selected = false;
	shortcut = '';
	dismiss = false;
	callback = null;
	constructor(ntext, ncallback, x, y, nwidth, nshortcut = '', ndismiss = false) {
		super(x, y, nwidth, 0);
		this.text = ntext;
		this.selected = false;
		this.shortcut = nshortcut;
		this.dismiss = ndismiss;
		this.callback = ncallback;
	}

	Draw(x, y, the_console) {
		the_console.setBackgroundFlag(TCOD_BKGND_SET);
		if (this.selected) {
			the_console.setDefaultForeground(TCODColor.black);
			the_console.setDefaultBackground(TCODColor.white);
		} else {
			the_console.setDefaultForeground(TCODColor.white);
			the_console.setDefaultBackground(TCODColor.black);
		}
		the_console.setAlignment(TCOD_CENTER);
		the_console.printFrame(x + this._x, y + this._y, this.width, 3);
		the_console.print(x + this._x + this.width / 2, y + this._y + 1, this.text);
		the_console.setDefaultForeground(TCODColor.white);
		the_console.setDefaultBackground(TCODColor.black);
	}

	Update(x, y, clicked, key) {
		if (this.shortcut && (key.c == this.shortcut || key.vk == this.shortcut)) {
			if (this.callback) {
				this.callback();
			}
			return ((this.dismiss ? MenuResult.DISMISS : 0) | MenuResult.KEYRESPOND);
		}
		if (x >= this._x && x < this._x + this.width && y >= this._y && y < this._y + 3) {
			this.selected = true;
			if (clicked && this.callback) {
				this.callback();
			}
			return (((clicked && this.dismiss) ? MenuResult.DISMISS : 0) | MenuResult.MENUHIT);
		} else {
			this.selected = false;
			return MenuResult.NOMENUHIT;
		}
	}
}