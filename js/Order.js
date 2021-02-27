import {
    defineEnum
} from "./other/Enums.js";

export const Order = defineEnum("Order", [
    'NOORDER',
    'GUARD',
    'PATROL',
    'FOLLOW'
]);