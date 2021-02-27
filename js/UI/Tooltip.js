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

class TooltipEntry {
	text = "";
	color = null;
	constructor(ntext, ncolor) {
		this.text = ntext;
		this.color = ncolor;
	}
};

class Tooltip {
	static instance = null;
	static Inst() {
		if (!this.instance) {
			this.instance = new Tooltip();
		}
		return this.instance;
	}
	entries = [];
	offsetX = 0;
	offsetY = 0;
	Clear() {
		this.entries = [];
		this.offsetX = 0;
		this.offsetY = 0;
	}
	AddEntry(entry) {
		this.entries.push(entry);
	}
	OffsetPosition(x, y) {
		this.offsetX = x;
		this.offsetY = y;
	}

	Draw(x, y, the_console) {
		x += offsetX;
		y += offsetY;
		the_console.setDefaultBackground(TCODColor.darkestYellow);
		let width = 0;
		for (let it of this.entries) {
			width = Math.max(width, it.text.length);
		}
		x = Math.min(Math.min(the_console.getWidth() - 1, x + 1), the_console.getWidth() - width);
		y = Math.min(Math.max(0, y - 1), Math.max(0, the_console.getHeight() - this.entries.length));
		if (width > 0) {
			the_console.rect(x, y, width, this.entries.length, true, TCOD_BKGND_SET);
			for (let i = 0; i < this.entries.length && y, the_console.getHeight(); i++) {
				let entry = this.entries[i];
				the_console.setDefaultForeground(entry.color);
				the_console.printEx(x, y, TCOD_BKGND_SET, TCOD_LEFT, entry.text);
				y++;
			}
		}
		the_console.setDefaultBackground(TCODColor.black);
		the_console.setDefaultForeground(TCODColor.white);
	}

}