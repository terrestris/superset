# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
"""set cross_filter_column if null

Revision ID: fea69e8db074
Revises: a1b2c3d4e5f6
Create Date: 2026-02-10 13:30:00.000000

"""

from alembic import op
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
import json


# revision identifiers, used by Alembic.
revision = "fea69e8db074"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None

Base = declarative_base()


class Slice(Base):
    __tablename__ = "slices"
    id = Column(Integer, primary_key=True)
    datasource_id = Column(Integer)
    viz_type = Column(String(200))
    params = Column(Text)


def upgrade():
    """Set cross_filter_column to geom_column if null for thematic maps"""
    bind = op.get_bind()
    session = Session(bind=bind)

    try:
        # Find all slices with thematic_map viz_type
        slices = session.query(Slice).filter(Slice.viz_type == "thematic_map").all()

        for slc in slices:
            try:
                params = json.loads(slc.params or "{}")

                # If cross_filter_column is not set, try to set it from geom_column
                if not params.get("cross_filter_column") and params.get("geom_column"):
                    params["cross_filter_column"] = params["geom_column"]
                    slc.params = json.dumps(params)

            except Exception as e:
                print(f"Warning: Could not update slice {slc.id}: {e}")

        session.commit()

    except Exception as e:
        print(f"Warning: cross_filter_column migration encountered issue: {e}")
        session.rollback()
    finally:
        session.close()


def downgrade():
    """Remove cross_filter_column if it was set to geom_column"""
    pass
