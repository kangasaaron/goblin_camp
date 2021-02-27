import {
    defineEnum
} from "./other/Enums.js";

export const JobPriority = defineEnum('JobPriority', [
    "VERYHIGH",
    "HIGH",
    "MED",
    "LOW",
    "PRIORITY_COUNT"
]);