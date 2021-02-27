import {
	BloodNode
} from "../Blood.js"
import {
	Coordinate
} from "../Coordinate.js"
import {
	JSONSerializer
} from "../Data/Serialization.js"

QUnit.module("Blood test", function () {
	QUnit.test("statics", function (assert) {
		assert.equal(BloodNode.CLASS_VERSION, 0);
	});

	QUnit.test("constructor", function (assert) {
		let b = new BloodNode();
		assert.ok(b !== undefined);
		assert.ok(b.pos === Coordinate.zero);
		assert.ok(b.depth === 0);
		assert.ok(b.graphic === null);
		assert.ok(Array.isArray(b.color));
		assert.equal(b.color.length, 3);

		assert.ok(b.Position() === Coordinate.zero);
		assert.ok(b.Depth() === 0);

		b.Depth(7);
		assert.ok(b.Depth() === 7);
		assert.ok(b.hashCode !== null && b.hashCode !== undefined);
	});

	QUnit.test("save/load", function (assert) {
		let pos = new Coordinate(20, 30);
		let depth = 4;
		let b = new BloodNode(pos, depth);
		b.graphic = 1;
		b.color = [255, 0, 0];

		let a = new JSONSerializer();

		a.register_type(BloodNode);
		let s = a.serialize(b);
		let n = a.deserialize(s);
		let p = new Coordinate(20, 30);
		let d = 4;
		let comparison = new BloodNode(p, d);
		comparison.graphic = 1;
		comparison.color = [255, 0, 0];
		comparison.__id = b.__id;

		assert.deepEqual(n, comparison, "after registering class");
	});
});