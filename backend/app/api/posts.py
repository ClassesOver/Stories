# -*- coding: utf-8 -*-

from flask import jsonify, request, abort
from flask_login import current_user
from app import db
from app.models import Post, Comment
from app.api import bp
from app.api.auth import token_auth
from .errors import error_response
from sqlalchemy import or_, desc


@bp.route('/posts/search', methods=['GET'])
def search_posts():
    page = request.args.get('page', 1, type=int)
    value = request.args.get('value', '')
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    if value:
        query, total = Post.search(value, page=page, per_page=per_page)
        data = {
            'items'   : [post.to_dict() for post in query.all()],
            'total'   : total,
            'page'    : page,
            'per_page': per_page,
        }
        return jsonify(data)
    else:
        return jsonify({})

@bp.route('/posts/trending', methods=['GET'])
def get_trending_posts():
    return jsonify(
        [post.to_dict() for post in
         Post.query.filter_by(published=True).order_by(Post.read_count.desc()).order_by(Post.clap_count.desc()).limit(10).all()])

@bp.route('/posts', methods=['GET'])
def get_posts():
    limit = int(request.args.get('limit')) or 20
    offset = int(request.args.get('offset')) or 0
    return jsonify(
        [post.to_dict() for post in
         Post.query.filter_by(published=True).order_by(Post.timestamp.desc()).limit(limit).offset(offset).all()])


@bp.route('/posts/<hash_id>/comments', methods=['POST'])
def create_post_comment(hash_id):
    post = Post.get_or_404(hash_id)
    if current_user and not current_user.is_anonymous:
        author = current_user.username
        email = current_user.email
    else:
        author = request.json.get('author')
        email = request.json.get('email')
    page = request.json.get('page')
    per_page = request.json.get('per_page')
    text = request.json.get('text')
    comment = Comment(text=text, author=author, email=email, post_id=post.id)
    comment.save()
    db.session.commit()
    query = Comment.query.filter(Comment.post_id == post.id).order_by(Comment.thread_timestamp.desc(),
                                                              Comment.path.asc())

    resources = query.paginate(page, per_page, False)
    for item in resources.items:
        if item.id == comment.id:
            return {'page': page}
    return {'page': page + 1 ,'per_page': per_page}

@bp.route('/posts/<hash_id>/comments', methods=['GET'])
def get_post_comments(hash_id):
    post = Post.get_or_404(hash_id)
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    query = Comment.query.filter(Comment.post_id == post.id).order_by(Comment.thread_timestamp.desc(),
                                                                      Comment.path.asc())
    data = Comment.to_collection_dict(query, page, per_page, 'api.get_post_comments', hash_id=hash_id)
    return jsonify(data)


@bp.route('/posts/draft', methods=['GET'])
@token_auth.login_required
def get_draft_posts():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    query = Post.query.filter(Post.user_id == current_user.id).filter(
        or_(Post.published == None, Post.published == False)).order_by(desc(Post.timestamp))
    data = Post.to_collection_dict(query, page, per_page, 'api.get_draft_posts')
    return jsonify(data)


@bp.route('/posts/published', methods=['GET'])
@token_auth.login_required
def get_published_posts():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    query = Post.query.filter((Post.user_id == current_user.id)).filter(Post.published == True).order_by(
        desc(Post.timestamp))
    data = Post.to_collection_dict(query, page, per_page, 'api.get_published_posts')
    return jsonify(data)


@bp.route('/posts/<hash_id>/publish', methods=['PUT'])
@token_auth.login_required
def publish_post(hash_id):
    post = Post.get_or_404(hash_id)
    post.action_publish()
    db.session.commit()
    return jsonify(True)

@bp.route('/posts/<hash_id>/draft', methods=['PUT'])
@token_auth.login_required
def draft_post(hash_id):
    post = Post.get_or_404(hash_id)
    post.action_draft()
    db.session.commit()
    return jsonify(True)

@bp.route('/posts', methods=['POST'])
@token_auth.login_required
def create_post():
    body = request.json.get('body')
    title = request.json.get('title')
    post = Post(title=title, body=body)
    db.session.add(post)
    db.session.commit()
    return jsonify(post.hash_id)


@bp.route('/posts/<hash_id>', methods=['DELETE'])
def delete_post(hash_id):
    post = Post.get_or_404(hash_id)
    Post.query.filter(Post.id == post.id).delete()
    db.session.commit()
    return jsonify(True)


@bp.route('/posts/<hash_id>', methods=['GET'])
def get_post(hash_id):
    post = Post.get_or_404(hash_id)
    if post and post.published:
        post.read_count = (post.read_count or 0 )+ 1
        db.session.add(post)
        db.session.commit()
        return jsonify(post.to_dict())
    elif post and current_user and not current_user.is_anonymous and post.user_id == current_user.id:
        return jsonify(post.to_dict())
    else:
        return error_response(404)


@bp.route('/posts/<hash_id>', methods=['PUT'])
@token_auth.login_required
def update_post(hash_id):
    post = Post.get_or_404(hash_id)
    if post and post.user_id != current_user.id:
        return error_response(401)
    body = request.json.get('body')
    title = request.json.get('title')
    post.title = title
    post.body = body
    db.session.add(post)
    db.session.commit()
    return jsonify(True)


@bp.route('/posts/<hash_id>/clap', methods=['PUT'])
@token_auth.login_required
def post_clap(hash_id):
    post = Post.get_or_404(hash_id)
    post.clap(current_user.id)
    db.session.add(post)
    db.session.commit()
    
    return jsonify({'clap_count': post.clap_count})
