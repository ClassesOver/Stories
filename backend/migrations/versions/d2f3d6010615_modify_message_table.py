"""modify message table

Revision ID: d2f3d6010615
Revises: fbb3ebcf5f90
Create Date: 2020-12-24 11:56:01.558233

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd2f3d6010615'
down_revision = 'fbb3ebcf5f90'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('message', schema=None) as batch_op:
        batch_op.add_column(sa.Column('res_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('res_model', sa.String(length=16), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('message', schema=None) as batch_op:
        batch_op.drop_column('res_model')
        batch_op.drop_column('res_id')

    # ### end Alembic commands ###
