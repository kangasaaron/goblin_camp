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
'use strict'; //

import "string"
import "vector"

struct TooltipEntry {
	std.string text;
	TCODColor color;
	TooltipEntry(std.string ntext, TCODColor ncolor): text(ntext), color(ncolor) {}
};

class Tooltip {
//private extends 
	std.vector<TooltipEntry> entries;
	Tooltip(): entries(std.vector<TooltipEntry>()) {}
	static Tooltip* instance;
	int offsetX, offsetY;
//public:
	static Tooltip* Inst();
	void Clear();
	void AddEntry(TooltipEntry entry);
	void Draw(int x, int y, TCODConsole *the_console);
	void OffsetPosition(int x, int y);
};
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
import "stdafx.js"

import "libtcod.js"

import "UI/Tooltip.js"

Tooltip* Tooltip.instance = 0;
Tooltip* Tooltip.Inst() {
	if(!instance) {
		instance = new Tooltip();
	}
	return instance;
}

void Tooltip.Clear() {
	entries.clear();
	offsetX = 0;
	offsetY = 0;
}

void Tooltip.AddEntry(TooltipEntry entry) {
	entries.push_back(entry);
}

void Tooltip.Draw(int x, int y, TCODConsole *the_console) {
	x += offsetX;
	y += offsetY;
	the_console.setDefaultBackground(TCODColor.darkestYellow);
	int width = 0;
	for(std.vector<TooltipEntry>.iterator it = entries.begin(); it != entries.end(); it++) {
		width = std.max(width, (int)it.text.length());
	}
	x = std.min(std.min(the_console.getWidth() - 1, x + 1), the_console.getWidth() - width);
	y = std.min(std.max(0, y - 1), std.max(0, the_console.getHeight() - (int)entries.size()));
	if(width > 0) {
		the_console.rect(x, y, width, (int)entries.size(), true, TCOD_BKGND_SET);
		for(std.vector<TooltipEntry>.iterator it = entries.begin(); it != entries.end() && y < the_console.getHeight(); it++) {
			TooltipEntry entry = *it;
			the_console.setDefaultForeground(entry.color);
			the_console.printEx(x, y, TCOD_BKGND_SET, TCOD_LEFT, entry.text.c_str());
			y++;
		}
	}
	the_console.setDefaultBackground(TCODColor.black);
	the_console.setDefaultForeground(TCODColor.white);
}

void Tooltip.OffsetPosition(int x, int y) { offsetX = x; offsetY = y; }
