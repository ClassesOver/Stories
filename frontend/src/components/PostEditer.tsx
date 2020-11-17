import React, {useEffect, useRef, useContext, useState} from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-gruvbox";
import MarkdownPreview from "./MarkdownPreview";
import {useHistory, useParams} from "react-router-dom";
import * as api from "../api";
import Button from '@material-ui/core/Button';
import Markdown from 'markdown-to-jsx';
import AppContext from '../context';

interface IPostEditorProps {
    body: string;
    onChange: (value: string, event?: any) => void;
};
interface IParams {
    postId: any;
}
interface IPostEditorViewProps {

}
interface IPostEditorHeaderProps {
    disabled?: boolean;
    title: string;
    onSave: React.MouseEventHandler;
}

const PostEditor : React.FC<IPostEditorProps> = (props) => {
    return (<div className="tm-post-editor">
        <div className="editor-pane">
            <AceEditor  className="tm-ace-editor"
                        style = {
                            {
                                width: '50vw',
                                height: 'auto'
                            }
                        }
                        mode="markdown"
                        theme="gruvbox"
                        value={props.body}
                        onChange={props.onChange}
                        name="tm-ace-markdown-editor"
                        editorProps={{$blockScrolling: true }}
                        />
        </div>
        <div className="view-pane">
            <MarkdownPreview style = {
                            {
                                width: '50vw',
                                height: 'auto'
                            }
                        } className="markdown-body tm-mk-preview" value={props.body} />
        </div>
    </div>)
}

const PostEditorHeader : React.FC<IPostEditorHeaderProps>  = (props) => {
    return ( <div className="tm-post-editor-header">
        <div id="title"><Markdown>{props.title || ''}</Markdown></div>
        <Button variant="contained" color="secondary" onClick={props.onSave} disabled={props.disabled || false} >Save</Button>
    </div>)
}
interface IState {
    body: string;
    id: string | number;
    mode: string;
    title: string;
}
const PostEditorView : React.FC<IPostEditorViewProps> = (props) => {
    const [post, setPost] = useState<IState>({body: '', title: '', id: 'new', mode: 'create'});
    const [disabled,setDisabled] = useState(true);
    const [saveCount, setSaveCount] = useState(0);
    const [saveValue, setSaveValue] = useState('');
    const {authenticated} = useContext(AppContext);
    const history = useHistory();
    const onSave = (event: React.MouseEvent) => {
        if (postId === 'new') {
            createPost(post.body, post.title).then(id => {
                history.push(`/expore/editor/${id}`)
            });
        } else {
            savePost(postId, post.body, post.title).then(() => {
                let count = saveCount + 1;
                setSaveCount(count);
            });
        }
    }

    let regexHeader = /^# (.*$)/igm;
    const onChange = (value: any) => {
        setDisabled((value == saveValue));
        let header;
        if (value) {
            let headers = value.match(regexHeader);
            if (headers) {
                header = headers[0] || '';
                header = header.slice(2);
            } else {
                header = '';
            }
        } 
        return setPost({...post, body: value, title: header});
    }
    let { postId } = useParams<IParams>();

    const fetchPost = async (postId: string) => {
        if (postId === 'new') {
            setPost({...post, id: 'new', body: '', mode: 'create'})
            setSaveValue('')
        } else {
            let resp = await api.getPost(postId);
            let {id, body, title, author} = resp.data as any;
            if (id && author.id !== authenticated.userId) {
                history.push('/expore', {errorCode: 401});
                return;
            }
            setSaveValue(body);
            if (body == post.body && title == post.title) {
                return;
            }
            setPost({...post, id: id , body: body ,mode: 'write'})
        }
    }
    useEffect(() => {
        fetchPost(postId)
    }, [saveCount])
    
    useEffect(() => {
        fetchPost(postId)
    }, []);
    
    return (
        <>
        <PostEditorHeader title={post.title} disabled={disabled}  onSave={onSave}/>
        <PostEditor body={post.body} onChange={onChange} />
        </>
     )

}


const canBeDiscard = () => {
};


const createPost = async (body: string, title: string) => {
    let resp = await api.createPost({body, title});
    return resp.data;
}

const savePost = async (id: string, body: string, title: string) => {
    let resp = await api.updatePost(id, {body, title});
    return resp.data;
}



export default PostEditorView