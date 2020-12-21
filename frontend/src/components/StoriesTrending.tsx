import React, { useEffect, useState } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Avatar } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import * as api from '../api';
import Moment from 'react-moment';


interface IStoriesTrendingProps {
}
interface IStory {
    value: {[key: string]: any};
    id: any;
    index: number;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '23px',
            height: '23px',
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1)
        }
    }),
);

function _Story (props: IStory) {
    const classes = useStyles();
    const {value, id}  = props;
    const history = useHistory();
    const onClick = (event: React.MouseEvent<EventTarget>) => {
        event.stopPropagation();
        history.push(`/expore/view/${id}`);
    }
    return <div onClick={onClick} className="tm-post-trending" data-id={id}>
        <span className='index'>{`0${props.index + 1}`}</span>
        <div className="v">
            <div className="h">
                <Avatar src={value.author._links.avatar} className={classes.root} alt={value.author.username}>{value.author.username && value.author.username[0]}
                </Avatar>
                <span className="username">{value.author.username}</span>
            </div>
            <div className="h">
                <span className="title">{value.title}</span>
            </div>
            <div className="mt">
                <Moment format="LL" >{value.timestamp}</Moment>
            </div>
        </div>
    </div>
}

function StoriesTrending(props: IStoriesTrendingProps) {

    const [stories, setStories] = useState<{ [key: string]: any }>([]);
    const [loading, setLoading] = useState(false);
    const fetchStories = async () => {
        setLoading(true);
        try {
            let resp = await api.getTrendingStories();
            setStories(resp.data);
        } catch (e) {

        }
        setLoading(false);
    }
    useEffect(() => {
        fetchStories();
    }, []);

    return <div className="tm-posts-trending">
            <h4>Trending Stories</h4>
           {
            stories.map((story: { [x: string]: any; id: any; }, index: number) => {
                return <_Story key={story.id} index={index} id={story.id} value={story} />
            })
        }
    </div>
}


export default StoriesTrending;