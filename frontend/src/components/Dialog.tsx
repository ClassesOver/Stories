import React, {useEffect, useContext, useState} from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Icon from '@material-ui/core/Icon';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import AppContext from '../context';
import {logIn} from  '../api';
import {setCookie} from "../utils";
interface ILogInProps {
    open: boolean;
    onClose: React.MouseEventHandler<HTMLButtonElement | {}>;
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

export const LogInDialog = (props: ILogInProps) => {
    const classes = useStyles();
    const [values, setValues] = useState<ILoginState>({
        username: '',
        password: '',
        showPassword: false,
        disabled: true
      });
    const {authenticated, setAuthenticated} = useContext(AppContext);
    const {open, onClose} = props;
    const handleChange = (prop: keyof ILoginState) => (event: React.ChangeEvent<HTMLInputElement>) => {
        let disabled = (values.password.length == 0 || values.password.length == 0)
        console.log(event.target.value)
        setValues({ ...values, [prop]: event.target.value, disabled});
    };
    useEffect(() => {validate()},[values]);
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
        let {username, password} = values;
        let e = event;
        return logIn(username, password).then((value) => {
            let {message, user} = value.data;
            if (user.access_token) {
                setCookie('access_token', user.access_token)
                setAuthenticated({
                    ...authenticated,
                    userId: user.id,
                    accessToken: user.access_token,
                    userInfo: user || {},
                });
                onClose(e)
            }
        });
    }
    return (<Dialog  open={open} onClose={onClose} aria-labelledby="form-dialog-title">
            <DialogTitle className="tm-dialog-title" id="form-dialog-title">Subscribe</DialogTitle>
            <DialogContent>
                <form className={classes.root}  autoComplete="off">
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
                                    <Icon className="fa fa-user" style={{fontSize: 16}}/>
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
                        required
                        type={values.showPassword ? 'text' : 'password'}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Icon className="fa fa-key" style={{fontSize: 16}}/>
                                </InputAdornment>
                            ),
                            endAdornment:( <InputAdornment position="end">
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
            </DialogContent>
            <DialogActions>
                <Button disabled={values.disabled} onClick={handleSubmit} variant="contained" disableElevation>
                    Sign In
                </Button>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
    </Dialog>)
};
