# -*- coding: utf-8 -*-
from app.models import User
from flask import jsonify, request, render_template
from flask_login import current_user
from app.api import bp
from app.api.auth import token_auth
from app import db
from app.models import Post, VerificationCode
from app.email import send_email
from datetime import datetime, timedelta

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
    no_access_token = request.args.get('no_access_token', '')
    if no_access_token:
        return jsonify(current_user.to_dict(access_token=False))
    return jsonify(current_user.to_dict(access_token=True))

@bp.route('/user_info', methods=['PUT'])
@token_auth.login_required
def save_user_info():
    values = request.json.get('values')
    for k, v in values.items():
        setattr(current_user, k ,v)
    db.session.add(current_user)
    db.session.commit()
    return jsonify(current_user.to_dict(access_token=False))

@bp.route('/verification_code', methods=['POST'])
def generate_verification_code():
    email = request.json.get('email', '')
    vtype = request.json.get('vtype', '')

    user = User.query.filter_by(email=email).all()
    if user: 
        return jsonify({'error': {
            'email': 'This email has been used. Please enter a new email address.'
        }})
    obj = VerificationCode.generate(email, vtype)
    db.session.add(obj)
    db.session.commit()
    html = render_template('user/verification_code.html', vcode = obj.vcode)
    subject = "Please confirm your email"
    send_email(subject, 'System', [email], '', html)
    return jsonify({'error': {}})

@bp.route('/signup', methods=['POST'])
def signup():
    email = request.json.get('email', '')
    password = request.json.get('password', '')
    verification_code = request.json.get('verification_code', '')
    username = request.json.get('username', '')
    vcode = VerificationCode.query.filter_by(active=True).filter_by(email=email).filter_by(vcode=verification_code).all()
    user = User.query.filter_by(email=email).all()
    if user:
        return jsonify({'error': {
            'email': 'This email has been used. Please enter a new email address.'
        }, 'user': False})
    if not vcode:
        return jsonify({'error': {
            'verification_code': 'Wrong verification code.'
        }, 'user': False})
    else:
        flag = False
        for v in vcode:
            if v.expiration <= datetime.utcnow() + timedelta(30):
                flag = True
                break
        if not flag:
            return jsonify({'error': {
                    'verification_code': 'The verification code has expired.'
                }, 'user': False})
    user = User(email=email, username = username)
    user.set_password(password)
    db.session.add(user)
    for v in vcode:
        v.active = False
        db.session.add(v)
    db.session.commit()
    return jsonify({'error': {}, 'user': user.hash_id})
