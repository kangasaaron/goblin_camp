import {
    Enum
} from "./other/enums.js";
/**
 * @constant
 * @type {Enum}
 * @enum {TaskResult}
 */
export class TaskResult extends Enum {
    static TASKSUCCESS;
    static TASKFAILNONFATAL;
    static TASKFAILFATAL;
    static TASKCONTINUE;
    static TASKOWNDONE;
    static PATHEMPTY;
}
TaskResult.enumify();