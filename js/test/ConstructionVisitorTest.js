import { ConstructionVisitor } from "../ConstructionVisitor.js";

QUnit.module("Construction Visitor test", function() {
    QUnit.test("abstract functions", function(assert) {
        assert.ok(ConstructionVisitor.prototype.Visit !== undefined);
        assert.equal(typeof ConstructionVisitor.prototype.Visit, "function");
    });
});