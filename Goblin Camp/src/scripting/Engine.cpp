/* Copyright 2010 Ilkka Halila
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
#include "stdafx.hpp"

#include "scripting/_python.hpp"

#include <cassert>
#include <vector>
#include <string>
#include <list>
#include <cstdlib>
#include <ostream> // std::flush

#define BOOST_FILESYSTEM_VERSION 3
#include <boost/foreach.hpp>
#include <boost/filesystem.hpp>

namespace fs = boost::filesystem;
namespace py = boost::python;

#include "Data.hpp"
#include "scripting/Engine.hpp"
#include "scripting/API.hpp"
#include "Logger.hpp"

namespace {
	namespace globals {
		py::object logger, loadPackageFunc, printExcFunc;
	}
}

namespace Script {
	const short version = 0;
	
	void Init(std::vector<std::string>& args) {
		LOG("Initialising engine.");
		
		Py_NoSiteFlag = 1;
		Py_InitializeEx(0);
		Py_SetProgramName(const_cast<char*>(args[0].c_str()));
		
		LOG("Python " << Py_GetVersion());
		
		// Don't use default search path.
		{
		#ifdef WINDOWS
			char pathsep = ';';
		#else
			char pathsep = ':';
		#endif
			std::string path = (Data::GetPath(Data::Path::GlobalData) / "lib").string();
			path += pathsep;
			path += (Data::GetPath(Data::Path::GlobalData) / "lib" / "stdlib.zip").string();
			
			PySys_SetPath(const_cast<char*>(path.c_str()));
		}
		
		try {
			// This cannot possibly fail. Unless the universe has blown up.
			py::object res = py::eval(
				"repr(__import__('sys').path)",
				py::import("__builtin__").attr("__dict__")
			);
			LOG("sys.path = " << py::extract<char*>(res));
		} catch (const py::error_already_set&) {
			LOG("Bootstrap failed.");
			LogException();
			exit(20);
		}
		
		// Get utility functions.
		LOG("Importing utils.");
		py::object modImp = py::import("imp");
		py::object modTB  = py::import("traceback");
		
		globals::printExcFunc    = modTB.attr("print_exception");
		globals::loadPackageFunc = modImp.attr("load_package");
		
		ExposeAPI();
		PyImport_AddModule("gcmods");
		
		globals::logger = API::pyLoggerStream();
	}
	
	void Shutdown() {
		LOG("Shutting down engine.");
		
		ReleaseListeners();
		Py_Finalize();
	}
	
	void LoadScript(const std::string& mod, const std::string& directory) {
		LOG("Loading '" << directory << "' into 'gcmods." << mod << "'.");
		
		try {
			globals::loadPackageFunc("gcmods." + mod, directory);
		} catch (const py::error_already_set&) {
			LogException();
		}
	}
	
	void LogException(bool clear) {
		if (PyErr_Occurred() == NULL) return;
		
		PyObject *excType, *excVal, *excTB;
		PyErr_Fetch(&excType, &excVal, &excTB);
		PyErr_Clear();
		
		py::handle<> hExcType(excType);
		py::handle<> hExcVal(excVal);
		py::handle<> hExcTB(excTB);
		py::handle<> none(py::borrowed(Py_None));
		
		Logger::log << "**** Python exception occurred ****\n";
		try {
			globals::printExcFunc(hExcType, hExcVal, hExcTB, none, globals::logger);
		} catch (const py::error_already_set&) {
			Logger::log << " < INTERNAL ERROR > \n";
			PyErr_Print();
		}
		Logger::log << "***********************************\n";
		
		if (!clear) {
			PyErr_Restore(excType, excVal, excTB);
		}
	}
}
