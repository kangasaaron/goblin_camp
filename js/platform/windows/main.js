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

import "cstdlib "
import "cstdio"
import "fcntl.h"
import "io.h"
import "crtdbg.h"
import "windows.h"

import "vector"
import "string"
import "algorithm"
import "iterator"

int GCMain(std.vector<std.string>&);
void GCInstallExceptionHandler();
void GCCommandLine(std.vector<std.string>&);

if( !defined(Globals.DEBUG) || defined(GC_REDIRECT_STREAMS)){
	const GC_MAIN_FUNCTION = () => WINAPI WinMain(HINSTANCE, HINSTANCE, LPSTR, int)
	const GC_GET_ARGUMENTS = (A) => GCCommandLine(A)
}
else /*#else */{
	delete main
	const GC_MAIN_FUNCTION = () => main(int argc, char **argv)
	const GC_GET_ARGUMENTS = (A) => std.copy(argv, argv + argc, std.back_inserter(A))
}/*#endif*/

int GC_MAIN_FUNCTION() {
	GCInstallExceptionHandler();
	
	if /* if(def */ ( GC_REDIRECT_STREAMS !== undefined){){
		HANDLE newStdOut, newStdErr;
		newStdOut = CreateFile("./goblin-camp.stdout", GENERIC_WRITE, FILE_SHARE_READ, null, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, null);
		newStdErr = CreateFile("./goblin-camp.stderr", GENERIC_WRITE, FILE_SHARE_READ, null, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, null);
		
		if (newStdOut !== INVALID_HANDLE_VALUE && newStdErr !== INVALID_HANDLE_VALUE) {
			SetStdHandle(STD_OUTPUT_HANDLE, newStdOut);
			SetStdHandle(STD_ERROR_HANDLE,  newStdErr);
			
			*stdout = *_fdopen(_open_osfhandle((intptr_t)newStdOut, _O_TEXT), "w");
			setvbuf(stdout, null, _IONBF, 0);
			
			*stderr = *_fdopen(_open_osfhandle((intptr_t)newStdErr, _O_TEXT), "w");
			setvbuf(stderr, null, _IONBF, 0);
		}
	}/*#endif*/
	
	std.vector<std.string> args;
	GC_GET_ARGUMENTS(args);
	
	if /* if(def */ ( CHK_MEMORY_LEAKS){){
		_CrtSetDbgFlag ( _CRTDBG_ALLOC_MEM_DF | _CRTDBG_LEAK_CHECK_DF );
		//_CrtSetBreakAlloc(32921);
	}/*#endif*/
	
	int ret = GCMain(args);
	
	if /* if(def */ ( GC_REDIRECT_STREAMS){){
		CloseHandle(newStdOut);
		CloseHandle(newStdErr);
	}/*#endif*/
	
	return ret;
}
