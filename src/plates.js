import _ from 'lodash'

const DEFAULT_OPTIONS = {
    alwaysPushRaw: false,
    onStackPush: () => {},
    onStackClear: () => {}
}

export class Plates {

    /**
     * Create the Plates class that creates a stack of values
     * @param data the first value to store
     * @param options
     */
    constructor(data, options) {
        this.setOptions(options);
        this.stack = [];
        this.stackPointer = 0;
        if (data) this.push(data);
    }

    /**
     * Set the options
     */
    setOptions(options) {
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    }

    /**
     * Update the options
     * @param options
     */
    updateOptions(options) {
        this.options = Object.assign({}, this.options, options);
    }

    /**
     * Move the stack pointer backwards
     */
    undo() {
        this.stackPointer = Math.max(0, this.stackPointer - 1);
    }

    /**
     * Move the stack pointer forwards
     */
    redo() {
        this.stackPointer = Math.min(this.stack.length, this.stackPointer + 1);
    }

    /**
     * Returns true if there is an undo available
     */
    hasUndo() {
        return this.stackPointer > 0;
    }

    /**
     * Returns true if there is a redo available
     */
    hasRedo() {
        return this.stackPointer < this.stack.length;
    }

    /**
     * Clears the stack
     */
    clear() {
        this.stack = [];
        this.stackPointer = 0;
        this.options.onStackClear();
    }

    /**
     * Go to the start of the stack
     */
    goToStart() {
        this.stackPointer = 0;
    }

    /**
     * Go to the end of the stack
     */
    goToEnd() {
        this.stackPointer = this.stack.length;
    }

    /**
     * Add an object to the stack
     * @param obj
     */
    push(obj) {
        obj = JSON.parse(JSON.stringify(obj));
        this.stack = this.stack.slice(0, this.stackPointer);
        let curr = this.get();
        let raw = new Data(obj);
        if (obj instanceof Object && curr instanceof Object && !this.options.alwaysPushRaw) {
            let diff = new Change(curr, obj);
            let sizeDiff = this._roughSizeOfObject(diff) - this._roughSizeOfObject(raw);
            sizeDiff > 0 ? this.stack.push(raw) : this.stack.push(diff);
        }
        else {
            this.stack.push(raw);
        }
        this.stackPointer++;
        this.options.onStackPush();
    }

    /**
     * Gets the current top of the stack
     * @returns {{}|null}
     */
    get() {
        let dataPointer = -1;
        for (let i = this.stackPointer - 1; i >= 0; i--) {
            if (this.stack[i] instanceof Data) {
                dataPointer = i;
                break;
            }
        }
        if (dataPointer < 0) {
            return null;
        }
        let obj = this.stack[dataPointer].get();
        for (let i = dataPointer; i < this.stackPointer - 1; i++) {
            obj = this.stack[i + 1].recoverObj(obj);
        }
        if (Object.keys(obj).some(key => /^\d+$/.test(key))) {
            obj = Object.keys(obj).map(key => obj[key]);
        }
        return obj;
    }

    /**
     * Calculates the approximate size of an object
     * @param object
     * @returns {number} the size in bytes
     */
    _roughSizeOfObject(object) {
        let objectList = [];
        let stack = [object];
        let bytes = 0;

        while (stack.length) {
            let value = stack.pop();
            if (typeof value === 'boolean') {
                bytes += 4;
            }
            else if (typeof value === 'string') {
                bytes += value.length * 2;
            }
            else if (typeof value === 'number') {
                bytes += 8;
            }
            else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
                objectList.push( value );
                for(let i in value) {
                    stack.push(value[i]);
                }
            }
        }
        return bytes;
    }
}

/**
 * Stores raw data as a class
 */
class Data {
    constructor(data) {
        this.data = data;
    }

    get() {
        return this.data;
    }
}

/**
 * Stores changes by marking the differences between two objects
 */
const MARKED_DELETE = '~$*MARKED FOR DELETION*$~'; // This unique string is treated as a deleted element
class Change {

    constructor(before, after) {
        this.differences = this.computeDifferences(before, after);
    }

    /**
     * Gets the differences between the two object parameters
     * @param obj1
     * @param obj2
     * @returns {{}} the differences object
     */
    computeDifferences(obj1, obj2) {
        const diff = {};

        function compareObjects(obj1, obj2, path = '') {
            for (const key in obj1) {
                const currentPath = path ? `${path}.${key}` : key;

                if (obj2.hasOwnProperty(key)) {
                    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                        compareObjects(obj1[key], obj2[key], currentPath);
                    } else if (obj1[key] !== obj2[key]) {
                        diff[currentPath] = obj2[key];
                    }
                } else {
                    diff[currentPath] = MARKED_DELETE;
                }
            }

            for (const key in obj2) {
                const currentPath = path ? `${path}.${key}` : key;

                if (!obj1.hasOwnProperty(key) && !diff.hasOwnProperty(currentPath)) {
                    diff[currentPath] = obj2[key];
                }
            }
        }

        compareObjects(obj1, obj2);
        return diff;
    }

    /**
     * Recovers the after object given the before object and the differences
     * @param obj the differences
     * @returns {{}} the after object
     */
    recoverObj(obj) {
        let diff = this.differences;
        const recoveredObj = {};

        function traverseObject(obj, path = '') {
            for (const key in obj) {
                const currentPath = path ? `${path}.${key}` : key;

                if (diff.hasOwnProperty(currentPath)) {
                    const diffValue = diff[currentPath];
                    if (diffValue === null || diffValue === undefined) {
                        recoveredObj[key] = diffValue;
                        continue;
                    }
                    if (diffValue === MARKED_DELETE) continue;

                    if (typeof diffValue === 'object') {
                        recoveredObj[key] = traverseObject(obj[key], currentPath);
                    } else {
                        recoveredObj[key] = diffValue;
                    }
                } else {
                    recoveredObj[key] = obj[key];
                }
            }

            for (const key in diff) {
                if (!obj.hasOwnProperty(key)) {
                    _.set(recoveredObj, key, _.get(diff, key));
                }
            }

            return recoveredObj;
        }

        return traverseObject(obj);
    }

    /**
     * Returns the differences object
     * @returns {*}
     */
    get() {
        return this.differences;
    }
}
