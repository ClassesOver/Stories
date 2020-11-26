import React from 'react';
import {IAuthenticated} from "./interface";



export default React.createContext<{ [key : string]: any}>({
    authenticated: {
        userId: false,
        accessToken: false,
        userInfo: {id: false},
        initUser: false,
    },
    setAuthenticated: (_: boolean) => {},
    isAuthenticated: () => {return false}
});