import {
    Enumify
} from "../cplusplus/Enums.js";

/**
 * @enum
 */
export const MenuResult = {
    MENUHIT: 1,
    NOMENUHIT: 2,
    KEYRESPOND: 4,
    DISMISS: 8,
}
Enumify(MenuResult);
