# -*- coding: utf-8 -*-
from app import db
from app.api import bp
from app.api.auth import token_auth
from app.models import Post, Tag
from flask import jsonify, request
from flask_login import current_user

@bp.route('/tags', methods=['GET'])
@token_auth.login_required
def get_tags():
    post_hash_id = request.args.get('post_id', False)
    if post_hash_id == 'new':
        return jsonify([])
    post = Post.get_or_404(post_hash_id)
    return jsonify([{'id': tag.hash_id, 'name': tag.name} for tag in post.tags])

@bp.route('/tags', methods=['POST'])
@token_auth.login_required
def new_a_tag():
    post_hash_id = request.json.get('post_id', False)
    name = request.json.get('name', False)
    tags = Tag.query.filter_by(name = name).filter_by(user_id = current_user.id).limit(1).all()
    if not tags:
        tag = Tag(name, user_id = current_user.id)
    else:
        tag = tags[0]
    post = Post.get_or_404(post_hash_id)
    if tag not in post.tags:
        post.tags.append(tag)
        db.session.commit()
    return jsonify({'id': tag.hash_id, 'name': tag.name})


    
@bp.route('/tags', methods=['PUT'])
@token_auth.login_required
def unlink_tag():
    tag_hash_id = request.json.get('tag_id', False)
    post_hash_id = request.json.get('post_id', False)
    tag = Tag.get_or_404(tag_hash_id)
    post = Post.get_or_404(post_hash_id)
    post.tags.remove(tag)
    db.session.add(post)
    db.session.commit()
    return jsonify(True)
