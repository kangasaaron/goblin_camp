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

import { TCOD_dice_t } from "../fakeTCOD/libtcod.js";
import { Coordinate } from "./Coordinate.js";
import { Distribution } from "./other/Distribution.js";
import { Globals } from "./Globals.js";

let Random = {};

/** from d3 */
const mul = 0x19660D;
const inc = 0x3C6EF35F;
const eps = 1 / 0x100000000;

export default function lcg(seed = Math.random()) {
  let state = (0 <= seed && seed < 1 ? seed / eps : Math.abs(seed)) | 0;
  return () => (state = mul * state + inc | 0, eps * (state >>> 0));
}

/**
    @class Dice
        Represents a single or multiple dice roll.
*/
export class Dice{
	constructor(...args){
		/** @type {unsigned int} dices*/
		this.dices = 0;
		/** @type {unsigned int} faces*/
		this.faces = 0;
		/** @type {float} multiplier*/
		this.multiplier = 1.0;
		/** @type {float} offset*/
		this.offset = 0.0;    
        if(args.length === 1 && args[0] instanceof TCOD_dice_t)
            this._constructor_TCOD_dice_t(args[0]);
        else
            this._constructor_int_int_float_float(...args);
    }

    /**
		Creates the dice out of TCOD_dice_t.
		@param {TCOD_dice_t} dice TCOD_dice_t to convert.
     */
    _constructor_TCOD_dice_t(dice){
        this.dices = (Math.max(1, dice.nb_rolls));
        this.faces = (Math.max(1, dice.nb_faces));
		this.multiplier = (dice.multiplier);
        this.offset = (dice.addsub);
    }

	/**
		Creates the dice of format <tt>@<multiplier@> * @<dices@>d@<faces@> + @<offset@></tt>.
		
		@param {unsigned int} faces      Dice faces.
		@param {unsigned int = 1} dices      Number of dice rolls.
		@param {unsigned float = 1.0} multiplier Result modifier.
		@param {unsigned float = 0.0} offset     Result modifier.
	*/
    _constructor_int_int_float_float(faces, dices, multiplier, offset) {
		this.dices = Math.max(1, dices);
        this.faces = Math.max(1, faces);
        this.multiplier = multiplier;
        this.offset = offset;
    }	
	
	/**
		Rolls the dice.		
		@returns {int} Result of the roll(s).
	*/
	Roll() {
		let result = 0;
        
		for (let i = 0; i < this.dices; ++i) {
			result += Generate(1, Math.max(1, this.faces));
		}
		
		// round(x) = floor(x + 0.5)
		result = (Math.floor(
			((this.multiplier * result) + this.offset) + 0.5
		));
		return result;
	}
	
	/**
		Calculates maximum value of the roll.
		
		@returns {int} Highest value that @ref Dice::Roll may return for this dice.
	*/
	Max() {
		return Math.round(((this.multiplier * (this.dices * this.faces)) + this.offset));
	}
	
	/**
		Calculates minimum value of the roll.
		
		@returns {int} Lowest value that @ref Dice::Roll may return for this dice.
	*/
	Min() {
		return Math.round((this.multiplier * (this.dices * 1)) + this.offset);
	}
}

// namespace Globals {
// 	/**
// 		The global pseudo-random number generator.
// 		Seeded in @ref Random::Init.
// 	*/
// 	Random::Generator generator;
// }

/**
    @class Generator
        An interface to seed and use Mersenne Twister-based PNRG.
        
        @see Globals.generator
*/
export class Generator {

	/**
		Creates and optionally seeds generator.
		
		@see Generator::Seed
		@param {unsigned int = 0} seed Seed to use.
	*/
	constructor(seed = 0){
		/**
		 * @type {GeneratorImpl} 
		 */
        this.generator = lcg()
		/**
		 * @type {unsigned int}
		 */
        this.seed = seed;
		this.SetSeed(seed);
	}

	/**
		(Re-)seeds the generator.
		
		@param {unsigned int = 0} seed New seed to use. If 0, then reuses seed from the global generator.
	*/
	SetSeed(seed = 0) {
		// if (seed === 0 && this !== Globals.generator) {
		// 	seed = Globals.generator.SetSeed(seed);
		// }
		this.seed = seed;
		this.generator = lcg(seed)
	}
	
	/**
		Returns the seed used in this generator.
		
		@returns {unsigned int} The seed value.
	*/
	GetSeed() {
		return this.seed;
	}
	
    Generate(...args){
        if(args.length === 2)
            return this.Generate_int_int(args[0],args[1]);
        else if(args.length === 1)
            return this.Generate_int(args[0]);
        else if(args.length === 0)
            return this.Generate_no_args();
    }

	/**
		Generates a random integer from range [start, end] using uniform distribution.
		
		@param {int} start The start of the range.
		@param {int} end   The end of the range.
		@returns   {int}      A random number from specified range.
	*/
	Generate_int_int( start,  end) {
		return Math.floor(InternalGenerate(this.generator, start, end)); // todo this is weird
	}
	
	/**
		Generates a random integer from range [0, end] using uniform distribution.
		
		@param {int} end The end of the range.
		@returns   {int}    A random number from specified range.
	*/
	Generate_int( end) {
		return this.Generate_int_int(0, end);
	}
	
	/**
		Generates a random float from range [0, 1] using uniform distribution.
		
		@returns A random number from range [0, 1].
	*/
	Generate_no_args() {
		return InternalGenerate(this.generator);
	}
	
	/**
		Generates a random boolean.
		
		@returns {bool} A random boolean.
	*/
	GenerateBool() {
		return !!this.Generate(0, 1);
	}
	
	/**
		Generates a random sign. XXX come up with a better name.
		
		@returns {short} Either 1 or -1.
	*/
	Sign() {
		return this.GenerateBool() ? 1 : -1;
	}

	ChooseInExtent(...args) {
        if(args.length === 2)
            return this.ChooseInExtent_Coordinate_Coordinate(args[0],args[1]);
        else if(args.length === 1)
            return this.ChooseInExtent_Coordinate(args[0]);
	}
	/**
		Generates a random coordinate inside the rectangular area
		delimited by (origin, extent), using uniform distribution
		(origin+extent excluded).
		
		When given only one parameter, it is assumed that the origin is zero.
        @returns {Coordinate}
        @param {const Coordinate &} origin
        @param {const Coordinate &} extent
	*/
	ChooseInExtent_Coordinate_Coordinate(origin, extent) {
		let res = origin;
		for (let d = 0; d < 2; ++d)
			res[d] += Generator.Generate(extent[d]-1);
		return res;
	}

	/** @copydoc Generator::ChooseInExtent 
     * @returns {Coordinate}
     * @param {const Coordinate &} extent
    */
	ChooseInExtent_Coordinate(extent) {
		return Generator.ChooseInExtent(Coordinate.zero, extent);
	}

    ChooseInRadius(...args){
        if(args.length === 2 && args[0] instanceof Coordinate)
            this.ChooseInRadius_Coordinate_int(args[0],args[1]);
        else if(args.length === 1)
            this.ChooseInRadius_int(args[0]);
    }

	/**
		Generates a random coordinate inside a rectangle of radius
		R around the origin, that is, with each coordinate within +R
		or -R of the origin. May return negative coordinates.

		If no origin is given, assumes zero. This is typically used this way:
		   position += ChooseInRadius(r);
	*/
	ChooseInRadius_Coordinate_int( origin, radius) {
		let res = origin;
		for (let d = 0; d < 2; ++d)
			res[d] += Generator.Generate(-radius, radius);
		return res;
	}
	ChooseInRadius_int( radius) {
		return Generator.ChooseInRadius(Generator.zero, radius);
	}

	/**
	   Generates a random coordinate inside a rectangle delimited by
	   its low and high corners, both included.
       @returns {Coordinate}
       @param {const Coordinate &} low
       @param {const Coordinate &} hight
	 */
	 ChooseInRectangle(low, high) {
		let res;
		for (let d = 0; d < 2; ++d)
			res[d] = Generator.Generate(low[d], high[d]);
		return res;
	}


  }
   	

/**
    Common code for @ref Random::Generator functions.
    
    @tparam    G            Generator implementation type.
    @tparam    D            Distribution implementation type.
    @param[in] generator    Generator implementation.
    @param[in] distribution Distribution implementation.
    @returns                Random number.
    @returns template <typename G, typename D> inline typename D::result_type 
*/
function InternalGenerate(generator, start = 0, end = 1) {
	return generator() * (end - start) + start	
}

/**
    Returns standard time-based seed.
    
    @returns {unsigned int} Seed value.
*/
function GetStandardSeed() {
    return Math.round(Date.now());
}

/**
    @fn unsigned ChooseIndex(const T&)
	Chooses a random index from a given STL container.
	
	@tparam T            The container type (must implement the <tt>Random Access Container</tt> concept).
	@param[in] container The container.
	@returns             The index of a random element.
*/
function ChooseIndex(container) {
    return Math.floor(Generate(0, container.length - 1));
}

/**
	@fn unsigned ChooseElement(const T&)
	Chooses a random element from a given STL container.

	@tparam T            The container type (must implement the <tt>Random Access Container</tt> concept).
	@param[in] container The container.
	@returns             A random element.
*/
function ChooseElement(container) {
    return container[ChooseIndex(container)];
}


/**
    Initialises the PRNG.
*/
function Init() {
    let seed = GetStandardSeed();
    console.log("Seeding global random generator with " + seed);
    Globals.generator.SetSeed(seed);
}

function Generate(...args){
    if(args.length === 2)
        return Generate_int_int(args[0],args[1]);
    else if(args.length === 1)
        return Generate_int(args[0]);
    return Generate_no_args();
}

/** @copydoc Generator::Generate(int, int) */
function Generate_int_int( start,  end) {
    return Globals.generator.Generate(start, end);
}

/** @copydoc Generator::Generate(int) */
function Generate_int( end) {
    return Globals.generator.Generate(end);
}

/** @copydoc Generator::Generate() */
function Generate_no_args() {
    return Globals.generator.Generate();
}

/** @copydoc Generator::GenerateBool */
function GenerateBool() {
    return Globals.generator.GenerateBool();
}

/**
    @fn T Sign(const T&)
        Multiplies the expression by a random sign. XXX come up with a better name.
        
        @see Generator::Sign
        @tparam    T    The expression type.
        @param[in] expr The expression value.
        @returns        The expression value multiplied by either 1 or -1.
*/
function Sign(expr = 1) {
    return expr * Globals.generator.Sign();
}

function ChooseInExtent(...args){
    if(args.length === 2)
        return ChooseInExtent_Coordinate_Coordinate(args[0],args[1]);
    return ChooseInExtent_Coordinate(args[0]);
}

/** @copydoc Generator::ChooseInExtent      * 
 * @returns {Coordinate}
*/
function ChooseInExtent_Coordinate_Coordinate(zero,  extent) {
    return Globals.generator.ChooseInExtent(zero, extent);
}
function ChooseInExtent_Coordinate( extent) {
    return Globals.generator.ChooseInExtent(extent);
}

    
function ChooseInRadius(...args){
    if(args.length === 2)
        return ChooseInRadius_Coordinate_int(args[0],args[1]);
    return ChooseInRadius_int(args[0]);
}

/** @copydoc Generator::ChooseInRadius 
 * @returns {Coordinate}
 * @param */
function ChooseInRadius_Coordinate_int(origin,  radius) {
    return Globals.generator.ChooseInRadius(origin, radius);
}

function ChooseInRadius_int(radius) {
    return Globals.generator.ChooseInRadius(radius);
}
    
/** @copydoc Generator::ChooseInRectangle 
 * @returns {Coordinate}
 * @param {const Coordinate&} low
 * @param {const Coordinate&} high
*/
function ChooseInRectangle(low, high) {
    return Globals.generator.ChooseInRectangle(low, high);
}

/**
	A simplified interface to Boost.Random.
*/

export { ChooseIndex };
export { ChooseElement };
export { Init };
export { Generate };
export { GenerateBool };
export { Sign };
export { ChooseInExtent };
export { ChooseInRadius };
export { ChooseInRectangle };
