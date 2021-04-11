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



import "./data/Config.js"
import "./scripting/API.js"
import "./scripting/Engine.js"
import "./scripting/_gcampapi/Functions.js"
import "./scripting/_gcampapi/PyItem.js"
import "./scripting/_gcampapi/PyConstruction.js"


let listeners = [];


class API {
    BOOST_PYTHON_MODULE(_gcampapi) {
        let expose = [
            ExposeLoggerStream, ExposeFunctions, PyItem.Expose, PyConstruction.Expose
        ];

        for (let idx = 0; idx < sizeof(expose) / sizeof(expose[0]); ++idx) {
            expose[idx]();
        }
    }

    BOOST_PYTHON_MODULE(_gcampconfig) {
        py.def("setCVar", Config.SetStringCVar);
        py.def("getCVar", Config.GetStringCVar);
        py.def("bindKey", Config.SetKey);
        py.def("getKey", Config.GetKey);
    }
}