import {
    Drawable
} from '../../UI/Drawable.js';
import {
    MenuResult
} from '../../UI/MenuResult.js';

QUnit.module("UI/Drawable tests", function () {
    QUnit.test("constructor", function (assert) {
        let x = 20,
            y = 10,
            width = 300,
            height = 200;

        let d = new Drawable(x, y, width, height);
        assert.equal(d._x, 20);
        assert.equal(d._y, 10);
        assert.equal(d.width, 300);
        assert.equal(d.height, 200);
        assert.equal(d.Height(), 200);
        assert.equal(d.Visible(), 0);
        assert.equal(d.visible, 0);
        assert.equal(d.getTooltip, null);
        assert.equal(d.GetTooltip(), undefined);

        d.SetVisible(1);
        assert.equal(d.Visible(), 1);

        d.SetTooltip((x, y, tooltip) => `${x}, ${y}, ${tooltip}`);

        assert.equal(d.GetTooltip(30, 40, "result"), "30, 40, result");
    });

    QUnit.test("Update", function (assert) {
        let x = 20,
            y = 10,
            width = 300,
            height = 200;

        let d = new Drawable(x, y, width, height);
        let result = d.Update(0, 0);
        assert.equal(result, MenuResult.NOMENUHIT);

        result = d.Update(25, 15);
        assert.equal(result, MenuResult.MENUHIT);
    });


});