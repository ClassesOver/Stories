#!/bin/sh
python3 -m venv venv
venv/bin/pip install -r backend/requirements.txt
source venv/bin/activate
export FLASK_APP=backend/wsgi.py
while true; do
    flask db upgrade -d backend/migrations
    if [[ "$?" == "0" ]]; then
        break
    fi
    echo Deploy backend command failed, retrying in 5 secs...
    sleep 5
done
exec flask run --reload -h 0.0.0.0


