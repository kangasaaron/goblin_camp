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

// import "data/Serialization.js"
import { zero, Coordinate } from "./Coordinate.js";
import { Random } from "./Random.js";

class TCODColor {} // TODO this is a hack; take it out.

// class FilthNode  extends /*public*/ boost.enable_shared_from_this<FilthNode> {
export class FilthNode {
    // GC_SERIALIZABLE_CLASS
    pos = zero;
    depth = 0;
    graphic = 0;
    color = null;
    graphic = null;
    // Coordinate pos;
    // int depth;
    // int graphic;
    // TCODColor color;
    //public:
    // FilthNode(const Coordinate& pos = zero, int depth = 0);
    constructor(pos = zero, depth = 0) {
        this.pos = pos;
        this.depth = depth;
        // this.color = new TCODColor();
        // this.color.b = 0;
    }

    // ~FilthNode();

    // void Update();
    // int Depth();
    // void Depth(int);
    // Coordinate Position();
    // int GetGraphic();
    // TCODColor GetColor();
};

FilthNode.CLASS_VERSION = 0;
// BOOST_CLASS_VERSION(FilthNode, 0)
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

// import "Random.js"
// import "Filth.js"
// import "Game.js"
// import "Coordinate.js"

// FilthNode.FilthNode(const Coordinate& pos, int ndep) : pos(pos)
// {
// 	color.b = 0;
// 	Depth(ndep);
// }

// FilthNode.~FilthNode() {}

// void FilthNode.Update() {
// }

FilthNode.prototype.GetGraphic = function GetGraphic() {
    return (this.depth < 5) ? '~' : '#';
}

FilthNode.prototype.GetColor = function GetColor() {
    return this.color;
}

// int FilthNode.Depth() {return depth;}
FilthNode.prototype.Depth = function Depth(val) {
    // ow(val,ow.optional.number);
    if (Number.isFinite(val)) {
        this.depth = val;
        let add = Random.Generate(60);
        color.r = 170 - Math.min(Map.Inst().GetCorruption(pos), 40) + add;
        color.g = 150 - Math.min(Map.Inst().GetCorruption(pos), 80) + add;
    }
    return this.depth;
}
FilthNode.prototype.Position = function Position() { return this.pos; }

FilthNode.prototype.save = function save(ar, version) {
    ar({
        'pos': this.pos,
        'depth': this.depth,
        'graphic': this.graphic,
        'color': this.color
    });
}

FilthNode.prototype.load = function load(ar, version) {
    this.pos = ar.pos;
    this.depth = ar.depth;
    this.graphic = ar.graphic;
    this.color = ar.color;
}