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
	Drawable
}
from './Drawable.js';

export class Grid extends Drawable {
	cols = 0;
	contents = [];

	constructor(ncontents, ncols, x, y, nwidth, nheight) {
		super(x, y, nwidth, nheight);
		this.cols = ncols;
		this.contents = ncontents;
	}

	AddComponent(component) {
		this.contents.push(component);
	}

	RemoveAll() {
		this.contents = [];
	}

	Draw(x, y, ...args) {
		let the_console = args.pop();
		let scroll = 0,
			_width = 0,
			_height = 0;
		if (args.length)
			scroll = args.shift();
		if (args.length)
			_width = args.shift();
		if (args.length)
			_height = args.shift();

		let col = 0;
		let top = y;
		let bottom = y + scroll + _height;
		let colWidth = _width / cols;
		let rowHeight = 0;
		for (let component of this.contents.filter(component => component.Visible())) {
			if (y - scroll >= top && y + component.Height() <= bottom) {
				component.Draw(x + colWidth * col, y - scroll, the_console);
			}
			rowHeight = Math.max(rowHeight, component.Height());
			col++;
			if (col >= cols) {
				col = 0;
				y += rowHeight;
				rowHeight = 0;
			}
		}
	}

	TotalHeight() {
		let col = 0;
		let rowHeight = 0;
		let y = 0;
		for (let component of this.contents.filter(component => component.Visible())) {
			rowHeight = Math.max(rowHeight, component.Height());
			col++;
			if (col >= cols) {
				col = 0;
				y += rowHeight;
				rowHeight = 0;
			}
		}
		return y + rowHeight;
	}

	Update(x, y, clicked, key) {
		let col = 0;
		let colWidth = width / cols;
		let rowHeight = 0;
		for (let component of this.contents.filter(component => component.Visible())) {
			let result = component.Update(x - this._x - col * (colWidth - 1), y - this._y, clicked, key);
			if (!(result & MenuResult.NOMENUHIT)) {
				return result;
			}
			rowHeight = Math.max(rowHeight, component.Height());
			col++;
			if (col >= cols) {
				col = 0;
				y -= rowHeight;
				rowHeight = 0;
			}
		}
		return MenuResult.NOMENUHIT;
	}

	GetTooltip(x, y, tooltip) {
		super.GetTooltip(x, y, tooltip);
		let col = 0;
		let colWidth = width / cols;
		let rowHeight = 0;
		for (let component of this.contents.filter(component => component.Visible())) {
			component.GetTooltip(x - this._x - col * colWidth, y - this._y, tooltip);
			rowHeight = Math.max(rowHeight, component.Height());
			col++;
			if (col >= cols) {
				col = 0;
				y -= rowHeight;
				rowHeight = 0;
			}
		}

	}
}