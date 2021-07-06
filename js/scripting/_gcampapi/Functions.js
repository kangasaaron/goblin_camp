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

// namespace py = boost.python;

import "./scripting/_gcampapi/Functions.js"
import "./Announce.js"
import "./scripting/API.js"
import "./Version.js"
import "./UI/MessageBox.js"
import "./Game.js"
import "./Item.js"
import "./Construction.js"
import "./NatureObject.js"

class EntityType extends Enum {
    //enum
    static EConstr;
    static EItem;
    static ENPC;
    static EPlant;
}
EntityType.enumify();

// namespace Script {
class API {
    Announce(str) {
        Announce.i.AddMsg(str);
    }

    IsDebugBuild() {
        if (Globals.DEBUG) {
            return true;
        } else /*#else */ {
            return false;
        } /*#endif*/
    }

    IsDevMode() {
        return Game.i.DevMode();
    }

    GetVersionString() {
        return Globals.gameVersion;
    }

    MessageBox(str) {
        MessageBox.ShowMessageBox(str);
    }

    Delay(delay, callback) {
        if (!(typeof callback === "function")) {
            LOG("WARNING: Attempted to add a delay to an uncallable object");
            return;
        }
        // py.object

        let func = callback.bind(this);
        Game.i.AddDelay(delay, func);
    }


    _SpawnItem(coords, type) {
        return Game.i.CreateItem(coords, type);
    }

    // XXX:  it doesn't 'spawn' constructions, it builds them (as in will fail and return -1 when there are no resources)
    // TODO: make it spawn, and reserve building for something else
    SpawnEntity(type,
        name, x, y) {
        let spawn;
        let getID;
        let coords = new Coordinate(x, y);

        switch (type) {
            case EntityType.EConstr:
                spawn = Game.i.PlaceConstruction;
                getID = Construction.StringToConstructionType;
                break;
            case EntityType.EItem:
                //spawn = boost.bind(&Game.i.CreateItem, Game.i, _1, _2); // this makes the compiler cry for some reason
                spawn = _SpawnItem;
                getID = Item.StringToItemType;
                break;
            case EntityType.ENPC:
                spawn = Game.i.CreateNPC.bind(Game.i, _1, _2);
                getID = NPC.StringToNPCType;
                break;
            case EntityType.EPlant:
                Game.i.CreateNatureObject(coords, name);
                return -1;
            default:
                // PyErr_SetString(PyExc_ValueError, "Invalid type");
                // py.throw_error_already_set();
                throw new SyntaxError("Invalid type");
                return -1;
        }

        let id = getID(name);

        if (id === -1) {
            throw new SyntaxError("Invalid name");
            // PyErr_SetString(PyExc_ValueError, "Invalid name");
            // py.throw_error_already_set();
        }

        return spawn(coords, id);
    }

    ExposeFunctions() {
        py.def("announce", Announce);
        py.def("appendListener", Script.AppendListener);
        py.def("getVersionString", GetVersionString);
        py.def("isDebugBuild", IsDebugBuild);
        py.def("isDevMode", IsDevMode);
        py.def("messageBox", MessageBox);
        py.def("delay", Delay);
        py.def("spawnEntity", SpawnEntity);

        py.enum_ < EntityType > ("EntityType").
        value("ENTITY_BUILDING", EConstr).
        value("ENTITY_ITEM", EItem).
        value("ENTITY_NPC", ENPC).
        value("ENTITY_PLANT", EPlant).
        export_values();
    }

}