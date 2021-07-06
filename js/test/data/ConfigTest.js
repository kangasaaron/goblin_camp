import {
    Config
} from "../../data/Config.js";
import "../sinon-9.2.4.js";

QUnit.module("data/Config", function () {
    QUnit.test("statics", function (assert) {
        assert.ok(Config !== null);
        assert.ok(Globals !== null);
        assert.ok(Config.constructor.name === "Configuration");

        assert.ok(Config.cvars.has("resolutionX"));
        assert.ok(Config.cvars.has("resolutionY"));
        assert.ok(Config.cvars.has("fullscreen"));
        assert.ok(Config.cvars.has("renderer"));
        assert.ok(Config.cvars.has("useTileset"));
        assert.ok(Config.cvars.has("tileset"));
        assert.ok(Config.cvars.has("tutorial"));
        assert.ok(Config.cvars.has("riverWidth"));
        assert.ok(Config.cvars.has("riverDepth"));
        assert.ok(Config.cvars.has("halfRendering"));
        assert.ok(Config.cvars.has("compressSaves"));
        assert.ok(Config.cvars.has("translucentUI"));
        assert.ok(Config.cvars.has("autosave"));
        assert.ok(Config.cvars.has("pauseOnDanger"));

        assert.equal(Config.cvars.get("resolutionX"), "800");
        assert.equal(Config.cvars.get("resolutionY"), "600");
        assert.equal(Config.cvars.get("fullscreen"), "0");
        assert.equal(Config.cvars.get("renderer"), "0");
        assert.equal(Config.cvars.get("useTileset"), "0");
        assert.equal(Config.cvars.get("tileset"), "");
        assert.equal(Config.cvars.get("tutorial"), "1");
        assert.equal(Config.cvars.get("riverWidth"), "30");
        assert.equal(Config.cvars.get("riverDepth"), "5");
        assert.equal(Config.cvars.get("halfRendering"), "0");
        assert.equal(Config.cvars.get("compressSaves"), "0");
        assert.equal(Config.cvars.get("translucentUI"), "0");
        assert.equal(Config.cvars.get("autosave"), "1");
        assert.equal(Config.cvars.get("pauseOnDanger"), "0");

        assert.ok("keys" in Config);
        assert.ok(Config.keys.has("Exit"));
        assert.ok(Config.keys.has("Basics"));
        assert.ok(Config.keys.has("Workshops"));
        assert.ok(Config.keys.has("Orders"));
        assert.ok(Config.keys.has("Furniture"));
        assert.ok(Config.keys.has("StockManager"));
        assert.ok(Config.keys.has("Squads"));
        assert.ok(Config.keys.has("Announcements"));
        assert.ok(Config.keys.has("Center"));
        assert.ok(Config.keys.has("Help"));
        assert.ok(Config.keys.has("Pause"));
        assert.ok(Config.keys.has("Jobs"));
        assert.ok(Config.keys.has("DevConsole"));
        assert.ok(Config.keys.has("TerrainOverlay"));
        assert.ok(Config.keys.has("Permanent"));

        assert.equal(Config.keys.get("Exit"), 'q');
        assert.equal(Config.keys.get("Basics"), 'b');
        assert.equal(Config.keys.get("Workshops"), 'w');
        assert.equal(Config.keys.get("Orders"), 'o');
        assert.equal(Config.keys.get("Furniture"), 'f');
        assert.equal(Config.keys.get("StockManager"), 's');
        assert.equal(Config.keys.get("Squads"), 'm');
        assert.equal(Config.keys.get("Announcements"), 'a');
        assert.equal(Config.keys.get("Center"), 'c');
        assert.equal(Config.keys.get("Help"), 'h');
        assert.equal(Config.keys.get("Pause"), ' ');
        assert.equal(Config.keys.get("Jobs"), 'j');
        assert.equal(Config.keys.get("DevConsole"), '`');
        assert.equal(Config.keys.get("TerrainOverlay"), 't');
        assert.equal(Config.keys.get("Permanent"), 'p');


        assert.equal(Config.cvars, Config.GetCVarMap());
        assert.equal(Config.keys, Config.GetKeyMap());

        let a = "a";
        Config.SetKey("some new key", a);
        assert.ok(Config.keys.has("some new key"));
        assert.equal(Config.GetKey("some new key"), a);

        let v = "v";
        Config.SetCVar("some new var", v);
        assert.ok(Config.cvars.has("some new var"));
        assert.equal(Config.GetCVar("some new var"), v);

        const sandbox = sinon.createSandbox();
        sandbox.stub(Date, "now").callsFake(() => "date.now");
        sandbox.stub(localStorage, "setItem").callsFake(() => true);
        Config.Save();
        assert.equal(Date.now.callCount, 1);
        assert.equal(localStorage.setItem.callCount, 1);
        assert.equal(localStorage.setItem.getCall(0).args[0], "personal/config.json");
        assert.equal(localStorage.setItem.getCall(0).args[1], `{"saved on":"date.now","cvars":{"resolutionX":"800","resolutionY":"600","fullscreen":"0","renderer":"0","useTileset":"0","tileset":"","tutorial":"1","riverWidth":"30","riverDepth":"5","halfRendering":"0","compressSaves":"0","translucentUI":"0","autosave":"1","pauseOnDanger":"0","some new var":"v"},"keys":{"Exit":"q","Basics":"b","Workshops":"w","Orders":"o","Furniture":"f","StockManager":"s","Squads":"m","Announcements":"a","Center":"c","Help":"h","Pause":" ","Jobs":"j","DevConsole":"\`","TerrainOverlay":"t","Permanent":"p","some new key":"a"}}`);
        sandbox.restore();
    });

});