/**
	@class Dice
		Represents a single or multiple dice roll.
*/
export class Dice {
    constructor(...args) {
        if (args.length === 1)
            this.constructor_tcod_dice(args[0]);
        else
            this.constructor_numbers(args[0], args[1], ags[2], args[3]);
    }

    /**
        Creates the dice out of TCOD_dice_t.
        
        @param[in] dice TCOD_dice_t to convert.
    */

    constructor_tcod_dice(dice) {
        this.dices = Math.max(1, dice.nb_rolls);
        this.faces = Math.max(1, dice.nb_faces);
        this.multiplier = dice.multiplier;
        this.offset = dice.addsub;
    }
    /**
        Creates the dice of format <tt>\<multiplier\> * \<dices\>d\<faces\> + \<offset\></tt>.
        
        @param[in] faces      Dice faces.
        @param[in] dices      Number of dice rolls.
        @param[in] multiplier Result modifier.
        @param[in] offset     Result modifier.
    */
    constructor_numbers(dices, faces = 1, multiplier = 1, offset = 0) {
        this.dices = dices;
        this.faces = faces;
        this.multiplier = multiplier;
        this.offset = offset;
    }
    /**
    	Rolls the dice.
    	
    	@returns Result of the roll(s).
    */
    Roll() {
        let result = 0;

        for (let i = 0; i < this.dices; ++i) {
            result += Generate(1, Math.max(1, this.faces));
        }

        // round(x) = floor(x + 0.5)
        result = Math.floor(
            ((this.multiplier * result) + this.offset) + 0.5
        );
        return result;
    }

    /**
    	Calculates maximum value of the roll.
    	
    	@returns Highest value that @ref Dice.Roll may return for this dice.
    */
    Max() {
        return Math.round(this.multiplier * (this.dices * this.faces) + this.offset);
    }

    /**
    	Calculates minimum value of the roll.
    	
    	@returns Lowest value that @ref Dice.Roll may return for this dice.
    */
    Min() {
        return Math.round((this.multiplier * (this.dices * 1)) + this.offset);
    }
}