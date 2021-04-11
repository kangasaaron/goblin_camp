import {
	FilthNode
} from "../Filth.js"
import {
	Coordinate
} from "../Coordinate.js"
import { Color } from "../color/Color.js";

QUnit.module("Filth test", function () {
	QUnit.test("statics", function (assert) {
		assert.equal(FilthNode.CLASS_VERSION, 0);
	});

	QUnit.test("constructor", function (assert) {
		let b = new FilthNode();
		assert.ok(b !== undefined);
		assert.ok(b.pos.equals(Coordinate.zero));
		assert.equal(b.depth, 0);
		assert.equal(b.graphic, null);
		assert.ok(b.color instanceof Color);
		assert.equal(b.color.r, 0);
		assert.equal(b.color.g, 0);
		assert.equal(b.color.b, 0);

		assert.ok(b.Position().equals(Coordinate.zero));
		assert.equal(b.Depth(), 0);
		assert.ok(b.GetColor() instanceof Color);
		assert.equal(b.GetColor().r, 0);
		assert.equal(b.GetColor().g, 0);
		assert.equal(b.GetColor().b, 0);

		// TODO waiting on Map 
		// b.Depth(7);
		// assert.equal(b.Depth(), 7);
	});

	QUnit.test.todo("save/load", function (assert) {
		assert.ok(false);
	});
});