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


import {
    Direction
}
from "./Direction.js";

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
    static CLASS_VERSION = 0;
    hashCode() {
        return `Coordinate(${this.x},${this.y})`;
    }
    constructor(x = 0, y = 0) {
        super(2);
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

    static DirectionToCoordinate(dir) {
        let coordsToDirs = [
            [0, -1], // North
            [1, -1], // North-east
            [1, 0], // East
            [1, 1], // South-east
            [0, 1], // South
            [-1, 1], // South-west
            [-1, 0], // West
            [-1, -1], // North-west
            [0, 0] // No direction
        ];
        return new Coordinate(...coordsToDirs[dir]);
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

    X(v) {
        if (v !== undefined)
            this.x = v;
        return this.x;
    }

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

    Xptr() {
        return this.x;
    }
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
    isGreaterThan(other) {
        validCoordinate(other, "isGreaterThan", "other");
        return !(this.equals(other) && this.isLessThan(other));
    }

    equals(other) {
        validCoordinate(other, "equals", "other");
        return this.x === other.x && this.y === other.y;
    }

    isNotEqualTo(other) {
        validCoordinate(other, "isNotEqualTo", "other");
        return !this.equals(other);
    }

    addScalar(scalar) {
        if (!Number.isFinite(scalar))
            throw new TypeError('Coordinate addScalar "scalar" parameter must be a finite number');
        return new Coordinate(this.x + scalar, this.y + scalar);
    }

    minusScalar(scalar) {
        if (!Number.isFinite(scalar))
            throw new TypeError('Coordinate minusScalar "scalar" parameter must be a finite number');
        return new Coordinate(this.x - scalar, this.y - scalar);
    }

    addCoordinate(other) {
        validCoordinate(other, "addCoordinate", "other");
        return new Coordinate(this.x + other.x, this.y + other.y);
    }

    minusCoordinate(other) {
        validCoordinate(other, "minusCoordinate", "other");
        return new Coordinate(this.x - other.x, this.y - other.y);
    }

    timesScalar(scalar) {
        if (!Number.isFinite(scalar))
            throw new TypeError('Coordinate timesScalar "scalar" parameter must be a finite number');
        return new Coordinate(this.x * scalar, this.y * scalar);
    }

    dividedByScalar(scalar) {
        if (!Number.isFinite(scalar))
            throw new TypeError('Coordinate dividedByScalar "scalar" parameter must be a finite number');
        return new Coordinate(this.x / scalar, this.y / scalar);
    }

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

    insideRectangle(low, high) {
        validCoordinate(low, "insideRectangle", "low");
        validCoordinate(high, "insideRectangle", "high");

        return (this.x >= low.x && this.y <= high.x) &&
            (this.y >= low.y && this.y <= high.y);
    }

    //are we inside the rectangle starting at origin and with extent (width,height) excluded?

    insideExtent(origin, extent) {
        validCoordinate(origin, "insideExtent", "origin");
        validCoordinate(extent, "insideExtent", "extent");
        return this.insideRectangle(origin, origin.addCoordinate(extent.minusScalar(1)));
    }


    onRectangleEdges(low, high) {
        validCoordinate(low, "onRectangleEdges", "low");
        validCoordinate(high, "onRectangleEdges", "high");
        return (this.x == low.x || this.x == high.x || this.y == low.y || this.y == high.y);
    }

    onExtentEdges(origin, extent) {
        validCoordinate(origin, "onExtentEdges", "origin");
        validCoordinate(extent, "onExtentEdges", "extent");
        return this.onRectangleEdges(origin, origin.addCoordinate(extent.minusScalar(1)));
    }


    shrinkRectangle(low, high) {
        validCoordinate(low, "shrinkRectangle", "low");
        validCoordinate(high, "shrinkRectangle", "high");
        let res = new Coordinate(this.x, this.y);
        for (let d = 0; d < 2; ++d) {
            res[d] = Math.max(low[d], Math.min(high[d], res[d]))
        }
        return res;
    }

    shrinkExtent(origin, extent) {
        validCoordinate(origin, "shrinkExtent", "origin");
        validCoordinate(extent, "shrinkExtent", "extent");
        return this.shrinkRectangle(origin, origin.addCoordinate(extent.minusScalar(1)));
    }

    serialize(ar, version) {
        return {
            "x": this.x,
            "y": this.y
        };
    }

    static deserialize(ar, version) {
        return new Coordinate(ar.x, ar.y);
    }
    static Distance(...args) {
        if (args[0] instanceof Coordinate && args[1] instanceof Coordinate)
            return this.DistanceBetweenCoordinates(args[0], args[1]);
        else if (Number.isFinite(args[0]) && Number.isFinite(args[1]) && Number.isFinite(args[2]) && Number.isFinite(args[3]))
            return this.DistanceBetweenCoordinatePoints(
                args[0],
                args[1],
                args[2],
                args[3]
            );
    }

    static DistanceBetweenCoordinates(p, q) {
        let distance = 0;
        for (let d = 0; d < 2; ++d) {
            distance += Math.abs(q[d] - p[d]);
        }
        return distance;
    }
    static DistanceBetweenCoordinatePoints(x0, y0, x1, y1) {
        return this.DistanceBetweenCoordinates(new Coordinate(x0, y0), new Coordinate(x1, y1));
    }
    static get zero() {
        return new Coordinate(0, 0);
    }
    static get undefinedCoordinate() {
        return new Coordinate(-1, -1);
    }
}

function hash_value(coord) {
    let seed = 0;
    hash_combine(seed, coord.x);
    hash_combine(seed, coord.y);
    return seed;
}