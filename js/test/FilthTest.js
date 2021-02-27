import {
	FilthNode
} from "../Filth.js"
import {
	Coordinate
} from "../Coordinate.js"

QUnit.module("Filth test", function () {
	QUnit.test("statics", function (assert) {
		assert.equal(FilthNode.CLASS_VERSION, 0);
	});

	QUnit.test("constructor", function (assert) {
		let b = new FilthNode();
		assert.ok(b !== undefined);
		assert.equal(b.pos, Coordinate.zero);
		assert.equal(b.depth, 0);
		assert.equal(b.graphic, null);
		assert.ok(Array.isArray(b.color));
		assert.equal(b.color.length, 3);
		assert.equal(b.color[0], undefined);
		assert.equal(b.color[1], undefined);
		assert.equal(b.color[2], 0);

		assert.equal(b.Position(), zero);
		assert.equal(b.Depth(), 0);
		assert.ok(Array.isArray(b.GetColor()));
		assert.equal(b.GetColor().length, 3);
		assert.equal(b.GetColor()[0], undefined);
		assert.equal(b.GetColor()[1], undefined);
		assert.equal(b.GetColor()[2], 0);

		// TODO waiting on Map 
		// b.Depth(7);
		// assert.equal(b.Depth(), 7);
	});

	QUnit.test.todo("save/load", function (assert) {
		assert.ok(false);
	});
});