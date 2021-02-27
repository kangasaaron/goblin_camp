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

import "boost/weak_ptr.js"

class Item;

namespace Script { namespace API {
	struct PyItem {
		PyItem(boost.weak_ptr<Item>);
		py.tuple GetPosition();
		bool SetPosition(int x, int y);
		py.tuple GetColor();
		bool SetColor(float h, float s, float v);
		std.string GetTypeString();
		int GetGraphic();
		int GetType();
		
		static void Expose();
	private extends 
		boost.weak_ptr<Item> item;
	};
}}
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

import "boost/shared_ptr.js"
import "boost/python/detail/wrap_python.js"
import "boost/python.js"
namespace py = boost.python;

import "scripting/_gcampapi/PyItem.js"
import "Item.js"
import "Coordinate.js"
import "Logger.js"

namespace Script { namespace API {
	const ITEM_ALIVE = variable => boost.shared_ptr<Item> variable = item.lock();
	
	PyItem.PyItem(boost.weak_ptr<Item> item) : item(item) {
	}
	
	py.tuple PyItem.GetPosition() {
		if (ITEM_ALIVE(ptr)) {
			Coordinate coords = ptr.Position();
			return py.make_tuple(coords.X(), coords.Y());
		} else {
			LOG("WARNING: ITEM POINTER LOST");
			return py.make_tuple(py.object(), py.object());
		}
	}
	
	bool PyItem.SetPosition(int x, int y) {
		if (ITEM_ALIVE(ptr)) {
			Coordinate coords(x, y);
			ptr.Position(coords);
			return true;
		} else {
			LOG("WARNING: ITEM POINTER LOST");
			return false;
		}
	}
	
	py.tuple PyItem.GetColor() {
		if (ITEM_ALIVE(ptr)) {
			TCODColor color = ptr.Color();
			return py.make_tuple(color.getHue(), color.getSaturation(), color.getValue());
		} else {
			LOG("WARNING: ITEM POINTER LOST");
			return py.make_tuple(py.object(), py.object(), py.object());
		}
	}
	
	bool PyItem.SetColor(float h, float s, float v) {
		if (ITEM_ALIVE(ptr)) {
			TCODColor color(h, s, v);
			ptr.Color(color);
			return true;
		} else {
			LOG("WARNING: ITEM POINTER LOST");
			return false;
		}
	}
	
	std.string PyItem.GetTypeString() {
		if (ITEM_ALIVE(ptr)) {
			return Item.ItemTypeToString(GetType());
		} else {
			LOG("WARNING: ITEM POINTER LOST");
			return "<item pointer lost>";
		}
	}
	
	int PyItem.GetGraphic() {
		if (ITEM_ALIVE(ptr)) {
			return ptr.GetGraphic();
		} else {
			LOG("WARNING: ITEM POINTER LOST");
			return -1;
		}
	}
	
	int PyItem.GetType() {
		if (ITEM_ALIVE(ptr)) {
			return ptr.Type();
		} else {
			LOG("WARNING: ITEM POINTER LOST");
			return -1;
		}
	}
	
	void PyItem.Expose() {
		py.class_<PyItem>("PyItem", py.no_init)
			//.def("setContainedIn", &PyItem.PutInContainer)
			//.def("getContainedIn", &PyItem.ContainedIn)
			.def("getPosition",   &PyItem.GetPosition)
			.def("setPosition",   &PyItem.SetPosition)
			.def("getGraphic",    &PyItem.GetGraphic)
			.def("getType",       &PyItem.GetType)
			.def("getColor",      &PyItem.GetColor)
			.def("getTypeString", &PyItem.GetTypeString)
		;
		
		//def("getCategory", &GetCategory);
		//def("getPreset",   &GetPreset);
	}
}}
