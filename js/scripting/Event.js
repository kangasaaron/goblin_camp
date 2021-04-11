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


class APIEventManager {
    GameStart() {
        Script.InvokeListeners("onGameStart");
    }
    GameEnd() {
        Script.InvokeListeners("onGameEnd");
    }
    GameSaved(filename) {
        Script.InvokeListeners("onGameSaved", "(s)", filename.c_str());
    }
    GameLoaded(filename) {
        Script.InvokeListeners("onGameLoaded", "(s)", filename.c_str());
    }
    BuildingCreated(cons, x, y) {
        let pyconstruction = cons;
        let obj = boost.ref(pyconstruction);
        Script.InvokeListeners("onBuildingCreated", "(Oii)", obj.ptr(), x, y);
    }
    BuildingDestroyed(cons, x, y) {
        let pyconstruction = cons;
        let obj = boost.ref(pyconstruction);
        Script.InvokeListeners("onBuildingDestroyed", "(Oii)", obj.ptr(), x, y);
    }
    ItemCreated(item, x, y) {
        let pyitem = item;

        let obj = boost.ref(pyitem);
        Script.InvokeListeners("onItemCreated", "(Oii)", obj.ptr(), x, y);
    }
    TierChanged(tier, campName) {
        Script.InvokeListeners("onTierChanged", "(is)", tier, campName.c_str());
    }

    /* ItemDestroyed(Item*, int, int) {
	
	}
	,
	 NPCSpawned(NPC*, Construction*, int, int) {
	
	}
	,
	 NPCKilled(NPC*, NPC*, int, int) {
	
	}*/
};

export let APIEvent = new APIEventManager();