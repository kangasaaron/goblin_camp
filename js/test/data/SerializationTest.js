import {
    Coordinate
} from "../../Coordinate.js";
import {
    BloodNode
} from "../../Blood.js";
import {
    JSONSerializer
} from "../../data/Serialization.js";

QUnit.module("data/Serialization: serializing", function () {
    QUnit.test("serialize primitives", function (assert) {
        let a = new JSONSerializer();

        let s = a.serialize();
        assert.equal(s, "\"__undefined__\"");

        s = a.serialize("")
        assert.equal(s, "\"\"");

        s = a.serialize(undefined)
        assert.equal(s, "\"__undefined__\"");

        s = a.serialize(null)
        assert.equal(s, "\"__null__\"");

        s = a.serialize(25)
        assert.equal(s, "25");

        s = a.serialize("cat");
        assert.equal(s, "\"cat\"");

        s = a.serialize(BigInt(30));
        assert.equal(s, "{\"__type__\":\"BigInt\",\"value\":\"30\"}");

        s = a.serialize(Symbol("hey"));
        assert.equal(s, "{\"__type__\":\"Symbol\",\"description\":\"hey\"}");

        s = a.serialize(true);
        assert.equal(s, "true");
        s = a.serialize(false);
        assert.equal(s, "false");

        s = a.serialize(NaN);
        assert.equal(s, "\"__NaN__\"");
        s = a.serialize(Infinity);
        assert.equal(s, "\"__Infinity__\"");
        s = a.serialize(-Infinity);
        assert.equal(s, "\"__-Infinity__\"");
    });
    QUnit.test("serialize built-in objects", function (assert) {
        let a = new JSONSerializer();

        let s = a.serialize(new Date(0))
        assert.equal(s, "{\"__type__\":\"Date\",\"value\":0}", "date");

        s = a.serialize(new Array())
        assert.equal(s, "[]", "empty array");

        s = a.serialize([1, 2, 3, 4, 5, 6, 7])
        assert.equal(s, "[1,2,3,4,5,6,7]", "number array");

        s = a.serialize([new Date(0), new Date(1), new Date(2), new Date(3), new Date(4), new Date(5), new Date(6)])
        assert.equal(s, "[{\"__type__\":\"Date\",\"value\":0},{\"__type__\":\"Date\",\"value\":1},{\"__type__\":\"Date\",\"value\":2},{\"__type__\":\"Date\",\"value\":3},{\"__type__\":\"Date\",\"value\":4},{\"__type__\":\"Date\",\"value\":5},{\"__type__\":\"Date\",\"value\":6}]", "array of dates");

        s = a.serialize([true, null, undefined, "cat", [], {}, new Date(0)]);
        assert.equal(s, "[true,\"__null__\",\"__undefined__\",\"cat\",[],{},{\"__type__\":\"Date\",\"value\":0}]", "varied array");

        s = a.serialize(new Error("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"Error\",\"message\":\"oh noes!\"}", "Error");
        s = a.serialize(new AggregateError([new Error("oh noes!"), new RangeError("not again!")]));
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"AggregateError\",\"value\":[{\"__type__\":\"Error\",\"errorType\":\"Error\",\"message\":\"oh noes!\"},{\"__type__\":\"Error\",\"errorType\":\"RangeError\",\"message\":\"not again!\"}]}", "AggregateError");
        s = a.serialize(new EvalError("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"EvalError\",\"message\":\"oh noes!\"}", "EvalError");
        // s = a.serialize(new InternalError("oh noes!"))
        // assert.equal(s, "{\"__type__\":\"InternalError\",\"message\":\"oh noes!\"}", "InternalError");
        s = a.serialize(new RangeError("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"RangeError\",\"message\":\"oh noes!\"}", "RangeError");
        s = a.serialize(new ReferenceError("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"ReferenceError\",\"message\":\"oh noes!\"}", "ReferenceError");
        s = a.serialize(new SyntaxError("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"SyntaxError\",\"message\":\"oh noes!\"}", "SyntaxError");
        s = a.serialize(new TypeError("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"TypeError\",\"message\":\"oh noes!\"}", "TypeError");
        s = a.serialize(new URIError("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"URIError\",\"message\":\"oh noes!\"}", "URIError");

        s = a.serialize(new Map([
            ["key1", 1],
            ["key2", 2]
        ]));
        assert.equal(s, "{\"__type__\":\"Map\",\"values\":[[\"key1\",1],[\"key2\",2]]}", "simplemap");

        s = a.serialize(new Map([
            [12, new Date(0)],
            [Symbol("whoa"), BigInt(35)]
        ]));
        assert.equal(s, "{\"__type__\":\"Map\",\"values\":[[12,{\"__type__\":\"Date\",\"value\":0}],[{\"__type__\":\"Symbol\",\"description\":\"whoa\"},{\"__type__\":\"BigInt\",\"value\":\"35\"}]]}", "complicated map");

        s = a.serialize(new Set([1, 2, 3, 4, 5, 6, 7]));
        assert.equal(s, "{\"__type__\":\"Set\",\"values\":[1,2,3,4,5,6,7]}", "simple set");

        s = a.serialize(new Set([
            12, new Date(0),
            Symbol("whoa"), BigInt(35)
        ]));
        assert.equal(s, "{\"__type__\":\"Set\",\"values\":[12,{\"__type__\":\"Date\",\"value\":0},{\"__type__\":\"Symbol\",\"description\":\"whoa\"},{\"__type__\":\"BigInt\",\"value\":\"35\"}]}", "complicated set");


        s = a.serialize(Int8Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Int8Array\",\"values\":[1,2,3,4,5,6,7]}", "int 8 array");
        s = a.serialize(Uint8Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Uint8Array\",\"values\":[1,2,3,4,5,6,7]}", "uint 8 array");
        s = a.serialize(Uint8ClampedArray.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Uint8ClampedArray\",\"values\":[1,2,3,4,5,6,7]}", "uint 8 clamped array");

        s = a.serialize(Int16Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Int16Array\",\"values\":[1,2,3,4,5,6,7]}", "int 16 array");
        s = a.serialize(Uint16Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Uint16Array\",\"values\":[1,2,3,4,5,6,7]}", "uint 16 array");

        s = a.serialize(Int32Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Int32Array\",\"values\":[1,2,3,4,5,6,7]}", "int 32 array");
        s = a.serialize(Uint32Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Uint32Array\",\"values\":[1,2,3,4,5,6,7]}", "uint 32 array");

        s = a.serialize(Float32Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Float32Array\",\"values\":[1,2,3,4,5,6,7]}", "Float 32 array");
        s = a.serialize(Float64Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Float64Array\",\"values\":[1,2,3,4,5,6,7]}", "Float 64 array");
        s = a.serialize(BigInt64Array.from([1n, 2n, 3n, 4n, 5n, 6n, 7n]))
        assert.equal(s, "{\"__type__\":\"BigInt64Array\",\"values\":[\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\"]}", "BigInt 64 array");
        s = a.serialize(BigUint64Array.from([1n, 2n, 3n, 4n, 5n, 6n, 7n]))
        assert.equal(s, "{\"__type__\":\"BigUint64Array\",\"values\":[\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\"]}", "BigUInt 64 array");


        s = a.serialize(new RegExp("[^abc]*", "gimsuy"))
        assert.equal(s, "{\"__type__\":\"RegExp\",\"source\":\"[^abc]*\",\"flags\":\"gimsuy\"}", "RegExp");


    });

    QUnit.test.todo("ArrayBuffer", function (assert) {});
    QUnit.test.todo("DataView", function (assert) {});
    QUnit.test("Object", function (assert) {
        let a = new JSONSerializer();
        let s = a.serialize({
            "a": "b",
            "c": 2
        })
        assert.equal(s, "{\"a\":\"b\",\"c\":2}", "simple object");
        let obj = {};
        obj[12] = new Date(0);
        Object.defineProperty(obj, "whoa", {
            value: BigInt(35),
            enumerable: true
        });

        s = a.serialize(obj)
        assert.equal(s, "{\"12\":{\"__type__\":\"Date\",\"value\":0},\"whoa\":{\"__type__\":\"BigInt\",\"value\":\"35\"}}", "complicated object");
    });
    QUnit.test("Function", function (assert) {
        let a = new JSONSerializer();
        let s = a.serialize(() => true)
        assert.equal(s, "{\"__type__\":\"Function\",\"source\":\"() => true\"}", "Function");
    });
    QUnit.test("Classes", function (assert) {
        let pos = new Coordinate(20, 30);
        let depth = 4;
        let b = new BloodNode(pos, depth);

        let a = new JSONSerializer();
        let s = a.serialize(b);
        assert.equal(s, "{\"pos\":[20,30],\"depth\":4,\"graphic\":\"__null__\",\"color\":[null,null,null],\"__id\":" + b.__id + "}", "before registering class");

        a.register_type(BloodNode);
        s = a.serialize(b);
        assert.equal(s, "{\"__class__\":\"BloodNode\",\"__version__\":" + BloodNode.CLASS_VERSION + ",\"pos\":{\"__class__\":\"Coordinate\",\"__version__\":0,\"x\":20,\"y\":30},\"depth\":4,\"graphic\":null,\"color\":[null,null,null],\"__id\":" + b.__id + "}", "after registering class");

    });
});


QUnit.module("data/Serialization: deserializing", function () {
    QUnit.test("deserialize primitives", function (assert) {
        let a = new JSONSerializer();

        let s = a.serialize();
        let n = a.deserialize(s);
        assert.equal(n, undefined);

        s = a.serialize("")
        n = a.deserialize(s);
        assert.equal(n, "");

        s = a.serialize(undefined)
        n = a.deserialize(s);
        assert.equal(n, undefined);

        s = a.serialize(null)
        n = a.deserialize(s);
        assert.equal(n, null);

        s = a.serialize(25)
        n = a.deserialize(s);
        assert.equal(n, 25);

        s = a.serialize("cat");
        n = a.deserialize(s);
        assert.equal(n, "cat");

        s = a.serialize(BigInt(30));
        n = a.deserialize(s);
        assert.equal(n, 30n);

        s = a.serialize(Symbol("hey"));
        n = a.deserialize(s);
        assert.equal(n, Symbol.for("hey"));

        s = a.serialize(true);
        n = a.deserialize(s);
        assert.equal(n, true);
        s = a.serialize(false);
        n = a.deserialize(s);
        assert.equal(n, false);

        s = a.serialize(NaN);
        n = a.deserialize(s);
        assert.ok(isNaN(n));
        s = a.serialize(Infinity);
        n = a.deserialize(s);
        assert.equal(n, Infinity);
        s = a.serialize(-Infinity);
        n = a.deserialize(s);
        assert.equal(n, -Infinity);
    });


    QUnit.test("deserialize built-in objects", function (assert) {
        let a = new JSONSerializer();

        let s = a.serialize(new Date(0))
        let n = a.deserialize(s);
        assert.equal(n.valueOf(), new Date(0).valueOf());

        s = a.serialize(new Array())
        n = a.deserialize(s);
        assert.deepEqual(n, [], "empty array");

        s = a.serialize([1, 2, 3, 4, 5, 6, 7])
        n = a.deserialize(s);
        assert.deepEqual(n, [1, 2, 3, 4, 5, 6, 7], "number array");

        s = a.serialize([new Date(0), new Date(1), new Date(2), new Date(3), new Date(4), new Date(5), new Date(6)])
        n = a.deserialize(s);
        assert.deepEqual(n, [new Date(0), new Date(1), new Date(2), new Date(3), new Date(4), new Date(5), new Date(6)], "array of dates");

        s = a.serialize([true, null, undefined, "cat", [], {}, new Date(0)]);
        n = a.deserialize(s);
        assert.deepEqual(n, [true, null, undefined, "cat", [], {}, new Date(0)], "varied array");

        s = a.serialize(new Error("oh noes!"))
        n = a.deserialize(s);
        assert.deepEqual(n, new Error("oh noes!"), "Error");

        s = a.serialize(new AggregateError([new Error("oh noes!"), new RangeError("not again!")]));
        n = a.deserialize(s);
        assert.deepEqual(n, new AggregateError([new Error("oh noes!"), new RangeError("not again!")]));

        s = a.serialize(new EvalError("oh noes!"))
        n = a.deserialize(s);
        assert.deepEqual(n, new EvalError("oh noes!"))

        // s = a.serialize(new InternalError("oh noes!"))
        // n = a.deserialize(s);
        // assert.equal(n, "{\"__type__\":\"InternalError\",\"message\":\"oh noes!\"}", "InternalError");
        s = a.serialize(new RangeError("oh noes!"));
        n = a.deserialize(s);
        assert.deepEqual(n, new RangeError("oh noes!"));

        s = a.serialize(new ReferenceError("oh noes!"))
        n = a.deserialize(s);
        assert.deepEqual(n, new ReferenceError("oh noes!"))

        s = a.serialize(new SyntaxError("oh noes!"))
        n = a.deserialize(s);
        assert.deepEqual(n, new SyntaxError("oh noes!"))

        s = a.serialize(new TypeError("oh noes!"))
        n = a.deserialize(s);
        assert.deepEqual(n, new TypeError("oh noes!"))

        s = a.serialize(new URIError("oh noes!"))
        n = a.deserialize(s);
        assert.deepEqual(n, new URIError("oh noes!"))

        s = a.serialize(new Map([
            ["key1", 1],
            ["key2", 2]
        ]));
        n = a.deserialize(s);
        assert.deepEqual(n, new Map([
            ["key1", 1],
            ["key2", 2]
        ]), "map");

        s = a.serialize(new Map([
            [12, new Date(0)],
            [Symbol.for("whoa"), BigInt(35)]
        ]));
        n = a.deserialize(s);
        let ne = Array.from(n.entries());
        assert.equal(ne[0][0], 12);
        assert.deepEqual(ne[0][1], new Date(0));
        assert.equal(ne[1][0], Symbol.for("whoa"));
        assert.equal(ne[1][1], BigInt(35));

        s = a.serialize(new Set([1, 2, 3, 4, 5, 6, 7]));
        n = a.deserialize(s);
        assert.deepEqual(n, new Set([1, 2, 3, 4, 5, 6, 7]), "simple set");

        s = a.serialize(new Set([
            12, new Date(0),
            Symbol.for("what???"), BigInt(35)
        ]));
        n = a.deserialize(s);
        assert.deepEqual(n, new Set([
            12, new Date(0),
            Symbol.for("what???"), BigInt(35)
        ]), "complicated set");

        s = a.serialize(Int8Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.deserialize(s);
        assert.deepEqual(n, Int8Array.from([1, 2, 3, 4, 5, 6, 7]))
        s = a.serialize(Uint8Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.deserialize(s);
        assert.deepEqual(n, Uint8Array.from([1, 2, 3, 4, 5, 6, 7]))
        s = a.serialize(Uint8ClampedArray.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.deserialize(s);
        assert.deepEqual(n, Uint8ClampedArray.from([1, 2, 3, 4, 5, 6, 7]))

        s = a.serialize(Int16Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.deserialize(s);
        assert.deepEqual(n, Int16Array.from([1, 2, 3, 4, 5, 6, 7]))
        s = a.serialize(Uint16Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.deserialize(s);
        assert.deepEqual(n, Uint16Array.from([1, 2, 3, 4, 5, 6, 7]))

        s = a.serialize(Int32Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.deserialize(s);
        assert.deepEqual(n, Int32Array.from([1, 2, 3, 4, 5, 6, 7]))
        s = a.serialize(Uint32Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.deserialize(s);
        assert.deepEqual(n, Uint32Array.from([1, 2, 3, 4, 5, 6, 7]))

        s = a.serialize(Float32Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.deserialize(s);
        assert.deepEqual(n, Float32Array.from([1, 2, 3, 4, 5, 6, 7]), "Float 32 array");

        s = a.serialize(Float64Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.deserialize(s);
        assert.deepEqual(n, Float64Array.from([1, 2, 3, 4, 5, 6, 7]), "Float 64 array");

        s = a.serialize(BigInt64Array.from([1n, 2n, 3n, 4n, 5n, 6n, 7n]))
        n = a.deserialize(s);
        assert.deepEqual(n, BigInt64Array.from([1n, 2n, 3n, 4n, 5n, 6n, 7n]), "BigInt 64 array");

        s = a.serialize(BigUint64Array.from([1n, 2n, 3n, 4n, 5n, 6n, 7n]))
        n = a.deserialize(s);
        assert.deepEqual(n, BigUint64Array.from([1n, 2n, 3n, 4n, 5n, 6n, 7n]), "BigUInt 64 array");


        s = a.serialize(new RegExp("[^abc]*", "gimsuy"))
        n = a.deserialize(s);
        assert.deepEqual(n, new RegExp("[^abc]*", "gimsuy"), "RegExp");


    });
    QUnit.test("Object", function (assert) {
        let a = new JSONSerializer();
        let s = a.serialize({
            "a": "b",
            "c": 2
        })
        let n = a.deserialize(s);
        assert.deepEqual(n, {
            "a": "b",
            "c": 2
        }, "simple object");
        let obj = {};
        obj[12] = new Date(0);
        Object.defineProperty(obj, "whoa", {
            value: BigInt(35),
            enumerable: true
        });

        s = a.serialize(obj);
        n = a.deserialize(s);
        assert.deepEqual(n, obj, "complicated object");
    });

    QUnit.test("Classes", function (assert) {
        let pos = new Coordinate(20, 30);
        let depth = 4;
        let b = new BloodNode(pos, depth);
        b.graphic = 1;
        b.color = [255, 0, 0];

        let a = new JSONSerializer();
        let s = a.serialize(b);
        let n = a.deserialize(s);
        assert.deepEqual(n, {
            "pos": [20, 30],
            "depth": 4,
            "graphic": 1,
            "color": [255, 0, 0],
            "__id": b.__id
        }, "before registering class");

        a.register_type(BloodNode);
        s = a.serialize(b);
        n = a.deserialize(s);
        let p = new Coordinate(20, 30);
        let d = 4;
        let comparison = new BloodNode(p, d);
        comparison.graphic = 1;
        comparison.color = [255, 0, 0];
        comparison.__id = b.__id;

        assert.deepEqual(n, comparison, "after registering class");

    });
});