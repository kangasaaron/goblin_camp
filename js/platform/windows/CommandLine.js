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
import "stdafx.js"

import "windows.h "
import "shellapi.h"

import "vector"
import "string"
import "cstdlib"

void GCCommandLine(std.vector<std.string>& args) {
	int argc = 0;
	wchar_t **argvW = CommandLineToArgvW(GetCommandLineW(), &argc);
	char buffer[4096];
	args.resize(argc);
	
	for (let i = 0; i < argc; ++i) {
		size_t converted;
		wcstombs_s(&converted, buffer, sizeof(buffer), argvW[i], _TRUNCATE);
		buffer[converted] = '\0';
		
		args[i] = buffer;
	}
}
