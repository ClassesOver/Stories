import {withRouter} from 'react-router-dom';
import AppContext from '../context'
import React, {useContext} from 'react';
import {LogInDialog} from './Dialog'
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { grey, blue } from '@material-ui/core/colors';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { Button } from '@material-ui/core';
import * as api from '../api';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    btn: {
        padding: '0px',
        minWidth: '0px',
        width: 'auto',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
    },
    purple: {
        cursor: 'pointer',
        color: theme.palette.getContrastText(grey[600]),
        backgroundColor: grey[600],
      },
  }),
);
const AuthButton = withRouter(({history}) => {
    const classes = useStyles();
    const {authenticated, setAuthenticated, isAuthenticated} = useContext(AppContext);
    const [open, setOpen] = React.useState(false);
    const [menusOpen, setMenusOpen] = React.useState(false);
    const handleClick: React.MouseEventHandler = (ev) => {
        ev.stopPropagation();
        setOpen(true);
    }
    const username = authenticated.userInfo.username || '';
    const avatar = authenticated.userInfo._links && authenticated.userInfo._links.avatar;
    const handleClose = () => {
        setOpen(false);
    };
    const anchorRef = React.useRef<HTMLButtonElement>(null);

    const handleToggle = () => {
        setMenusOpen((prevOpen) => !prevOpen);
    };


     function handleListKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Tab') {
        event.preventDefault();
        setOpen(false);
        }
    }

    const prevOpen = React.useRef(menusOpen);
    React.useEffect(() => {
        if (prevOpen.current === true && menusOpen === false) {
            anchorRef.current!.focus();
        }

        prevOpen.current = menusOpen;
    }, [menusOpen]);
    const handleMenusClose = (event: React.MouseEvent<EventTarget>) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }

        setMenusOpen(false);
    };
    const handleLogOut = async (event: React.MouseEvent<EventTarget>) => {
        await api.logOut();
        setMenusOpen(false);
        setAuthenticated({ initUser: false, userId: false, accessToken: false, userInfo: { id: false } });
        history.push('/');
    }
    return isAuthenticated() ? (<div className={classes.root}>
        <div>
            <Button
                aria-controls={menusOpen ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                ref={anchorRef}
                onClick={handleToggle} className={classes.btn} >
                <Avatar
                    variant="rounded" src={avatar} alt={username} className={classes.purple}>{username && username[0]}</Avatar>
            </Button>
            <Popper open={menusOpen} anchorEl={anchorRef.current} placement='bottom' role={undefined} transition disablePortal>
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleMenusClose}>
                                <MenuList autoFocusItem={menusOpen} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                    <MenuItem onClick={handleMenusClose}>Profile</MenuItem>
                                    <MenuItem onClick={handleMenusClose}>My account</MenuItem>
                                    <MenuItem onClick={handleLogOut}>Logout</MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </div>
    </div>) : (
        <div className='auth-login'>
            <LogInDialog open={open} onClose={handleClose} />
            <button  className="btn btn-secondary" onClick={handleClick} type="button">Sign in</button>
        </div>

        
    );
});

export default AuthButton;


