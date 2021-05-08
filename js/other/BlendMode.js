import { Enum } from "./Enums.js";

export class BlendMode extends Enum {
    static BKGND_NONE; // the cell's background color is not modified.
    static BKGND_SET; // the cell's background color is replaced by the console's default background color : newbk = curbk.
    static BKGND_MULTIPLY; // the cell's background color is multiplied by the console's default background color : newbk = oldbk * curbk
    static BKGND_LIGHTEN; // newbk = MAX(oldbk,curbk)
    static BKGND_DARKEN; // newbk = MIN(oldbk,curbk)
    static BKGND_SCREEN; // newbk = white - (white - oldbk) * (white - curbk) // inverse of multiply : (1-newbk) = (1-oldbk)*(1-curbk)
    static BKGND_COLOR_DODGE; // newbk = curbk / (white - oldbk)
    static BKGND_COLOR_BURN; // newbk = white - (white - oldbk) / curbk
    static BKGND_ADD; // newbk = oldbk + curbk
    static BKGND_ADDALPHA; //alpha) : newbk = oldbk + alpha*curbk
    static BKGND_BURN; // newbk = oldbk + curbk - white
    static BKGND_OVERLAY; // newbk = curbk.x <= 0.5 ? 2*curbk*oldbk : white - 2*(white-curbk)*(white-oldbk)
    static BKGND_ALPHA; //alpha) : newbk = (1.0f-alpha)*oldbk + alpha*(curbk-oldbk)
    static BKGND_DEFAULT; // use the console's default background flag
    //Note that BKGND_ALPHA and BKGND_ADDALPHA are MACROS that needs a float parameter between (0.0 and 1.0). 
    //BKGND_ALPH and BKGND_ADDA should not be used directly (else they will have the same effect as BKGND_NONE).
}
BlendMode.enumify();
