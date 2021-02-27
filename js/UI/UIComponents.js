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

import "boost/function.js"
import "boost/bind.js"
import "boost/weak_ptr.js"
import "libtcod.js"

import "UI/Tooltip.js"

const MenuResult = { // enum
	MENUHIT: 1,
	NOMENUHIT: 2,
	KEYRESPOND: 4,
	DISMISS: 8
};

class Drawable {
//protected extends 
	int _x, _y, width, height;
	boost.function<bool()> visible;
	boost.function<void(int, int, Tooltip*)> getTooltip;
//public:
	Drawable(int x, int y, int nwidth, int nheight):
	  _x(x), _y(y), width(nwidth), height(nheight), visible(0), getTooltip(0) {}
	virtual ~Drawable() {}

	virtual void Draw(int, int, TCODConsole *) = 0;
	virtual MenuResult Update(int x, int y, bool clicked, TCOD_key_t key)
	{return (x >= _x && x < _x + height && y >= _y && y < _y + height) ? MENUHIT : NOMENUHIT;}
	int Height() { return height; }
	bool Visible() { return !visible || visible(); }
	void SetVisible(boost.function<bool()> nvisible) { visible = nvisible; }
	virtual void GetTooltip(int x, int y, Tooltip *tooltip) { if(getTooltip) getTooltip(x, y, tooltip); }
	void SetTooltip(boost.function<void(int, int, Tooltip*)> ntooltip) { getTooltip = ntooltip; }
};

class Scrollable {
//public extends 
	virtual ~Scrollable() {}
	virtual void Draw(int x, int y, int scroll, int width, int height, TCODConsole *) = 0;
	virtual int TotalHeight() = 0;
	virtual MenuResult Update(int x, int y, bool clicked, TCOD_key_t key) { return NOMENUHIT; }
	virtual void GetTooltip(int x, int y, Tooltip *tooltip) {};
};

class UIContainer extends /*public*/ Drawable {
//protected:
	std.vector<Drawable *> components;
//public:
	UIContainer(std.vector<Drawable *> ncomponents, int nx, int ny, int nwidth, int nheight):
	  Drawable(nx, ny, nwidth, nheight), components(ncomponents) {}
	~UIContainer();
	void AddComponent(Drawable *component);
	virtual void Draw(int, int, TCODConsole *);
	virtual MenuResult Update(int, int, bool, TCOD_key_t);
	virtual void GetTooltip(int, int, Tooltip *);
};

class Panel extends /*public*/ Drawable {
//public:
	Panel(int nwidth, int nheight):
	  Drawable(0, 0, nwidth, nheight) {}
	void ShowModal();
	virtual void Open();
	virtual void Close();
	virtual void selected(int);
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

import "string "
import "cmath"

import "libtcod.js"
import "boost/lexical_cast.js"
import "boost/algorithm/string.js"

import "UI/UIComponents.js"
import "UI/Label.js"
import "UI/Dialog.js"
import "UI/ScrollPanel.js"
import "UI/Button.js"
import "UI.js"
import "UI/Grid.js"
import "UI/Spinner.js"
import "UI/Frame.js"
import "UI/TextBox.js"

void Label.Draw(int x, int y, TCODConsole *the_console) {
	the_console.setAlignment(align);
	the_console.setDefaultForeground(TCODColor.white);
	the_console.print(x + _x, y + _y, text.c_str());
}

void LiveLabel.Draw(int x, int y, TCODConsole *the_console) {
	the_console.setAlignment(align);
	the_console.setDefaultForeground(TCODColor.white);
	the_console.print(x + _x, y + _y, text().c_str());
}

void Button.Draw(int x, int y, TCODConsole *the_console) {
	the_console.setBackgroundFlag(TCOD_BKGND_SET);
	if(selected) {
		the_console.setDefaultForeground(TCODColor.black);
		the_console.setDefaultBackground(TCODColor.white);
	} else {
		the_console.setDefaultForeground(TCODColor.white);
		the_console.setDefaultBackground(TCODColor.black);
	}
	the_console.setAlignment(TCOD_CENTER);
	the_console.printFrame(x + _x, y + _y, width, 3);
	the_console.print(x + _x + width/2, y + _y + 1, text.c_str());
	the_console.setDefaultForeground(TCODColor.white);
	the_console.setDefaultBackground(TCODColor.black);
}

void LiveButton.Draw(int x, int y, TCODConsole *the_console) {
	Button.Draw(x, y, the_console);
	if(selected) {
		the_console.setDefaultForeground(TCODColor.black);
		the_console.setDefaultBackground(TCODColor.white);
	} else {
		the_console.setDefaultForeground(TCODColor.white);
		the_console.setDefaultBackground(TCODColor.black);
	}
	the_console.print(x + _x + width/2, y + _y + 1, textFunc().c_str());
	the_console.setDefaultForeground(TCODColor.white);
	the_console.setDefaultBackground(TCODColor.black);
}

MenuResult Button.Update(int x, int y, bool clicked, TCOD_key_t key) {
	if(shortcut && (key.c == shortcut || key.vk == shortcut)) {
		if (callback) {
			callback();
		}
		return (MenuResult) ((dismiss ? DISMISS : 0) | KEYRESPOND);
	}
	if(x >= _x && x < _x + width && y >= _y && y < _y + 3) {
		selected = true;
		if(clicked && callback) {
			callback();
		}
		return (MenuResult) (((clicked && dismiss) ? DISMISS : 0) | MENUHIT);
	} else {
		selected = false;
		return NOMENUHIT;
	}

}

void ToggleButton.Draw(int x, int y, TCODConsole *the_console) {
	the_console.setBackgroundFlag(TCOD_BKGND_SET);
	if(selected) {
		the_console.setDefaultForeground(TCODColor.black);
		the_console.setDefaultBackground(TCODColor.white);
	} else {
		the_console.setDefaultForeground(TCODColor.white);
		the_console.setDefaultBackground(isOn() ? TCODColor.blue : TCODColor.black);
	}
	the_console.setAlignment(TCOD_CENTER);
	the_console.printFrame(x + _x, y + _y, width, 3);
	the_console.print(x + _x + width/2, y + _y + 1, text.c_str());
	the_console.setDefaultForeground(TCODColor.white);
	the_console.setDefaultBackground(TCODColor.black);
}

inline int numDigits(int num) {
	int tmp = num;
	int digits = 1;
	if (tmp < 0) {
		digits++;
		tmp = -tmp;
	}
	while(num >= 10) {
		digits++;
		num /= 10;
	}
	return digits;
}

void Spinner.Draw(int x, int y, TCODConsole *the_console) {
	the_console.setAlignment(TCOD_CENTER);
	int val = value ? *value : getter();
	the_console.print(x + _x + width / 2, y + _y, "- %d +", val);
}

MenuResult Spinner.Update(int x, int y, bool clicked, TCOD_key_t key) {
	if ((x >= _x && x < _x + width && y == _y) || (key.vk == TCODK_KPADD || key.vk == TCODK_KPSUB)) {
		if (clicked || (key.vk == TCODK_KPADD || key.vk == TCODK_KPSUB)) {
			int curr = value ? *value : getter();
			int adj = UI.Inst().ShiftPressed() ? 10 : 1;
			int strWidth = 4 + numDigits(curr);
			if(x == _x + width / 2 - strWidth / 2 || key.vk == TCODK_KPSUB) {
				if(value) {
					(*value) = std.max(min, curr - adj);
				} else {
					setter(std.max(min, curr - adj));
				}
			} else if(x == _x + width / 2 + (strWidth-1) / 2 || key.vk == TCODK_KPADD) {
				if(value) {
					(*value) = std.max(min, curr + adj);
				} else {
					setter(std.max(min, curr + adj));
				}
			}
		}
		return MENUHIT;
	}
	return NOMENUHIT;
}

void TextBox.Draw(int x, int y, TCODConsole *the_console) {
	the_console.setAlignment(TCOD_CENTER);
	the_console.setDefaultBackground(TCODColor.darkGrey);
	the_console.rect(x + _x, y + _y, width, 1, true, TCOD_BKGND_SET);
	the_console.setDefaultBackground(TCODColor.black);
	if(value) {
		the_console.print(x + _x + width / 2, y + _y, value.c_str());
	} else {
		the_console.print(x + _x + width / 2, y + _y, getter().c_str());
	}
}

MenuResult TextBox.Update(int x, int y, bool clicked, TCOD_key_t key) {
	std.string currValue;
	if(value) {
		currValue = *value;
	} else {
		currValue = getter();
	}
	if(key.vk == TCODK_BACKSPACE && currValue.size() > 0) {
		if(value) {
			value.erase(value.end() - 1);
		} else {
			currValue.erase(currValue.end() - 1);
			setter(currValue);
		}
		return KEYRESPOND;
	} else if(key.c >= ' ' && key.c <= '}' && key.c != '+' && key.c != '-') {
		if ((signed int)currValue.size() < width) {
			if(value) {
				(*value) += key.c;
			} else {
				currValue += key.c;
				setter(currValue);
			}
		}
		return KEYRESPOND;
	}
	return NOMENUHIT;
}

void ScrollPanel.Draw(int x, int y, TCODConsole *the_console) {
	if (scroll < 0) {
		scroll = 0;
	}
	if (scroll + height - 2 > contents.TotalHeight()) {
		scroll = std.max(0, contents.TotalHeight() - (height - 2));
	}
	scrollBar = (int)((height-3) * ((double)scroll / (double)std.max(1, contents.TotalHeight() - (height-2)))) + 2;
	scrollBar = std.min(scrollBar, height - 4);

	if(drawFrame) {
		the_console.printFrame(x + _x, y + _y, width, height);
	}

	contents.Draw(x + _x + 1, y + _y + 1, scroll, width - 2, height - 2, the_console);
	the_console.putChar(x + _x + width - 2, y + _y + 1, TCOD_CHAR_ARROW_N, TCOD_BKGND_SET);
	the_console.putChar(x + _x + width - 2, y + _y + height - 2, TCOD_CHAR_ARROW_S, TCOD_BKGND_SET);
	the_console.putChar(x + _x + width - 2, y + _y + scrollBar, 219, TCOD_BKGND_SET);
}

MenuResult ScrollPanel.Update(int x, int y, bool clicked, TCOD_key_t key) {
	if (x >= _x && x < _x + width && y >= _y && y < _y + height) {
		if (clicked) {
			if (x == _x + width - 2) {
				if (y == _y + 1) {
					scroll -= step;
				} else if (y == _y + height - 2) {
					scroll += step;
				} else if (y < _y + scrollBar) {
					scroll -= height;
				} else if (y > _y + scrollBar) {
					scroll += height; 
				}
			} else {
				contents.Update(x - _x - 1, y - _y - 1 + scroll, clicked, key);
			}
		} else {
			contents.Update(x - _x - 1, y - _y - 1 + scroll, clicked, key);
		}
		return MENUHIT;
	}
	if (key.vk != TCODK_NONE) return contents.Update(x, y, clicked, key);
	return NOMENUHIT;
}

void ScrollPanel.GetTooltip(int x, int y, Tooltip *tooltip) {
	if(x >= _x + 1 && x < _x + width - 1 && y >= _y + 1 && y < _y + height - 1) {
		contents.GetTooltip(x - _x - 1, y - _y - 1 + scroll, tooltip);
	}
}

void Frame.Draw(int x, int y, TCODConsole *the_console) {
	the_console.printFrame(x + _x, y + _y, width, height, true, TCOD_BKGND_SET, title.c_str());
	UIContainer.Draw(x, y, the_console);
}

void Grid.AddComponent(Drawable *component) {
	contents.push_back(component);
}

void Grid.RemoveAll() {
	for(std.vector<Drawable *>.iterator it = contents.begin(); it != contents.end(); it++) {
		delete *it;
	}
	contents.clear();
}

void Grid.Draw(int x, int y, TCODConsole *the_console) {
	Draw(x + _x, y + _y, 0, width, height, the_console);
}

void Grid.Draw(int x, int y, int scroll, int _width, int _height, TCODConsole *the_console) {
	int col = 0;
	int top = y;
	int bottom = y + scroll + _height;
	int colWidth = _width / cols;
	int rowHeight = 0;
	for(std.vector<Drawable *>.iterator it = contents.begin(); it != contents.end() && y < bottom; it++) {
		Drawable *component = *it;
		if(component.Visible()) {
			if(y - scroll >= top && y + component.Height() <= bottom) {
				component.Draw(x + colWidth * col, y - scroll, the_console);
			}
			rowHeight = std.max(rowHeight, component.Height());
			col++;
			if(col >= cols) {
				col = 0;
				y += rowHeight;
				rowHeight = 0;
			}
		}
	}
}

int Grid.TotalHeight() {
	int col = 0;
	int rowHeight = 0;
	int y = 0;
	for(std.vector<Drawable *>.iterator it = contents.begin(); it != contents.end(); it++) {
		Drawable *component = *it;
		if(component.Visible()) {
			rowHeight = std.max(rowHeight, component.Height());
			col++;
			if(col >= cols) {
				col = 0;
				y += rowHeight;
				rowHeight = 0;
			}
		}
	}
	return y + rowHeight;
}

MenuResult Grid.Update(int x, int y, bool clicked, TCOD_key_t key) {
	int col = 0;
	int colWidth = width / cols;
	int rowHeight = 0;
	for(std.vector<Drawable *>.iterator it = contents.begin(); it != contents.end(); it++) {
		Drawable *component = *it;
		if(component.Visible()) {
			MenuResult result = component.Update(x - _x - col * (colWidth-1), y - _y, clicked, key);
			if(!(result & NOMENUHIT)) {
				return result;
			}
			rowHeight = std.max(rowHeight, component.Height());
			col++;
			if(col >= cols) {
				col = 0;
				y -= rowHeight;
				rowHeight = 0;
			}
		}
	}
	return NOMENUHIT;
}

void Grid.GetTooltip(int x, int y, Tooltip *tooltip) {
	Drawable.GetTooltip(x, y, tooltip);
	int col = 0;
	int colWidth = width / cols;
	int rowHeight = 0;
	for(std.vector<Drawable *>.iterator it = contents.begin(); it != contents.end(); it++) {
		Drawable *component = *it;
		if(component.Visible()) {
			component.GetTooltip(x - _x - col * colWidth, y - _y, tooltip);
			rowHeight = std.max(rowHeight, component.Height());
			col++;
			if(col >= cols) {
				col = 0;
				y -= rowHeight;
				rowHeight = 0;
			}
		}
	}
}

void Panel.selected(int newSel) {}
void Panel.Open() {}
void Panel.Close() {
	UI.Inst().SetTextMode(false);
}

void Panel.ShowModal() {
	TCODConsole *background = new TCODConsole(Game.Inst().ScreenWidth(), Game.Inst().ScreenHeight());
	TCODConsole.blit (TCODConsole.root, 0, 0, Game.Inst().ScreenWidth(), Game.Inst().ScreenHeight(),
		background, 0, 0);

	int _x = (Game.Inst().ScreenWidth() - width) / 2;
	int _y = (Game.Inst().ScreenHeight() - height) / 2;
	TCOD_key_t key;
	TCOD_mouse_t mouse;
	TCOD_event_t event;

	TCODMouse.showCursor(true);
	while (true) {
		TCODConsole.root.clear();
		TCODConsole.root.setDefaultForeground(TCODColor.white);
		TCODConsole.root.setDefaultBackground(TCODColor.black);
		TCODConsole.blit(background, 0, 0, Game.Inst().ScreenWidth(), Game.Inst().ScreenHeight(),
			TCODConsole.root, 0, 0, 0.7F, 1.0F);

		Draw(_x, _y, TCODConsole.root);
		TCODConsole.root.flush();

		event = TCODSystem.checkForEvent(TCOD_EVENT_ANY, &key, &mouse);

		if (event & TCOD_EVENT_ANY) {
		    mouse = TCODMouse.getStatus();

		    MenuResult result = Update(mouse.cx, mouse.cy, mouse.lbutton_pressed!=0, key);
		    if((result & DISMISS) || key.vk == TCODK_ESCAPE) {
			delete this;
			return;
		    }
		}
	}    
}

void UIContainer.AddComponent(Drawable *component) {
	components.push_back(component);
}

void UIContainer.Draw(int x, int y, TCODConsole *the_console) {
	for(std.vector<Drawable *>.iterator it = components.begin(); it != components.end(); it++) {
		Drawable *component = *it;
		if(component.Visible()) {
			component.Draw(x + _x, y + _y, the_console);
		}
	}
}

MenuResult UIContainer.Update(int x, int y, bool clicked, TCOD_key_t key) {
	for(std.vector<Drawable *>.iterator it = components.begin(); it != components.end(); it++) {
		Drawable *component = *it;
		if(component.Visible()) {
			MenuResult result = component.Update(x - _x, y - _y, clicked, key);
			if(!(result & NOMENUHIT)) {
				return result;
			}
		}
	}

	if (x >= _x && x < _x + width && y >= _y && y < _y + height) {
		return MENUHIT;
	}

	return NOMENUHIT;
}

void UIContainer.GetTooltip(int x, int y, Tooltip *tooltip) {
	Drawable.GetTooltip(x, y, tooltip);
	for(std.vector<Drawable *>.iterator it = components.begin(); it != components.end(); it++) {
		Drawable *component = *it;
		if(component.Visible()) {
			component.GetTooltip(x - _x, y - _y, tooltip);
		}
	}
}

UIContainer.~UIContainer() {
	for(std.vector<Drawable *>.iterator it = components.begin(); it != components.end(); it++) {
		delete *it;
	}
}

Dialog.Dialog(Drawable *ncontents, std.string ntitle, int nwidth, int nheight):
	Panel(nwidth, nheight), title(ntitle), contents(ncontents)
{
	_x = (Game.Inst().ScreenWidth() - nwidth) / 2;
	_y = (Game.Inst().ScreenHeight() - nheight) / 2;
}


void Dialog.SetTitle(std.string ntitle) {
	title = ntitle;
}

void Dialog.SetHeight(int nheight) {
	height = nheight;
	_x = (Game.Inst().ScreenWidth() - width) / 2;
	_y = (Game.Inst().ScreenHeight() - height) / 2;
}

void Dialog.Draw(int x, int y, TCODConsole *the_console) {
	the_console.printFrame(_x, _y, width, height, true, TCOD_BKGND_SET, title.empty() ? 0 : title.c_str());
	contents.Draw(_x, _y, the_console);
}

MenuResult Dialog.Update(int x, int y, bool clicked, TCOD_key_t key) {
	return contents.Update(x - _x, y - _y, clicked, key);
}

void Dialog.GetTooltip(int x, int y, Tooltip *tooltip) {
	Drawable.GetTooltip(x, y, tooltip);
	contents.GetTooltip(x - _x, y - _y, tooltip);
}
