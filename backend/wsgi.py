from app import create_app, db, cli
from app.models import User, Post, Message, Notification, Task, Tag, Comment, VerificationCode
from flask_socketio import SocketIO, disconnect, emit
import functools
from flask import g, request

app = create_app()
cli.register(app)
socketio = SocketIO(app, logger=True, engineio_logger=True, manage_session=False)


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


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Post': Post, 'Message': Message,
            'Notification': Notification, 'Task': Task, 'Tag': Tag, 'VerificationCode': VerificationCode, 'Comment': Comment}


if __name__ == '__main__':
    app.run()
