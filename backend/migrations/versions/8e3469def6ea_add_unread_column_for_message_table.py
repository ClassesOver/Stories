"""add unread column for message table

Revision ID: 8e3469def6ea
Revises: e6c5aeb5f08b
Create Date: 2020-12-22 11:54:00.425939

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8e3469def6ea'
down_revision = 'e6c5aeb5f08b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('message', schema=None) as batch_op:
        batch_op.add_column(sa.Column('unread', sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('message', schema=None) as batch_op:
        batch_op.drop_column('unread')

    # ### end Alembic commands ###
