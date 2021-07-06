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


import { TCOD_alignment_t, TCOD_bkgnd_flag_t, TCODColor } from "../../fakeTCOD/libtcod.js";
import { Drawable } from "./Drawable.js";
import { MenuResult } from "./MenuResult.js";

export class Button extends Drawable {
	constructor(ntext, ncallback, x, y, nwidth, nshortcut = '', ndismiss = false) {
		super(x, y, nwidth, 0);
		this.text = ntext;
		this.selected = false;
		this.shortcut = nshortcut;
		this.dismiss = ndismiss;
		this.callback = ncallback;
	}

	Draw(x, y, the_console) {
		the_console.setBackgroundFlag(TCOD_bkgnd_flag_t.TCOD_BKGND_SET);
		if (this.selected) {
			the_console.setDefaultForeground(Color.black);
			the_console.setDefaultBackground(Color.white);
		} else {
			the_console.setDefaultForeground(Color.white);
			the_console.setDefaultBackground(Color.black);
		}
		the_console.setAlignment(TCOD_alignment_t.TCOD_CENTER);
		the_console.printFrame(x + this._x, y + this._y, this.width, 3);
		the_console.print(x + this._x + this.width / 2, y + this._y + 1, this.text);
		the_console.setDefaultForeground(Color.white);
		the_console.setDefaultBackground(Color.black);
	}

	Update(x, y, clicked, key) {
		if (this.shortcut && (key.c === this.shortcut || key.vk === this.shortcut)) {
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
