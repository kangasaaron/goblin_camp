/* Copyright 2010-2011 Ilkka Halila
This file is part of Goblin Camp.

Goblin Camp is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Goblin Camp is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License 
along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/

import { Paths } from "../data/Paths.js";
import { Path } from "../data/Path.js";


function LogBootstrapException() {
    let excType, excValue, excTB;
    Script.ExtractException(excType, excValue, excTB);
    let error_already_set;
    try {
        let strExcType = String(excType);
        let strExcValue = String(excValue);

        error_already_set = "Python bootstrap error: [" + strExcType + "] " + strExcValue;
    } catch (e) {
        LOG_FUNC("< INTERNAL ERROR >", error_already_set, "LogBootstrapException");
        PyErr_Print();
    }
}

export class Engine {
    // Only mods with apiVersion property that equals to this will have their scripts loaded.
    version = 0;
    static instance;
    static Reset() {
        this.instance = null;
        this.instance = new Engine();
        return this.instance;
    }
    constructor() {
        if (Engine.instance) return Engine.instance;

        this.Paths = new Paths();

        return this;
    }
    // Initialises the engine.
    Init(args) {
        console.log("Initialising the engine.");

        // Py_NoSiteFlag = 1;
        // Py_InitializeEx(0);
        // Py_SetProgramName(args[0].c_str());

        // init_weakref();
        // inittime();
        // init_functools();
        // initcStringIO();
        // initzlib();

        // console.log("Python ", Py_GetVersion());

        // Don't use default search path. FIXME: don't use bundled stdlib.zip!
        // {
        let pathsep;
        // if (Globals.WINDOWS) {
        // pathsep = ";";
        // } /*#else */
        // else {
        pathsep = ":";
        // } /*#endif*/
        let libDir = this.Paths.GetName(Path.GlobalData) + "/" + "lib";

        let path = libDir.toString();
        path += pathsep;
        //path += (libDir / "stdlib.zip").string();

        // FIXME?
        // let defaultpath = Py_GetPath();
        // path += defaultpath;

        // PySys_SetPath(path.c_str());
        // }
        let error_already_set = "";
        try {
            // This cannot possibly fail. Unless the universe has blown up.
            let res = py.eval(
                "repr(__import__('sys').path)",
                py.import("__builtin__").attr("__dict__")
            );
            console.log("sys.path = ", res);

            // Get utility functions.
            console.log("Importing utils.");
            let modImp = py.import("imp");
            let modTB = py.import("traceback");

            Globals.printExcFunc = modTB.attr("print_exception");
            Globals.loadPackageFunc = modImp.attr("load_package");

            console.log("Exposing the API.");
            ExposeAPI();

            console.log("Creating internal namespaces.");
            PyImport_AddModule("__gcmods__");
            PyImport_AddModule("__gcuserconfig__");
            PyImport_AddModule("__gcautoexec__");
            PyImport_AddModule("__gcdevthe_console__");

            console.log("Setting up the_console namespace.");
            modImp.attr("load_source")(
                "__gcdevthe_console__",
                (
                    this.Paths.Get(Path.GlobalData) /
                    "lib" /
                    "__gcdevthe_console__.py"
                ).string()
            );

            py.exec(
                "log.info('Console ready.')",
                py.import("__gcdevthe_console__").attr("__dict__")
            );
        } catch (e) {
            LogBootstrapException(e, error_already_set);

            LOG("Bootstrap has failed, exiting.");
            exit(20);
        }
    }

    // Shuts down the engine.
    Shutdown() {
        console.log("Shutting down engine.");

        ReleaseListeners();
        Py_Finalize();
    }

    // Loads mod's __init__.py.
    LoadScript(mod, directory) {
        console.log(((("Loading '" + directory) + "' into '__gcmods__.") + mod) + "'.");

        try {
            Globals.loadPackageFunc("__gcmods__." + mod, directory);
        } catch (e) {
            LogException();
        }
    }

    // Logs active exception (noop if no exception is active).
    ExtractException(excType, excValue, excTB) {
        let rawExcType, rawExcValue, rawExcTB;
        PyErr_Fetch(rawExcType, rawExcValue, rawExcTB);

        excType = py.object(rawExcType);

        // "The value and traceback object may be null even when the type object is not."
        // http://docs.python.org/c-api/exceptions.html#PyErr_Fetch

        // So, set them to None initially.
        excValue = py.object();
        excTB = py.object();

        // And convert to py.objects when they're not null.
        if (rawExcValue) {
            excValue = py.object(rawExcValue);
        }

        if (rawExcTB) {
            excTB = py.object(rawExcTB);
        }
    }

    // Extracts exception information into separate objects.
    LogException(clear) {
        if (PyErr_Occurred() == null) return;

        let none, excType, excVal, excTB;
        ExtractException(excType, excVal, excTB);
        PyErr_Clear();

        Logger.log << "**** Python exception occurred ****\n";
        try {
            Globals.printExcFunc(
                excType,
                excVal,
                excTB,
                none,
                boost.ref(Globals.stream)
            );
        } catch (e) {
            Logger.log << " < INTERNAL ERROR > \n";
            PyErr_Print();
        }
        Logger.log << Logger.Suffix();

        if (!clear) {
            PyErr_Restore(excType.ptr(), excVal.ptr(), excTB.ptr());
        }
    }
}
