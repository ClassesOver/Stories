from flask_httpauth import HTTPTokenAuth
from app.models import User
from flask_login import AnonymousUserMixin
from app.api.errors import error_response

token_auth = HTTPTokenAuth()



class _AnonymousUserMixin(AnonymousUserMixin):
    
    def is_following(self, user):
        return False
    
    def to_dict(self):
        return {}


def init_token_auth(app, login_manager=None):
    header = app.config.get('AUTH_HEADER_NAME') or None
    token_auth.header = header
    if login_manager is None:
        login_manager = app.login_manager
    
    login_manager.anonymous_user = _AnonymousUserMixin
    
    @login_manager.header_loader
    def load_user_from_header(*args):
        auth = token_auth.get_auth()
        user = token_auth.authenticate(auth, None)
        if user and token_auth.authorize(None, user, auth):
            return user
        else:
            return None
    
    @token_auth.verify_token
    def verify_token(token):
        return User.check_token(token) if token else None
    
    @token_auth.error_handler
    def token_auth_error(status):
        return error_response(status)
    
    app.token_auth = token_auth
