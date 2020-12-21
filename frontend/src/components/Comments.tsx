import React, { useEffect, useState } from 'react';
import * as api from '../api';
import { useToasts } from 'react-toast-notifications';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Button, TextField, Avatar, IconButton, Icon } from '@material-ui/core';
interface ICommentProps {
    comment: { [key: string]: any };
    id: any;
    onReplyComment: (data: IComment []) => void;
}
const useStyles = makeStyles(() =>
    createStyles({
        avatar: {
            width: '30px',
            height: '30px',
            borderRadius: '50%',
        },
        root: {
            display: 'flex',
        },
        commentActions: {
            padding: '0px 10px',
            paddingTop: '10px',
            display: 'flex',
            alignItems: 'center',
            '& > button': {
                margin: '0px 3px',
                textTransform: 'none',
            }
        },
        commmentInput: {
            transition: ' all 0.8s ease',
        },
        commentReply: {
            fontSize: '1rem'
        },
        commentReplyContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center'
        },
        commentReplyButton: {
            margin: '0px 3px',
            textTransform: 'none',
        },
        commentReplyTo : {
            fontSize: " 0.8rem",
            padding: "0px 20px",
            color: "#612c2c"
        }
    }),
);

const Comment: React.FC<ICommentProps> = (props) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const { id } = props;
    const { addToast } = useToasts();
    const [content, setContent] = useState('');
    const onReplyCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value);
    }
    const onClickReply = (event: React.MouseEvent<EventTarget>) => {
        event.stopPropagation();
        setOpen(!open);
    }
    const onReplyComment = async (event: React.MouseEvent<EventTarget>) => {
        event.stopPropagation();
        try {
            let resp = await api.postComment({id , content});
            setContent('');
            props.onReplyComment(resp.data);
        } catch (e) {
            addToast(e.message, {
                appearance: 'error',
                autoDismiss: true,
            });
        }
        setOpen(false);
    }
    return <div className={props.comment.level > 0 ? `tm-cm level level-${props.comment.level}` : 'tm-cm'} >
        <div className="tm-cm-h">
            <Avatar className={classes.avatar} src={props.comment.author._links.avatar} alt={props.comment.author.username}>{props.comment.author.username && props.comment.author.username[0]}</Avatar>
            <span className='email'>{props.comment.email}</span>
        </div>
        {props.comment.parent_id ? <span className={classes.commentReplyTo}>{`reply to ${props.comment.reply_to}`} </span>: ''}
        <div className="tm-cm-m">
            {props.comment.text}
        </div>
        <div className="tm-cm-f">
            <div className={classes.commentReplyContainer}>
                <IconButton size="small" onClick={onClickReply}>
                    <Icon className={`fa fa-reply ${classes.commentReply}`} />
                </IconButton>
            </div>
            <div className={open ? `open ${classes.commmentInput}` : `close ${classes.commmentInput}`}>
                <TextField
                    margin="normal"
                    variant="outlined" helperText="Write your replys here." InputLabelProps={{
                        shrink: true,
                    }} name="reply" onChange={onReplyCommentChange} value={content} fullWidth multiline label="Comment" />
            </div>
            {open ? <Button size="small"  className={classes.commentReplyButton} onClick={onReplyComment} variant="outlined" >Reply</Button> : ''}
        </div>
    </div>
}


interface ICommentsProps {
    postId: string;
    pageSize: number;
}
interface IComment {
    id: string;
    user_id: string;
    text: string;
}

const Comments: React.FC<ICommentsProps> = (props) => {
    const [open, setOpen] = useState(false);
    const { postId } = props;
    const { addToast } = useToasts();
    const [content, setContent] = useState('');
    const [loading, setLoading] = React.useState<boolean>(false);
    const [comments, setComments] = useState<IComment[]>([]);
    const classes = useStyles();
    useEffect(() => {
        let active = true;

        (async () => {
            if (!props.postId) {
                return;
            }
            setLoading(true);
            const resp = await api.getComments({ id: props.postId});
            let newComments = resp.data;
            if (!active) {
                return;
            }
            setComments(newComments);
            setLoading(false);
        })();

        return () => {
            active = false;
        };
    }, [props.postId]);
    useEffect(() => {
        if (!open) {
            setContent('');
        }
    }, [open]);
    const onCloseComment = (event: React.MouseEvent<EventTarget>) => {
        event.stopPropagation();
        setOpen(false);
    }
    const onWriteComment = (event: React.MouseEvent<EventTarget>) => {
        event.stopPropagation();
        setOpen(true);
    }
    const onCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value);
    }
    const onPostComment = async (event: React.MouseEvent<EventTarget>) => {
        event.stopPropagation();
        try {
            let resp = await api.postComment({ post_id: postId, content });
            setComments(resp.data)
        } catch (e) {
            addToast(e.message, {
                appearance: 'error',
                autoDismiss: true,
            });
        }
        setOpen(false);
    }
    return <div className="tm-comments">
        <div className="tm-comments-count">{`(${comments.length}) Comments`}</div>
        <div className={classes.commentActions}>
            {open ? <React.Fragment>
                <Button size="small" onClick={onPostComment} variant="outlined" >Post a Comment</Button>
                <Button size="small" onClick={onCloseComment} variant="outlined" >Close</Button>
            </React.Fragment> : <Button onClick={onWriteComment} size="small" variant="outlined">Write a Comment</Button>}


        </div>
        <div className={open ? `open ${classes.commmentInput}` : `close ${classes.commmentInput}`}>
            <TextField
                margin="normal"
                variant="outlined" helperText="Write your comments here." InputLabelProps={{
                    shrink: true,
                }} name="comment" onChange={onCommentChange} value={content} fullWidth multiline label="Comment" />
        </div>
        {comments.map((v) => {
            return <Comment onReplyComment={(data: IComment []) => setComments(data)} comment={v} key={v.id} id={v.id} />
        })}
    </div>
}

export default Comments;