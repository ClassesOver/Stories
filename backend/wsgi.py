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


@socketio.on('join_private')
@authenticated_only
def on_join_private(data):
    channel = Channel.get(data['id'])
    if channel:
        join_room(channel.hash_id)

@socketio.on('send_private_message')
@authenticated_only
def send_private_message(data):
    user_hash_id = data.get('user_id')
    other = User.get_or_404(user_hash_id)
    content = data.get('content', '')
    if g.user.id != other.id:
        channel_d = Channel.private_channel_get(g.user, other)
        channel_obj = Channel.get(channel_d['id'])
        msg_obj = channel_obj.send_private_message(g.user, other, content)
        db.session.commit()
        msg = json.dumps(msg_obj.to_dict())
        emit('receive_private_message', msg, room=channel_obj.hash_id)

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
