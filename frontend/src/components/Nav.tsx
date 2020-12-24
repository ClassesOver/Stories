import React, { useContext, useState , useEffect} from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import Search from './Search';
import AuthButton from './AuthButton';
import SignupButton from './SignUpButton';
import AppContext from '../context';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MessageIcon from '@material-ui/icons/Message';
import CloseIcon from '@material-ui/icons/Close';
import { IconButton } from '@material-ui/core';
import Drawer from './Drawer';
import * as api from '../api';
import Moment from 'react-moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import DraftsIcon from '@material-ui/icons/Drafts';

interface IMessagesDrawerProps {
    open: boolean;
    toggleOpen: (open: boolean) => void;
    title?:  string;
}
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            '& > *': {
                margin: theme.spacing(1),
            },
        },
        messagesDrawer: {
            width: '32vw',
            minWidth: '320px',
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(3),
            flexDirection: 'column',
            justifyContent: 'flex-start',
            '& > div': {
                width : '100%',
            }
        },
        messages: {
            fontSize: '0.13rem',
            width: '100%',
            listStyle: 'none',
            margin: '0px',
            padding: '0px',
            fontFamily: "'Monospaced Number', 'Chinese Quote', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;",
        },
        messageTitle: {
            display: 'flex',
            flexFlow: 'row nowrap',
            alignItems: 'center',
            paddingBottom: theme.spacing(1),
            '& > .left': {
                flex: 1,
                textTransform: 'capitalize',
                fontWeight: 'bold'
            },
            '& .time' : {
                marginRight: '5px',
                color: 'rgba(0, 0, 0, 0.54)',
            },
            '& .close' : {
               
            },
            '& .mtype': {
                marginLeft: '5px',
            }
        },
        messageBody: {
            padding: '5px'
        },
        message: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            borderBottom: '1px solid  lightgray',
            padding: '15px 10px',
            paddingRight: '36px',
            margin: 0,
            overflowX: 'hidden',
            position: 'relative',
            '& > div': {
                width: '100%',
            }
        }
    }),
);

const MessagesDrawer: React.FC<IMessagesDrawerProps> = (props) => {
    const classes = useStyles();
    const [messages, setMessages] = useState<{[key: string]: any} []>();
    const fetchMessages = async () => {
        let resp = await api.getMessages();
        let messages = resp.data;
        return messages;
    };
    const onMarkAsRead = async (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
        await api.markMessageAsRead(id);
        (async () => {
            if (props.open) {
                let msgs = await fetchMessages();
                setMessages(msgs);
            } else {
                setMessages([]);
            }

        })();
    };
    const onRemove = async (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
        await api.messageRemove(id);
        (async () => {
            if (props.open) {
                let msgs = await fetchMessages();
                setMessages(msgs);
            } else {
                setMessages([]);
            }

        })();
    };
    useEffect(() => {
        (async () => {
            if (props.open) {
                let msgs = await fetchMessages();
                setMessages(msgs);
            } else {
                setMessages([]);
            }

        })();
    }, [props])
    return <Drawer title={props.title} anchor='right' open={props.open} toggleOpen={props.toggleOpen} >
        <div className={classes.messagesDrawer}>
            <PerfectScrollbar>
                <ul className={classes.messages}>
                    {messages?.map((v) => {
                        return <li className={classes.message} key={v.id}>
                            <div className={classes.messageTitle}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}></span>
                                <div className="left">
                                    {v.unread ? <IconButton size="small" data-id={v.id} onClick={(event: React.MouseEvent<HTMLButtonElement>) => onMarkAsRead(v.id, event)}>
                                        <Badge color="secondary" variant="dot">
                                            <MessageIcon fontSize="small" />
                                        </Badge>
                                    </IconButton> : <IconButton size="small" disabled><DraftsIcon fontSize="small" /></IconButton>}
                                    <span className="mtype">{v.mtype}</span>
                                </div>
                                <div className="right">
                                    <span className="time"><Moment format="LLL">{v.timestamp}</Moment></span>
                                    <IconButton size="small" data-id={v.id} onClick={(event: React.MouseEvent<HTMLButtonElement>) => onRemove(v.id, event)}><CloseIcon fontSize="small" /></IconButton>
                                </div>
                            </div>
                            <div className={classes.messageBody} style={{ maxHeight: '63px', overflow: 'hidden' }}>
                                <p>{v.body}</p>
                            </div>
                        </li>
                    })}
                </ul>
            </PerfectScrollbar>
        </div>
    </Drawer>
}

let greetingTimer : NodeJS.Timer | null; 
export default () => {
  const {isAuthenticated, socket} = useContext(AppContext);
  const [greeting, setGreeting] = useState('');
  const [msgCount, setMsgCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messagesDrawerOpen, setMessagesDrawerOpen] = useState(false);
  useEffect(() => {
      if (socket) {
        socket.off('messages_unread_count');
        socket.on('messages_unread_count', (data: {[key:string]: any}) => {
            setMsgCount(data.count);
        });
        socket.off('notification_count');
        socket.on('notification_count', (data: {[key:string]: any}) => {
            setNotificationCount(data.count);
        })
      }
  }, [socket])
  const sayGreeting = () => {
      let now = new Date();
      let  hour = now.getHours();
      if (hour < 12) {
          setGreeting('Good morning')
      } else if (hour < 18) {
          setGreeting('Good afternoon')
      } else {
          setGreeting('Good evening')
      }
      
  }
  useEffect(() => {
      sayGreeting();
  }, [])
  if (greetingTimer) {
      clearInterval(greetingTimer);
  }
  greetingTimer = setInterval(() => {
      sayGreeting();
  }, 1000 * 3600);
    return <Navbar id="tm-navbar" variant="dark" sticky="top" expand="sm"  >
        <Navbar.Brand className="tm-nav-brand" as={Link} to="/">
            <span>I'm troubled</span>
            <span className="greeting">
                {greeting}
            </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="tm-nav">
                <Nav.Link className="tm-nav-link" as={Link} to="/expore" >Expore</Nav.Link>
                {isAuthenticated ? <Nav.Link className="tm-nav-link" as={Link} to="/expore/me/stories" >Stories</Nav.Link> : ''}
            </Nav>
            <Search className="tm-search" placeholder="Search" />
            <AuthButton />
            <SignupButton />
            {isAuthenticated() ? (<div>
                <IconButton >
                    <Badge badgeContent={notificationCount} max={99} color="secondary" invisible={notificationCount <= 0}>
                        <NotificationsIcon />
                    </Badge>
                </IconButton>

                <IconButton onClick={(event: React.MouseEvent<EventTarget>) => {setMessagesDrawerOpen(true)}}>
                    <Badge badgeContent={msgCount} max={99} color="secondary" invisible={msgCount <= 0}>
                        <MailIcon />
                    </Badge>
                </IconButton>
                <MessagesDrawer title='Notification messages' open={messagesDrawerOpen} toggleOpen={(open: boolean) => setMessagesDrawerOpen(open)} />
            </div>) : ''}
        </Navbar.Collapse>
    </Navbar>
}