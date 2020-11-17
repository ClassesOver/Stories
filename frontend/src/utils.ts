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



