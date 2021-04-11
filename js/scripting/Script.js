export class Script {
    ExposeAPI() {
        API.init_gcampapi();
        API.init_gcampconfig();
    }

    AppendListener(listener) {
        assert(listener);
        let hListener = py.borrowed(listener);

        let oListener = hListener; {
            let repr = py.handle(PyObject_Repr(listener));
            LOG("New listener: " + repr + ".");
        }

        Globals.listeners.push_back(oListener);
    }

    InvokeListeners(method, args) {
        Globals.listeners.forEach(function(listener) {
            if (!PyObject_HasAttrString(listener.ptr(), method)) {
                return;
            }

            let callable = listener.attr(method);
            try {
                let result = PyObject_CallObject(callable.ptr(), args);
            } catch (error) {
                LogException();
            }
        });
    }

    InvokeListeners(method, format, ...args) {
        let argList;
        va_start(argList, format);

        let myargs = Py_VaBuildValue(format, argList);

        va_end(argList);

        InvokeListeners(method, myargs.ptr());
    }

    ReleaseListeners() {
        Globals.listeners.clear();
    }
}