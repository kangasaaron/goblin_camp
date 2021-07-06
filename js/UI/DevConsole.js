/* Copyright 2010-2011 Ilkka Halila
 This file is part of Goblin Camp.
 
 Goblin Camp is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 Goblin Camp is distributed in the hope that it will be useful,
 but without any warranty; without even the implied warranty of
 merchantability or fitness for a particular purpose. See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License 
 along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/


// +-------[ DEV CONSOLE ]--------------------------+
// | output                                       ^ |
// | output                                         |
// | ...                                          v |
// +------------------------------------------------+
// | >>> input                                      |
// +------------------------------------------------+
  
import {TCODColor, TCOD_alignment_t, TCOD_bkgnd_flag_t, TCOD_key_t} from "../../fakeTCOD/libtcod.js";
import {Game} from "../Game.js";
import {Script} from "../scripting/Script.js";


export class DevConsole {

    constructor(width) {
        /** @type {unsigned} */
        this.inputID = 0;
        /** @type {std.string} */
        this.input = "";
        /** @type {std.string} */
        this.output = "";
        /** @type {TCODConsole} */
        this.canvas = null;
        /** @type {PyCompilerFlags} */
        this.cf;
        /** @type {PyObject *} */
        this.newStdOut;
        /** @type {PyObject *} */
        this.ewStdIn;
        /** @type {PyObject *} */
        this.oldStdOut;
        /** @type {PyObject *} */
        this.oldStdErr;
        /** @type {PyObject *} */
        this.oldStdIn;
        this.canvas = new TCODConsole(width - 2, 256);
        this.output.reserve(2048);
        this.input.reserve(256);
        this.canvas.clear();

        this.cf.cf_flags = (CO_FUTURE_DIVISION | CO_FUTURE_ABSOLUTE_IMPORT | CO_FUTURE_PRINT_FUNCTION);

        PycString_IMPORT;
        this.newStdIn = PycStringIO.NewInput(PyString_FromString(""));

        /* const_cast are workarounds against the fact that PySys_{Get,Set}Object expects
           a char * instead of const char *
           see: http://mail.python.org/pipermail/python-dev/2011-February/108140.html
        */
        this.oldStdOut = PySys_GetObject(("stdout"));
        this.oldStdErr = PySys_GetObject(("stderr"));
        this.oldStdIn = PySys_GetObject(("stdin"));
    }

    GetStreamValue() {
        /** @type {PyObject *} */
        let str = PycStringIO.cgetvalue(this.newStdOut);
        return String(str);
    }

    RedirectStreams() {
        this.newStdOut = PycStringIO.NewOutput(2048);

        PySys_SetObject(("stdout"), this.newStdOut);
        PySys_SetObject(("stderr"), this.newStdOut);
        PySys_SetObject(("stdin"), this.newStdIn);
    }

    RestoreStreams() {
        PySys_SetObject(("stdout"), this.oldStdOut);
        PySys_SetObject(("stderr"), this.oldStdErr);
        PySys_SetObject(("stdin"), this.oldStdIn);

        Py_DECREF(this.newStdOut);
    }

    Render(error) {


        let sep = ("\n");
        let inTok = new tokenizer(this.input, sep);
        let outTok = new tokenizer(this.output, sep);

        this.canvas.clear();
        this.canvas.setAlignment(TCOD_alignment_t.TCOD_LEFT);
        this.canvas.setDefaultBackground(Color.black);
        this.canvas.setDefaultForeground(Color.white);

        this.canvas.print(0, 0, "[In  %d]", this.inputID);
        this.canvas.setDefaultForeground(Color.sky);

        let y = 1;
        inTok.forEach(function(token) {
            this.canvas.print(0, y, "%s", token.c_str());
            ++y;
        });

        ++y;

        this.canvas.setDefaultForeground(Color.white);
        this.canvas.print(0, y, "[Out %d]", this.inputID);
        this.canvas.setDefaultForeground(error ? Color.amber : Color.chartreuse);

        ++y;
        outTok.forEach(function(token) {
            this.canvas.print(0, y, "%s", token.c_str());
            ++y;
        });

        ++this.inputID;
        this.input.clear();
        return y;
    }

    Eval() {
        this.error = false;
        this.RedirectStreams();
        this.output.clear();

        try {
            /** @type {PyCodeObject *} */
            let co = Py_CompileStringFlags(
                this.input.c_str(), "<the_console>", Py_single_input, this.cf
            );

            if (co === null) {
                py.throw_error_already_set();
            }

            /** @type {py.object} */
            let ns = py.import("__gcdevthe_console__").attr("__dict__");
            /** @type {PyObject *} */
            let ret = PyEval_EvalCode(co, ns.ptr(), ns.ptr());

            if (ret === null) {
                Py_DECREF(co);
                py.throw_error_already_set();
            }

            Py_DECREF(ret);
            Py_DECREF(co);
            //py.handle<> retH(ret);
            //py.object repr = py.object(py.handle<>(PyObject_Repr(ret)));

            this.output = GetStreamValue(); // + "\n" + std.string(py.extract<char*>(repr));
        } catch (e) {
            let excType, excVal, excTB;
            Script.i.ExtractException(excType, excVal, excTB);
            Script.i.LogException();

            error = true;
            if (!excType.is_none()) {
                output = (py.str(excType));
                if (!excVal.is_none()) {
                    output += std.string(": ") + std.string((py.str(excVal)));
                }
            } else {
                output = "Internal error: exception with None type.";
            }
        }

        this.RestoreStreams();
        return this.Render(error);
    }


    // void ShowDevConsole() {
    static Show() {
        let w = Game.i.ScreenWidth() - 4;
        let h = 25;
        let x = 2;
        let y = Game.i.ScreenHeight() - h - 2;

        /** @type {TCOD_key_t} */
        let key = new TCOD_key_t();
        /** @type {TCOD_mouse_t} */
        let mouse = new TCOD_mouse_t();
        /** @type {TCOD_event_t} */
        let event = new TCOD_event_t();

        /** @type {TCODConsole * } */
        let c = TCODConsole.root;

        let clicked = false;
        let scroll = 0;
        let maxScroll = 0;

        let the_console = new DevConsole(w - 2);

        // I tried to use the UI code. Really. I can't wrap my head around it.
        // FIXME: That's OK. :)
        while (true) {
            c.setDefaultForeground(Color.white);
            c.setDefaultBackground(Color.black);
            c.printFrame(x, y, w, h, true, TCOD_bkgnd_flag_t.TCOD_BKGND_SET, "Developer the_console");
            c.setAlignment((TCOD_alignment_t.TCOD_LEFT));

            TCODConsole.blit(the_console.canvas, 0, scroll, w - 2, h - 5, c, x + 1, y + 1);

            c.putChar(x + w - 2, y + 1, TCOD_CHAR_ARROW_N, TCOD_bkgnd_flag_t.TCOD_BKGND_SET);
            c.putChar(x + w - 2, y + h - 4, TCOD_CHAR_ARROW_S, TCOD_bkgnd_flag_t.TCOD_BKGND_SET);

            for (let i = 1; i < w - 1; ++i) {
                c.putChar(x + i, y + h - 3, TCOD_CHAR_HLINE, TCOD_bkgnd_flag_t.TCOD_BKGND_SET);
            }

            c.putChar(x, y + h - 3, TCOD_CHAR_TEEE, TCOD_bkgnd_flag_t.TCOD_BKGND_SET);
            c.putChar(x + w - 1, y + h - 3, TCOD_CHAR_TEEW, TCOD_bkgnd_flag_t.TCOD_BKGND_SET);

            c.print(x + 1, y + h - 2, "[In %d]: %s", the_console.inputID, the_console.input.c_str());

            c.flush();

            event = TCODSystem.checkForEvent(TCOD_EVENT_ANY, key, mouse);

            if (event & TCOD_EVENT_KEY_PRESS) {
                if (key.vk === TCODK_ESCAPE) {
                    return;
                } else if (key.vk === TCODK_ENTER || key.vk === TCODK_KPENTER) {
                    maxScroll = the_console.Eval();
                } else if (key.vk === TCODK_BACKSPACE && the_console.input.size() > 0) {
                    the_console.input.erase(the_console.input.end() - 1);
                } else if (key.c >= ' ' && key.c <= '~') {
                    the_console.input.push(key.c);
                }
            }

            // if (event & TCOD_EVENT_MOUSE) {
            //     mouse = TCODMouse.getStatus();
            // }

            // if (mouse.lbutton) {
            // 	clicked = true;
            // }

            // if (clicked && !mouse.lbutton) {
            if (event & TCOD_EVENT_MOUSE_PRESS) {
                if (mouse.lbutton) {
                    if (mouse.cx === x + w - 2) {
                        if (mouse.cy === y + 1) {
                            scroll = Math.max(0, scroll - 1);
                        } else if (mouse.cy === y + h - 4) {
                            scroll = Math.min(maxScroll - h + 3, scroll + 1);
                        }
                    }
                    clicked = false;
                }
            }
        }
    }
}