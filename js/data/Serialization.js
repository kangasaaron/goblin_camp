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


/**
	This macro exists to enfoce consistent signatures across all serialisable
	classes. I removed templateness to speed up the build (since we only use binary
	archives anyway) � save/load can now be implemented in separate translation units.
	
	A complete definition of a serialisable class/struct looks like this:
	
	<code>
		class T {
			GC_SERIALIZABLE_CLASS
		};
		
		BOOST_CLASS_VERSION(T, 0)
	</code>
	
	@ref InputArchive and @ref OutputArchive typedefs have been created
	so that we don't completely lose ability to change the archive type
	in the future (even if it's not likely to happen).
*/


import "./Config.js"

import "../Entity.js"
// import "../Game.js"
// import "../JobManager.js"
import "../Camp.js"
// import "../StockManager.js"
// import "../Map.js"

// IMPORTANT
// Implementing class versioning properly is an effort towards backward compatibility for saves,
// or at least eliminating those pesky crashes. This means some discipline in editing following
// functions. General rules:
//   - If you change .save, you change .load accordingly, and vice versa.
//   - If you change any of them, therefore changing the file structure,
//     (and this is vital) *increment the appropriate class' version*.
//   - No reordering of old fields, Boost.Serialization is very order-dependent.
//     Append new fields at the end, and enclose them with the correct version check.
//   - If you need to remove any old field, remove it from the saving code, but
//     *preserve loading code for the previous version* (use dummy variable of
//     the same type) -- no point in having zeroed fields in saved game with newer class version,
//     but old saves will always have those fields present.
//   - Do not change the magic constant. It's introduced to ease recognition of the save
//     files, especially after implementing these rules.
//
//  NB: When saving, we always use newest version, so version checks have to be
//      present only in loading code.
//
// File format after this revision:
//
//  These two fields MUST always be present:
//    - magic constant (uint32_t, little endian):
//        This value should never change and must always be equal to saveMagicConst.
//        If it's not, the file is not Goblin Camp save, and MUST be rejected.
//    - file format version (uint8_t, little endian):
//        This value represents overall file format, as defined here.
//        It should be incremented when file format changes so much that maintaining backward 
//        compatibility is not possible or feasible. Parser MUST NOT attempt any further decoding
//        if file format version is different than build's fileFormatConst.
//        
//        File format version of 0xFF is reserved for experimental file formats,
//        and should never be used in production branches.
//
//  These fields are specific to current file format version:
//    - compression flag (uint8_t, little endian)
//        0x00 = uncompressed save (backwards compatible)
//        If other than 0x00, then specifies the algorithm.
//           0x01 = zlib deflate
//        Other values are invalid and MUST be rejected.
//    - 0x00 (uint8_t,  reserved, little endian)
//    - 0x00 (uint32_t, reserved, little endian)
//    - 0x00 (uint64_t, reserved, little endian)
//    - 0x00 (uint64_t, reserved, little endian)
//    - 0x00 (uint64_t, reserved, little endian)
//    - actual serialised payload, defined and processed by Boost.Serialization machinery

// Magic constant: reversed fourcc 'GCMP'
// (so you can see it actually spelled like this when hex-viewing the save).
const saveMagicConst = 0x47434d50;

// File format version (8-bit, because it should not change too often).
const fileFormatConst = 0x01;

class ReadingStream {
    data = "";
    position = 0;
    constructor(string) {
        this.data = string;
    }
    read(amount) {
        let result = this.data.slice(this.position, this.position + amount);
        this.position += amount;
        return result;
    }
    readByte(size, type) {
        let result = new type();
        result.push(this.read(size));
        return result[0];
    }
    ReadUInt8() {
        return this.readByte(8, Uint8Array);
    }
    ReadUInt16() {
        return this.readByte(16, Uint16Array);
    }
    ReadUInt32() {
        return this.readByte(32, Uint32Array);
    }
    ReadUInt64() {
        let binary = this.read(64);
        let result = BigInt(binary);
        return result;
    }
}
//
// Save/load entry points
//

// XXX implement the archives
// template < size_t N > struct Type {};

// let DEFINE_TYPE = (T) => template < > struct Type < sizeof(T) > {
// 	typedef T uint;
// };
// DEFINE_TYPE(std.uint8_t);
// DEFINE_TYPE(std.uint16_t);
// DEFINE_TYPE(std.uint32_t);
// DEFINE_TYPE(std.uint64_t);
// delete DEFINE_TYPE;
/*
function ReadUInt8(stream) {
	// typedef typename Type < sizeof(T) / 2 > .uint U;
	const bits = 8;

	let a = new Uint8Array();
	a.push(stream)
	// a = ReadUInt < U > (stream);
	// b = ReadUInt < U > (stream);

	// return (static_cast < T > (a) << bits) | static_cast < T > (b);
}

template < >
	std.uint8_t ReadUInt < std.uint8_t > (std.istream & stream) {
		return static_cast < std.uint8_t > (stream.get());
	}

template < typename T >
	void WriteUInt(std.ostream & stream, T value) {
		typedef typename Type < sizeof(T) / 2 > .uint U;
		const std.uint32_t bits = sizeof(U) * 8;

		// All types here are unsigned.
		const U max = static_cast < U > (-1);

		WriteUInt < U > (stream, (value >> bits) & max);
		WriteUInt < U > (stream, value & max);
	}

template < >
	void WriteUInt < std.uint8_t > (std.ostream & stream, std.uint8_t value) {
		stream.put(static_cast < char > (value));
	}
*/
export class Serialization {
    WritePayload(ofs) {
        let oarch = ofs;
        oarch.WriteUInt32(Entity.uids);
        oarch.WriteBuffer(Game.serialize());
        oarch.WriteBuffer(JobManager.seralize());
        oarch.WriteBuffer(Camp.seralize());
        oarch.WriteBuffer(StockManager.seralize());
        oarch.WriteBuffer(Map.seralize());
    }

    ReadPayload(ifs) {
        let iarch = ifs;
        Entity.uids = iarch.ReadUInt32();
        Game.deserialize(iarch);
        JobManager.deserialize(iarch);
        Camp.deserialize(iarch);
        StockManager.deserialize(iarch);
        Map.deserialize(iarch);
    }


    SaveGame(filename) {
        try {
            // std.ofstream rawStream(filename.c_str(), std.ios.binary);
            // io.filtering_ostream stream;

            // Write the file header
            WriteUInt32(rawStream, saveMagicConst);
            WriteUInt8(rawStream, fileFormatConst);

            let compress = Config.GetCVar("compressSaves");
            compress = false; /// TODO implement compression
            // compression flag
            WriteUInt8(rawStream, (compress ? 0x01 : 0x00));

            // reserved
            WriteUInt8(rawStream, 0x00);
            WriteUInt16(rawStream, 0x00);
            WriteUInt32(rawStream, 0x00);
            WriteUInt64(rawStream, 0x00);
            WriteUInt64(rawStream, 0x00);
            WriteUInt64(rawStream, 0x00);

            // Write the payload
            // if (compress) {
            // 	io.zlib_params params(6); // level
            // 	stream.push(io.zlib_compressor(params));
            // }

            stream.push(rawStream);
            Game.SavingScreen(this.WritePayload.bind(this), stream);

            return true;
        } catch (e) {
            console.log("std.exception while trying to save the game: ", e.message);
            return false;
        }
    }

    ReadGameFile(data) {
        try {
            // io.filtering_istream stream;
            let rawStream = new ReadingStream(data);

            // Read and verify the file header
            if (rawStream.ReadUInt32() != saveMagicConst) {
                throw std.runtime_error("Invalid magic value.");
            }

            if (rawStream.ReadUInt8() != fileFormatConst) {
                throw std.runtime_error("Invalid file format value.");
            }

            // compression
            let compressed = rawStream.ReadUInt8(); // TODO implement compression

            // if (compressed > 1) {
            // 	throw new Error("Invalid compression algorithm.");
            // }

            // reserved values
            if (rawStream.ReadUInt8() != 0) {
                throw std.runtime_error("Forward compatibility: reserved value #1 not 0x00.");
            }
            if (rawStream.ReadUInt16() != 0) {
                throw std.runtime_error("Forward compatibility: reserved value #2 not 0x0000.");
            }
            if (rawStream.ReadUInt32() != 0) {
                throw std.runtime_error("Forward compatibility: reserved value #3 not 0x00000000.");
            }
            if (rawStream.ReadUInt64() != 0) {
                throw std.runtime_error("Forward compatibility: reserved value #4 not 0x0000000000000000.");
            }
            if (rawStream.ReadUInt64() != 0) {
                throw std.runtime_error("Forward compatibility: reserved value #5 not 0x0000000000000000.");
            }
            if (rawStream.ReadUInt64() != 0) {
                throw std.runtime_error("Forward compatibility: reserved value #6 not 0x0000000000000000.");
            }

            Game.Reset();

            // Read the payload
            // if (compressed) { // TODO implement compression
            // 	stream.push(io.zlib_decompressor());
            // }

            stream.push(rawStream);
            Game.LoadingScreen(this.ReadPayload.bind(this), stream);
            Game.TranslateContainerListeners();
            Game.ProvideMap();
            Game.Pause();

            return true;
        } catch (e) {
            console.error("exception while trying to load the game: ", e.message);
            return false;
        }
    }
    LoadGame(filename) {
        try {
            let rawStream = new FileReader();
            rawStream.onload = this.ReadGameFile.bind(this, filename);
            rawStream.readAsBinaryString(filename);
        } catch (e) {
            console.error("exception while trying to read the game file: ", e.message);
            return false;
        }
    }
}

class Serializable {
    static CLASS_VERSION = 0;
    static __SerializableType__ = "default";
    static __instance_id = 0;
    constructor(baseValue) {
        this.__id = this.constructor.__instance_id++;
        this.data = baseValue;
    }
    save(ar, version) {

    }
    load(ar, version) {

    }
    get hashCode() {
        return this.constructor.name + "_" + this.__id;
    }
}
class SerializablePrimative extends Serializable {
    static __SerializableType__ = "primative";
    static get typeName() {
        return (this.name).replace("Serializable", "");
    }
    get typeName() {
        return this.constructor.typeName;
    }
    serialize() {
        return this.data;
    }
    static deserialize(data) {
        return data;
    }
};

class SerializableSymbol extends SerializablePrimative {
    serialize() {
        return {
            "__type__": this.typeName,
            "description": this.data.description
        };
    }
    static deserialize(data) {
        return Symbol.for(data.description);
    }
}
class SerializableNumber extends SerializablePrimative {
    serialize() {
        if (isNaN(this.data)) return "__NaN__";
        if (this.data === -Infinity) return "__-Infinity__";
        if (this.data === Infinity) return "__Infinity__";
        return super.serialize();
    }
    static deserialize(data) {
        if (data === "__Infinity__")
            return Infinity;
        else if (data === "__-Infinity__")
            return -Infinity;
        return super.deserialize(data);
    }
}
class SerializableBigInt extends SerializablePrimative {
    serialize() {
        return {
            "__type__": this.typeName,
            "value": this.data.toString()
        };
    }
    static deserialize(data) {
        return BigInt(data.value);
    }
}
class SerializableFunction extends SerializablePrimative {
    serialize() {
        return {
            "__type__": this.typeName,
            "source": this.data.toString()
        }
    }
}
class SerializableNull extends SerializablePrimative {
    serialize() {
        return "__null__";
    }
    static deserialize() {
        return null;
    }
}
class SerializableUndefined extends SerializablePrimative {
    serialize() {
        return "__undefined__";
    }
    static deserialize() {
        return;
    }
}
class SerializableBoolean extends SerializablePrimative {}
class SerializableString extends SerializablePrimative {
    serialize() {
        return this.data;
    }
}
class SerializableObject extends SerializablePrimative {
    static __SerializableType__ = "object";
    serialize(serializer) {
        let d = this.data;
        let ks = Array.from(Object.keys(this.data));
        let result = {};
        if (ks.length == 0)
            return result;
        ks.map(key => result[serializer.serializable(key)] = serializer.serializable(d[key]));
        return result;
    }
    static deserialize(data, version, deserializer) {
        let result = {};
        let ks = Array.from(Object.keys(data));
        if (ks.length == 0) return result;
        ks.map(key => result[deserializer.deserializable(key)] = deserializer.deserializable(data[key]));
        return result;
    }
}
class SerializableDate extends SerializableObject {
    serialize() {
        return {
            "__type__": this.typeName,
            "value": this.data.valueOf()
        };
    }
    static deserialize(data) {
        return new Date(data.value);
    }
}
class SerializableRegExp extends SerializableObject {
    serialize() {
        return {
            "__type__": this.typeName,
            "source": this.data.source,
            "flags": this.data.flags
        };
    }
    static deserialize(data) {
        return new RegExp(data.source, data.flags);
    }
}
class SerializableError extends SerializableObject {
    serialize(serializer) {
        if (this.data.name === "AggregateError") {
            return {
                "__type__": this.typeName,
                "errorType": this.data.name,
                "value": this.data.errors.map(item => serializer.serializable(item))
            };
        }
        return {
            "__type__": this.typeName,
            "errorType": this.data.name,
            "message": this.data.message
        };
    }
    static deserialize(data, version, deserializer) {
        if (data.errorType === "AggregateError") {
            let errors = data.value.map(item => deserializer.deserializable(item));
            return new AggregateError(errors);
        }
        return new globalThis[data.errorType](data.message);
    }
}
class SerializableMap extends SerializableObject {
    serialize(serializer) {
        return {
            "__type__": this.typeName,
            "values": Array.from(this.data.entries()).map(keyValue => [serializer.serializable(keyValue[0]), serializer.serializable(keyValue[1])])
        };
    }
    static deserialize(data, version, deserializer) {
        let values = data.values.map(function(kv) {
            return [
                deserializer.deserializable(kv[0]),
                deserializer.deserializable(kv[1])
            ];
        });
        return new Map(values);
    }
}
class SerializableSet extends SerializableObject {
    serialize(serializer) {
        return {
            "__type__": this.typeName,
            "values": Array.from(this.data.values()).map(value => serializer.serializable(value))
        };
    }
    static deserialize(data, version, deserializer) {
        let values = data.values.map(function(v) {
            return deserializer.deserializable(v)
        });
        return new Set(values);
    }
}
class SerializableWeakMap extends SerializableObject {}
class SerializableWeakSet extends SerializableObject {}
class SerializableArray extends SerializableObject {
    serialize(serializer) {
        return this.data.map(item => serializer.serializable(item));
    }
    static deserialize(data, version, deserializer) {
        return data.map(item => deserializer.deserializable(item));
    }
}
class SerializableTypedArray extends SerializableArray {
    serialize(serializer) {
        return {
            "__type__": this.typeName,
            "values": this.data.reduce(function(regularArray, item) {
                regularArray.push(item)
                return regularArray;
            }, [])
        };
    }
    static deserialize(data, version, deserializer) {
        return globalThis[this.typeName].from(data.values);
    }
}
class SerializableInt8Array extends SerializableTypedArray {}
class SerializableUint8Array extends SerializableTypedArray {}
class SerializableUint8ClampedArray extends SerializableTypedArray {}
class SerializableInt16Array extends SerializableTypedArray {}
class SerializableUint16Array extends SerializableTypedArray {}
class SerializableInt32Array extends SerializableTypedArray {}
class SerializableUint32Array extends SerializableTypedArray {}
class SerializableFloat32Array extends SerializableTypedArray {}
class SerializableFloat64Array extends SerializableTypedArray {}
class SerializableBigIntArray extends SerializableTypedArray {
    serialize(serializer) {
        return {
            "__type__": this.typeName,
            "values": this.data.reduce(function(regularArray, item) {
                regularArray.push(item.toString());
                return regularArray;
            }, [])
        };
    }
    static deserialize(data, version, deserializer) {
        return globalThis[this.typeName].from(data.values.map(value => BigInt(value)));
    }
}
class SerializableBigInt64Array extends SerializableBigIntArray {}
class SerializableBigUint64Array extends SerializableBigIntArray {}
class SerializableArrayBuffer extends SerializableObject {}

export class JSONSerializer extends Serializable {
    registered_types = [];
    data = {};
    constructor() {
        super();
        this.register_type(SerializableSymbol);
        this.register_type(SerializableNumber);
        this.register_type(SerializableBigInt);
        this.register_type(SerializableFunction);
        this.register_type(SerializableNull);
        this.register_type(SerializableUndefined);
        this.register_type(SerializableBoolean);
        this.register_type(SerializableString);
        this.register_type(SerializableObject);
        this.register_type(SerializableDate);
        this.register_type(SerializableRegExp);
        this.register_type(SerializableError);
        this.register_type(SerializableMap);
        this.register_type(SerializableSet);
        this.register_type(SerializableWeakMap);
        this.register_type(SerializableWeakSet);
        this.register_type(SerializableArray);
        this.register_type(SerializableTypedArray);
        this.register_type(SerializableInt8Array);
        this.register_type(SerializableUint8Array);
        this.register_type(SerializableUint8ClampedArray);
        this.register_type(SerializableInt16Array);
        this.register_type(SerializableUint16Array);
        this.register_type(SerializableInt32Array);
        this.register_type(SerializableUint32Array);
        this.register_type(SerializableFloat32Array);
        this.register_type(SerializableFloat64Array);
        this.register_type(SerializableBigIntArray);
        this.register_type(SerializableBigInt64Array);
        this.register_type(SerializableBigUint64Array);
        this.register_type(SerializableArrayBuffer);

    }
    register_type(klass) {
        if (!this.registered_types.includes(klass)) {
            if (!"CLASS_VERSION" in klass) console.error("JSONSerializer register_type klass does not have CLASS_VERSION");
            if (!"save" in klass) console.error("JSONSerializer register_type klass does not have save");
            if (!"load" in klass) console.error("JSONSerializer register_type klass does not have load");
            if (!"hashCode" in klass) console.error("JSONSerializer register_type klass does not have hashCode");
            this.registered_types.push(klass);
        }
    }
    determine_type(obj) {
        if (obj === null || obj === "__null__")
            return SerializableNull;
        if (obj === undefined || obj === "__undefined__")
            return SerializableUndefined;
        let type = this.registered_types.find(rt => rt.name == obj.constructor.name);
        if (type) return type;
        if (typeof obj === "object" && "__class__" in obj)
            type = this.registered_types.find(rt => rt.name == obj.__class__);
        if (type) return type;
        if (typeof obj === "object" && "__type__" in obj)
            type = this.registered_types.find(rt => rt.typeName == obj.__type__);
        if (type) return type;
        switch (typeof obj) {
            case "symbol":
                return SerializableSymbol;
            case "number":
                return SerializableNumber;
            case "bigint":
                return SerializableBigInt;
            case "function":
                return SerializableFunction;
            case "undefined":
                return SerializableUndefined;
            case "boolean":
                return SerializableBoolean;
            case "string":
                if (["__NaN__", "__Infinity__", "__-Infinity__"].includes(obj)) return SerializableNumber;
                return SerializableString;
            case "object":
                if (obj instanceof Error)
                    return SerializableError;
                else if (obj instanceof RegExp)
                    return SerializableRegExp
                else if (obj instanceof Date)
                    return SerializableDate
                else if (obj instanceof Map)
                    return SerializableMap
                else if (obj instanceof Set)
                    return SerializableSet
                else if (obj instanceof WeakMap)
                    return SerializableWeakMap
                else if (obj instanceof WeakSet)
                    return SerializableWeakSet
                else if (obj instanceof Int8Array)
                    return SerializableInt8Array
                else if (obj instanceof Uint8Array)
                    return SerializableUint8Array
                else if (obj instanceof Uint8ClampedArray)
                    return SerializableUint8ClampedArray
                else if (obj instanceof Int16Array)
                    return SerializableInt16Array
                else if (obj instanceof Uint16Array)
                    return SerializableUint16Array
                else if (obj instanceof Int32Array)
                    return SerializableInt32Array
                else if (obj instanceof Uint32Array)
                    return SerializableUint32Array
                else if (obj instanceof Float32Array)
                    return SerializableFloat32Array
                else if (obj instanceof Float64Array)
                    return SerializableFloat64Array
                else if (obj instanceof BigInt64Array)
                    return SerializableBigInt64Array
                else if (obj instanceof BigUint64Array)
                    return SerializableBigUint64Array
                else if (obj instanceof ArrayBuffer)
                    return SerializableArrayBuffer
                else if (obj instanceof Array)
                    return SerializableArray
                return SerializableObject;
                //Error, Regexp, Date, Map, Set, WeakMap, WeakSet, Array, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array,Float32Array,Float64Array, BigInt64Array, BigUint64Array, ArrayBuffer, 
        }
    }
    serializable(object) {
        let type = this.determine_type(object);
        let needsClassAndVersion = false;
        if (type.__SerializableType__ === "primative" || type.__SerializableType__ === "object")
            object = new type(object);
        else
            needsClassAndVersion = true;
        let result = object.serialize(this);
        if (typeof result == "object" && needsClassAndVersion) {
            result = Object.assign({
                "__class__": object.constructor.name,
                "__version__": object.constructor.CLASS_VERSION
            }, result);
        }
        return result;
    }
    serialize(object) {
        return JSON.stringify(this.serializable(object));
    }
    deserializable(object) {
        let type = this.determine_type(object);
        let version = 0;
        if (object && typeof object === "object" && "__version__" in object) {
            version = object.__version__;
        }
        return type.deserialize(object, version, this);
    }
    deserialize(str) {
        let object = JSON.parse(str);
        return this.deserializable(object);
    }
}