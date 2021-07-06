import {
  Enumify
} from '../cplusplus/Enums.js'
/**
 * @constant
 * @type {Enum}
 * @enum {TaskResult}
 */
export const TaskResult = {
  TASKSUCCESS: null,
  TASKFAILNONFATAL: null,
  TASKFAILFATAL: null,
  TASKCONTINUE: null,
  TASKOWNDONE: null,
  PATHEMPTY: null
}
Enumify(TaskResult)
