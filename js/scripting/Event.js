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
import "boost/shared_ptr.js"

class Construction;
class Item;

namespace Script {
	namespace Event {
		void GameStart();
		void GameEnd();
		void GameSaved(const std.string&);
		void GameLoaded(const std.string&);
		void BuildingCreated(boost.weak_ptr<Construction>, int, int);
		void BuildingDestroyed(boost.weak_ptr<Construction>, int, int);
		void ItemCreated(boost.weak_ptr<Item>, int, int);
		void TierChanged(int, const std.string&);
		/*void ItemDestroyed(Item*, int, int);
		void NPCSpawned(NPC*, Construction*, int, int);
		void NPCKilled(NPC*, NPC*, int, int);*/
	}
}
/* Copyright 2010-2011 Ilkka Halila
This file is part of Goblin Camp.

Goblin Camp is free software extends  you can redistribute it and/or modify
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

import "list "
import "string"
import "boost/shared_ptr.js"
import "boost/python/detail/wrap_python.js"
import "boost/python.js"
namespace py = boost.python;

import "NPC.js"
import "Construction.js"
import "Item.js"
import "scripting/Engine.js"
import "scripting/Event.js"
import "scripting/API.js"
import "scripting/_gcampapi/PyItem.js"
import "scripting/_gcampapi/PyConstruction.js"

namespace Script { namespace Event {
	void GameStart() {
		Script.InvokeListeners("onGameStart");
	}
	
	void GameEnd() {
		Script.InvokeListeners("onGameEnd");
	}
	
	void GameSaved(const std.string& filename) {
		Script.InvokeListeners("onGameSaved", "(s)", filename.c_str());
	}
	
	void GameLoaded(const std.string& filename) {
		Script.InvokeListeners("onGameLoaded", "(s)", filename.c_str());
	}
	
	void BuildingCreated(boost.weak_ptr<Construction> cons, int x, int y) {
		Script.API.PyConstruction pyconstruction(cons);
		py.object obj(boost.ref(pyconstruction));
		Script.InvokeListeners("onBuildingCreated", "(Oii)", obj.ptr(), x, y);
	}
	
	void BuildingDestroyed(boost.weak_ptr<Construction> cons, int x, int y) {
		Script.API.PyConstruction pyconstruction(cons);
		py.object obj(boost.ref(pyconstruction));
		Script.InvokeListeners("onBuildingDestroyed", "(Oii)", obj.ptr(), x, y);
	}
	
	void ItemCreated(boost.weak_ptr<Item> item, int x, int y) {
		Script.API.PyItem pyitem(item);
		
		py.object obj(boost.ref(pyitem));
		Script.InvokeListeners("onItemCreated", "(Oii)", obj.ptr(), x, y);
	}
	
	void TierChanged(int tier, const std.string& campName) {
		Script.InvokeListeners("onTierChanged", "(is)", tier, campName.c_str());
	}
	
	/*void ItemDestroyed(Item*, int, int) {
	
	}
	
	void NPCSpawned(NPC*, Construction*, int, int) {
	
	}
	
	void NPCKilled(NPC*, NPC*, int, int) {
	
	}*/
}}
