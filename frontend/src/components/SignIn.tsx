
import React, { useEffect, useState, useContext } from "react";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import * as api from '../api';
import { Button } from "@material-ui/core";
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Icon from '@material-ui/core/Icon';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import AppContext from '../context';
import { logIn } from '../api';
import { setCookie } from "../utils";
import { useToasts } from 'react-toast-notifications';
import BarLoader from "react-spinners/BarLoader";
import {useHistory} from 'react-router-dom';
interface ISignInProps {

}


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        margin: {
            margin: theme.spacing(1),
        },
        withoutLabel: {
            marginTop: theme.spacing(3),
        },
    }),
);

interface ILoginState {
    username: string;
    password: string;
    showPassword: boolean;
    disabled: boolean;
}
const SignIn: React.FC<ISignInProps> = () => {
    const history = useHistory();
    const [values, setValues] = useState<ILoginState>({
        username: '',
        password: '',
        showPassword: false,
        disabled: true
    });
    const { authenticated, setAuthenticated } = useContext(AppContext);
    const [logIning, setLogIning] = useState(false);
    const { addToast } = useToasts();
    const handleChange = (prop: keyof ILoginState) => (event: React.ChangeEvent<HTMLInputElement>) => {
        let disabled = (values.password.length == 0 || values.password.length == 0)
        setValues({ ...values, [prop]: event.target.value, disabled });
    };
    useEffect(() => { validate() }, [values]);
    const validate = () => {
        if (values.username.length === 0) {

        }
        if (values.password.length === 0) {

        }
    }
    const handleClickShowPassword = () => {
        setValues({ ...values, showPassword: !values.showPassword });
    };
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };


    const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
        let { username, password } = values;
        let e = event;
        setLogIning(true);
        return logIn(username, password).then((value) => {
            setLogIning(false);
            let { message, user } = value.data;
            if (user && user.access_token) {
                setCookie('access_token', user.access_token)
                setAuthenticated({
                    ...authenticated,
                    userId: user.id,
                    accessToken: user.access_token,
                    userInfo: user || {},
                });
                addToast(message, {
                    appearance: 'success',
                    autoDismiss: true,
                });
                history.push('/');
            } else {
                addToast(message, {
                    appearance: 'warning',
                    autoDismiss: true,
                });
                history.push('/');
            }
        });
    }
    const handleKeyUp = (event: React.KeyboardEvent<EventTarget>) => {
        if (event.key === 'Enter') {
            let { username, password } = values;
            let e = event;
            setLogIning(true);
            return logIn(username, password).then((value) => {
                setLogIning(false);
                let { message, user } = value.data;
                if (user && user.access_token) {
                    setCookie('access_token', user.access_token)
                    setAuthenticated({
                        ...authenticated,
                        userId: user.id,
                        accessToken: user.access_token,
                        userInfo: user || {},
                    });
                    addToast(message, {
                        appearance: 'success',
                        autoDismiss: true,
                    });
                } else {
                    addToast(message, {
                        appearance: 'warning',
                        autoDismiss: true,
                    });
                }
            });
        }
    }
    const onCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        history.go(-1);
    }
    const classes = useStyles();
    return <div className="layout">
        <div className="tm-signin">
            <form className={classes.root} autoComplete="off">
                <TextField
                    fullWidth
                    className={classes.margin}
                    id="tm-login-username"
                    label="Username"
                    required
                    type="text"
                    onChange={handleChange('username')}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Icon className="fa fa-user" style={{ fontSize: 16 }} />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    fullWidth
                    className={classes.margin}
                    id="tm-login-password"
                    label="Password"
                    onChange={handleChange('password')}
                    onKeyUp={handleKeyUp}
                    required
                    type={values.showPassword ? 'text' : 'password'}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Icon className="fa fa-key" style={{ fontSize: 16 }} />
                            </InputAdornment>
                        ),
                        endAdornment: (<InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                            >
                                {values.showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        </InputAdornment>),
                    }}
                />
            </form>
            {logIning
                ? <div className="tm-signin-actions" >
                    <BarLoader color={"#612c2c"} loading={logIning} />
                </div>
                :
                <div className="tm-signin-actions">
                    <Button disabled={values.disabled} onClick={handleSubmit} variant="contained" disableElevation>
                        Sign In
                    </Button>
                    <Button onClick={onCancel} >Cancel</Button>
                </div>
            }
        </div>
    </div>
}
export default SignIn;