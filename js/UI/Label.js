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

import "libtcod.js"

export class Label extends Drawable {
	text = '';
	align = null;
	constructor(ntext, x, y, nalign = TCOD_CENTER) {
		super(x, y, 0, 1);
		this.text = ntext;
		this.align = nalign;
	}
	Draw(x, y, the_console) {
		the_console.setAlignment(this.align);
		the_console.setDefaultForeground(Color.white);
		the_console.print(x + this._x, y + this._y, this.text);
	}
}