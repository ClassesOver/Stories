import Cookies from 'js-cookie';

export const setCookie = (name: string, value: string) => {
    return Cookies.set(name, value);
}

export const getCookie = (name: string) => {
    return Cookies.get(name);
}

export const removeCookie = (name: string) => {
    return Cookies.remove(name);
}

export class Queue extends Array {
    enqueue(val: any) {
        this.push(val);
    }

    dequeue() {
        return this.shift();
    }

    peek() {
        return this[0];
    }

    isEmpty() {
        return this.length === 0;
    }
}

export class DropPrevious {
    private currentDef: any;

    constructor () {
        this.currentDef = false;
    }

    add (promise: Promise<any>) {
        if (this.currentDef) {
            this.currentDef.reject();
        }
        let rejection;
        let res = new Promise(function (resolve, reject) {
            rejection = reject;
            promise.then(resolve).catch(function (reason) {
                reject(reason);
            });
        });

        this.currentDef = res;
        this.currentDef.reject = rejection;
        return res;
    }
}

export const delayValue = (value:any, delay: number = 500) => {
    let _f = (value: any) => { return new Promise((resolve, reject) => {
        setTimeout(() => resolve(value), delay)
    })}
    return _f(value);
}


export class Mutex {
    private lock: any;
    private queueSize: number;
    private unlockedProm: any;
    private _unlock: any;
    constructor() {
        this.lock = Promise.resolve();
        this.queueSize = 0;
        this.unlockedProm = undefined;
        this._unlock = undefined;
    }
    exec(action: () =>void) {
        let self = this;
        let currentLock = this.lock;
        let result: any;
        this.queueSize++;
        this.unlockedProm = this.unlockedProm || new Promise(function (resolve) {
            self._unlock = resolve;
        });
        this.lock = new Promise<void>(function (unlockCurrent) {
            currentLock.then(function () {
                result = action();
                var always = function (returnedResult: any) {
                    unlockCurrent();
                    self.queueSize--;
                    if (self.queueSize === 0) {
                        self.unlockedProm = undefined;
                        self._unlock();
                    }
                    return returnedResult;
                };
                Promise.resolve(result).then(always);
            });
        });
        return this.lock.then(function () {
            return result;
        });
    }
    getUnlockedDeffunction () {
        return this.unlockedProm || Promise.resolve();
    }
};




