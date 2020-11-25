import React, { useEffect, useContext, useState } from "react";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import * as api from '../api';
import { useToasts } from 'react-toast-notifications';
import BarLoader from "react-spinners/BarLoader";
import { useHistory } from 'react-router-dom';
import AppContext from '../context';
import { Button, Grid, InputAdornment, Icon, TextField, IconButton } from "@material-ui/core";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { string } from "prop-types";
interface ISignUpProps {

}
interface ISignUpState {
    username: string;
    password: string;
    confirm: string;
    email: string;
    verification_code: string,
}
interface IError {
    email: string;
    confirm: string;
    password: string;
    verification_code: string;
}
type IErrorKey = keyof IError;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        sendButton: {
            textTransform: 'none',
        },
        margin: {
            margin: theme.spacing(1),
        },
        withoutLabel: {
            marginTop: theme.spacing(3),
        },
    }),
);

const SignUp: React.FC<ISignUpProps> = (props) => {
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [seconds, setSeconds] = useState(60);
    const [errors, setErrors] = useState<IError>({
        email: '', password: '', confirm: '',
        verification_code: '',
    });
    const history = useHistory()
    const { addToast } = useToasts();
    const classes = useStyles();
    let timer: NodeJS.Timer;
    const isEmailValid = () => {
        let reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
        if (values.email.length > 0 && reg.test(values.email)) {
            return true;
        } else {
            setErrors({ ...errors, email: 'Please enter a valid email address.' });
            return false;
        }
    }
    const isConfirmValid = () => {
        if (values.password != values.confirm) {
            setErrors({ ...errors, confirm: 'The two passwords are inconsistent.' });
            return false;
        } else {
            return true;
        }
    }
    const isValid = () => {
        return isConfirmValid() && isEmailValid();
    }
    const onSend = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!isEmailValid()) {
            return;
        }
        event.stopPropagation();
        setDisabled(true);
        let seconds = 60;
        if (timer) {
            clearInterval(timer)
        }
        timer = setInterval(() => {
            seconds = seconds - 1;
            if (seconds >= 0) {
                setSeconds(seconds);
            } else {
                setDisabled(false);
                setSeconds(60);
            }
        }, 1000);
        try {
            let resp = await api.sendVerificationCode({ ...values, vtype: 'signup' });
            let { error } = resp.data;
            setErrors({ ...errors, ...error });
        } catch (e) {

        }
    }
    const [values, setValues] = useState<ISignUpState>({
        username: '',
        password: '',
        confirm: '',
        email: '',
        verification_code: ''
    });

    const handleKeyUp = async (event: React.KeyboardEvent<EventTarget>) => {
        event.stopPropagation();
        if (event.key === 'Enter') {
            if (!isValid()) {
                return;
            }
            setLoading(true);
            try {
                let resp = await api.signUp(values);
                let { error, user } = resp.data;
                setErrors({ ...error, ...error });
                if (user) {
                    addToast(`${values.username} user registered successfully.`, {
                        appearance: 'success',
                        autoDismiss: true,
                    });
                    history.push('/signin');
                }
            } catch (e) {

            }
            setLoading(false);
        }
    }
    const hasError = (key: IErrorKey) => {
        return !!errors[key];
    }
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!isValid()) {
            return;
        }
        setLoading(true);
        try {
            let resp = await api.signUp(values);
            let { error, user } = resp.data;
            setErrors({ ...errors, ...error });
            if (user) {
                addToast(`${values.username} user registered successfully.`, {
                    appearance: 'success',
                    autoDismiss: true,
                });
                history.push('/signin');
            }
        } catch (e) {

        }
        setLoading(false);
    }

    const handleChange = (prop: keyof ISignUpState) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setErrors({ ...errors, [prop]: '' });
        setValues({ ...values, [prop]: event.target.value});
    };
    useEffect(() => {
        let flag = !(values.password.length > 0 &&
            values.verification_code.length > 0  &&
            values.email.length > 0  &&
            values.confirm.length > 0  &&
            values.username.length > 0);
        setSubmitDisabled(flag);
    }, [values]);
    return <div className="layout">
        <div className="tm-signup">
            <form className={classes.root} autoComplete="off">
                <TextField
                    fullWidth
                    error={hasError('email')}
                    className={classes.margin}
                    id="tm-signup-email"
                    label="Email"
                    onChange={handleChange('email')}
                    helperText={errors.email}
                    required
                    type='text'
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Icon className="fa fa-envelope" style={{ fontSize: 16 }} />
                            </InputAdornment>
                        )
                    }}
                />
                <TextField
                    fullWidth
                    className={classes.margin}
                    id="tm-signup-username"
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
                <div>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item>
                            <TextField
                                fullWidth
                                className={classes.margin}
                                id="tm-vcode"
                                label="Verification code"
                                error={hasError('verification_code')}
                                helperText={errors.verification_code}
                                onChange={handleChange('verification_code')}
                                required
                                type='text'
                                InputProps={{
                                    startAdornment: (<div />),
                                }}
                            />
                        </Grid>
                        <Grid item>
                            <div style={{ paddingTop: '15px' }}>
                                <Button className={classes.sendButton} color="primary" disabled={disabled} onClick={onSend} size="small" >
                                    {
                                        disabled ? `${seconds} s` : 'Send'
                                    }
                                </Button>
                            </div>
                        </Grid>
                    </Grid>
                </div>
                <TextField
                    fullWidth
                    className={classes.margin}
                    id="tm-signup-password"
                    label="Password"
                    onChange={handleChange('password')}
                    required
                    type='password'
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Icon className="fa fa-key" style={{ fontSize: 16 }} />
                            </InputAdornment>
                        )
                    }}
                />
                <TextField
                    fullWidth
                    className={classes.margin}
                    id="tm-confirm-password"
                    label="Confirm"
                    onChange={handleChange('confirm')}
                    error={hasError('confirm')}
                    helperText={errors.confirm}
                    onKeyUp={handleKeyUp}
                    required
                    type='password'
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Icon className="fa fa-key" style={{ fontSize: 16 }} />
                            </InputAdornment>
                        )
                    }}
                />
            </form>
            {loading
                ? <div className="tm-sign-actions" >
                    <BarLoader color={"#612c2c"} loading={loading} />
                </div>
                :
                <div className="tm-signup-actions">
                    <Button disabled={submitDisabled} onClick={handleSubmit} variant="contained" disableElevation>
                        Sign Up
                    </Button>
                </div>
            }
        </div>
    </div>
}
export default SignUp;