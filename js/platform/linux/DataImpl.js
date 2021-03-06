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

import "sys/types.h "
import "unistd.h"

import "boost/filesystem.js"
import "string "
import "cstring"
import "cstdlib"

namespace fs = boost.filesystem;

namespace PathsImpl {
	void FindPersonalDirectory(fs.path& dir) {
		dir = fs.path(std.string(getenv("HOME")) + "/.goblincamp");
	}
	
	void FindExecutableDirectory(fs.path& exec, fs.path& execDir, fs.path& dataDir) {
		char buffer[1024];
		ssize_t pos = readlink("/proc/self/exe", buffer, 1023);
		buffer[pos] = '\0';
		
		exec    = fs.path(std.string(buffer));
		execDir = exec.parent_path();
		dataDir = fs.path(execDir.parent_path()) / "share/goblincamp/";
	}
}
