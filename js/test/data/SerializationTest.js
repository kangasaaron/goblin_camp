import {
    Coordinate
} from "../../Coordinate.js";
import {
    BloodNode
} from "../../BloodNode.js";
import {
    JSONSerializer
} from "../../data/Serialization.js";
import { Color } from "../../color/Color.js";

QUnit.module("data/Serialization: saving", function () {
    QUnit.test("save primitives", function (assert) {
        let a = new JSONSerializer();

        let s = a.save();
        assert.equal(s, "\"__undefined__\"");

        s = a.save("")
        assert.equal(s, "\"\"");

        s = a.save(undefined)
        assert.equal(s, "\"__undefined__\"");

        s = a.save(null)
        assert.equal(s, "\"__null__\"");

        s = a.save(25)
        assert.equal(s, "25");

        s = a.save("cat");
        assert.equal(s, "\"cat\"");

        s = a.save(BigInt(30));
        assert.equal(s, "{\"__type__\":\"BigInt\",\"value\":\"30\"}");

        s = a.save(Symbol("hey"));
        assert.equal(s, "{\"__type__\":\"Symbol\",\"description\":\"hey\"}");

        s = a.save(true);
        assert.equal(s, "true");
        s = a.save(false);
        assert.equal(s, "false");

        s = a.save(NaN);
        assert.equal(s, "\"__NaN__\"");
        s = a.save(Infinity);
        assert.equal(s, "\"__Infinity__\"");
        s = a.save(-Infinity);
        assert.equal(s, "\"__-Infinity__\"");
    });
    QUnit.test("save built-in objects", function (assert) {
        let a = new JSONSerializer();

        let s = a.save(new Date(0))
        assert.equal(s, "{\"__type__\":\"Date\",\"value\":0}", "date");

        s = a.save(new Array())
        assert.equal(s, "[]", "empty array");

        s = a.save([1, 2, 3, 4, 5, 6, 7])
        assert.equal(s, "[1,2,3,4,5,6,7]", "number array");

        s = a.save([new Date(0), new Date(1), new Date(2), new Date(3), new Date(4), new Date(5), new Date(6)])
        assert.equal(s, "[{\"__type__\":\"Date\",\"value\":0},{\"__type__\":\"Date\",\"value\":1},{\"__type__\":\"Date\",\"value\":2},{\"__type__\":\"Date\",\"value\":3},{\"__type__\":\"Date\",\"value\":4},{\"__type__\":\"Date\",\"value\":5},{\"__type__\":\"Date\",\"value\":6}]", "array of dates");

        s = a.save([true, null, undefined, "cat", [], {}, new Date(0)]);
        assert.equal(s, "[true,\"__null__\",\"__undefined__\",\"cat\",[],{},{\"__type__\":\"Date\",\"value\":0}]", "varied array");

        s = a.save(new Error("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"Error\",\"message\":\"oh noes!\"}", "Error");
        s = a.save(new AggregateError([new Error("oh noes!"), new RangeError("not again!")]));
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"AggregateError\",\"value\":[{\"__type__\":\"Error\",\"errorType\":\"Error\",\"message\":\"oh noes!\"},{\"__type__\":\"Error\",\"errorType\":\"RangeError\",\"message\":\"not again!\"}]}", "AggregateError");
        s = a.save(new EvalError("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"EvalError\",\"message\":\"oh noes!\"}", "EvalError");
        // s = a.save(new InternalError("oh noes!"))
        // assert.equal(s, "{\"__type__\":\"InternalError\",\"message\":\"oh noes!\"}", "InternalError");
        s = a.save(new RangeError("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"RangeError\",\"message\":\"oh noes!\"}", "RangeError");
        s = a.save(new ReferenceError("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"ReferenceError\",\"message\":\"oh noes!\"}", "ReferenceError");
        s = a.save(new SyntaxError("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"SyntaxError\",\"message\":\"oh noes!\"}", "SyntaxError");
        s = a.save(new TypeError("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"TypeError\",\"message\":\"oh noes!\"}", "TypeError");
        s = a.save(new URIError("oh noes!"))
        assert.equal(s, "{\"__type__\":\"Error\",\"errorType\":\"URIError\",\"message\":\"oh noes!\"}", "URIError");

        s = a.save(new Map([
            ["key1", 1],
            ["key2", 2]
        ]));
        assert.equal(s, "{\"__type__\":\"Map\",\"values\":[[\"key1\",1],[\"key2\",2]]}", "simplemap");

        s = a.save(new Map([
            [12, new Date(0)],
            [Symbol("whoa"), BigInt(35)]
        ]));
        assert.equal(s, "{\"__type__\":\"Map\",\"values\":[[12,{\"__type__\":\"Date\",\"value\":0}],[{\"__type__\":\"Symbol\",\"description\":\"whoa\"},{\"__type__\":\"BigInt\",\"value\":\"35\"}]]}", "complicated map");

        s = a.save(new Set([1, 2, 3, 4, 5, 6, 7]));
        assert.equal(s, "{\"__type__\":\"Set\",\"values\":[1,2,3,4,5,6,7]}", "simple set");

        s = a.save(new Set([
            12, new Date(0),
            Symbol("whoa"), BigInt(35)
        ]));
        assert.equal(s, "{\"__type__\":\"Set\",\"values\":[12,{\"__type__\":\"Date\",\"value\":0},{\"__type__\":\"Symbol\",\"description\":\"whoa\"},{\"__type__\":\"BigInt\",\"value\":\"35\"}]}", "complicated set");


        s = a.save(Int8Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Int8Array\",\"values\":[1,2,3,4,5,6,7]}", "int 8 array");
        s = a.save(Uint8Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Uint8Array\",\"values\":[1,2,3,4,5,6,7]}", "uint 8 array");
        s = a.save(Uint8ClampedArray.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Uint8ClampedArray\",\"values\":[1,2,3,4,5,6,7]}", "uint 8 clamped array");

        s = a.save(Int16Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Int16Array\",\"values\":[1,2,3,4,5,6,7]}", "int 16 array");
        s = a.save(Uint16Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Uint16Array\",\"values\":[1,2,3,4,5,6,7]}", "uint 16 array");

        s = a.save(Int32Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Int32Array\",\"values\":[1,2,3,4,5,6,7]}", "int 32 array");
        s = a.save(Uint32Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Uint32Array\",\"values\":[1,2,3,4,5,6,7]}", "uint 32 array");

        s = a.save(Float32Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Float32Array\",\"values\":[1,2,3,4,5,6,7]}", "Float 32 array");
        s = a.save(Float64Array.from([1, 2, 3, 4, 5, 6, 7]))
        assert.equal(s, "{\"__type__\":\"Float64Array\",\"values\":[1,2,3,4,5,6,7]}", "Float 64 array");
        s = a.save(BigInt64Array.from([1n, 2n, 3n, 4n, 5n, 6n, 7n]))
        assert.equal(s, "{\"__type__\":\"BigInt64Array\",\"values\":[\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\"]}", "BigInt 64 array");
        s = a.save(BigUint64Array.from([1n, 2n, 3n, 4n, 5n, 6n, 7n]))
        assert.equal(s, "{\"__type__\":\"BigUint64Array\",\"values\":[\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\"]}", "BigUInt 64 array");


        s = a.save(new RegExp("[^abc]*", "gimsuy"))
        assert.equal(s, "{\"__type__\":\"RegExp\",\"source\":\"[^abc]*\",\"flags\":\"gimsuy\"}", "RegExp");


    });

    QUnit.test.todo("ArrayBuffer", function (assert) { });
    QUnit.test.todo("DataView", function (assert) { });
    QUnit.test("Object", function (assert) {
        let a = new JSONSerializer();
        let s = a.save({
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

        s = a.save(obj)
        assert.equal(s, "{\"12\":{\"__type__\":\"Date\",\"value\":0},\"whoa\":{\"__type__\":\"BigInt\",\"value\":\"35\"}}", "complicated object");
    });
    QUnit.test("Function", function (assert) {
        let a = new JSONSerializer();
        let s = a.save(() => true)
        assert.equal(s, "{\"__type__\":\"Function\",\"source\":\"() => true\"}", "Function");
    });
    QUnit.test("Classes", function (assert) {
        let pos = new Coordinate(20, 30);
        let depth = 4;
        let b = new BloodNode(pos, depth);

        let a = new JSONSerializer();
        assert.equal(a.isRegistered(BloodNode), false);
        let s = a.save(b);
        assert.equal(s, `{"__id":${b.__id},"data":"__undefined__","pos":[20,30],"depth":4,"graphic":"__null__","color":{"__id":${b.color.__id},"data":"__undefined__","_storage":{"r":0,"g":0,"b":0,"opacity":1}}}`, "before registering class");

        a.register_type(BloodNode);
        s = a.save(b);
        assert.equal(s, `{"__class__":"BloodNode","__version__":0,"pos":{"__class__":"Coordinate","__version__":0,"x":20,"y":30},"depth":4,"graphic":null,"color":{"__class__":"Color","__version__":0,"r":0,"g":0,"b":0,"opacity":1},"__id":${b.__id}}`, "after registering class");

    });
});


QUnit.module("data/Serialization: loading/deserializing", function () {
    QUnit.test("load primitives", function (assert) {
        let a = new JSONSerializer();

        let s = a.save();
        let n = a.load(s);
        assert.equal(n, undefined);

        s = a.save("")
        n = a.load(s);
        assert.equal(n, "");

        s = a.save(undefined)
        n = a.load(s);
        assert.equal(n, undefined);

        s = a.save(null)
        n = a.load(s);
        assert.equal(n, null);

        s = a.save(25)
        n = a.load(s);
        assert.equal(n, 25);

        s = a.save("cat");
        n = a.load(s);
        assert.equal(n, "cat");

        s = a.save(BigInt(30));
        n = a.load(s);
        assert.equal(n, 30n);

        s = a.save(Symbol("hey"));
        n = a.load(s);
        assert.equal(n, Symbol.for("hey"));

        s = a.save(true);
        n = a.load(s);
        assert.equal(n, true);
        s = a.save(false);
        n = a.load(s);
        assert.equal(n, false);

        s = a.save(NaN);
        n = a.load(s);
        assert.ok(isNaN(n));
        s = a.save(Infinity);
        n = a.load(s);
        assert.equal(n, Infinity);
        s = a.save(-Infinity);
        n = a.load(s);
        assert.equal(n, -Infinity);
    });


    QUnit.test("deserialize built-in objects", function (assert) {
        let a = new JSONSerializer();

        let s = a.save(new Date(0))
        let n = a.load(s);
        assert.equal(n.valueOf(), new Date(0).valueOf());

        s = a.save(new Array())
        n = a.load(s);
        assert.deepEqual(n, [], "empty array");

        s = a.save([1, 2, 3, 4, 5, 6, 7])
        n = a.load(s);
        assert.deepEqual(n, [1, 2, 3, 4, 5, 6, 7], "number array");

        s = a.save([new Date(0), new Date(1), new Date(2), new Date(3), new Date(4), new Date(5), new Date(6)])
        n = a.load(s);
        assert.deepEqual(n, [new Date(0), new Date(1), new Date(2), new Date(3), new Date(4), new Date(5), new Date(6)], "array of dates");

        s = a.save([true, null, undefined, "cat", [], {}, new Date(0)]);
        n = a.load(s);
        assert.deepEqual(n, [true, null, undefined, "cat", [], {}, new Date(0)], "varied array");

        s = a.save(new Error("oh noes!"))
        n = a.load(s);
        assert.deepEqual(n, new Error("oh noes!"), "Error");

        s = a.save(new AggregateError([new Error("oh noes!"), new RangeError("not again!")]));
        n = a.load(s);
        assert.deepEqual(n, new AggregateError([new Error("oh noes!"), new RangeError("not again!")]));

        s = a.save(new EvalError("oh noes!"))
        n = a.load(s);
        assert.deepEqual(n, new EvalError("oh noes!"))

        // s = a.save(new InternalError("oh noes!"))
        // n = a.load(s);
        // assert.equal(n, "{\"__type__\":\"InternalError\",\"message\":\"oh noes!\"}", "InternalError");
        s = a.save(new RangeError("oh noes!"));
        n = a.load(s);
        assert.deepEqual(n, new RangeError("oh noes!"));

        s = a.save(new ReferenceError("oh noes!"))
        n = a.load(s);
        assert.deepEqual(n, new ReferenceError("oh noes!"))

        s = a.save(new SyntaxError("oh noes!"))
        n = a.load(s);
        assert.deepEqual(n, new SyntaxError("oh noes!"))

        s = a.save(new TypeError("oh noes!"))
        n = a.load(s);
        assert.deepEqual(n, new TypeError("oh noes!"))

        s = a.save(new URIError("oh noes!"))
        n = a.load(s);
        assert.deepEqual(n, new URIError("oh noes!"))

        s = a.save(new Map([
            ["key1", 1],
            ["key2", 2]
        ]));
        n = a.load(s);
        assert.deepEqual(n, new Map([
            ["key1", 1],
            ["key2", 2]
        ]), "map");

        s = a.save(new Map([
            [12, new Date(0)],
            [Symbol.for("whoa"), BigInt(35)]
        ]));
        n = a.load(s);
        let ne = Array.from(n.entries());
        assert.equal(ne[0][0], 12);
        assert.deepEqual(ne[0][1], new Date(0));
        assert.equal(ne[1][0], Symbol.for("whoa"));
        assert.equal(ne[1][1], BigInt(35));

        s = a.save(new Set([1, 2, 3, 4, 5, 6, 7]));
        n = a.load(s);
        assert.deepEqual(n, new Set([1, 2, 3, 4, 5, 6, 7]), "simple set");

        s = a.save(new Set([
            12, new Date(0),
            Symbol.for("what???"), BigInt(35)
        ]));
        n = a.load(s);
        assert.deepEqual(n, new Set([
            12, new Date(0),
            Symbol.for("what???"), BigInt(35)
        ]), "complicated set");

        s = a.save(Int8Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.load(s);
        assert.deepEqual(n, Int8Array.from([1, 2, 3, 4, 5, 6, 7]))
        s = a.save(Uint8Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.load(s);
        assert.deepEqual(n, Uint8Array.from([1, 2, 3, 4, 5, 6, 7]))
        s = a.save(Uint8ClampedArray.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.load(s);
        assert.deepEqual(n, Uint8ClampedArray.from([1, 2, 3, 4, 5, 6, 7]))

        s = a.save(Int16Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.load(s);
        assert.deepEqual(n, Int16Array.from([1, 2, 3, 4, 5, 6, 7]))
        s = a.save(Uint16Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.load(s);
        assert.deepEqual(n, Uint16Array.from([1, 2, 3, 4, 5, 6, 7]))

        s = a.save(Int32Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.load(s);
        assert.deepEqual(n, Int32Array.from([1, 2, 3, 4, 5, 6, 7]))
        s = a.save(Uint32Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.load(s);
        assert.deepEqual(n, Uint32Array.from([1, 2, 3, 4, 5, 6, 7]))

        s = a.save(Float32Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.load(s);
        assert.deepEqual(n, Float32Array.from([1, 2, 3, 4, 5, 6, 7]), "Float 32 array");

        s = a.save(Float64Array.from([1, 2, 3, 4, 5, 6, 7]))
        n = a.load(s);
        assert.deepEqual(n, Float64Array.from([1, 2, 3, 4, 5, 6, 7]), "Float 64 array");

        s = a.save(BigInt64Array.from([1n, 2n, 3n, 4n, 5n, 6n, 7n]))
        n = a.load(s);
        assert.deepEqual(n, BigInt64Array.from([1n, 2n, 3n, 4n, 5n, 6n, 7n]), "BigInt 64 array");

        s = a.save(BigUint64Array.from([1n, 2n, 3n, 4n, 5n, 6n, 7n]))
        n = a.load(s);
        assert.deepEqual(n, BigUint64Array.from([1n, 2n, 3n, 4n, 5n, 6n, 7n]), "BigUInt 64 array");


        s = a.save(new RegExp("[^abc]*", "gimsuy"))
        n = a.load(s);
        assert.deepEqual(n, new RegExp("[^abc]*", "gimsuy"), "RegExp");


    });
    QUnit.test("Object", function (assert) {
        let a = new JSONSerializer();
        let s = a.save({
            "a": "b",
            "c": 2
        })
        let n = a.load(s);
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

        s = a.save(obj);
        n = a.load(s);
        assert.deepEqual(n, obj, "complicated object");
    });

    QUnit.test("Classes", function (assert) {
        let pos = new Coordinate(20, 30);
        let depth = 4;
        let b = new BloodNode(pos, depth);
        b.graphic = 1;
        b.color = new Color(255, 0, 0);

        let a = new JSONSerializer();
        assert.equal(a.isRegistered(BloodNode), false);
        let s = a.save(b);
        let n = a.load(s);
        assert.deepEqual(n, {
            "__id": b.__id,
            "color": {
                "__id": b.color.__id,
                "_storage": {
                    "b": 0,
                    "g": 0,
                    "opacity": 1,
                    "r": 255
                },
                "data": undefined
            },
            "data": undefined,
            "depth": 4,
            "graphic": 1,
            "pos": [
                20,
                30
            ]
        }, "before registering class");

        a.register_type(BloodNode);
        s = a.save(b);
        n = a.load(s);
        let p = new Coordinate(20, 30);
        let d = 4;
        let comparison = new BloodNode(p, d);
        comparison.graphic = 1;
        comparison.color = b.color;
        comparison.__id = b.__id;


        assert.equal(n.__id, comparison.__id, "after registering class");
        assert.equal(n.Depth(), comparison.Depth());
        assert.equal(n.graphic, comparison.graphic);
        assert.equal(n.pos.X(), comparison.pos.X());
        assert.equal(n.pos.Y(), comparison.pos.Y());
        assert.equal(n.color.r, comparison.color.r);
        assert.equal(n.color.g, comparison.color.g);
        assert.equal(n.color.b, comparison.color.b);
        assert.equal(n.color.opacity, comparison.color.opacity);
        assert.ok(n.equals(comparison));

    });
});