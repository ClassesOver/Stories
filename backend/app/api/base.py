# -*- coding: utf-8 -*-
from app.models import User
from flask import jsonify, request
from flask_login import current_user
from app.api import bp
from app.api.auth import token_auth
from app import db
from app.models import Post

_ModelMap = {
    'post': Post
}

@bp.route('/logout', methods=['POST'])
@token_auth.login_required
def logout():
    token_auth.current_user().revoke_token()
    db.session.commit()
    return '', 204

@bp.route('/login', methods=['POST'])
def login():
    payload = request.json
    username = payload['username']
    password = payload['password']
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify(
            {
                'user': None,
                'message': 'The user cannot exist.'
            }
        )
    elif user and not user.check_password(password):
        return jsonify(
            {
                'user': None,
                'message': 'The password is incorrect.'
            }
        )
    else:
        user_d = user.to_dict()
        user_d['access_token'] = user.get_token()
        db.session.commit()
        return jsonify({
            'user': user_d,
            'message': 'User login succeeded.'
        })


@bp.route('/user_info', methods=['GET'])
@token_auth.login_required
def user_info():
    return jsonify(current_user.to_dict(access_token=True))

