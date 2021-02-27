import {
    defineEnum
} from "./other/Enums.js";

export const JobCompletion = defineEnum("JobCompletion", [
    "FAILURE",
    "SUCCESS",
    "ONGOING"
]);