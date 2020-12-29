from flask import jsonify, request, url_for, abort
from app import db
from app.models import User, Channel
from app.api import bp
from app.api.auth import token_auth
from app.api.errors import bad_request
from app.api import MessageType
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
    return jsonify([msg.to_dict() for msg in channel.messages])

@bp.route('/users/channels', methods=['GET'])
@token_auth.login_required
def get_channels():
    channels = Channel.query.filter_by(ctype='private').filter(Channel.users.any(id=current_user.id)).all()
    l = []
    for channel in channels:
        users = channel.users.filter(User.id != current_user.id).all()
        if users:
            user = users[0]
            l.append({'user': user.to_dict(), 'channel': channel.to_dict()})
    return jsonify(l)
            