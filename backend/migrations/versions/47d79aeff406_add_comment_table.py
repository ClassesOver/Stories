"""add comment table.

Revision ID: 47d79aeff406
Revises: 1bd5cf351b01
Create Date: 2020-11-02 17:43:24.359267

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '47d79aeff406'
down_revision = '1bd5cf351b01'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('comment',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('text', sa.String(length=140), nullable=True),
    sa.Column('author', sa.String(length=32), nullable=True),
    sa.Column('email', sa.String(length=120), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('timestamp', sa.DateTime(), nullable=True),
    sa.Column('thread_timestamp', sa.DateTime(), nullable=True),
    sa.Column('path', sa.Text(), nullable=True),
    sa.Column('parent_id', sa.Integer(), nullable=True),
    sa.Column('post_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['parent_id'], ['comment.id'], name=op.f('fk_comment_parent_id_comment')),
    sa.ForeignKeyConstraint(['post_id'], ['post.id'], name=op.f('fk_comment_post_id_post')),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], name=op.f('fk_comment_user_id_user')),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_comment'))
    )
    with op.batch_alter_table('comment', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_comment_email'), ['email'], unique=True)
        batch_op.create_index(batch_op.f('ix_comment_path'), ['path'], unique=False)
        batch_op.create_index(batch_op.f('ix_comment_thread_timestamp'), ['thread_timestamp'], unique=False)
        batch_op.create_index(batch_op.f('ix_comment_timestamp'), ['timestamp'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('comment', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_comment_timestamp'))
        batch_op.drop_index(batch_op.f('ix_comment_thread_timestamp'))
        batch_op.drop_index(batch_op.f('ix_comment_path'))
        batch_op.drop_index(batch_op.f('ix_comment_email'))

    op.drop_table('comment')
    # ### end Alembic commands ###
