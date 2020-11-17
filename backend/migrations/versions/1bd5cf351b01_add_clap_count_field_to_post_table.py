"""add clap_count field to post table

Revision ID: 1bd5cf351b01
Revises: 6c70e93892e6
Create Date: 2020-10-29 21:00:38.324895

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1bd5cf351b01'
down_revision = '6c70e93892e6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('post', schema=None) as batch_op:
        batch_op.add_column(sa.Column('clap_count', sa.Integer(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('post', schema=None) as batch_op:
        batch_op.drop_column('clap_count')

    # ### end Alembic commands ###
