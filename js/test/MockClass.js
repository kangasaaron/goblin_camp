export function Mock(cls) {
    let mock = class extends(cls) {}
    mock.__override__ = function __override__(functionName, callActualFunction, returnValue) {
        this.prototype[functionName] = function(...args) {
            if (!this.__calls__)
                this.__calls__ = {};
            if (!this.__calls__[functionName])
                this.__calls__[functionName] = [];

            let ret;
            if (callActualFunction)
                ret = cls.prototype[functionName].call(this, ...args);

            this.__calls__[functionName].push({
                time: Date.now(),
                returns: ret,
                args
            });
            if (returnValue !== undefined) {
                return returnValue;
            }
            return ret;
        }
    }

    Object.defineProperty(mock, 'name', {
        "writable": false,
        "configurable": false,
        "enumerable": false,
        "value": "Mock" + cls.name
    });

    return mock;
};