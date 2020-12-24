import React, { useEffect, useContext, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-gruvbox";
import MarkdownPreview from "./MarkdownPreview";
import { useHistory, useParams } from "react-router-dom";
import * as api from "../api";
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Markdown from 'markdown-to-jsx';
import AppContext from '../context';
import { useToasts } from 'react-toast-notifications';
import { Icon } from "@material-ui/core";
import Drawer from './Drawer';
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import ChipInput from 'material-ui-chip-input';

interface IState {
    body: string;
    id: string | number;
    title: string;
    published: boolean;
}

interface IPostSettingsProps {
    title: string;
    open: boolean;
    postId: any;
    post: IState;
    toggleOpen: (open: boolean) => void;
}


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
    mode: string;
    postId: any;
    title: string;
    post: IState;
    published: boolean;
    onSave: React.MouseEventHandler;
    onDraft: React.MouseEventHandler;
    onPublish: React.MouseEventHandler;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    postEditorSettingDrawer: {
        width: '26vw',
        minWidth: '360px',
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(3),
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        maxWidth: 300,
      }
}));

const PostEditor: React.FC<IPostEditorProps> = (props) => {
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
const PostSettingsDrawer: React.FC<IPostSettingsProps> = (props) => {
    const classes = useStyles();
    const history = useHistory();
    const [value, setValue] = useState<any []>([]);
    const getTags = async () => {
        let resp = await api.getTags(props.postId);
        setValue(resp.data);
    };
    const getOrCreateTag = async (text: string, postId: string) => {
        let resp = await api.getOrCreateTag(text, postId);
        return resp.data;
    };
    const unlinkTag = async (tagId: string) => {
        let resp = await api.unlinkTag(tagId, props.postId);
        return resp.data;
    }
    useEffect(() => {
        getTags();
    }, [props]);
    const handleAddChip = async (chip: any) => {
        if (!chip.name) {
            return;
        }
       if (value.some((v) => {return v.name === chip.name})) {
           return;
       }
       if (props.postId === 'new') {
           return;
       }
       let tag = await getOrCreateTag(chip.name, props.postId);
       let newValue = [...value];
       newValue.push(tag);
       setValue(newValue);
    }
    const handleDeleteChip = async (chip: any, index: number) => {
        await unlinkTag(chip.id);
        let newValue = value.filter((v) => v.id !== chip.id)
        setValue(newValue);
    }
    return <Drawer title={props.title} anchor='right' open={props.open} toggleOpen={props.toggleOpen} >
        <div className={classes.postEditorSettingDrawer}>
        <ChipInput
            label="Tags"
            InputLabelProps={{shrink: true}}
            fullWidthInput
            fullWidth
            clearInputValueOnChange
            defaultValue={value}
            dataSourceConfig={{value: 'id', text: 'name'}}
            value={value}
            onAdd={(chip) => handleAddChip(chip)}
            onDelete={(chip, index) => handleDeleteChip(chip, index)}
            />
        </div>
    </Drawer>
}


const PostEditorHeader: React.FC<IPostEditorHeaderProps> = (props) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        props.onSave(event);
        setDrawerOpen(true);
    };
    const onExport = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        let postId = props.postId;
        api.getFile(`/api/posts/${props.postId}/export`);
    };
    return (<div className="tm-post-editor-header">
        <PostSettingsDrawer post={props.postId} postId={props.postId} title='Settings' open={drawerOpen} toggleOpen={(open: boolean) => setDrawerOpen(open)} />
        <div id="title"><Markdown>{props.title || ''}</Markdown></div>
        {props.mode == 'write' ? <Button variant="contained" color="primary" onClick={onExport} >Export</Button>: ''}
        {props.mode == 'write' ? props.published ? <Button variant="contained" color="primary" onClick={props.onDraft} >Draft</Button> : <Button variant="contained" color="primary" onClick={props.onPublish} >Publish</Button> : ''}
        <Button variant="contained" color="secondary" onClick={props.onSave} disabled={props.disabled} >Save</Button>
        <IconButton onClick={onClick} size='small'><Icon style={{ fontSize: '13px' }} className="fa fa-cog" /></IconButton>
    </div>)
}

const PostEditorView: React.FC<IPostEditorViewProps> = (props) => {
    const [post, setPost] = useState<IState>({ body: '', title: '', id: 'new', published: false });
    const [disabled, setDisabled] = useState(true);
    const [values, setValues] = useState<any[]>([]);
    const { authenticated } = useContext(AppContext);
    const [mode, setMode] = useState('');
    const history = useHistory();
    const { addToast } = useToasts();

    const onSave = (event: React.MouseEvent) => {
        if (postId === 'new') {
            createPost(post.body, post.title).then(id => {
                history.push(`/expore/editor/${id}`);
            });
        } else {
            savePost(postId, post.body, post.title).then(() => {
                fetchPost(postId);
            });
        }
    }
    const onPublish = async (event: React.MouseEvent) => {
        await api.publishPost(postId);
        setPost({ ...post, published: true });
        addToast(`${post.title} is published.`, {
            appearance: 'info',
            autoDismiss: true,
        })
    }
    const onDraft = async (event: React.MouseEvent) => {
        await api.draftPost(postId);
        setPost({ ...post, published: false });
        addToast(`${post.title} is drafted.`, {
            appearance: 'info',
            autoDismiss: true,
        })
    }
    let regexHeader = /^# (.*$)/igm;
    const onChange = (value: any) => {
        setDisabled(value == values.slice(-1));
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
        return setPost({ ...post, body: value, title: header });
    }
    let { postId } = useParams<IParams>();
    const fetchPost = async (postId: string) => {
        if (postId === 'new') {
            setPost({ ...post, id: 'new', body: '', published: false })
            values.push('');
            setValues(values);
            setMode('create');
        } else {
            let resp = await api.getPost(postId);
            setDisabled(true);
            let { id, body, title, author, published } = resp.data as any;
            values.push(body);
            setValues(values);
            if (id && author.id !== authenticated.userId) {
                history.push('/expore', { errorCode: 401 });
                return;
            }
            setPost({ ...post, id: id, body: body, title, published })
            setMode('write');
        }
    }


    useEffect(() => {
        fetchPost(postId)
    }, [props]);

    return (
        <>
            <PostEditorHeader post={post}  postId={post.id} published={post.published} mode={mode} title={post.title} disabled={disabled} onDraft={onDraft} onPublish={onPublish} onSave={onSave} />
            <PostEditor body={post.body} onChange={onChange} />
        </>
    )

}


const canBeDiscard = () => {
};


const createPost = async (body: string, title: string) => {
    let resp = await api.createPost({ body, title });
    return resp.data;
}

const savePost = async (id: string, body: string, title: string) => {
    let resp = await api.updatePost(id, { body, title });
    return resp.data;
}



export default PostEditorView