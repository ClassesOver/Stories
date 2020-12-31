from flask import jsonify, request, url_for, abort
from app import db
from app.models import User, Channel, Message
from app.api import bp
from app.api.auth import token_auth
from app.api.errors import bad_request
from app.api import MessageType
from flask_socketio import emit, join_room
import json
from flask_login import current_user

@bp.route('/users/<hash_id>/followers', methods=['PUT'])
@token_auth.login_required
def follow(hash_id):
    user = User.get(hash_id)
    if user is None:
        message = 'User not found.'
        jsonify({'message': message, 'mtype': MessageType.ERROR})
    if user == current_user:
        message = 'You cannot follow yourself!'
        jsonify({'message': message, 'mtype': MessageType.WARNING})
    message = 'You are following %s!' % user.username
    current_user.follow(user)
    db.session.commit()
    return jsonify({'message': message, 'mtype': MessageType.SUCCESS})


@bp.route('/users/<hash_id>/followed', methods=['PUT'])
@token_auth.login_required
def unfollow(hash_id):
    user = User.get(hash_id)
    if user is None:
        message = 'User not found.'
        return  jsonify({'message': message, 'mtype': MessageType.ERROR})
    if user == current_user:
        message = 'You cannot unfollow yourself!'
        return  jsonify({'message': message, 'mtype': MessageType.WARNING})
    message = 'You are unfollowing %s!' % user.username
    current_user.unfollow(user)
    db.session.commit()
    return jsonify({'message': message, 'mtype': MessageType.SUCCESS})


@bp.route('/users/<int:id>', methods=['GET'])
@token_auth.login_required
def get_user(id):
    return jsonify(User.query.get_or_404(id).to_dict())


@bp.route('/users', methods=['GET'])
@token_auth.login_required
def get_users():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    data = User.to_collection_dict(User.query, page, per_page, 'api.get_users')
    return jsonify(data)


@bp.route('/users/<int:id>/followers', methods=['GET'])
@token_auth.login_required
def get_followers(id):
    user = User.query.get_or_404(id)
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    data = User.to_collection_dict(user.followers, page, per_page,
                                   'api.get_followers', id=id)
    return jsonify(data)


@bp.route('/users/<int:id>/followed', methods=['GET'])
@token_auth.login_required
def get_followed(id):
    user = User.query.get_or_404(id)
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    data = User.to_collection_dict(user.followed, page, per_page,
                                   'api.get_followed', id=id)
    return jsonify(data)


@bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    if 'username' not in data or 'email' not in data or 'password' not in data:
        return bad_request('must include username, email and password fields')
    if User.query.filter_by(username=data['username']).first():
        return bad_request('please use a different username')
    if User.query.filter_by(email=data['email']).first():
        return bad_request('please use a different email address')
    user = User()
    user.from_dict(data, new_user=True)
    db.session.add(user)
    db.session.commit()
    response = jsonify(user.to_dict())
    response.status_code = 201
    response.headers['Location'] = url_for('api.get_user', id=user.id)
    return response


@bp.route('/users/<int:id>', methods=['PUT'])
@token_auth.login_required
def update_user(id):
    if token_auth.current_user().id != id:
        abort(403)
    user = User.query.get_or_404(id)
    data = request.get_json() or {}
    if 'username' in data and data['username'] != user.username and \
            User.query.filter_by(username=data['username']).first():
        return bad_request('please use a different username')
    if 'email' in data and data['email'] != user.email and \
            User.query.filter_by(email=data['email']).first():
        return bad_request('please use a different email address')
    user.from_dict(data, new_user=False)
    db.session.commit()
    return jsonify(user.to_dict())


@bp.route('/users/private_channel/invite', methods=['GET'])
@token_auth.login_required
def private_channel_get():
    user_hash_id = request.args.get('user_id')
    other = User.get_or_404(user_hash_id)
    if current_user.id != other.id:
        channel = Channel.private_channel_get(current_user, other)
        return jsonify(channel)
    return jsonify({})


@bp.route('/users/private_messages', methods=['GET'])
@token_auth.login_required
def private_messages_get():
    channel_hash_id = request.args.get('channel_id')
    channel = Channel.get(channel_hash_id)
    l = []
    for msg in channel.messages:
        if msg.sender_id == current_user.id:
            if msg.unread:
                status = 'sent'
            else:
                status = 'read'
        else:
            msg.unread = False
            db.session.commit()
            status = 'received'
        recipient = User.query.get(msg.recipient_id)
        sender = User.query.get(msg.sender_id)
        d = {
            'position'    : msg.sender_id == current_user.id and 'right' or 'left',
            'date'        : msg.timestamp.isoformat() + 'Z',
            'status'      : status,
            'text'        : msg.body,
            'type'        : 'text',
            'id'          : msg.hash_id,
            'recipient_id': recipient.hash_id,
            'sender_id'   : sender.hash_id,
            'channel_id'  : msg.channel.hash_id
        }
        l.append(d)
    return jsonify(l)

@bp.route('/users/channels', methods=['GET'])
@token_auth.login_required
def get_channels():
    channels = Channel.query.filter_by(ctype='private').filter(Channel.users.any(id=current_user.id)).all()
    l = []
    for channel in channels:
        users = channel.users.filter(User.id != current_user.id).all()
        if users:
            user = users[0]
            message = channel.messages.order_by(Message.timestamp.desc()).first()
            unread = channel.messages.filter_by(unread=True).filter_by(recipient_id=current_user.id).count()
            l.append({
                      'avatar'    : user.avatar_src or user.avatar(128),
                      'alt'       : user.username[0],
                      'title'     : user.username,
                      'subtitle'  : message and message.body,
                      'date'      : message and message.timestamp.isoformat() + 'Z',
                      'unread'    : unread,
                      'user_id'   : user.hash_id,
                      'channel_id': channel.hash_id})
    return jsonify(l)
@bp.route('/users/send_private_message', methods=['POST'])
@token_auth.login_required
def send_private_message():
    user_hash_id = request.json.get('user_id')
    uuid = request.json.get('uuid', '')
    other = User.get_or_404(user_hash_id)
    content = request.json.get('content', '')
    if current_user.id != other.id:
        channel_d = Channel.private_channel_get(current_user, other)
        channel_obj = Channel.get(channel_d['id'])
        msg_obj = channel_obj.send_private_message(current_user, other, content)
        db.session.commit()
        recipient = User.query.get(msg_obj.recipient_id)
        sender = User.query.get(msg_obj.sender_id)
        new_message = {
            'position'    : msg_obj.sender_id == current_user.id and 'right' or 'left',
            'date'        : msg_obj.timestamp.isoformat() + 'Z',
            'text'        : msg_obj.body,
            'type'        : 'text',
            'id'          : msg_obj.hash_id,
            'recipient_id': recipient.hash_id,
            'sender_id'   : sender.hash_id,
            'uuid'        : uuid,
            'channel_id'  : msg_obj.channel.hash_id
        }
        return jsonify(new_message)
