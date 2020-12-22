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
import { IconButton } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  }),
);

let greetingTimer : NodeJS.Timer | null; 
export default () => {
  const {isAuthenticated, socket} = useContext(AppContext);
  const [greeting, setGreeting] = useState('');
  const [msgCount, setMsgCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)
  let interval: any;
  useEffect(() => {
      if (socket) {
        socket.on('connect', () => {
            interval = setInterval(() => {
                socket.emit('messages_unread_count', {});
                socket.emit('notification_count', {});
            }, 1500);
            socket.on('messages_unread_count', (data: {[key:string]: any}) => {
                setMsgCount(data.count);
            });
            socket.on('notification_count', (data: {[key:string]: any}) => {
                setNotificationCount(data.count);
            })
        });
        socket.on('disconnect', () => {
            if (interval) {
                clearInterval(interval)
            }
        })
      }
      return () => {
          if (interval) {
              clearInterval(interval)
          }
      }
  }, [])
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
            <div>
                <IconButton >
                    <Badge badgeContent={notificationCount} max={99} color="secondary" invisible={notificationCount <= 0}>
                        <NotificationsIcon />
                    </Badge>
                </IconButton>

                <IconButton>
                    <Badge badgeContent={msgCount} max={99} color="secondary" invisible={msgCount <= 0}>
                        <MailIcon />
                    </Badge>
                </IconButton>
            </div>
        </Navbar.Collapse>
    </Navbar>
}