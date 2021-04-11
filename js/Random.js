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

import "./other/rot.js";

class Generator {
    seed = 0;
    generator = null;
    constructor(seed = 0) {
        this.generator = ROT.RNG.clone();
        this.seed = seed;
        this.SetSeed(this.seed);
    }
    ChooseIndex(container) {
        return this.Generate(0, (container.size || container.length) - 1);
    }
    ChooseElement(container) {
        return container[this.ChooseIndex(container)];
    }
    Sign(expr) {
            return expr * (this.Generate(0, 1) ? -1 : 1);
        }
        /**
              	(Re-)seeds the generator.
              	
              	@param[in] seed New seed to use. If 0, then reuses seed from the global generator.
              */
    SetSeed(seed) {
        if (seed == 0 && this.generator) {
            seed = this.generator.seed;
        }
        this.seed = seed;
        this.generator.setSeed(this.seed);
    }

    /**
	Returns the seed used in this generator.
	
	@returns The seed value.
	*/

    GetSeed() {
        return this.seed;
    }
    Generate(...args) {
        if (args.length == 1) return this.Generate_end(args[0]);
        else if (args.length == 2) return this.Generate_start_end(args[0], args[1]);
        else return this.Generate_none();
    }

    Generate_start_end(start, end) {
        return InternalGenerate(this.generator, start, end);
    }

    /**
      	Generates a random integer from range [0, end] using uniform distribution.
      	
      	@param[in] end The end of the range.
      	@returns       A random number from specified range.
      */
    Generate_end(end) {
        return this.Generate(0, end);
    }

    /**
      	Generates a random float from range [0, 1] using uniform distribution.
      	
      	@returns A random number from range [0, 1].
      */
    Generate_none() {
        return this.Generate(0, 1);
    }

    /**
      	Generates a random boolean.
      	
      	@returns A random boolean.
      */
    GenerateBool() {
        return !!this.Generate(0, 1);
    }

    /**
      	Generates a random sign. XXX come up with a better name.
      	
      	@returns Either 1 or -1.
      */
    /**
        	@fn T Sign(const T&)
        		Multiplies the expression by a random sign. XXX come up with a better name.
        		
        		@see Generator.Sign
        		@param    T    The expression type.
        		@param[in] expr The expression value.
        		@returns        The expression value multiplied by either 1 or -1.
        */
    Sign() {
        return this.GenerateBool() ? 1 : -1;
    }

    /**
      	Generates a random coordinate inside the rectangular area
      	delimited by (origin, extent), using uniform distribution
      	(origin+extent excluded).
      	
      	When given only one parameter, it is assumed that the origin is zero.
      */
    ChooseInExtent(origin, extent) {
        if (origin !== undefined && extend === undefined) {
            extent = origin;
            origin = zero;
        }
        let res = origin;
        for (let d = 0; d < 2; ++d) {
            res[d] += Generator.Generate(extent[d] - 1);
        }
        return res;
    }

    /**
      	Generates a random coordinate inside a rectangle of radius
      	R around the origin, that is, with each coordinate within +R
      	or -R of the origin. May return negative coordinates.

      	If no origin is given, assumes zero. This is typically used this way:
      	   position += ChooseInRadius(r);
      */
    ChooseInRadius(origin, extent) {
        if (origin !== undefined && extend === undefined) {
            extent = origin;
            origin = zero;
        }
        let res = origin;
        for (let d = 0; d < 2; ++d) {
            res[d] += Generator.Generate(-radius, radius);
        }
        return res;
    }

    /**
         Generates a random coordinate inside a rectangle delimited by
         its low and high corners, both included.
       */
    ChooseInRectangle(low, high) {
        let res;
        for (let d = 0; d < 2; ++d) {
            res[d] = Generator.Generate(low[d], high[d]);
        }
        return res;
    }
}

/**
	Common code for @ref Random.Generator functions.
	
	@param    G            Generator implementation type.
	@param    D            Distribution implementation type.
	@param[in] generator    Generator implementation.
	@param[in] distribution Distribution implementation.
	@returns                Random number.
*/
function InternalGenerate(generator, distribution) {

}
/**
	Returns standard time-based seed.
	
	@returns Seed value.
*/
function GetStandardSeed() {
    return Date.now();
}


/**
	A simplified interface to Boost.Random.
*/


/**
	@class Generator
		An interface to seed and use Mersenne Twister-based PNRG.
		
		@see generator
*/

/**
	Creates and optionally seeds generator.
	
	@see Generator.Seed
	@param[in] seed Seed to use.
*/


/**
	Generates a random integer from range [start, end] using uniform distribution.
	
	@param[in] start The start of the range.
	@param[in] end   The end of the range.
	@returns         A random number from specified range.
*/

/**
	Initialises the PRNG.
*/
export class RandomGen {
    generator = new Generator();
    Init() {
        let seed = GetStandardSeed();
        console.log("Seeding global random generator with ", seed);
        Random.generator.SetSeed(seed);
    }

    /** @copydoc Generator.Generate(int, int) */
    Generate(...args) {
        return this.generator.Generate(...args);
    }
    GenerateBool() {
        return this.generator.GenerateBool();
    }

    Sign() {
        return this.generator.Sign();
    }

    ChooseInExtent(...args) {
        return this.generator.ChooseInExtent(...args);
    }
    ChooseInRadius(...args) {
        return this.generator.ChooseInRadius(...args);
    }
    ChooseInRectangle(...args) {
        return this.generator.ChooseInRectangle(...args);
    }

    /**
      	@fn unsigned ChooseIndex(const T&)
      		Chooses a random index from a given STL container.
      		
      		@param T            The container type (must implement the <tt>Random Access Container</tt> concept).
      		@param[in] container The container.
      		@returns             The index of a random element.
      */

    /**
      	@fn unsigned ChooseElement(const T&)
      		Chooses a random element from a given STL container.
      		
      		@param T            The container type (must implement the <tt>Random Access Container</tt> concept).
      		@param[in] container The container.
      		@returns             A random element.
      */
    // }
}

export let Random = new RandomGen();