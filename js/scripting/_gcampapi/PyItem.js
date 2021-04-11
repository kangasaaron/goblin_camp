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

const ITEM_ALIVE = variable => variable = item.lock();

class PyItem {
    //boost.weak_ptr<Item> 
    item;
    constructor(item) {
        item = (item)
    }
    GetPosition() {
        if (ITEM_ALIVE(ptr)) {
            let coords = ptr.Position();
            return py.make_tuple(coords.X(), coords.Y());
        } else {
            LOG("WARNING: ITEM POINTER LOST");
            return py.make_tuple(py.object(), py.object());
        }
    }
    SetPosition(x, y) {
        if (ITEM_ALIVE(ptr)) {
            let coords = new Coordinate(x, y);
            ptr.Position(coords);
            return true;
        } else {
            LOG("WARNING: ITEM POINTER LOST");
            return false;
        }
    }
    GetColor() {
        if (ITEM_ALIVE(ptr)) {
            let color = ptr.Color();
            return py.make_tuple(color.getHue(), color.getSaturation(), color.getValue());
        } else {
            LOG("WARNING: ITEM POINTER LOST");
            return py.make_tuple(py.object(), py.object(), py.object());
        }
    }

    SetColor(h, s, v) {
        if (ITEM_ALIVE(ptr)) {
            let color = new HSV(h, s, v);
            ptr.Color(color);
            return true;
        } else {
            LOG("WARNING: ITEM POINTER LOST");
            return false;
        }
    }
    GetTypeString() {
        if (ITEM_ALIVE(ptr)) {
            return Item.ItemTypeToString(GetType());
        } else {
            LOG("WARNING: ITEM POINTER LOST");
            return "<item pointer lost>";
        }
    }

    GetGraphic() {
        if (ITEM_ALIVE(ptr)) {
            return ptr.GetGraphic();
        } else {
            LOG("WARNING: ITEM POINTER LOST");
            return -1;
        }
    }
    GetType() {
        if (ITEM_ALIVE(ptr)) {
            return ptr.Type();
        } else {
            LOG("WARNING: ITEM POINTER LOST");
            return -1;
        }
    }


    static Expose() {
        py.class_ < PyItem > ("PyItem", py.no_init)
            //.def("setContainedIn", &PyItem.PutInContainer)
            //.def("getContainedIn", &PyItem.ContainedIn)
            .def("getPosition", PyItem.GetPosition)
            .def("setPosition", PyItem.SetPosition)
            .def("getGraphic", PyItem.GetGraphic)
            .def("getType", PyItem.GetType)
            .def("getColor", PyItem.GetColor)
            .def("getTypeString", PyItem.GetTypeString);

        //def("getCategory", &GetCategory);
        //def("getPreset",   &GetPreset);
    }
}