import {
    defineEnum
} from "./other/enums.js";

export const StatusEffectType = defineEnum("StatusEffectType", [
    'HUNGER',
    'THIRST',
    'PANIC',
    'CONCUSSION',
    'DROWSY',
    'SLEEPING',
    'POISON',
    'BLEEDING',
    'FLYING',
    'BADSLEEP',
    'RAGE',
    'SWIM',
    'EATING',
    'DRINKING',
    'CARRYING',
    'WORKING',
    'BURNING',
    'CRACKEDSKULLEFFECT',
    'INVIGORATED',
    'DRUNK',
    'HEALING',
    'HELPLESS',
    'HIGHGROUND',
    'TRIPPED',
    'BRAVE',
    'COLLYWOBBLES',
    'DROOPS',
    'RATTLES',
    'CHILLS',
    'STATUS_EFFECT_COUNT'
]);