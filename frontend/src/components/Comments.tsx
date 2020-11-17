import React, {useEffect, useState} from 'react';
import * as api from '../api';
interface ICommentProps {
    comment: { [key: string]: any }
}
const Comment: React.FC<ICommentProps> = (props) => {
    return <div className="tm-cm">
        <div className="tm-cm-h"></div>
        <div className="tm-cm-m">{props.comment.text}</div>
        <div className="tm-cm-f"></div>
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
    const [page, setPage] = React.useState(1);
    const [rowCount, setRowCount] = React.useState(0);
    const [pageCount, setPageCount] = React.useState(1);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [links, setLinks] = React.useState({prev: null, next: null});
    const [comments, setComments] = useState<IComment[]>([]);
    useEffect(() => {
        let active = true;

        (async () => {
            if (!props.postId) {
                return;
            }
            setLoading(true);
            const resp = await api.getComments({id: props.postId, page, pageSize: props.pageSize });
            let newComments = resp.data.items
            if (!active) {
                return;
            }
            setComments(newComments);
            setLinks(resp.data._links);
            setRowCount(resp.data._meta.total_items);
            setPageCount(resp.data._meta.total_pages);
            setLoading(false);
        })();

        return () => {
            active = false;
        };
    },[props.postId]);
    return <div className="tm-comments">
        {comments.map((v) => {
            return <Comment comment={v} key={v.id} />
        })}
    </div>
}

export default Comments;