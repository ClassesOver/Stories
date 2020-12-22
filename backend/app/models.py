import base64
from datetime import datetime, timedelta
from hashlib import md5
import json
import os
from time import time
from flask import current_app, url_for
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import redis
import rq
from app import db, login
from app.search import add_to_index, remove_from_index, query_index
from flask_login import current_user
import random


class SearchableMixin(object):
    @classmethod
    def search(cls, expression, page, per_page):
        ids, total = query_index(cls.__tablename__, expression, page, per_page)
        if total == 0:
            return cls.query.filter_by(id=0), 0
        when = []
        for i in range(len(ids)):
            when.append((ids[i], i))
        return cls.query.filter(cls.id.in_(ids)).order_by(
            db.case(when, value=cls.id)), total
    
    @classmethod
    def before_commit(cls, session):
        session._changes = {
            'add'   : list(session.new),
            'update': list(session.dirty),
            'delete': list(session.deleted)
        }
    
    @classmethod
    def after_commit(cls, session):
        for obj in session._changes['add']:
            if isinstance(obj, SearchableMixin):
                add_to_index(obj.__tablename__, obj)
        for obj in session._changes['update']:
            if isinstance(obj, SearchableMixin):
                add_to_index(obj.__tablename__, obj)
        for obj in session._changes['delete']:
            if isinstance(obj, SearchableMixin):
                remove_from_index(obj.__tablename__, obj)
        session._changes = None
    
    @classmethod
    def reindex(cls):
        for obj in cls.query:
            add_to_index(cls.__tablename__, obj)


db.event.listen(db.session, 'before_commit', SearchableMixin.before_commit)
db.event.listen(db.session, 'after_commit', SearchableMixin.after_commit)



followers = db.Table(
    'followers',
    db.Column('follower_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('followed_id', db.Integer, db.ForeignKey('user.id'))
)

claps = db.Table(
    'claps',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id', ondelete='CASCADE')),
    db.Column('post_id', db.Integer, db.ForeignKey('post.id', ondelete='CASCADE'))
)
tags = db.Table(
    'tags',
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id', ondelete='CASCADE')),
    db.Column('post_id', db.Integer, db.ForeignKey('post.id', ondelete='CASCADE')),
)


class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), index=True, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    posts = db.relationship(
        'Post', secondary=tags,
        backref=db.backref('tags', lazy='dynamic'), lazy='dynamic')
    
    def __init__(self, name, user_id):
        self.name = name
        self.user_id = user_id
        super(Tag, self).__init__()
    
    @classmethod
    def name_create(cls, name, user_id=None):
        if user_id:
            user_id = user_id
        else:
            if current_user and current_user.id:
                user_id = current_user.id
        tag = Tag(name, user_id)
        db.session.add(tag)
        return  tag
    
    def to_dict(self):
        return  {
            'id': self.hash_id,
            'name': self.name
        }

class VerificationCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), index=True)
    vcode = db.Column(db.String(6), index=True)
    expiration = db.Column(db.DateTime)
    vtype = db.Column(db.String(12))
    active = db.Column(db.Boolean(), default=True)

    @staticmethod
    def generate(email, vtype, expires_in = 60 * 3):
        o = VerificationCode()
        o.email = email
        o.expiration = datetime.utcnow() + timedelta(seconds=expires_in)
        o.vtype = vtype
        o.vcode = VerificationCode.get_code()
        return o


    @staticmethod
    def get_code():
        code_list = []
        for i in range(10):   # 0~9
            code_list.append(str(i))
        for i in range(65, 91):  # A-Z    
            code_list.append(chr(i))
        for i in range(97, 123):  # a-z
            code_list.append(chr(i))
        code = random.sample(code_list,6)
        code_num = ''.join(code)
        return code_num


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    posts = db.relationship('Post', backref='author', lazy='dynamic')
    about_me = db.Column(db.String(140))
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    token = db.Column(db.String(32), index=True, unique=True)
    phone = db.Column(db.String(20))
    github = db.Column(db.String(128))
    token_expiration = db.Column(db.DateTime)
    followed = db.relationship(
        'User', secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref=db.backref('followers', lazy='dynamic'), lazy='dynamic')
    clap_posts = db.relationship(
        'Post', secondary=claps,
        backref=db.backref('clap_users', lazy='dynamic'), lazy='dynamic')
    tags = db.relationship('Tag', backref='user', lazy='dynamic')
    messages_sent = db.relationship('Message',
                                    foreign_keys='Message.sender_id',
                                    backref='author', lazy='dynamic')
    messages_received = db.relationship('Message',
                                        foreign_keys='Message.recipient_id',
                                        backref='recipient', lazy='dynamic')
    last_message_read_time = db.Column(db.DateTime)
    notifications = db.relationship('Notification', backref='user',
                                    lazy='dynamic')
    tasks = db.relationship('Task', backref='user', lazy='dynamic')

    avatar_src = db.Column(db.Text())
    
    def __repr__(self):
        return '<User {}>'.format(self.username)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def avatar(self, size):
        email = self.email and  self.email.lower() or ''
        digest = md5(email.encode('utf-8')).hexdigest()
        return 'https://www.gravatar.com/avatar/{}?d=identicon&s={}'.format(
            digest, size)
    
    def follow(self, user):
        if not self.is_following(user):
            self.followed.append(user)
    
    def unfollow(self, user):
        if self.is_following(user):
            self.followed.remove(user)
    
    def is_following(self, user):
        return self.followed.filter(
            followers.c.followed_id == user.id).count() > 0
    
    def followed_posts(self):
        followed = Post.query.join(
            followers, (followers.c.followed_id == Post.user_id)).filter(
            followers.c.follower_id == self.id)
        own = Post.query.filter_by(user_id=self.id)
        return followed.union(own).order_by(Post.timestamp.desc())
    
    def get_reset_password_token(self, expires_in=600):
        return jwt.encode(
            {'reset_password': self.id, 'exp': time() + expires_in},
            current_app.config['SECRET_KEY'],
            algorithm='HS256').decode('utf-8')
    
    @staticmethod
    def verify_reset_password_token(token):
        try:
            id = jwt.decode(token, current_app.config['SECRET_KEY'],
                            algorithms=['HS256'])['reset_password']
        except:
            return
        return User.query.get(id)
    
    def new_messages(self):
        last_read_time = self.last_message_read_time or datetime(1900, 1, 1)
        return Message.query.filter_by(recipient=self).filter(
            Message.timestamp > last_read_time).count()
    
    def add_notification(self, name, data):
        self.notifications.filter_by(name=name).delete()
        n = Notification(name=name, payload_json=json.dumps(data), user=self)
        db.session.add(n)
        return n
    
    def launch_task(self, name, description, *args, **kwargs):
        rq_job = current_app.task_queue.enqueue('app.tasks.' + name, self.id,
                                                *args, **kwargs)
        task = Task(id=rq_job.get_id(), name=name, description=description,
                    user=self)
        db.session.add(task)
        return task
    
    def get_tasks_in_progress(self):
        return Task.query.filter_by(user=self, complete=False).all()
    
    def get_task_in_progress(self, name):
        return Task.query.filter_by(name=name, user=self,
                                    complete=False).first()
    
    def to_dict(self, include_email=False, access_token=False):
        
        data = {
            'id'            : self.hash_id,
            'username'      : self.username,
            'last_seen'     : self.last_seen.isoformat() + 'Z',
            'about_me'      : self.about_me,
            'post_count'    : self.posts.count(),
            'follower_count': self.followers.count(),
            'followed_count': self.followed.count(),
            'phone'         : self.phone,
            'email'         : self.email,
            'github'        : self.github,
            '_links'        : {
                'avatar'   : self.avatar_src or self.avatar(128)
            }
        }
        if include_email:
            data['email'] = self.email
        if access_token:
            data['access_token'] = self.get_token()
        return data
    
    def from_dict(self, data, new_user=False):
        for field in ['username', 'email', 'about_me']:
            if field in data:
                setattr(self, field, data[field])
        if new_user and 'password' in data:
            self.set_password(data['password'])
    
    def get_token(self, expires_in=3600 * 24):
        now = datetime.utcnow()
        if self.token and self.token_expiration > now + timedelta(seconds=60):
            return self.token
        self.token = base64.b64encode(os.urandom(24)).decode('utf-8')
        self.token_expiration = now + timedelta(seconds=expires_in)
        db.session.add(self)
        return self.token
    
    def revoke_token(self):
        self.token_expiration = datetime.utcnow() - timedelta(seconds=1)
    
    @staticmethod
    def check_token(token):
        user = User.query.filter_by(token=token).first()
        if user is None or user.token_expiration < datetime.utcnow():
            return None
        return user


@login.user_loader
def load_user(id):
    return User.query.get(int(id))


class Post(SearchableMixin, db.Model):
    __searchable__ = ['body', 'title']
    
    def _default_user(self):
        if current_user:
            return current_user.id
        else:
            return None
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(140), default='Untitled story')
    body = db.Column(db.Text())
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), default=_default_user)
    published = db.Column(db.Boolean(), default=False)
    clap_count = db.Column(db.Integer, default=0)
    read_count = db.Column(db.Integer, default=0)
    
    def add_to_index(self):
        if self.published:
            add_to_index(self.__tablename__, self)

    def remove_from_index(self):
        if self.published:
            remove_from_index(self.__tablename__, self)
    
    def action_publish(self):
        self.published = True
        self.add_to_index()
        
    
    def action_draft(self):
        self.published = False
        self.remove_from_index()
    
    def __repr__(self):
        return '<Post {}>'.format(self.title)
    
    def is_following(self):
        if current_user:
            is_following = current_user.is_following(self.author)
            return is_following
        else:
            return False
    
    def to_dict(self):
        data = {
            'id'              : self.hash_id,
            'title'           : self.title,
            'body'            : self.body,
            'is_following'    : self.is_following(),
            'author'          : self.author and self.author.to_dict(),
            'timestamp'       : self.timestamp.isoformat() + 'Z',
            'clap_users_count': self.clap_users.count(),
            'published'       : self.published,
            'clap_count'      : self.clap_count or 0,
            'tags'            : [tag.to_dict() for tag  in self.tags],
        }
        return data
    
    def clap(self, uid):
        self.clap_count = (self.clap_count or 0) + 1;
        user = User.query.get(uid)
        if user not in self.clap_users:
            self.clap_users.append(user)
            db.session.add(self)
        return self.clap_count


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    body = db.Column(db.String(140))
    unread = db.Column(db.Boolean(), default=True)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    
    def __repr__(self):
        return '<Message {}>'.format(self.body)


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    timestamp = db.Column(db.Float, index=True, default=time)
    unread = db.Column(db.Boolean(), default=True)
    body = db.Column(db.String(140))
    
    def __repr__(self):
        return '<Message {}>'.format(self.name)

class Task(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(128), index=True)
    description = db.Column(db.String(128))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    complete = db.Column(db.Boolean, default=False)
    
    def get_rq_job(self):
        try:
            rq_job = rq.job.Job.fetch(self.id, connection=current_app.redis)
        except (redis.exceptions.RedisError, rq.exceptions.NoSuchJobError):
            return None
        return rq_job
    
    def get_progress(self):
        job = self.get_rq_job()
        return job.meta.get('progress', 0) if job is not None else 100
    
class Comment(db.Model):
    _N = 6

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(140))
    author = db.Column(db.String(32))
    email = db.Column(db.String(120), index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    timestamp = db.Column(db.DateTime(), default=datetime.utcnow, index=True)
    thread_timestamp = db.Column(db.DateTime(), default=datetime.utcnow, index=True)
    path = db.Column(db.Text, index=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('comment.id'))
    replies = db.relationship(
        'Comment', backref=db.backref('parent', remote_side=[id]),
        lazy='dynamic')
    post_id = db.Column(db.Integer, db.ForeignKey('post.id', ondelete='CASCADE'))
    
    def reply(self, text):
        return Comment(text=text, parent = self)
    
    def to_dict(self):
        user = User.query.get(self.user_id)
        data = {
            'id': self.hash_id,
            'text': self.text,
            'author': user and user.to_dict(),
            'email': self.email,
            'parent_id': self.parent_id,
            'reply_to': self.parent and self.parent.email,
            'level': self.level(),
            'timestamp': self.timestamp.isoformat() + 'Z'
        }
        return data
    

    def save(self):
        db.session.add(self)
        db.session.commit()
        prefix = self.parent.path + '.' if self.parent else ''
        self.path = prefix + '{:0{}d}'.format(self.id, self._N)
        if self.parent:
            self.thread_timestamp = self.parent.thread_timestamp
        db.session.commit()

    def level(self):
        return len(self.path) // self._N - 1
