const possibleKinds = ['key+value', 'value'];

export function makeSetIterator(set, kind) {
    let nextIndex = 0;
    let end = set.size;
    let iterationCount = 0;
    let entries = Array.from(set);

    const setIterator = {
        next: function() {
            let result = { done: false };
            value = entries[nextIndex];

            if (kind === "value")
                result.value = value;
            else if (kind === "key+value")
                result.value = [set.keyOf(nextIndex), value];
            if (nextIndex < end - 1) {
                nextIndex++;
                return result;
            }

            result = result.done = true;
            return result;
        }
    };
    return setIterator;
}