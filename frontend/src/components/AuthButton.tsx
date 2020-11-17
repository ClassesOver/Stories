import {withRouter} from 'react-router-dom';
import AppContext from '../context'
import React, {useContext} from 'react';
import {LogInDialog} from './Dialog'
import Avatar from '@material-ui/core/Avatar';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { grey, blue } from '@material-ui/core/colors';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    purple: {
        '&:hover' : {
            border: '1px solid',
            borderColor: blue[100],
        },
        cursor: 'pointer',
        color: theme.palette.getContrastText(grey[600]),
        backgroundColor: grey[600],
        marginLeft: theme.spacing(2),
      },
  }),
);

const AuthButton = withRouter(({history}) => {
    const classes = useStyles();
    const {authenticated, setAuthenticated, isAuthenticated} = useContext(AppContext);
    const [open, setOpen] = React.useState(false);
    const handleClick: React.MouseEventHandler = (ev) => {
        ev.stopPropagation();
        setOpen(true);
    }
    const username = authenticated.userInfo.username || '';
    const avatar = authenticated.userInfo._links && authenticated.userInfo._links.avatar;
    const handleClose = () => {
        setOpen(false);
    };
    return isAuthenticated() ? (<div className={classes.root}>
            <Avatar variant="rounded" src={avatar} alt={username} className={classes.purple}>{username && username[0]}</Avatar>
        </div>) : (
        <div className='auth-login'>
            <LogInDialog open={open} onClose={handleClose} />
            <button  className="btn btn-secondary" onClick={handleClick} type="button">Sign in</button>
        </div>
    );
});

export default AuthButton;


