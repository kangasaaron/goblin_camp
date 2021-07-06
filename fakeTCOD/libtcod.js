
import { Enumify } from "../js/cplusplus/Enums.js"

export class TCODColor {
    constructor(red, green, blue){
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
    clone(){
        return new TCODColor(this.red,this.green,this.blue)
    }
    static lerp(){
        return new TCODColor(
            c1.r + (c2.r - c1.r) * coef,
            c1.g + (c2.g - c1.g) * coef,
            c1.b + (c2.b - c1.b) * coef
        );
    }
    static fromHex(hex){
        let red = parseInt(hex.substr(1,2),16)
        let green = parseInt(hex.substr(3,2),16)
        let blue = parseInt(hex.substr(5,2),16)
        return new TCODColor(red,green,blue)
    }
}
TCODColor.white = Object.freeze(TCODColor.fromHex('#ffffff'))
TCODColor.yellow = Object.freeze(TCODColor.fromHex('#ffff00'))
TCODColor.red = Object.freeze(TCODColor.fromHex('#ff0000'))
TCODColor.celadon = Object.freeze(TCODColor.fromHex('#acffac'))
TCODColor.grey = Object.freeze(TCODColor.fromHex('#808080'))
TCODColor.darkGrey = Object.freeze(TCODColor.fromHex('#606060'))
TCODColor.lightGreen = Object.freeze(TCODColor.fromHex('#3fff3f'))
TCODColor.cyan = Object.freeze(TCODColor.fromHex('#00ffff'))
TCODColor.green = Object.freeze(TCODColor.fromHex('#00ff00'))
TCODColor.black = Object.freeze(TCODColor.fromHex('#000000'))

export let TCOD_alignment_t = { 
    TCOD_LEFT: null,
    TCOD_RIGHT: null,
    TCOD_CENTER: null,
}
TCOD_alignment_t = Enumify(TCOD_alignment_t);

export let TCOD_bkgnd_flag_t = {
    TCOD_BKGND_NONE:null,
    TCOD_BKGND_SET:null,
    TCOD_BKGND_MULTIPLY:null,
    TCOD_BKGND_LIGHTEN:null,
    TCOD_BKGND_DARKEN:null,
    TCOD_BKGND_SCREEN:null,
    TCOD_BKGND_COLOR_DODGE:null,
    TCOD_BKGND_COLOR_BURN:null,
    TCOD_BKGND_ADD:null,
    TCOD_BKGND_ADDA:null,
    TCOD_BKGND_BURN:null,
    TCOD_BKGND_OVERLAY:null,
    TCOD_BKGND_ALPH:null,
    TCOD_BKGND_DEFAULT:null
}
TCOD_bkgnd_flag_t = Enumify(TCOD_bkgnd_flag_t);

export const TCOD_chars_t = {
    /* single walls */
    TCOD_CHAR_HLINE: 196,
    TCOD_CHAR_VLINE: 179,
    TCOD_CHAR_NE: 191,
    TCOD_CHAR_NW: 218,
    TCOD_CHAR_SE: 217,
    TCOD_CHAR_SW: 192,
    TCOD_CHAR_TEEW: 180,
    TCOD_CHAR_TEEE: 195,
    TCOD_CHAR_TEEN: 193,
    TCOD_CHAR_TEES: 194,
    TCOD_CHAR_CROSS: 197,
        /* double walls */
    TCOD_CHAR_DHLINE: 205,
    TCOD_CHAR_DVLINE: 186,
    TCOD_CHAR_DNE: 187,
    TCOD_CHAR_DNW: 201,
    TCOD_CHAR_DSE: 188,
    TCOD_CHAR_DSW: 200,
    TCOD_CHAR_DTEEW: 185,
    TCOD_CHAR_DTEEE: 204,
    TCOD_CHAR_DTEEN: 202,
    TCOD_CHAR_DTEES: 203,
    TCOD_CHAR_DCROSS: 206,
        /* blocks */
    TCOD_CHAR_BLOCK1: 176,
    TCOD_CHAR_BLOCK2: 177,
    TCOD_CHAR_BLOCK3: 178,
        /* arrows */
    TCOD_CHAR_ARROW_N: 24,
    TCOD_CHAR_ARROW_S: 25,
    TCOD_CHAR_ARROW_E: 26,
    TCOD_CHAR_ARROW_W: 27,
        /* arrows without tail */
    TCOD_CHAR_ARROW2_N: 30,
    TCOD_CHAR_ARROW2_S: 31,
    TCOD_CHAR_ARROW2_E: 16,
    TCOD_CHAR_ARROW2_W: 17,
        /* double arrows */
    TCOD_CHAR_DARROW_H: 29,
    TCOD_CHAR_DARROW_V: 18,
        /* GUI stuff */
    TCOD_CHAR_CHECKBOX_UNSET: 224,
    TCOD_CHAR_CHECKBOX_SET: 225,
    TCOD_CHAR_RADIO_UNSET: 9,
    TCOD_CHAR_RADIO_SET: 10,
        /* sub-pixel resolution kit */
    TCOD_CHAR_SUBP_NW: 226,
    TCOD_CHAR_SUBP_NE: 227,
    TCOD_CHAR_SUBP_N: 228,
    TCOD_CHAR_SUBP_SE: 229,
    TCOD_CHAR_SUBP_DIAG: 230,
    TCOD_CHAR_SUBP_E: 231,
    TCOD_CHAR_SUBP_SW: 232,
        /* miscellaneous */
    TCOD_CHAR_SMILIE: 1,
    TCOD_CHAR_SMILIE_INV: 2,
    TCOD_CHAR_HEART: 3,
    TCOD_CHAR_DIAMOND: 4,
    TCOD_CHAR_CLUB: 5,
    TCOD_CHAR_SPADE: 6,
    TCOD_CHAR_BULLET: 7,
    TCOD_CHAR_BULLET_INV: 8,
    TCOD_CHAR_MALE: 11,
    TCOD_CHAR_FEMALE: 12,
    TCOD_CHAR_NOTE: 13,
    TCOD_CHAR_NOTE_DOUBLE: 14,
    TCOD_CHAR_LIGHT: 15,
    TCOD_CHAR_EXCLAM_DOUBLE: 19,
    TCOD_CHAR_PILCROW: 20,
    TCOD_CHAR_SECTION: 21,
    TCOD_CHAR_POUND: 156,
    TCOD_CHAR_MULTIPLICATION: 158,
    TCOD_CHAR_FUNCTION: 159,
    TCOD_CHAR_RESERVED: 169,
    TCOD_CHAR_HALF: 171,
    TCOD_CHAR_ONE_QUARTER: 172,
    TCOD_CHAR_COPYRIGHT: 184,
    TCOD_CHAR_CENT: 189,
    TCOD_CHAR_YEN: 190,
    TCOD_CHAR_CURRENCY: 207,
    TCOD_CHAR_THREE_QUARTERS: 243,
    TCOD_CHAR_DIVISION: 246,
    TCOD_CHAR_GRADE: 248,
    TCOD_CHAR_UMLAUT: 249,
    TCOD_CHAR_POW1: 251,
    TCOD_CHAR_POW3: 252,
    TCOD_CHAR_POW2: 253,
    TCOD_CHAR_BULLET_SQUARE: 254,
        /* diacritics */
};

/* dice roll */
export class TCOD_dice_t {
    constructor(...args){
        /** @type {int} */
        this.nb_rolls = args.shift();
        /** @type {int} */
        this.nb_faces = args.shift();
        /** @type {float} */
        this.multiplier = args.shift();
        /** @type {float} */
        this.addsub = args.shift();
    }
}

export class TCODHeightMap{

}

export class TCODConsole {

}

export class TCODLine {
    
}