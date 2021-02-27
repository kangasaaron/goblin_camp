import {
    MenuResult
} from '../../UI/MenuResult.js';

QUnit.module("UI/MenuResult tests", function () {
    QUnit.test("enum", function (assert) {
        assert.ok(MenuResult);
        assert.equal(MenuResult.MENUHIT, 1);
        assert.equal(MenuResult.NOMENUHIT, 2);
        assert.equal(MenuResult.KEYRESPOND, 4);
        assert.equal(MenuResult.DISMISS, 8);
    });
});