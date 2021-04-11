import { Enum } from "../other/Enums.js";
/**
 * @const Path
 * @see Paths.Get
 */
export class Path extends Enum {
    /**
     * @var Path.Executable
     * @see Globals.exec
     */
    static Executable;

    /**
        @var Path.GlobalData
        @see Globals.dataDir
        */
    static GlobalData;

    /**
     * @var Path.Personal
     * @see Globals.personalDir
     */
    static Personal;

    /**
     * @var Path.Mods
     * @see Globals.modsDir
     */
    static Mods;

    /**
     * @var Path.Saves
     * @see Globals.savesDir
     */
    static Saves;

    /**
     * @var Path.Screenshots
     * @see Globals.screensDir
     */
    static Screenshots;

    /**
     * @var Path.Font
     * @see Globals.font
     */
    static Font;

    /**
     * @var Path.Config
     * @see Globals.config
     */
    static Config;

    /**
     * @var Path.ExecutableDir
     * @see Globals.execDir
     */
    static ExecutableDir;

    /**
     * @var Path.CoreTilesets
     * @see Globals.coreTilesetsDir
     */
    static CoreTilesets;

    /**
     * @var Path.Tilesets
     * @see Globals.tilesetsDir
     */
    static Tilesets;
}
Path.enumify();