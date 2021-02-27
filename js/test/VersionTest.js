
import {addVersionTo} from "../Version.js";

QUnit.module("Version test",function(){
	QUnit.test("only one", function(assert){
		let a = {};
		addVersionTo(a);
		assert.ok(a.gameVersion !== null);
		assert.equal(a.gameVersion, "Goblin Camp 0.22");
		let pd = Object.getOwnPropertyDescriptor(a,"gameVersion");
		assert.equal(pd.writable,false);
		assert.equal(pd.configurable,false);
	});
});