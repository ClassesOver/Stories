import React, {useState, useContext} from 'react';
import {Avatar, Button, Icon} from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {useToasts} from 'react-toast-notifications'
import * as api from "../api";
import AppContext from '../context';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatar: {
      width: '120px',
      height: '120px',
    },
    btn: {
        textTransform: 'capitalize',
    }
  }),
);
interface IProfileProps {
    author: { [key: string]: any};
    isFollowing: boolean;
}
const Profile: React.FC<IProfileProps> =  (props) => {
    const {authenticated} = useContext(AppContext);
    const {author, isFollowing} = props;
    const [followed, setFollowed] = useState(isFollowing);
    const { addToast } = useToasts()
    const handleFollow = async (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        let userId = author.id;
        try {
            let resp = await api.follow(userId);
            let {message, mtype} = resp.data;
            if (mtype === 'success') {
                setFollowed(true)
            }
            addToast(message, {
                appearance: mtype,
                autoDismiss: true,
            })
        } catch ({error, message}) {
            if (error.response.status === 401) {
                addToast(message, {
                    appearance: 'error',
                    autoDismiss: true,
                })
            }
        }
    }
    const handleUnfollow = async (event: React.MouseEvent<HTMLElement>)  => {
        event.stopPropagation();
        let userId = author.id;
        let resp = await api.unfollow(userId);
        let {message, mtype} = resp.data;
        if (mtype === 'success') {
            setFollowed(false)
        }
        addToast(message, {
            appearance: mtype,
            autoDismiss: true,
        })
    }
    const classes = useStyles();
    return <div className={'tm-profile'}>
        <div className="base-container">
            {authenticated.userId !== author.id ? <div className="follow">
                {followed ? <Button onClick={handleUnfollow} className={classes.btn}>Unfollow</Button>
                    : <Button onClick={handleFollow} className={classes.btn}>Follow</Button>}
            </div> : ''}
            <Avatar className={classes.avatar} src={author._links.avatar} alt={author.username}>{author.username && author.username[0]}</Avatar>
            <div className="name">{author.username}</div>
            <div className="follow-count">{}{`${author.follower_count} followers . ${author.followed_count} following`}</div>
            {author.about_me ? <div className="about-me">{author.about_me}</div> : <></>}
        </div>
        <div className="contract-container">
            <div className="email">
                <Icon className="fa fa-envelope icon" style={{fontSize: 16}}/>
                <a href={`mailto:${author.email}`}>{author.email} </a>
            </div>
            <div className="phone">
                <Icon className="fa fa-phone icon" style={{fontSize: 16}}/>
                {author.phone}
            </div>
            <div className="github">
                <Icon className="fa fa-github icon" style={{fontSize: 16}}/>
                {author.github}
            </div>
        </div>
    </div>
}

export default Profile;