import {
    Enum
} from "../cplusplus/Enums.js";

/**
 * @enum
 */
export class JobCompletion extends Enum {
    static FAILURE;
    static SUCCESS;
    static ONGOING
}
JobCompletion.enumify();