import {
    Enum
} from "./other/Enums.js";

/**
 * @enum
 * @property {Enum} BUILD_NOMATERIAL
 */
export class BuildResult extends Enum {
    static BUILD_NOMATERIAL = -99999;
};
BuildResult.enumify();