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
	UIContainer
} from "./UIContainer.js";

export class Frame extends UIContainer {
	title = "";
	constructor(ntitle, ncomponents, x, y, nwidth, nheight) {
		super(ncomponents, x, y, nwidth, nheight);
		this.title = ntitle;
	}
	SetTitle(ntitle) {
		this.title = ntitle;
	}
	Draw(x, y, the_console) {
		the_console.printFrame(x + this._x, y + this._y, this.width, this.height, true, TCOD_bkgnd_flag_t.TCOD_BKGND_SET, this.title);
		super.Draw(x, y, the_console);
	}
}