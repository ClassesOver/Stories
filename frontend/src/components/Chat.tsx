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
import PerfectScrollbar from 'react-perfect-scrollbar';
import SendIcon from '@material-ui/icons/Send';
import * as api from '../api';
import AppContext from '../context';
import { v4 as uuidv4 } from 'uuid';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        sendInput: {
            padding: theme.spacing(1),
        },
        sendButton: {
            textTransform: 'capitalize',
            float: 'right',
            margin: '5px 10px',
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
        channelDescription: {
            flex: 1,
            padding: '0px 10px',
            fontSize: '13px',
            textTransform: 'capitalize',
        },
        lastMessage: {},
        chatChannelName: {},
        channels: {
            color: '#808080',
            margin: '0px',
            padding: '0px',
            listStyle: 'none',
        },
        main: {
            height: '320px',
        },
        msgsContainer: {
            minWidth: '520px',
            overflow: 'hidden'
        },
        msgContainer: {
            marginTop: '6px',
            marginBottom: '6px',
            marginLeft: '16px',
            marginRight: '16px',
            display: 'flex',
            flexFlow: 'row nowrap',
            alignItems: 'center',
            '&.left': {
                justifyContent: 'flex-start',
                '& > .msg div.body': {
                    background: '#dde1e4 !important',
                },
                '& > .msg > div.sender': {
                    color: 'grey',
                }
            },
            '&.right': {
                justifyContent: 'flex-end',
                '& > .msg > div.sender': {
                    display: 'none',
                }
            }
        },
        msg: {
            display: 'flex',
            flexFlow: 'column',
            '& > div.body': {
                background: '#b0d6f7',
                borderRadius: '3px',
                padding: '6px',
            },
            '& > div.sender': {
                fontSize: '12px',
                marginBottom: '2px',
            }

        }
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
const Messages: React.FC<IMessagesProps> = (props) => {
    const classes = useStyles();
    const { authenticated } = useContext(AppContext);
    return <div className={classes.msgsContainer} >
        {props.messages.map((msg: any) => {
            return <div key={msg.id} className={`${msg.sender.id === authenticated.userId ? 'right' : 'left'} ${classes.msgContainer}`}>
                <div className={`${classes.msg} msg`}>
                    <div className="sender">{msg.sender.username}</div>
                    <div className="body">{msg.body}</div>
                </div>
            </div>
        })}
    </div>
}
const Channels: React.FC<IChannelsProps> = (props) => {
    const classes = useStyles();
    const [channels, setChannels] = useState<{ user: { [key: string]: any }, channel: { [key: string]: any } }[]>([]);
    const [active, setActive] = useState(props.defaultChannelId || '');
    const fetchChannels = async () => {
        let resp = await api.getChannels();
        return resp.data;
    }
    useEffect(() => {
        (async () => {
            let channels = await fetchChannels();
            setChannels(channels);
        })();
    }, []);
    return <ul className={classes.channels}>
        {channels.map((v) => {
            return <li className={`${v.channel.id === active ? classes.active : ''}`}>
                <div className={`${classes.channel}`}>
                    <Avatar className={classes.avatar} src={v.user._links.avatar} alt={v.user.username}>{v.user.username && v.user.username[0]}</Avatar>
                    <div className={classes.channelDescription}>
                        <span className={classes.chatChannelName}>{v.user.username}</span>
                        <span className={classes.lastMessage}></span>
                    </div>
                </div>
            </li>
        })}
    </ul>
}

export default function ChatDialog(props: ChatDialogProps) {
    const classes = useStyles();
    const [messages, setMessages] = useState<{ [key: string]: any }>([]);
    const [content, setContent] = useState('');
    const { authenticated, socket } = useContext(AppContext);
    const [chatUserId, setChatUserId] = useState('');
    const [chatChannelId, setChatChannelId] = useState('');
    const [chatName, setChatName] = useState('');
    const [scrollEl, setScrollEl] = useState<any>();
    useEffect(() => {
        if (!scrollEl) {
            return;
        }
        scrollEl.scrollTop = scrollEl.scrollHeigth;
    }, [messages]);
    const fetchPrivateMessages = async (cid: string) => {
        let resp = await api.getPrivateMessage(cid);
        return resp.data;
    }
    useEffect(() => {
        (async () => {
            if (chatChannelId && props.open) {
                let msgs = await fetchPrivateMessages(chatChannelId);
                setMessages(msgs as []);
            }
        })()
    }, [props]);
    useEffect(() => {
        if (socket) {
            socket.off('receive_private_message');
            socket.on('receive_private_message', (data: string) => {
                let newMsg = JSON.parse(data) as { [key: string]: any };
                let update = false;
                let newMessages = messages.map((v: { [key: string]: any }) => {
                    if (v.newId && v.uuid === newMsg.uuid) {
                        update = true;
                        return { ...v, ...newMsg, uuid: false };
                    } else {
                        return { ...v }
                    }
                });
                if (!update) {
                    setMessages(newMessages.concat(newMsg));
                } else {
                    setMessages(newMessages)
                }

            });
        };
    }, [socket, messages]);
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
            let dummyMessage = { newId, body: content, sender: authenticated.userInfo };
            socket.emit('send_private_message', { uuid: newId, content, user_id: chatUserId });
            setContent('');
            let newMessages = messages.concat(dummyMessage);
            setMessages(newMessages);
        }
    }
    return (
        <div>
            <Dialog fullWidth={true} maxWidth={`md`} onClose={props.handleClose} aria-labelledby="chat-dialog-title" open={props.open}>
                <DialogTitle id="chat-dialog-title" onClose={props.handleClose}>

                    <span style={{ textTransform: 'capitalize' }}>{chatName}</span>
                </DialogTitle>
                <DialogContent>
                    {props.showChannels ? <div style={{ position: 'absolute', left: '0px', top: '0px', bottom: '0px', width: '256px', borderRight: '1px solid #f1efef' }}>
                        <Channels defaultChannelId={props.defaultChatChannelId as string || ''} />
                    </div> : ''}
                    <div style={{ position: 'absolute', left: `${props.showChannels ? '256px' : '0px'}`, top: '0px', bottom: '0px', right: '0px', display: 'flex', flexFlow: 'column' }}>
                        <div className={classes.main} style={{ flex: 1 }}>
                            <PerfectScrollbar containerRef={ref => { setScrollEl(ref) }} >
                                <Messages messages={messages} />
                            </PerfectScrollbar>
                        </div>
                        <div>
                            <TextField
                                margin="normal"
                                variant="outlined" InputLabelProps={{
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