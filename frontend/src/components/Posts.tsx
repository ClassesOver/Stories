import React, {useEffect, useState } from 'react';
import * as api from '../api';
import MarkdownPreview from "./MarkdownPreview";
import Moment from 'react-moment';
import { useToasts } from 'react-toast-notifications';
import Avatar from '@material-ui/core/Avatar';
import readingTime from 'reading-time';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {useHistory} from 'react-router-dom';
import 'react-perfect-scrollbar/dist/css/styles.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import _ from 'lodash';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '30px',
      height: '30px',
      marginRight: '5px'
    },
  }),
);


interface IPostsProps {
    posts: any[];
};
interface IPostsViewProps {
};
interface IPost extends Object {
    title: string;
    body: string;
}
interface IPostProps {
    post: IPost,
    key: any;
}

export const limit = 20;

const Post: React.FC<IPostProps> = (props) => {
    const classes = useStyles();
    const {post} = props as any;
    const history = useHistory();
    const [readMore, setReadMore]=useState(false);
    const linkName = readMore? 'Read less':'Read more';
    let content;
    let extraContent;
    let stats = readingTime(post.body);
    let rt = stats.text;
    let words = stats.words;
    if (props.post.body && props.post.body.length > 200) {
        content = props.post.body.slice(0, 200);
        extraContent = props.post.body.slice(200);
    } else {
        content = props.post.body;
        extraContent = '';
    }
    const onReadMore =  (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setReadMore(!readMore);
    }
    const handleViewPost = (event: React.MouseEvent<HTMLHeadingElement>) => {
        history.push(`/expore/view/${post.id}`, {post: post});
    }
    return (<div className="tm-post-piece" onClick={handleViewPost} >
         <h6>
             <Avatar src={post.author._links.avatar} className={classes.root} alt={post.author.username}>{post.author.username && post.author.username[0]}
             </Avatar><Moment format="LL" >{post.timestamp}</Moment>
             <span className='words'>{words} words</span>
         </h6>
         <MarkdownPreview className="markdown-body" value={readMore?  post.body: extraContent ? content + '...' : content}/> 
         <div className='tags'>
             {
                 post.tags.map((v: {[key: string]: any, name: string, id: string}) => {
                    return <span key={v.id} className="tag" data-id={v.id} >{v.name}</span>
                 })
             }
         </div>
         {<a className="read-more-link" onClick={onReadMore}><span>{linkName}&nbsp;.&nbsp;{rt}</span></a>}
    </div>)
}
const Posts: React.FC<IPostsProps> = (props) => {
    const {posts} = props;
    return <div className="tm-posts" >
        {
            posts.map((post) => {
                return <Post key={post.id} post={post} />
            })
        }
    </div>
}

export const PostsView :React.FC<IPostsViewProps> = (props) => {
    const [posts, setPosts] = useState([]);
    const [offset, setOffset] = useState(0);
    const { addToast } = useToasts();
    const fetch = async (fresh: boolean = false, container: HTMLElement | null  = null) => {
        let _offset;
        if (fresh) {
            _offset = 0
        } else {
            _offset = offset
        }
        const {data} = await api.getPosts(limit, _offset);
        if (data.length < limit) {
        }
        if (data.length === 0 ) {
            addToast(`There are no more stories.`, {
                appearance: 'info',
                autoDismiss: true,
            });
            if (container) {
                container.scrollTop = container.scrollTop - 80;
            }
            return;
            
        }
        if (fresh) {
            setPosts(data);
            setOffset(data.length);
        } else {
            let newPosts = posts.concat(data);
            setPosts(newPosts);
            setOffset(newPosts.length);
        }
        return data;
    }
    useEffect(() => {
        fetch(true, null);
    },[]);
    let busy = false;
    const onScrollDown = _.debounce( async (container) => {
        if (busy) {
            return;
        }
        let st = container.scrollTop;
        let sh = container.scrollHeight;
        let h = container.clientHeight;
        if (st + h >= sh) {
            busy = true;
            await fetch(false, container);
            busy = false;
        }       
    },1000);
    return (<div className="tm-posts-view">
        <PerfectScrollbar onScrollDown={onScrollDown}>
            <Posts posts={posts} />
        </PerfectScrollbar>
    </div>)
}

export default PostsView