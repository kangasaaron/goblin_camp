import {
    Path,
    Paths
} from "../../data/Paths.js"

QUnit.module("data/Paths", function () {
    QUnit.test("statics", function (assert) {

        assert.ok(Paths !== null);
        assert.ok(Path !== null);
    });

    QUnit.test("Path enum", function (assert) {
        assert.ok(Path.Executable instanceof Path);
        assert.ok(Path.Executable instanceof Number);
        assert.equal(Path.Executable, 0);
        assert.ok(Path.GlobalData instanceof Path);
        assert.ok(Path.GlobalData instanceof Number);
        assert.equal(Path.GlobalData, 1);
        assert.ok(Path.Personal instanceof Path);
        assert.ok(Path.Personal instanceof Number);
        assert.equal(Path.Personal, 2);
        assert.ok(Path.Mods instanceof Path);
        assert.ok(Path.Mods instanceof Number);
        assert.equal(Path.Mods, 3);
        assert.ok(Path.Saves instanceof Path);
        assert.ok(Path.Saves instanceof Number);
        assert.equal(Path.Saves, 4);
        assert.ok(Path.Screenshots instanceof Path);
        assert.ok(Path.Screenshots instanceof Number);
        assert.equal(Path.Screenshots, 5);
        assert.ok(Path.Font instanceof Path);
        assert.ok(Path.Font instanceof Number);
        assert.equal(Path.Font, 6);
        assert.ok(Path.Config instanceof Path);
        assert.ok(Path.Config instanceof Number);
        assert.equal(Path.Config, 7);
        assert.ok(Path.ExecutableDir instanceof Path);
        assert.ok(Path.ExecutableDir instanceof Number);
        assert.equal(Path.ExecutableDir, 8);
        assert.ok(Path.CoreTilesets instanceof Path);
        assert.ok(Path.CoreTilesets instanceof Number);
        assert.equal(Path.CoreTilesets, 9);
        assert.ok(Path.Tilesets instanceof Path);
        assert.ok(Path.Tilesets instanceof Number);
        assert.equal(Path.Tilesets, 10);
    });

    QUnit.test("paths", function (assert) {
        assert.equal(Paths.Get(Path.Executable), "");
        assert.equal(Paths.Get(Path.GlobalData), "data/");
        assert.equal(Paths.Get(Path.Personal), "personal/");
        assert.equal(Paths.Get(Path.Mods), "personal/mods/");
        assert.equal(Paths.Get(Path.Saves), "personal/saves/");
        assert.equal(Paths.Get(Path.Screenshots), "personal/screenshots/");
        assert.equal(Paths.Get(Path.Font), "personal/terminal.png");
        assert.equal(Paths.Get(Path.Config), "personal/config.json");
        assert.equal(Paths.Get(Path.ExecutableDir), "exec/");
        assert.equal(Paths.Get(Path.CoreTilesets), "data/lib/tilesets_core/");
        assert.equal(Paths.Get(Path.Tilesets), "personal/tilesets/");
    });
});