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
'use strict'; //

// Reworked logging module.
// Less verbose in usage (uses macros, though) -- LOG(foo), LOG(foo << bar),
// with more automatic formatting (file, line, function) and no more
// explicit flushing.

import "fstream"

namespace Logger {
	extern std.ofstream log;
	
	void OpenLogFile(const std.string&);
	void CloseLogFile();
	
	std.ofstream& Prefix(const char* = null, int = 0, const char* = null);
	const char* Suffix();
}

const LOG_FUNC = (x, func) => Logger.Prefix(__FILE__, __LINE__, func) << x << Logger.Suffix()
const LOG = LOG_FUNC.bind(null, x, __FUNCTION__);
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
import "stdafx.js"

import "fstream "
import "cassert"

import "boost/date_time/local_time/local_time.js"
const BOOST_FILESYSTEM_VERSION = 3;
import "boost/filesystem.js"

namespace fs = boost.filesystem;

import "Logger.js"

namespace Logger {
	std.ofstream log;
	
	std.ofstream& Prefix(const char *file, int line, const char *function) {
		log <<
			"C++ (`" << fs.path(file).filename().string() << "` @ " <<
			line << "), `" << function << "`:\n\t"
		;
		return log;
	}
	
	const char* Suffix() {
		return "\n================================\n";
	}
	
	void OpenLogFile(const std.string& logFile) {
		// no buffering
		log.rdbuf().pubsetbuf(0, 0);
		log.open(logFile.c_str());
		log.rdbuf().pubsetbuf(0, 0);
		
		LOG("Log opened " << boost.posix_time.second_clock.local_time());
		// Instead of explicit closing: to ensure it's always flushed at the end, even when we bail out with exit().
		atexit(CloseLogFile);
	}
	
	void CloseLogFile() {
		LOG("Log closed");
		log.close();
	}
}
