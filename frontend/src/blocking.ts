import React from 'react';
export class Loading {


    private count: number;
    private blockUi: boolean;
    private longRunningTimer: any;
    private blockUiCallback: (_: boolean) => any;

    constructor() {
        this.count = 0;
        this.blockUi = false;
        this.blockUiCallback = (_: boolean) => {};
    }
    setBlockUiCallback (cb : (_: boolean) => any) {
        this.blockUiCallback = cb;
    }
    onEvent = (increment: number) => {
        if (!this.count && increment === 1) {

            this.longRunningTimer = setTimeout(() => {
                this.blockUi = true;
                this.blockUiCallback(true);
            }, 3000);
        }

        this.count += increment;
        if (this.count > 0) {
            console.log(`Loading ${this.count}`)
        } else {
            this.count = 0;
            clearTimeout(this.longRunningTimer);
            if (this.blockUi) {
                this.blockUi = false;
                this.blockUiCallback(false);
            }
        }
    }
    requestCall () {
        this.onEvent(1)
    }
    responseCall() {
        this.onEvent(-1)
    }
}
const loading =  new Loading()
export const requestCall = () => {
    loading.requestCall()
}
export const responseCall = () => {
    loading.responseCall()
}

export const responseCallError = () => {
    loading.responseCall()
}

export const setBlockUiCallback = (cb: (_: boolean) => any) => {
    loading.setBlockUiCallback(cb)
}
