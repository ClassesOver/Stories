from app import create_app, db, cli
from app.models import User, Post, Message, Notification, Task, Tag, Comment
from flask import render_template
app = create_app()
cli.register(app)


@app.route('/')
def index():
    return render_template('index.html')

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Post': Post, 'Message': Message,
            'Notification': Notification, 'Task': Task, 'Tag': Tag, 'Comment':Comment}


if __name__ == '__main__':
    app.run()