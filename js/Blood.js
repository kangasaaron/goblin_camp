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

// import "boost/enable_shared_from_this.js"
// import "libtcod.js"

import { zero, Coordinate } from "./Coordinate.js";
// import "data/Serialization.js"

export class BloodNode {
    // GC_SERIALIZABLE_CLASS

    // 	Coordinate pos;
    pos = zero;
    // 	int depth;
    depth = 0;
    // 	int graphic;
    graphic;
    // 	TCODColor color;
    color;
    // //public:
    // 	BloodNode(const Coordinate& pos = zero, int depth = 0);
    constructor(pos = zero, depth = 0) {
            this.pos = pos;
            this.depth = depth;
            this.graphic = null;
            this.color = null;
        }
        // 	~BloodNode();

    // 	void Update();
    // 	void Draw(Coordinate, TCODConsole*);
    // 	int Depth();
    // 	void Depth(int);
    // 	Coordinate Position();

    // BOOST_CLASS_VERSION(BloodNode, 0)
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
    // import "stdafx.js"

    // import "Blood.js"
    // import {Coordinate} from "Coordinate.js";

    // BloodNode.BloodNode(const Coordinate& pos, int ndep) : pos(pos), depth(ndep)
    // {
    // }

    // BloodNode.~BloodNode() {}

    // void BloodNode.Update() {
    // }

    Update() {}
    Draw(upleft, the_console) {};

    // void BloodNode.Draw(Coordinate upleft, TCODConsole* the_console) {
    // }

    Depth(val) {
        if (val !== undefined)
            this.depth = val;
        return this.depth;
    }

    // BloodNode.Depth(int val) {depth=val;}

    Position() {
        return this.pos;
    }

    save(ar, version) {
        // const int x = pos.X();
        // const int y = pos.Y();
        ar({
            "x": this.pos.X(),
            "y": this.pos.Y(),
            "depth": depth,
            "graphic": graphic,
            "color": color.save(ar, version)
        });
    }

    load(ar, version) {
        // int x, y;
        // ar & x;
        // ar & y;
        this.pos = new Coordinate(ar.x, ar.y);
        this.depth = ar.depth;
        this.graphic = ar.graphic;
        this.color = ar.color;
    }
}
BloodNode.CLASS_VERSION = 0;