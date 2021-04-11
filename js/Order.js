import {
    Enum
} from "./other/enums.js";
/**
 * @enum
 */
export class Order extends Enum {
    static NOORDER;
    static GUARD;
    static PATROL;
    static FOLLOW;
}
Order.enumify();