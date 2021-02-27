import "../sinon-9.2.4.js";
import {
    Paths,
    Path
} from '../../data/Paths.js';
import {
    Tilesets
} from '../../data/Tilesets.js';
import {
    fs
} from '../../other/fakefs.js';

QUnit.module("data/TileSets tests", function () {
    QUnit.test("LoadTilesetMetadata", function (assert) {
        const sandbox = sinon.createSandbox();
        sandbox.stub(Tilesets, "loadCoreTilesets").callsFake(function (arr) {
            arr.push("loadCoreTilesets");
            assert.ok("called loadCoreTilesets");
        });
        sandbox.stub(Tilesets, "loadUserTilesets").callsFake(function (arr) {
            arr.push("loadUserTilesets");
            assert.ok("called loadUserTilesets")
        });

        let result = Tilesets.LoadTilesetMetadata();

        assert.equal(result.length, 2);
        assert.equal(result[0], "loadCoreTilesets");
        assert.equal(result[1], "loadUserTilesets");
        assert.equal(Tilesets.loadCoreTilesets.callCount, 1);
        assert.equal(Tilesets.loadUserTilesets.callCount, 1);
        sandbox.restore();
    });

    QUnit.test("loadCoreTilesets", function (assert) {
        const sandbox = sinon.createSandbox();

        sandbox.stub(Paths, "Get").callsFake(() => "fake result");
        sandbox.stub(Tilesets, "loadDirectoryTilesets").callsFake(function (directory, arr) {
            arr.push("loadDirectoryTilesets");
            assert.ok("called loadDirectoryTilesets");
        });

        let arr = [];
        Tilesets.loadCoreTilesets(arr);

        assert.equal(Paths.Get.callCount, 1);
        assert.equal(Paths.Get.getCall(0).args[0], Path.CoreTilesets);
        assert.equal(Tilesets.loadDirectoryTilesets.callCount, 1);
        assert.equal(Tilesets.loadDirectoryTilesets.getCall(0).args[0], "fake result");
        assert.equal(arr.length, 1);
        assert.equal(arr[0], "loadDirectoryTilesets");

        sandbox.restore();
    });

    QUnit.test("loadUserTilesets", function (assert) {
        const sandbox = sinon.createSandbox();

        sandbox.stub(Paths, "Get").callsFake(() => "fake result");
        sandbox.stub(Tilesets, "loadDirectoryTilesets").callsFake(function (directory, arr) {
            arr.push("loadDirectoryTilesets");
            assert.ok("called loadDirectoryTilesets");
        });

        let arr = [];
        Tilesets.loadUserTilesets(arr);

        assert.equal(Paths.Get.callCount, 1);
        assert.equal(Paths.Get.getCall(0).args[0], Path.Tilesets);
        assert.equal(Tilesets.loadDirectoryTilesets.callCount, 1);
        assert.equal(Tilesets.loadDirectoryTilesets.getCall(0).args[0], "fake result");
        assert.equal(arr.length, 1);
        assert.equal(arr[0], "loadDirectoryTilesets");

        sandbox.restore();
    });

    QUnit.test("loadDirectoryTilesets", function (assert) {
        const sandbox = sinon.createSandbox();

        sandbox.stub(fs, "readDirectory").callsFake(() => ["a", "b", "c"]);
        sandbox.stub(fs, "isDirectory").callsFake(function (path) {
            return path !== "b";
        });
        sandbox.stub(Tilesets, "LoadMetadata").callsFake(() => false);

        let arr = [];
        Tilesets.loadDirectoryTilesets("file", arr);

        assert.equal(fs.readDirectory.callCount, 1);
        assert.equal(fs.readDirectory.getCall(0).args[0], "file");
        assert.equal(fs.isDirectory.callCount, 3);
        assert.equal(Tilesets.LoadMetadata.callCount, 2);

        sandbox.restore();
    });

    QUnit.test.todo("loadMetadata", function (assert) {
        // TODO Waiting on TileSetLoader
    });

});