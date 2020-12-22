import React, {useState, useEffect } from 'react';
import { AppLayout, Nav, SignUp, SignIn } from './components';
import AppContext from './context';
import { getUserInfo } from './api'
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastProvider, useToasts } from 'react-toast-notifications';
import { queue } from './api';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import 'animate.css';
import { ThemeProvider } from '@material-ui/styles';
import socketio from 'socket.io-client';
import { setBlockUiCallback } from "./blocking";
import {
    HashRouter as Router,
    Switch,
    Redirect,
    Route,
} from 'react-router-dom';
import { IAuthenticated } from './interface';
import { createMuiTheme } from '@material-ui/core/styles';
interface IState extends IAuthenticated {

    [key: string]: any;
}
const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#612c2c',
          },
    },
});
let errorMessageWorker: any = null;
let ENDPOINT: any = `http://${document.domain}`;
let interval: any;
function App() {
    const [authenticated, setAuthenticated] = useState<IState>({ initUser: false, userId: false, accessToken: false, userInfo: { id: false } });
    const [userLoaded, setUserLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [socket, setSocket] = useState<socketio.Socket>();
    const [block, setBlock] = useState(false);
    const getUser = async () => {
        getUserInfo().then((value) => {
            let data = value.data;
            setAuthenticated({ ...authenticated, initUser: true, userId: data.id, accessToken: data.access_token, userInfo: data });
        }).catch(error => {
            setAuthenticated({ ...authenticated, initUser: true, userId: false, accessToken: false, userInfo: { id: false } });
        });

    }

    const isAuthenticated = () => {
        return !!authenticated.userId;
    }
    useEffect(() => {
        if (!authenticated.initUser) {
            getUser();
        }
    }, []);
    useEffect(() => {
        let cb = (value: boolean) => {
            setBlock(value);
        };
        setBlockUiCallback(cb);
    }, []);
    useEffect(() => {
        if (authenticated.initUser) {
            setUserLoaded(true);
        }
        if  (interval) {
            clearInterval(interval);
        }
        if (!!authenticated.userId) {
            let _socket = socketio.io({transports:['websocket', 'polling'],});
            interval = setInterval(() => {
                _socket.emit('messages_unread_count', {});
                _socket.emit('notification_count', {});
            }, 1500);
            setSocket(_socket);
        }
    }, [authenticated]);
    let state = {
        authenticated,
        setAuthenticated,
        isAuthenticated,
        socket,
        block,
        setBlock,
    }
    if (errorMessageWorker) {
        clearInterval(errorMessageWorker)
    }
    errorMessageWorker = setInterval(() => {
        if (!queue.isEmpty()) {
            setErrorMessage(queue.dequeue());
        }
    }, 500);

    return (userLoaded ?
        <AppContext.Provider value={state}>
            <ThemeProvider theme={theme}>
                <BlockUi blocking={block} className="tm-block-ui">
                    <ToastProvider placement="bottom-left">
                        <Router>
                            <Nav />
                            <Switch>
                                <Route exact path="/">
                                    <Redirect
                                        to={{
                                            pathname: "/expore"
                                        }}
                                    />
                                </Route>
                                <Route path="/expore" component={AppLayout} />
                                <Route path="/signup" exact component={SignUp} />
                                <Route path="/signin" exact component={SignIn} />
                                <Route path="*">
                                    <div />
                                </Route>
                            </Switch>
                        </Router>
                        <PopMessage message={errorMessage} />
                    </ToastProvider>
                </BlockUi>
            </ThemeProvider>
        </AppContext.Provider> : <div />
    );
}

interface IPopMessageProps {
    message: any;
}
export const PopMessage: React.FC<IPopMessageProps> = (props) => {
    const { addToast } = useToasts();
    useEffect(() => {
        if (props.message) {
            addToast(props.message, {
                appearance: 'error',
                autoDismiss: true,
            });
        }
    }, [props.message])
    return <></>
}

export default App;
