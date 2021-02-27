import {
    Scrollable
} from '../../UI/Scrollable.js';
import {
    MenuResult
} from '../../UI/MenuResult.js';

QUnit.module("UI/Scrollable tests", function () {
    QUnit.test("Update", function (assert) {
        let d = new Scrollable();
        let result = d.Update();
        assert.equal(result, MenuResult.NOMENUHIT);
    });
});