"""add && remove fields to post table

Revision ID: 344c4f7a3eba
Revises: 85b4f61be863
Create Date: 2020-10-28 00:39:49.966798

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '344c4f7a3eba'
down_revision = '85b4f61be863'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('post', schema=None) as batch_op:
        batch_op.add_column(sa.Column('published', sa.Boolean(), nullable=True))
        batch_op.drop_column('language')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('post', schema=None) as batch_op:
        batch_op.add_column(sa.Column('language', sa.VARCHAR(length=5), nullable=True))
        batch_op.drop_column('published')

    # ### end Alembic commands ###