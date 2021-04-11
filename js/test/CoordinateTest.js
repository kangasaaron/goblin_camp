import {
    Coordinate
} from "../Coordinate.js";
import {
    Direction
} from "../Direction.js";
import {
    Enum
} from "../other/Enums.js";

QUnit.module("Direction test", function () {
    QUnit.test("test enum", function (assert) {
        assert.equal(Direction.NORTH, 0);
        assert.ok(Direction.NORTH instanceof Number);
        assert.ok(Direction.NORTH instanceof Direction);

        assert.equal(Direction.NORTHEAST, 1);
        assert.ok(Direction.NORTH instanceof Number);
        assert.ok(Direction.NORTH instanceof Direction);

        assert.equal(Direction.EAST, 2);
        assert.ok(Direction.NORTH instanceof Number);
        assert.ok(Direction.NORTH instanceof Direction);

        assert.equal(Direction.SOUTHEAST, 3);
        assert.ok(Direction.NORTH instanceof Number);
        assert.ok(Direction.NORTH instanceof Direction);

        assert.equal(Direction.SOUTH, 4);
        assert.ok(Direction.NORTH instanceof Number);
        assert.ok(Direction.NORTH instanceof Direction);

        assert.equal(Direction.SOUTHWEST, 5);
        assert.ok(Direction.NORTH instanceof Number);
        assert.ok(Direction.NORTH instanceof Direction);

        assert.equal(Direction.WEST, 6);
        assert.ok(Direction.NORTH instanceof Number);
        assert.ok(Direction.NORTH instanceof Direction);

        assert.equal(Direction.NORTHWEST, 7);
        assert.ok(Direction.NORTH instanceof Number);
        assert.ok(Direction.NORTH instanceof Direction);

        assert.equal(Direction.NODIRECTION, 8);
        assert.ok(Direction.NORTH instanceof Number);
        assert.ok(Direction.NORTH instanceof Direction);
    });
});

QUnit.module("Zero test", function () {
    QUnit.test("zero", function (assert) {
        assert.ok(Coordinate.zero instanceof Coordinate);
        assert.equal(Coordinate.zero.x, 0);
        assert.equal(Coordinate.zero.y, 0);
    });
});

QUnit.module("Undefined Coordinate test", function () {
    QUnit.test("undefinedCoordinate", function (assert) {
        assert.ok(Coordinate.undefinedCoordinate instanceof Coordinate);
        assert.equal(Coordinate.undefinedCoordinate.x, -1);
        assert.equal(Coordinate.undefinedCoordinate.y, -1);
    });
});

QUnit.module("Coordinate test", function () {
    QUnit.test("statics", function (assert) {
        assert.equal(Coordinate.CLASS_VERSION, 0);
        let c1 = new Coordinate(1, 1),
            c2 = new Coordinate(4, 4),
            result = Coordinate.min(c1, c2);
        assert.ok(result.x == 1 && result.y == 1);

        result = Coordinate.max(c1, c2);
        assert.ok(result.x == 4 && result.y == 4);

        result = Coordinate.DirectionToCoordinate(Direction.NORTH);
        assert.ok(result.x == 0 && result.y == -1, "NORTH")
        result = Coordinate.DirectionToCoordinate(Direction.NORTHEAST);
        assert.ok(result.x == 1 && result.y == -1, "NORTHEAST")
        result = Coordinate.DirectionToCoordinate(Direction.EAST);
        assert.ok(result.x == 1 && result.y == 0, "EAST")
        result = Coordinate.DirectionToCoordinate(Direction.SOUTHEAST);
        assert.ok(result.x == 1 && result.y == 1, "SOUTHEAST")
        result = Coordinate.DirectionToCoordinate(Direction.SOUTH);
        assert.ok(result.x == 0 && result.y == 1, "SOUTH")
        result = Coordinate.DirectionToCoordinate(Direction.SOUTHWEST);
        assert.ok(result.x == -1 && result.y == 1, "SOUTHWEST")
        result = Coordinate.DirectionToCoordinate(Direction.WEST);
        assert.ok(result.x == -1 && result.y == 0, "WEST")
        result = Coordinate.DirectionToCoordinate(Direction.NORTHWEST);
        assert.ok(result.x == -1 && result.y == -1, "NORTHWEST")
        result = Coordinate.DirectionToCoordinate(Direction.NODIRECTION);
        assert.ok(result.x == 0 && result.y == 0, "NODIRECTION")
    });

    QUnit.test("constructor", function (assert) {
        let a = new Coordinate();
        assert.ok(a instanceof Coordinate);
        assert.ok(a instanceof Array);
        assert.equal(a.x, 0);
        assert.equal(a.y, 0);

        let b = new Coordinate(10, 20);
        assert.ok(b instanceof Coordinate);
        assert.ok(b instanceof Array);
        assert.equal(b.x, 10);
        assert.equal(b.y, 20);
        assert.equal(b[0], 10);
        assert.equal(b[1], 20);

        assert.throws(function () {
            let c = new Coordinate(Infinity, Object);
        });
        assert.throws(function () {
            let c = new Coordinate(1, "jeff");
        });
        assert.throws(function () {
            let c = new Coordinate(null, Math);
        });
    });

    QUnit.test("get and set x and y", function (assert) {
        let a = new Coordinate();
        assert.equal(a.x, 0);
        assert.equal(a.y, 0);
        a.x = 2;
        a.y = 10;
        assert.equal(a.x, 2);
        assert.equal(a.y, 10);
        assert.equal(a[0], 2);
        assert.equal(a[1], 10);
        assert.equal(a.X(), 2);
        assert.equal(a.Y(), 10);
        assert.equal(a.Xptr(), 2);
        assert.equal(a.Yptr(), 10);

        a.X(7);
        a.Y(13);
        assert.equal(a.x, 7);
        assert.equal(a.y, 13);
        assert.equal(a[0], 7);
        assert.equal(a[1], 13);
        assert.equal(a.X(), 7);
        assert.equal(a.Y(), 13);
        assert.equal(a.Xptr(), 7);
        assert.equal(a.Yptr(), 13);


        assert.throws(function () {
            a.x = null;
        });
        assert.throws(function () {
            a.x = -Infinity;
        });
        assert.throws(function () {
            a.X(NaN);
        });


        assert.throws(function () {
            a.y = "jeff";
        });
        assert.throws(function () {
            a.y = Math;
        });
        assert.throws(function () {
            a.Y(Symbol("hey"));
        });
    });

    QUnit.test("comparison functions", function (assert) {
        let a = new Coordinate(0, 0);
        let b = new Coordinate(0, 0);

        assert.ok(a !== b);
        assert.ok(a.equals(b));
        assert.ok(a.equals(a));

        b.x = 1;
        assert.ok(a.isNotEqualTo(b));

        assert.ok(a.isLessThan(b));
        assert.ok(b.isGreaterThan(a));

        b.x = 0;
        b.y = 1;
        assert.ok(a.isLessThan(b));
        assert.ok(b.isGreaterThan(a), 'last greater than');

        assert.throws(function () {
            a.isLessThan("some string");
        });
        assert.throws(function () {
            a.isGreaterThan("some string");
        });
        assert.throws(function () {
            a.equals("some string");
        });
        assert.throws(function () {
            a.isNotEqualTo("some string");
        });

    });

    QUnit.test("scalar math", function (assert) {
        let a = new Coordinate(0, 0);
        let result = a.addScalar(1);
        assert.equal(result.x, 1);
        assert.equal(result.y, 1);

        assert.throws(function () {
            a.addScalar("jeff");
        });
        assert.throws(function () {
            a.addScalar(NaN);
        });
        assert.throws(function () {
            a.addScalar(Symbol("hey"));
        });
        assert.throws(function () {
            a.addScalar(Math);
        });

        result = a.minusScalar(3);
        assert.equal(result.x, -3);
        assert.equal(result.y, -3);

        assert.throws(function () {
            a.minusScalar("jeff");
        });
        assert.throws(function () {
            a.minusScalar(NaN);
        });
        assert.throws(function () {
            a.minusScalar(Symbol("hey"));
        });
        assert.throws(function () {
            a.minusScalar(Math);
        });

        a = new Coordinate(2, 3);
        result = a.timesScalar(3);
        assert.equal(result.x, 6);
        assert.equal(result.y, 9);

        assert.throws(function () {
            a.timesScalar("jeff");
        });
        assert.throws(function () {
            a.timesScalar(NaN);
        });
        assert.throws(function () {
            a.timesScalar(Symbol("hey"));
        });
        assert.throws(function () {
            a.timesScalar(Math);
        });

        a = new Coordinate(10, 8);
        result = a.dividedByScalar(2);
        assert.equal(result.x, 5);
        assert.equal(result.y, 4);

        assert.throws(function () {
            a.dividedByScalar("jeff");
        });
        assert.throws(function () {
            a.dividedByScalar(NaN);
        });
        assert.throws(function () {
            a.dividedByScalar(Symbol("hey"));
        });
        assert.throws(function () {
            a.dividedByScalar(Math);
        });


        a.addScalarToThis(3);
        assert.equal(a.x, 13);
        assert.equal(a.y, 11);

        assert.throws(function () {
            a.addScalarToThis("jeff");
        });
        assert.throws(function () {
            a.addScalarToThis(NaN);
        });
        assert.throws(function () {
            a.addScalarToThis(Symbol("hey"));
        });
        assert.throws(function () {
            a.addScalarToThis(Math);
        });
    });

    QUnit.test("Coordinate math", function (assert) {
        let a = new Coordinate(10, 20);
        let b = new Coordinate(2, 3);
        let result = a.addCoordinate(b);
        assert.equal(result.x, 12);
        assert.equal(result.y, 23);

        assert.throws(function () {
            let c = a.addCoordinate(Infinity);
        });
        assert.throws(function () {
            let c = a.addCoordinate("jeff");
        });
        assert.throws(function () {
            let c = a.addCoordinate(null);
        });

        result = a.minusCoordinate(b);
        assert.equal(result.x, 8);
        assert.equal(result.y, 17);

        assert.throws(function () {
            let c = a.minusCoordinate(Infinity);
        });
        assert.throws(function () {
            let c = a.minusCoordinate("jeff");
        });
        assert.throws(function () {
            let c = a.minusCoordinate(null);
        });


        a.addCoordinateToThis(b);
        assert.equal(a.x, 12);
        assert.equal(a.y, 23);

        assert.throws(function () {
            let c = a.addCoordinateToThis(Infinity);
        });
        assert.throws(function () {
            let c = a.addCoordinateToThis("jeff");
        });
        assert.throws(function () {
            let c = a.addCoordinateToThis(null);
        });
    });

    QUnit.test("rectangles and extents", function (assert) {
        let a = new Coordinate(5, 5);
        let high = new Coordinate(10, 10);
        let low = new Coordinate(0, 0);

        assert.ok(a.insideRectangle(low, high));

        assert.throws(function () {
            a.insideRectangle();
        });
        assert.throws(function () {
            a.insideRectangle(high);
        });
        assert.throws(function () {
            a.insideRectangle(high, "low");
        });
        assert.throws(function () {
            a.insideRectangle(7, Object);
        });
    });

});