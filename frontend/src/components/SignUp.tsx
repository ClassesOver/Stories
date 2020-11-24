import { CodeBlock } from "react-code-blocks";
import React, { useEffect, useRef, useState } from "react";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import * as api from '../api';
import { Button } from "@material-ui/core";
interface ISignUpProps {

}
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
  }),
);
const SignUp: React.FC<ISignUpProps> = (props) => {
   const classes = useStyles();
    return <div className="layout"></div>
}
export default SignUp;