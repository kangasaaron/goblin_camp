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

// import "boost/array.js"
// import "cstdlib" // int abs(int)"

//import "data/Serialization.js" //TODO
import { defineEnum } from "./other/enums.js";

export const Direction = defineEnum("Direction",
    "NORTH",
    "NORTHEAST",
    "EAST",
    "SOUTHEAST",
    "SOUTH",
    "SOUTHWEST",
    "WEST",
    "NORTHWEST",
    "NODIRECTION",
);

function validCoordinate(coordinate, functionName, parameterName) {
    if (!coordinate)
        throw new TypeError(`Coordinate "${functionName}" needs a "${parameterName}" parameter`);
    if (typeof coordinate !== "object")
        throw new TypeError(`Coordinate "${functionName}" "${parameterName}" parameter must be an object`);
    if (!('x' in coordinate))
        throw new TypeError(`Coordinate "${functionName}" "${parameterName}" parameter must have a member 'x'`);
    if (!('y' in coordinate))
        throw new TypeError(`Coordinate "${functionName}" "${parameterName}" parameter must have a member 'y'`);
    if (!Number.isFinite(coordinate.x))
        throw new TypeError(`Coordinate "${functionName}" "${parameterName}" parameter member 'x' must be a finite number`);
    if (!Number.isFinite(coordinate.y))
        throw new TypeError(`Coordinate "${functionName}" "${parameterName}" parameter member 'y' must be a finite number`);
}

export class Coordinate extends Array {
    // GC_SERIALIZABLE_CLASS

    // friend int Distance(const Coordinate&, const Coordinate&);
    // friend std.size_t hash_value(const Coordinate&);

    // int x, y;
    // x = 0;
    // y = 0;
    //public extends 
    constructor(x = 0, y = 0) {
        super();
        if (!Number.isFinite(x))
            throw new TypeError('Coordinate constructor parameter x must be a finite number');
        if (!Number.isFinite(y))
            throw new TypeError('Coordinate constructor parameter y must be a finite number');
        this.x = x;
        this.y = y;
    }
    get x() {
        return this[0];
    }
    set x(x) {
        if (!Number.isFinite(x))
            throw new TypeError('Coordinate set x parameter must be a finite number');
        this[0] = x;
    }
    get y() {
        return this[1];
    }
    set y(y) {
        if (!Number.isFinite(y))
            throw new TypeError('Coordinate set y parameter must be a finite number');
        this[1] = y;
    }

    /* beware, those are pairwise {min,max} : Coordinate.min(p,q) is *not* equivalent to (p < q ? p : q)
       
       Typical use: (min(p,q), max(p,q)) are the (low, high) corner of the bounding box rectangle of p and q
     */
    static min(p, q) { // const Coordinate& p, const Coordinate &q
        return new Coordinate(Math.min(p.x, q.x), Math.min(p.y, q.y));
    }
    static max(p, q) { //Coordinate max(const Coordinate& p, const Coordinate &q) {
        return new Coordinate(Math.max(p.x, q.x), Math.max(p.y, q.y));
    }

    static DirectionToCoordinate(dir) { //static Coordinate DirectionToCoordinate(Direction dir) {
        let coordsToDirs = //static boost.array<Coordinate,9> coordsToDirs = 
            [ // gcc complains unless there are two level of braces
                // see http://stackoverflow.com/questions/2687701/question-on-boost-array-initializer
                new Coordinate(0, -1), // North
                new Coordinate(1, -1), // North-east
                new Coordinate(1, 0), // East
                new Coordinate(1, 1), // South-east
                new Coordinate(0, 1), // South
                new Coordinate(-1, 1), // South-west
                new Coordinate(-1, 0), // West
                new Coordinate(-1, -1), // North-west
                new Coordinate(0, 0) // No direction
            ];
        return coordsToDirs[dir];
    }

    /* specific and generic accessors
       
       Coordinate provides both specific accessors p.X(), p.Y() and
       operator[] accessors p[0], p[1]. Both are read/write.

       Specific accessors are slightly more type-safe -- operator[]
       accesses such as top[3] are not ruled out -- so should be
       preferred when we statically know which dimension to access.
       
       The generic accessors are designed to be used for
       dimension-generic code, that is code which access both X and
       Y in the same way. For example:

    	   randomLocation.X(Random.Generate(upperCorner.X(), lowerCorner.X()));
    	   randomLocation.Y(Random.Generate(upperCorner.Y(), lowerCorner.Y()));

       can be profitably turned into:

    	   for (int d = 0; d < 2; ++d)
    		   randomLocation[d] =  Random.Generate(upperCorner[d], lowerCorder[d]);

       This latter form will avoid all kinds of copy-paste bugs.
    */
    // X() const {
    // 	return x;
    // }

    X(v) {
        if (v !== undefined)
            this.x = v;
        return this.x;
    }

    // Y() const {
    // 	return y;
    // }

    // Y(const int& v) {
    // 	return y = v;
    // }
    Y(v) {
        if (v !== undefined)
            this.y = v;
        return this.y;
    }

    // in order not to have to handle failure, we use a bool-like
    // semantics where 0 gets mapped to X and everyone else to Y
    // inline int operator[](int d) const {
    // 	if (d == 0) return x;
    // 	else return y;
    // }
    // inline int &operator[](int d) {
    // 	if (d == 0) return x;
    // 	else return y;
    // }

    //useful for legacy TCOD interaction
    // inline int *Xptr() {
    // 	return &x;
    // }
    Xptr() {
            return this.x;
        }
        // inline int *Yptr() {
        // 	return &y;
        // }
    Yptr() {
        return this.y;
    }

    isLessThan(other) {
            validCoordinate(other, "isLessThan", "other");
            if (this.x !== other.x)
                return this.x < other.x;
            else
                return this.y < other.y;
        }
        // inline bool operator<(const Coordinate& other) const {
        // 	if (x != other.x) return x < other.x;
        // 	else return y < other.y;
        // }

    // inline bool operator>(const Coordinate& other) const {
    // 	return !(operator<(other));
    // }
    isGreaterThan(other) {
        validCoordinate(other, "isGreaterThan", "other");
        return !(this.equals(other) && this.isLessThan(other));
    }

    // inline bool operator==(const Coordinate& other) const {
    // 	return (x == other.x && y == other.y);
    // }
    equals(other) {
        validCoordinate(other, "equals", "other");
        return this.x === other.x && this.y === other.y;
    }

    // inline bool operator!=(const Coordinate& other) const {
    // 	return !(operator==(other));
    // }
    isNotEqualTo(other) {
        validCoordinate(other, "isNotEqualTo", "other");
        return !this.equals(other);
    }

    // inline Coordinate operator+(const int& scalar) const {
    // 	return Coordinate(x + scalar, y + scalar);
    // }
    addScalar(scalar) {
        if (!Number.isFinite(scalar))
            throw new TypeError('Coordinate addScalar "scalar" parameter must be a finite number');
        return new Coordinate(this.x + scalar, this.y + scalar);
    }

    // inline Coordinate operator-(const int& scalar) const {
    // 	return Coordinate(x - scalar, y - scalar);
    // }
    minusScalar(scalar) {
        if (!Number.isFinite(scalar))
            throw new TypeError('Coordinate minusScalar "scalar" parameter must be a finite number');
        return new Coordinate(this.x - scalar, this.y - scalar);
    }

    // inline Coordinate operator+(const Coordinate& other) const {
    // 	return Coordinate(x + other.x, y + other.y);
    // }
    addCoordinate(other) {
        validCoordinate(other, "addCoordinate", "other");
        return new Coordinate(this.x + other.x, this.y + other.y);
    }

    // inline Coordinate operator-(const Coordinate& other) const {
    // 	return Coordinate(x - other.x, y - other.y);
    // }
    minusCoordinate(other) {
        validCoordinate(other, "minusCoordinate", "other");
        return new Coordinate(this.x - other.x, this.y - other.y);
    }

    // inline Coordinate operator*(const int& scalar) const {
    // 	return Coordinate(x * scalar, y * scalar);
    // }
    timesScalar(scalar) {
        if (!Number.isFinite(scalar))
            throw new TypeError('Coordinate timesScalar "scalar" parameter must be a finite number');
        return new Coordinate(this.x * scalar, this.y * scalar);
    }

    // inline Coordinate operator/(const int& scalar) const {
    // 	return Coordinate(x / scalar, y / scalar);
    // }
    dividedByScalar(scalar) {
        if (!Number.isFinite(scalar))
            throw new TypeError('Coordinate dividedByScalar "scalar" parameter must be a finite number');
        return new Coordinate(this.x / scalar, this.y / scalar);
    }

    // inline Coordinate& operator+=(const Coordinate& other) {
    // 	x += other.x;
    // 	y += other.y;
    // 	return *this;
    // }
    // inline Coordinate& operator+=(const int& scalar) {
    // 	x += scalar;
    // 	y += scalar;
    // 	return *this;
    // }
    addCoordinateToThis(other) {
        validCoordinate(other, "addCoordinateToThis", "other");
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    addScalarToThis(scalar) {
        if (!Number.isFinite(scalar))
            throw new TypeError('Coordinate addScalarToThis "scalar" parameter must be a finite number');
        this.x += scalar;
        this.y += scalar;
        return this;
    }

    /* The inside, onEdges and shrink functions are declined in two varieties:

       - the "rectangle" version takes a couple of corners (low, high) (with the
    	 coordinates of (low) all smaller than those of (high)), which the set
    	 of points whose coordinates are between (low,high), with (high)
    	 *included* in the rectangle.

       - the "extent" version takes an origin and an extent, that is a couple
    	 (width, height) of *positive* integers, which delimits the dimension of
    	 the rectangle. The (origin+extent) point is *excluded* from the
    	 rectangle.

       One may convert between both representations: the extent (origin,extent)
       is the rectangle (low=origin, high=origin+extent-1), and conversely the
       rectangle (low,high) has extent (low,high-low+1).

       Both representations are convenient in different situations.
     */

    // inline bool insideRectangle(const Coordinate& low, const Coordinate& high) const {
    // 	return (   x >= low.X() && x <= high.X()
    // 	        && y >= low.Y() && y <= high.Y());
    // }
    insideRectangle(low, high) {
        validCoordinate(low, "insideRectangle", "low");
        validCoordinate(high, "insideRectangle", "high");

        return (this.x >= low.x && this.y <= high.x) &&
            (this.y >= low.y && this.y <= high.y);
    }

    //are we inside the rectangle starting at origin and with extent (width,height) excluded?
    // inline bool insideExtent(const Coordinate& origin, const Coordinate& extent) const {
    // 	return insideRectangle(origin, origin+extent-1);
    // }
    insideExtent(origin, extent) {
        validCoordinate(origin, "insideExtent", "origin");
        validCoordinate(extent, "insideExtent", "extent");
        return this.insideRectangle(origin, origin.addCoordinate(extent.minusScalar(1)));
    }

    // inline bool onRectangleEdges(const Coordinate& low, const Coordinate& high) const {
    // 	return (x == low.X() || x == high.X() || y == low.Y() || y == high.Y());
    // }
    onRectangleEdges(low, high) {
            validCoordinate(low, "onRectangleEdges", "low");
            validCoordinate(high, "onRectangleEdges", "high");
            return (this.x == low.x || this.x == high.x || this.y == low.y || this.y == high.y);
        }
        // inline bool onExtentEdges(const Coordinate& origin, const Coordinate& extent) const {
        // 	return onRectangleEdges(origin, origin + extent - 1);
        // }
    onExtentEdges(origin, extent) {
        validCoordinate(origin, "onExtentEdges", "origin");
        validCoordinate(extent, "onExtentEdges", "extent");
        return this.onRectangleEdges(origin, origin.addCoordinate(extent.minusScalar(1)));
    }

    // inline Coordinate shrinkRectangle(const Coordinate& low, const Coordinate& high) const {
    // 	Coordinate res(x,y);
    // 	for (int d = 0; d < 2; ++d)
    // 		res[d] = std.max(low[d], std.min(high[d], res[d]));
    // 	return res;
    // }
    shrinkRectangle(low, high) {
        validCoordinate(low, "shrinkRectangle", "low");
        validCoordinate(high, "shrinkRectangle", "high");
        let res = new Coordinate(this.x, this.y);
        for (let d = 0; d < 2; ++d) {
            res[d] = Math.max(low[d], Math.min(high[d], res[d]))
        }
        return res;
    }

    // inline Coordinate shrinkExtent(const Coordinate& origin, const Coordinate& extent) const {
    // 	return shrinkRectangle(origin, origin + extent - 1);
    // };
    shrinkExtent(origin, extent) {
        validCoordinate(origin, "shrinkExtent", "origin");
        validCoordinate(extent, "shrinkExtent", "extent");
        return this.shrinkRectangle(origin, origin.addCoordinate(extent.minusScalar(1)));
    }
};

export function Distance(...args) {
    if (args[0] instanceof Coordinate && args[1] instanceof Coordinate)
        return DistanceBetweenCoordinates(args[0], args[1]);
    else if (Number.isFinite(args[0]) && Number.isFinite(args[1]) && Number.isFinite(args[2]) && Number.isFinite(args[3]))
        return DistanceBetweenCoordinatePoints(args[0], args[1], args[2], args[3]);
}

// inline int Distance(const Coordinate& p, const Coordinate& q) {
// 	int distance = 0;
// 	//dim-genericity may here seem a bit overkill, but will be nice if
// 	//we were to change to Euclidian distance for example
// 	for (int d = 0; d < 2; ++d)
// 		distance += abs(q[d] - p[d]);
// 	return distance;
// }
function DistanceBetweenCoordinates(p, q) {
    let distance = 0;
    for (let d = 0; d < 2; ++d) {
        distance += Math.abs(q[d] - p[d]);
    }
    return distance;
}

// inline int Distance(const int& x0, const int& y0, const int& x1, const int& y1) {
// 	//note: this reimplementation is not terribly efficient, but will go away soon anyway
// 	return Distance(Coordinate(x0, y0), Coordinate(x1, y1));
// }

function DistanceBetweenCoordinatePoints(x0, y0, x1, y1) {
    return DistanceBetweenCoordinates(new Coordinate(x0, y0), new Coordinate(x1, y1));
}

export const zero = new Coordinate(0, 0);
// static const Coordinate zero(0, 0);
// static const Coordinate undefined(-1, -1);
export const undefinedCoordinate = new Coordinate(-1, -1);

// BOOST_CLASS_VERSION(Coordinate, 0)
Coordinate.CLASS_VERSION = 0;
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

// import "boost/functional/hash.js"

// import "Coordinate.js"

// std.size_t hash_value(const Coordinate& coord) {
// 	std.size_t seed = 0;
// 	boost.hash_combine(seed, coord.x);
// 	boost.hash_combine(seed, coord.y);
// 	return seed;
// }
function hash_value(coord) {
    let seed = 0;
    hash_combine(seed, coord.x);
    hash_combine(seed, coord.y);
    return seed;
}


// void Coordinate.save(OutputArchive& ar, const unsigned int version) const {
// 	ar & x;
// 	ar & y;
// }
Coordinate.prototype.save = function save(ar, version) {
    ar(this.x);
    ar(this.y);
}

// void Coordinate.load(InputArchive& ar, const unsigned int version) {
// 	if (version == 0) {
// 		ar & x;
// 		ar & y;
// 	}
// }

Coordinate.prototype.load = function load(ar, version) {
    if (version === 0) {
        this.x = ar(x);
        this.y = ar(y);
    }
}