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


import "string"
import "vector"

import "boost/function.js"
import "boost/bind.js"
import "boost/weak_ptr.js"
import "libtcod.js"

import "UI/Tooltip.js"

export class UIList extends Drawable {
	items = [];
	selectable = false;
	selection = -1;
	draw = null;
	getTooltip = null;
	onclick = null;
	constructor(nitems, x, y, nwidth, nheight, ndraw, nonclick, nselectable, ntooltip) {
		super(x, y, nwidth, nheight);
		this.items = nitems;
		this.selectable = nselectable;
		this.draw = ndraw;
		this.getTooltip = ntooltip;
		onclick = nonclick;
	}

	Draw(x, y, ...args) {
		let the_console = args.pop(),
			scroll = 0,
			_width = this.width,
			_height = 1000,
			count = 0;
		if (args.length === 3) {
			if (Number.isFinite(args[0]))
				scroll = args.shift();
			if (Number.isFinite(args[0]))
				_width = args.shift();
			if (Number.isFinite(args[0]))
				_height = args.shift();
		}
		the_console.setAlignment(TCOD_LEFT);
		for (let item of this.items) {
			if (count >= scroll && count < scroll + _height) {
				this.draw(item, count, x, y + (count - scroll), _width, this.selection == count, the_console);
			}
			count++;
		}
	}

	TotalHeight() {
		return this.items.length;
	}

	Update(x, y, clicked, key) {
		if (x >= this._x && x < this._x + this.width && y >= this._y && y < this._y + this.height) {
			if (clicked) {
				if (this.selectable) {
					this.selection = y - this._y;
				}
				if (this.onclick) {
					this.onclick(y - this._y);
				}
			}
			return MenuResult.MENUHIT;
		}
		return MenuResult.NOMENUHIT;
	}

	GetTooltip(x, y, tooltip) {
		if (this.getTooltip) {
			if (x >= this._x && x < this._x + this.width && y >= this._y && y < this._y + this.width && y - this._y < this.items.length) {
				for (let i = 0; i < (y - this._y); i++) {
					;
				}
				this.getTooltip(this.items[i], tooltip);
			}
		}
	}

	Selected() {
		if (this.selection >= 0 && this.selection < this.items.length) {
			return this.selection;
		}
		return -1;
	}

	Select(i) {
		this.selection = i;
	}
}