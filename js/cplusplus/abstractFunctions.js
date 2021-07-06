export const addStaticAbstractFunction = function addStaticAbstractFunction(klass, functionName) {
    addAbstractFunctionToObject(klass, functionName);
};

export const addAbstractFunction = function addAbstractFunction(klass, functionName) {
    addAbstractFunctionToObject(klass.prototype, functionName);
};

const addAbstractFunctionToObject = function addAbstractFunctionToObject(klass, functionName) {
    Object.defineProperty(klass, functionName, {
        writable: false,
        enumerable: false,
        configurable: true,
        value: (() => {
            throw new ReferenceError(`abstract function ${klass.name}.${functionName} called`);
        }).bind(klass)
    })
}