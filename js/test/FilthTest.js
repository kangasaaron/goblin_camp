import {FilthNode} from "../Filth.js"
import {zero} from "../Coordinate.js"

QUnit.module("Filth test",function(){
	QUnit.test("statics",function(assert){
		assert.equal(FilthNode.CLASS_VERSION,0);
	});

	QUnit.test("constructor",function(assert){
		let b = new FilthNode();
		assert.ok(b !== undefined);
		assert.ok(b.pos === zero);
		assert.ok(b.depth === 0);
		assert.ok(b.graphic === null);
		assert.ok(b.color === null);

		assert.ok(b.Position() === zero);
		assert.ok(b.Depth() === 0);
		assert.ok(b.GetColor() === null);

		b.Depth(7);
		assert.ok(b.Depth() === 7);
	});
	
	QUnit.test.todo("save/load",function(assert){
		assert.ok(false);
	});
});