import {
    defineEnum
} from "../other/Enums.js";


export const MenuResult = defineEnum("MenuResult", [{
    "MENUHIT": 1
}, {
    "NOMENUHIT": 2
}, {
    "KEYRESPOND": 4
}, {
    "DISMISS": 8
}]);