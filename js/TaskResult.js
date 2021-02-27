import {
    defineEnum
} from "./other/Enums.js";

export const TaskResult = defineEnum("TaskResult", [
    "TASKSUCCESS",
    "TASKFAILNONFATAL",
    "TASKFAILFATAL",
    "TASKCONTINUE",
    "TASKOWNDONE",
    "PATHEMPTY"
]);