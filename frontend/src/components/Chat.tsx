import React, { useEffect, useState, useContext } from 'react';
import { createStyles, Theme, withStyles, WithStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { Avatar } from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import SendIcon from '@material-ui/icons/Send';
import * as api from '../api';
import AppContext from '../context';
import { v4 as uuidv4 } from 'uuid';
import { ChatList, MessageList } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import {Mutex} from '../utils';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        sendInput: {
            padding: theme.spacing(1),
        },
        sendButton: {
            textTransform: 'capitalize',
            float: 'right',
            margin: '5px 10px 0px 10px',
        },
        avatar: {
            width: '30px',
            height: '30px',
            borderRadius: '0px',
        },
        active: {
            background: '#2ca7ff',
            color: 'white',
        },
        channel: {
            cursor: 'pointer',
            marginLeft: '25px',
            display: 'flex',
            alignItems: 'center',
            padding: '12px 0px',
            borderBottom: '1px solid #cecccc75',
        },
        messageBoxPrefix: {
            fontSize: '13px',
            padding: '5px',
        },
        messageList: {
            height: '100%',
            overflowY: 'auto', 
        },
        chatChannelName: {},
        sendContainer: {
            boxShadow: '0 -1px 4px rgba(0, 21, 41, 0.08)',
            padding: '15px',
        },
        main: {
            height: '320px',
        },
    }),
);
const styles = (theme: Theme) =>
    createStyles({
        root: {
            margin: 0,
            padding: theme.spacing(2),
            borderBottom: '1px solid #d8d8d8',
        },
        closeButton: {
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
        },
    });

export interface IChannelsProps {
    defaultChannelId?: string;
    onItemClick: (value: any) => void;
}

export interface DialogTitleProps extends WithStyles<typeof styles> {
    id: string;
    children: React.ReactNode;
    onClose: () => void;
}
export interface ChatDialogProps {
    handleClose: () => void;
    open: boolean;
    showChannels: boolean,
    defaultChatUserId: string;
    defaultChatChannelId: string;
    defaultChatName: string;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2),
        position: 'relative',
        minHeight: '520px',
    },
}))(MuiDialogContent);

interface IMessagesProps {
    messages: { [key: string]: any };
}
interface IMessageProps {
    value: string;
}

const Messages: React.FC<IMessagesProps> = (props) => {
    const classes = useStyles();
    const { authenticated } = useContext(AppContext);

    return <MessageList
        className={classes.messageList}
        lockable={true}
        toBottomHeight={'100%'}
        dataSource={props.messages} />
}

export default function ChatDialog(props: ChatDialogProps) {
    const classes = useStyles();
    const mutex = new Mutex();
    const [messages, setMessages] = useState<{ [key: string]: any }>([]);
    const [content, setContent] = useState('');
    const [chatUserId, setChatUserId] = useState('');
    const [chatChannelId, setChatChannelId] = useState('');
    const [newMessage, setNewMessage] = useState<any>();
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [chatName, setChatName] = useState('');
    const [channels, setChannels] = useState<{ [key: string]: any }[]>([]);
    const {socket } = useContext(AppContext);
    const fetchChannels = async () => {
        let resp = await api.getChannels();
        let dataSource = resp.data;
        let newChannels = dataSource.map((v: { [key: string]: any }) => {
            let className = "";
            if (v.channel_id === chatChannelId) {
                className = 'active'
            }
            return { ...v, date: new Date(v.date), className}
        });
        setChannels(newChannels);
        return newChannels;
    }
    useEffect(() => {
       fetchChannels();
    }, [chatChannelId]);
    const fetchPrivateMessages = async (cid: string) => {
        setMessagesLoading(true);
        let resp = await api.getPrivateMessage(cid);
        setMessagesLoading(false);
        return resp.data.map((v: { [key: string]: any }) => {
            return {
                ...v,
                notch: false,
                replyButton: false,
                date: new Date(v.date),
            }
        });
        
    }
    useEffect(() => {
        (async () => {
            if (chatChannelId && props.open) {
                let msgs = await fetchPrivateMessages(chatChannelId);
                setMessages(msgs as []);
            }
        })()
    }, [props, chatChannelId]);
    const pushNewMessage = function(value: any) {
        setNewMessage(value);
    }
    useEffect(() => {
        if (newMessage && newMessage.channel_id === chatChannelId) {
            let values = messages.concat({...newMessage, date: new Date(newMessage.date)});
            setMessages(values);          
        }
        fetchChannels();
    }, [newMessage]);
    useEffect(() => {
        if (socket) {
            socket.off('new_private_message')
            socket.on('new_private_message', (value: any) => {
                pushNewMessage(value)
            })
        }
    }, [socket]);
    useEffect(() => {
        setChatUserId(props.defaultChatUserId);
        setChatChannelId(props.defaultChatChannelId);
        setChatName(props.defaultChatName);
    }, [props]);
    const onContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value);
    }
    const onSend = async (event: React.MouseEvent<EventTarget>) => {
        if (chatUserId) {
            let newId = uuidv4();
            let dummyMessage = {uuid: newId, type: 'text', id: newId, text: content,notch: false, status: 'waiting', position: 'right', date: new Date(), };
            setContent('');
            let newMessages = messages.concat(dummyMessage);
            setMessages(newMessages);
            let action = ((msgs: {[key: string]: any}[], newMsg: {[key: string]: any}) => {
                return (async () => {
                    let resp = await api.sendPrivateMessage({ uuid: newId, content, user_id: chatUserId });
                    socket.emit('sent_private_message', resp.data)
                    if (resp.data) {
                        newMsg.status = 'sent'
                        let newMsgs = msgs.concat(newMsg);
                        setMessages(newMsgs);
                    }
                    return resp;
                })
            })([...messages as {[key: string]: any}[]], dummyMessage as {[key: string]: any});
            mutex.exec(action);
        }
    }
    const onItemClick = (value: {[key: string]: any}) => {
        setChatChannelId(value.channel_id);
        setChatName(value.title);
    }
    return (
        <div>
            <Dialog fullWidth={true} maxWidth={`md`} onClose={props.handleClose} aria-labelledby="chat-dialog-title" open={props.open}>
                <DialogTitle id="chat-dialog-title" onClose={props.handleClose}>

                    <span style={{ textTransform: 'capitalize' }}>{chatName}</span>
                </DialogTitle>
                <DialogContent>
                    {props.showChannels ? <div style={{ position: 'absolute', left: '0px', top: '0px', bottom: '0px', width: '256px', borderRight: '1px solid #f1efef' }}>
                    <ChatList className='chat-list' dataSource={channels} onClick={onItemClick} />
                    </div> : ''}
                    <div style={{ position: 'absolute', left: `${props.showChannels ? '256px' : '0px'}`, top: '0px', bottom: '0px', right: '0px', display: 'flex', flexFlow: 'column' }}>
                        <div className={classes.main} style={{ flex: 1 }}>
                            <Messages messages={messages} />
                        </div>
                        <div className={classes.sendContainer}>
                            <TextField
                                margin="normal"
                                placeholder="Type here..."
                                InputLabelProps={{
                                    shrink: true,
                                }} name="content" onChange={onContentChange} value={content} fullWidth multiline label="" />

                            <Button
                                size="small"
                                variant="contained"
                                onClick={onSend}
                                className={classes.sendButton}
                                endIcon={<SendIcon>Send</SendIcon>}
                            >
                                Send
                        </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}