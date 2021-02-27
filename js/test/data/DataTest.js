import {
    Save
} from '../../data/Data.js';

QUnit.module("data/Save tests", function () {
    QUnit.test("Save constructor", function (assert) {
        let f = "filename",
            s = 10000,
            t = new Date(0);
        let save = new Save(f, s, t);

        assert.equal(save.filename, f);
        assert.equal(save.timestamp.valueOf(), t.valueOf());
        assert.equal(save.size, "10 KB");
        assert.equal(save.date, "1970-01-01T00:00:00.000Z");
    });
});
QUnit.module("data/Data tests", function () {
    QUnit.test.todo("GetSavedGames", function (assert) {});
    QUnit.test.todo("CountSavedGames", function (assert) {});
    QUnit.test.todo("LoadGame", function (assert) {});
    QUnit.test.todo("SaveGame", function (assert) {});
    QUnit.test.todo("LoadConfig", function (assert) {});
    QUnit.test.todo("LoadFont", function (assert) {});
    QUnit.test.todo("SaveScreenshot", function (assert) {});
});