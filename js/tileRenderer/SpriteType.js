import {
    defineEnum
} from "./other/Enums.js";

export const SpriteType = defineEnum("SpriteType", [{
        SPRITE_Single: 0x0
    },
    {
        SPRITE_Animated: 0x1
    },
    {
        SPRITE_SimpleConnectionMap: 0x2
    },
    /**
     * Two layered contains Simple
     */
    {
        SPRITE_TwoLayerConnectionMap: 0x6
    },
    {
        SPRITE_NormalConnectionMap: 0x8
    },
    /**
     * Extended constains Normal
     */
    {
        SPRITE_ExtendedConnectionMap: 0x18
    },
    /**
     * Connection Map encompasses all variants
     */
    {
        SPRITE_ConnectionMap: 0x1E
    }
]);