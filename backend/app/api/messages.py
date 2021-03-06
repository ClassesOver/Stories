# -*- coding: utf-8 -*-
from flask import jsonify, request
from flask_login import current_user
from app.models import Message
from app.api import bp
from app.api.auth import token_auth
from app import db


@bp.route('/messages', methods=['GET'])
@token_auth.login_required
def get_messages():
    limit = int(request.args.get('limit')) or 100
    offset = int(request.args.get('offset')) or 0
    query = Message.query.filter_by(recipient_id=current_user.id).order_by(Message.unread.desc(),
                                                                           Message.timestamp.desc()).limit(
        limit).offset(offset)
    count = Message.query.filter_by(recipient_id=current_user.id).order_by(Message.unread.desc(),
                                                                           Message.timestamp.desc()).count()
    msgs = query.all() or []
    return jsonify({'messages': [msg.to_dict() for msg in msgs], 'count': count})


@bp.route('/messages/<hash_id>/mark_as_read', methods=['PUT'])
@token_auth.login_required
def mark_as_read(hash_id):
    message = Message.get_or_404(hash_id)
    message.unread = False
    db.session.add(message)
    db.session.commit()
    return jsonify(True)


@bp.route('/messages/<hash_id>', methods=['DELETE'])
@token_auth.login_required
def message_delete(hash_id):
    message = Message.get_or_404(hash_id)
    Message.query.filter_by(id=message.id).delete()
    db.session.commit()
    return jsonify(True)
