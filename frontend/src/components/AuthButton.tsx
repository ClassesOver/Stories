import {withRouter} from 'react-router-dom';
import AppContext from '../context'
import React, {useContext, useState, useEffect} from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import AvatarEditor from 'react-avatar-edit';
import { Button, TextField , InputAdornment, Icon} from '@material-ui/core';
import Drawer from './Drawer';
import * as api from '../api';
import { height } from '@material-ui/system';

interface IProfileProps {
    open: boolean;
    toggleOpen: (open: boolean) => void;
    title?:  string;
}
interface Image {

}
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    purple: {
        cursor: 'pointer',
        color: theme.palette.getContrastText(grey[600]),
        backgroundColor: grey[600],
    },
    large: {
        width: theme.spacing(18),
        height: theme.spacing(18),
    },
    avatarButtton: {
        borderRadius: '50%',
        padding: '0px',
        minWidth: '0px',
        width: 'auto',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        '&:focus' : {
            outline: 'none',
        }
    },
    signInButton: {
        backgroundColor: 'white',
        '&:hover' : {
            backgroundColor: '#dad7d7',
        }
    },
    profileDrawer: {
        width: '40vw',
        minWidth: '360px',
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(3),
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    profileDrawerActions: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
        paddingTop: theme.spacing(1),
        justifyContent: 'flex-end',
    }
  }),
);
type MODE = 'readonly' | 'edit'
const ProfileDrawer: React.FC<IProfileProps> = (props) => {
    const classes = useStyles();
    const [mode, setMode] = useState<MODE>('readonly');
    const [state, setState] = useState<{ [key: string]: any }>({});
    const [changes, setChanges] = useState<{ [key: string]: any } []>([]);
    const [avatarSrc, setAvatarSrc] = useState(null);
    const {authenticated, setAuthenticated} = useContext(AppContext);
    const fetchUser = async () => {
        let resp = await api.getUserInfo(false);
        var user = resp.data;
        setState(user);
        return user;
    }
    useEffect(() => {
        fetchUser();
    }, [props]);

    const onEdit = (event: React.MouseEvent<EventTarget>) => {
        event.stopPropagation();
        setMode('edit');
    }
    const startEdit = (event: React.MouseEvent<EventTarget>) => {
        event.stopPropagation();
        setMode('edit');
    }
    const onSave = async (event: React.MouseEvent<EventTarget>) => {
        event.stopPropagation();
        let finalChange = changes.slice(-1)[0] || {};
        await api.saveUser({values: {...finalChange, avatar_src: avatarSrc}});
        let user = await fetchUser();
        setAuthenticated({...authenticated, userInfo: {...authenticated.userInfo, ...user}});
        setMode('readonly');
    }
    const onCancel = (event: React.MouseEvent<EventTarget>) => {
        event.stopPropagation();
        setChanges([]);
        setMode('readonly');
    }
    const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        let lastChange = changes.slice(-1)[0] || {};
        let change = {...lastChange, email: event.target.value};
        changes.push(change);
        setChanges(changes);
        setState({...state, email: event.target.value});

    }
    const onPhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        let lastChange = changes.slice(-1)[0] || {};
        let change = { ...lastChange, phone: event.target.value }
        changes.push(change);
        setChanges(changes);
        setState({...state, phone: event.target.value});

    }
    const onGithubChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        let lastChange = changes.slice(-1)[0] || {};
        let change = { ...lastChange, github: event.target.value }
        changes.push(change);
        setChanges(changes);
        setState({...state, github: event.target.value});
    }
    const onAboutMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        let lastChange = changes.slice(-1)[0] || {};
        let change = { ...lastChange, about_me: event.target.value }
        changes.push(change);
        setChanges(changes);
        setState({...state, about_me: event.target.value});
    }
    const onCrop = (preview: any) => {
        setAvatarSrc(preview);
    }
    const onClose = () => {
        setAvatarSrc(null);
    }
    const onBeforeFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
        // todo 
    }
    return <Drawer title={props.title} anchor='right' open={props.open} toggleOpen={props.toggleOpen} >
        <div className={classes.profileDrawerActions}>
            {
                mode === 'readonly' ? <Button size="small" onClick={onEdit}>Edit</Button> :
                    <React.Fragment>
                        <Button size="small" onClick={onSave}>Save</Button>
                        <Button size="small" onClick={onCancel}>Cancel</Button>
                    </React.Fragment>
            }
        </div>
        <div className={classes.profileDrawer}>
            {mode !== 'readonly' ? <AvatarEditor width={220}
                height={220}
                onCrop={onCrop}
                onClose={onClose}
                onBeforeFileLoad={onBeforeFileLoad}
                
                src={state.avatar_src} /> : <Avatar alt={state.username} src={state && state._links && state._links.avatar} className={classes.large} />}
            <TextField fullWidth
                onClick={startEdit}
                disabled
                margin="normal" onChange={onEmailChange} value={state.email} size="small" id="input-email" label="Email" InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Icon className="fa fa-envelope icon" style={{ fontSize: 16 }} />
                        </InputAdornment>
                    ),
                }} />
            <TextField fullWidth
                onClick={startEdit}
                margin="normal" onChange={onPhoneChange} value={state.phone} size="small" id="input-phone" label="Phone" InputProps={{
                    readOnly: mode === 'readonly',
                    startAdornment: (
                        <InputAdornment position="start">
                            <Icon className="fa fa-phone icon" style={{ fontSize: 16 }} />
                        </InputAdornment>
                    ),
                }} />
            <TextField fullWidth
                onClick={startEdit}
                margin="normal" onChange={onGithubChange} value={state.github} size="small" id="input-github" label="Github" InputProps={{
                    readOnly: mode === 'readonly',
                    startAdornment: (
                        <InputAdornment position="start">
                            <Icon className="fa fa-github icon" style={{ fontSize: 16 }} />
                        </InputAdornment>
                    ),
                }} />
            <TextField fullWidth
                multiline
                onClick={startEdit}
                margin="normal" onChange={onAboutMeChange} value={state.about_me} size="small" id="input-about-me" label="About Me" InputProps={{
                    readOnly: mode === 'readonly',
                    startAdornment: (
                        <InputAdornment position="start">
                            <Icon className="fa fa-pencil-square-o icon" style={{ fontSize: 16 }} />
                        </InputAdornment>
                    ),
                }} />
        </div>
    </Drawer>
}
const AuthButton = withRouter(({history}) => {
    const classes = useStyles();
    const {authenticated, setAuthenticated, isAuthenticated} = useContext(AppContext);
    const [menusOpen, setMenusOpen] = React.useState(false);
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const handleClick: React.MouseEventHandler = (ev) => {
        ev.stopPropagation();
        history.push('/signin');
    }
    const username = authenticated.userInfo.username || '';
    const avatar = authenticated.userInfo._links && authenticated.userInfo._links.avatar;
    const anchorRef = React.useRef<HTMLButtonElement>(null);

    const handleToggle = () => {
        setMenusOpen((prevOpen) => !prevOpen);
    };


    function handleListKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Tab') {
            event.preventDefault();
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
            <ProfileDrawer title='Profile' open={drawerOpen} toggleOpen={(open: boolean) => setDrawerOpen(open)}/>
            <Button
                aria-controls={menusOpen ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                ref={anchorRef}
                className={classes.avatarButtton}
                onClick={handleToggle} >
                <Avatar
                     src={avatar} alt={username} className={classes.purple}>{username && username[0]}</Avatar>
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
                                    <MenuItem onClick={() => setDrawerOpen(true)}>Profile</MenuItem>
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
            <Button variant="outlined" className={classes.signInButton}  onClick={handleClick}>Sign in</Button>
        </div>

        
    );
});

export default AuthButton;


