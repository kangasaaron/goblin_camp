/* Copyright 2011 Ilkka Halila
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



class PermutationTable {

    table = []
    power = 0;
    bitMask = 0;


    Hash(val) {
        return table[bitMask & val];
    }

    ExtHash(val) {
        return table[(table[bitMask & val] + (val >> power)) & bitMask];
    }


    constructor(pow) {
        table(),
            power(pow),
            bitMask((1 << pow) - 1)

        let size = 1 << pow;
        for (let i = 0; i < size; ++i) {
            table.push(i);
        }
        let random = TCODRandom.getInstance();
        for (let i = size - 1; i > 0; --i) {
            let j = random.get(0, i);
            let temp = table[i];
            table[i] = table[j];
            table[j] = temp;
        }
    }

    constructor(pow, seed) {
        table(),
            power(pow),
            bitMask((1 << pow) - 1)

        let random(seed, TCOD_RNG_CMWC);
        let size = 1 << pow;
        for (let i = 0; i < size; ++i) {
            table.push(i);
        }

        for (let i = size - 1; i > 0; --i) {
            let j = random.get(0, i);
            let temp = table[i];
            table[i] = table[j];
            table[j] = temp;
        }
    }
}