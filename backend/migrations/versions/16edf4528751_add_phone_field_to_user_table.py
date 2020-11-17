"""add phone field to user table

Revision ID: 16edf4528751
Revises: 344c4f7a3eba
Create Date: 2020-10-28 15:59:27.794375

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '16edf4528751'
down_revision = '344c4f7a3eba'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('phone', sa.String(length=20), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('phone')

    # ### end Alembic commands ###
