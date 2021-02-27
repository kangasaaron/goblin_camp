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
}
from './Drawable.js';

export class ScrollPanel extends Drawable {
	scroll = 0;
	scrollBar = 0;
	step = 0;
	drawFrame = false;
	contents = null;

	constructor(x, y, nwidth, nheight, ncontents, ndrawFrame = true, nstep = 1) {
		super(x, y, nwidth, nheight);
		this.scroll = 0;
		this.scrollBar = 0;
		this.step = nstep;
		this.drawFrame = ndrawFrame;
		this.contents = ncontents;
	}
	Draw(x, y, the_console) {
		if (this.scroll < 0) {
			this.scroll = 0;
		}
		if (this.scroll + this.height - 2 > this.contents.TotalHeight()) {
			this.scroll = Math.max(0, this.contents.TotalHeight() - (this.height - 2));
		}
		this.scrollBar = ((this.height - 3) * (this.scroll / Math.max(1, this.contents.TotalHeight() - (this.height - 2)))) + 2;
		this.scrollBar = Math.min(this.scrollBar, this.height - 4);

		if (this.drawFrame) {
			the_console.printFrame(x + this._x, y + this._y, this.width, this.height);
		}

		this.contents.Draw(x + this._x + 1, y + this._y + 1, this.scroll, this.width - 2, this.height - 2, the_console);
		the_console.putChar(x + this._x + this.width - 2, y + this._y + 1, TCOD_CHAR_ARROW_N, TCOD_BKGND_SET);
		the_console.putChar(x + this._x + this.width - 2, y + this._y + this.height - 2, TCOD_CHAR_ARROW_S, TCOD_BKGND_SET);
		the_console.putChar(x + this._x + this.width - 2, y + this._y + this.scrollBar, 219, TCOD_BKGND_SET);
	}

	Update(x, y, clicked, key) {
		if (x >= this._x && x < this._x + this.width && y >= this._y && y < this._y + this.height) {
			if (clicked) {
				if (x == this._x + this.width - 2) {
					if (y == this._y + 1) {
						this.scroll -= this.step;
					} else if (y == this._y + this.height - 2) {
						this.scroll += this.step;
					} else if (y < this._y + this.scrollBar) {
						this.scroll -= this.height;
					} else if (y > this._y + this.scrollBar) {
						this.scroll += this.height;
					}
				} else {
					this.contents.Update(x - this._x - 1, y - this._y - 1 + this.scroll, clicked, key);
				}
			} else {
				this.contents.Update(x - this._x - 1, y - this._y - 1 + this.scroll, clicked, key);
			}
			return MenuResult.MENUHIT;
		}
		if (key.vk != TCODK_NONE) return this.contents.Update(x, y, clicked, key);
		return MenuResult.NOMENUHIT;
	}

	GetTooltip(x, y, tooltip) {
		if (x >= this._x + 1 && x < this._x + this.width - 1 && y >= this._y + 1 && y < this._y + this.height - 1) {
			this.contents.GetTooltip(x - this._x - 1, y - this._y - 1 + this.scroll, tooltip);
		}
	}

}