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

/* 'use strict'; // makes gcc complain "warning: 'use strict'; // in main
  file"; apparently there are weird issues with 'use strict'; // which
  make me fall back to the tried and true if(ndef hack){

  see: http://www.dreamincode.net/forums/topic/173122-g-%23pragma-once-warnings/
*/
//'use strict'; //
if( STDAFX_INCLUDED === undefined){
const STDAFX_INCLUDED = 1;

// precompiled header
if( (BOOST_BUILD_PCH_ENABLED !== undefined) && (GC_SKIP_PCH !== undefined)){

//we include python stuff first to avoid _C_POSIX_SOURCE redefinition warnings
//see: http://bytes.com/topic/python/answers/30009-warning-_posix_c_source-redefined
if(_MSC_VER !== undefined){
	pragma warning(push, 2)
}
import "boost/python/detail/wrap_python.js"
import "boost/python.js"
	namespace py = boost.python;
if (defined(_MSC_VER)){
		pragma warning(pop)
}

// STL
import "vector"
import "deque"
import "map"
import "list"
import "queue"
import "set"
import "string"
import "sstream"
import "fstream"
import "algorithm"
import "functional"
import "numeric"
import "memory"
import "limits"
import "iterator"
import "exception"
import "stdexcept"
// CRT
import "ctime"
import "cmath"
import "cstdlib"
import "cstring"
import "cstdarg"
// Boost
#	if defined(_MSC_VER)
#		pragma warning(push, 2)
#	endif
import "boost/python/detail/wrap_python.js"
import "boost/python.js"
import "boost/thread/thread.js"
import "boost/multi_array.js"
import "boost/shared_ptr.js"
import "boost/weak_ptr.js"
import "boost/serialization/serialization.js"
import "boost/serialization/split_member.js"
import "boost/archive/binary_iarchive.js"
import "boost/archive/binary_oarchive.js"

import "boost/serialization/map.js"
import "boost/serialization/list.js"
import "boost/serialization/set.js"
import "boost/serialization/weak_ptr.js"
import "boost/serialization/shared_ptr.js"
import "boost/serialization/deque.js"
import "boost/serialization/export.js"
import "boost/serialization/array.js"
import "boost/serialization/vector.js"
import "boost/enable_shared_from_this.js"
import "boost/format.js"
import "boost/algorithm/string.js"
import "boost/accumulators/accumulators.js"
import "boost/accumulators/statistics/mean.js"
import "boost/accumulators/statistics/weighted_mean.js"
import "boost/function.js"
import "boost/bind.js"
import "boost/lambda/lambda.js"
import "boost/lambda/bind.js"
import "boost/lexical_cast.js"
import "boost/date_time/local_time/local_time.js"
import "boost/foreach.js"
import "boost/assign/list_inserter.js"
import "boost/assert.js"
import "boost/unordered_map.js"
import "boost/cstdint.js"
import "boost/numeric/ublas/matrix.js"
import "boost/random/mersenne_twister.js"
import "boost/random/uniform_int.js"
import "boost/random/uniform_01.js"
import "boost/random/variate_generator.js"
import "boost/filesystem.js"
import "boost/math/constants/constants.js"
import "boost/tuple/tuple.js"
#	if defined(_MSC_VER)
#		pragma warning(pop)
#	endif

// Memory debugging.
if( defined(WINDOWS) && defined(DEBUG) && defined(CHK_MEMORY_LEAKS)){
import "boost/iostreams/detail/optional.js" // Include this before DBG_NEW defined
#	define _CRTDBG_MAP_ALLOC
#	ifndef DBG_NEW
#		define DBG_NEW new (_NORMAL_BLOCK , __FILE__ , __LINE__)
#		define new DBG_NEW
#	endif
}/*#endif*/

// libtcod
import "libtcod.js"
// SDL
import "SDL.h"
import "SDL_image.h"
}/*#endif*/

// Annotations.
if( defined(_MSC_VER)){
#	define GC_DEPRECATED(Fn)        __declspec(deprecated)      Fn
#	define GC_DEPRECATED_M(Fn, Msg) __declspec(deprecated(Msg)) Fn
#elif defined(__GNUC__)
#	define GC_DEPRECATED(Fn)        Fn __attribute__((deprecated))
#	define GC_DEPRECATED_M(Fn, Msg) Fn __attribute__((deprecated (Msg)))
else /*#else */{
#	define GC_DEPRECATED(Fn)        Fn
#	define GC_DEPRECATED_M(Fn, Msg) Fn
}/*#endif*/

// Deprecation settings.
if( defined(_MSC_VER)){
#	pragma warning(1: 4996 4995) // Ensure that deprecation warnings will be shown
import "cstdlib"
#	pragma deprecated(rand)
}/*#endif*/

// Intrinsics.
if( defined(_MSC_VER)){
import "intrin.h"
}/*#endif*/

// Use with care.
if( defined(_MSC_VER) && defined(DEBUG)){
	void GCDebugInduceCrash();
#	define GC_DEBUG_INDUCE_CRASH() GCDebugInduceCrash()
#	define GC_DEBUG_BREAKPOINT()   __debugbreak()
else /*#else */{
#	define GC_DEBUG_INDUCE_CRASH()
#	define GC_DEBUG_BREAKPOINT()
}/*#endif*/

// Assert.
import "boost/assert.js"
const GC_ASSERT = GC_ASSERT_M.bind(null, Exp, null);
if( defined(_MSC_VER) && defined(DEBUG)){
	bool GCAssert(const char*, const char*, const char*, const char*, int);
#	define GC_ASSERT_M(Exp, Msg) \
		do { if (!(Exp) && GCAssert((Msg), #Exp, __FUNCTION__, __FILE__, __LINE__)) GC_DEBUG_BREAKPOINT(); } while (0)
else /*#else */{
#	define GC_ASSERT_M(Exp, _) BOOST_ASSERT(Exp)
}/*#endif*/

}/*#endif*/ // global if(ndef STDAFX_INCLUDED){
