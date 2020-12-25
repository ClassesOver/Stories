from flask import Blueprint
from enum import Enum
bp = Blueprint('api', __name__)

class MessageType:
    INFO = 'info'
    SUCCESS = 'success'
    WARNING = 'warning'
    ERROR = 'error'

from app.api import users, errors, tokens, posts, base, tags, messages
