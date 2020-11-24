import { CodeBlock } from "react-code-blocks";
import React, { useEffect, useRef, useState } from "react";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import * as api from '../api';
import { Button } from "@material-ui/core";
interface ISignupButton {

}
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            color: '#e4dfdf',
        },
    }),
);

const SignupButton: React.FC<ISignupButton> = (props) => {
    const classes = useStyles();
    const history = useHistory();
    const onClick = (event: React.MouseEvent<EventTarget>) => {
        event.stopPropagation();
        history.push('/signup');
    }
    return <Button onClick={onClick} className={classes.root}>Sign Up</Button>
}
export default SignupButton;