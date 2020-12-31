from app import create_app, db, cli
from app.models import User, Post, Message, Notification, Task, Tag, Comment, VerificationCode, Channel
from flask_socketio import SocketIO, disconnect, emit, join_room, leave_room
import functools
from flask import g, request
import json

app = create_app()
cli.register(app)
socketio = SocketIO(app, logger=True, engineio_logger=True)


def authenticated_only(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        t = request.cookies.get('access_token', False)
        user = t and User.check_token(t)
        if not user:
            disconnect()
        else:
            g.user = user
            return f(*args, **kwargs)
    return wrapped

@app.route('/')
def index():
    return app.send_static_file('index.html')

@socketio.on('messages_unread_count')
@authenticated_only
def messages_unread_count(data=[]):
    messages = Message.query.filter_by(recipient_id=g.user.id).filter_by(unread=True).all()
    emit('messages_unread_count', {'count': len(messages)})
    
@socketio.on('notification_count')
@authenticated_only
def messages_unread_count(data=[]):
    messages = Notification.query.filter_by(user_id=g.user.id).filter_by(unread=True).all()
    emit('notification_count', {'count': len(messages)})
    

@socketio.on('sent_private_message')
@authenticated_only
def sent_private_message(data):
    hash_id = data.get('id')
    msg_obj = Message.get(hash_id)
    recipient = User.query.get(msg_obj.recipient_id)
    sender = User.query.get(msg_obj.sender_id)
    msg = {
        'position'    : 'left',
        'date'        : msg_obj.timestamp.isoformat() + 'Z',
        'status'      : 'received',
        'text'        : msg_obj.body,
        'type'        : 'text',
        'id'          : msg_obj.hash_id,
        'recipient_id': recipient.hash_id,
        'sender_id'   : sender.hash_id,
        'channel_id'  : msg_obj.channel.hash_id
    }
    emit('new_private_message', msg, broadcast=True)


@socketio.on('leave')
@authenticated_only
def on_leave(data):
    room = data['room']
    leave_room(room)


@app.shell_context_processor
def make_shell_context():
    return {'db'          : db, 'User': User, 'Post': Post, 'Message': Message, 'Channel': Channel,
            'Notification': Notification, 'Task': Task, 'Tag': Tag, 'VerificationCode': VerificationCode,
            'Comment'     : Comment}


if __name__ == '__main__':
    socketio.run(app)
