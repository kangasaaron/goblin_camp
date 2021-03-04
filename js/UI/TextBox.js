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

export class TextBox extends Drawable {
	value = "";
	getter = null;
	setter = null;

	constructor(x, y, nwidth, ...values) {
		super(x, y, nwidth, 1);
		if (values.length === 2) {
			if (typeof values[0] === "function")
				this.getter = values[0];
			if (typeof values[1] === "function")
				this.setter = values[1];
		} else if (typeof values[0] !== "undefined")
			this.value = values[0];
	}

	Draw(x, y, the_console) {
		the_console.setAlignment(TCOD_CENTER);
		the_console.setDefaultBackground(Color.darkGrey);
		the_console.rect(x + this._x, y + this._y, this.width, 1, true, TCOD_BKGND_SET);
		the_console.setDefaultBackground(Color.black);
		if (this.value) {
			the_console.print(x + this._x + this.width / 2, y + this._y, this.value);
		} else {
			the_console.print(x + this._x + this.width / 2, y + this._y, this.getter());
		}
	}

	Update(x, y, clicked, key) {
		let currValue = "";
		if (this.value) {
			currValue = this.value;
		} else {
			currValue = this.getter();
		}
		if (key.vk == TCODK_BACKSPACE && currValue.length > 0) {
			if (this.value) {
				value.splice(value.length - 1, 1);
			} else {
				currValue.splice(currValue.length - 1, 1);
				this.setter(currValue);
			}
			return MenuResult.KEYRESPOND;
		} else if (key.c >= ' ' && key.c <= '}' && key.c != '+' && key.c != '-') {
			if (currValue.length < this.width) {
				if (this.value) {
					this.value += key.c;
				} else {
					currValue += key.c;
					this.setter(currValue);
				}
			}
			return MenuResult.KEYRESPOND;
		}
		return MenuResult.NOMENUHIT;
	}
};