import {
    Enum
} from "./cplusplus/Enums.js";

export class SpriteType extends Enum {
    static SPRITE_Single = 0x0;
    static SPRITE_Animated = 0x1;
    static SPRITE_SimpleConnectionMap = 0x2;
    /**
     * Two layered contains Simple
     */
    static SPRITE_TwoLayerConnectionMap = 0x6;
    static SPRITE_NormalConnectionMap = 0x8;
    /**
     * Extended constains Normal
     */
    static SPRITE_ExtendedConnectionMap = 0x18;
    /**
     * Connection Map encompasses all variants
     */
    static SPRITE_ConnectionMap = 0x1e;
}
SpriteType.enumify();