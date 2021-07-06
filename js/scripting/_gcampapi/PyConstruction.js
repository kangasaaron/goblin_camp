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




const CONSTRUCTION_ALIVE = (variable) => variable = construction.lock()

class PyConstruction {
    /**boost.weak_ptr<Construction>**/
    construction;
    constructor(construction) {
        construction = (construction)
    }

    GetPosition() {
        if (CONSTRUCTION_ALIVE(ptr)) {
            let coords = ptr.Position();
            return py.make_tuple(coords.X(), coords.Y());
        } else {
            LOG("WARNING: CONSTRUCTION POINTER LOST");
            return py.make_tuple(py.object(), py.object());
        }
    }
    GetTypeString() {
        if (CONSTRUCTION_ALIVE(ptr)) {
            if (GetType() >= 0) {
                return Construction.Presets[GetType()].name;
            } else {
                LOG("WARNING: CONSTRUCTION TYPE === -1");
                return "<invalid type>";
            }
        } else {
            LOG("WARNING: CONSTRUCTION POINTER LOST");
            return "<construction pointer lost>";
        }
    }
    GetType() {
        if (CONSTRUCTION_ALIVE(ptr)) {
            return ptr.Type();
        } else {
            LOG("WARNING: CONSTRUCTION POINTER LOST");
            return -1;
        }
    }

    static Expose() {
        py.class_ < PyConstruction > ("PyConstruction", py.no_init)
            .def("getPosition", PyConstruction.GetPosition)
            .def("getType", PyConstruction.GetType)
            .def("getTypeString", PyConstruction.GetTypeString);
    }
}