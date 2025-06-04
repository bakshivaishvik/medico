import os
import secrets
from flask import Flask, jsonify, request, send_file, render_template, redirect, make_response
from flask_cors import CORS
from pymongo import MongoClient
import pyqrcode
from io import BytesIO
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv
import logging
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Firebase
cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIALS_PATH"))
firebase_admin.initialize_app(cred)

# MongoDB Setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client.med_records
profiles = db.profiles

# Rate Limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# HTTPS Enforcement Middleware
@app.before_request
def enforce_https():
    if request.headers.get('X-Forwarded-Proto') == 'http' and os.getenv('FLASK_ENV') == 'production':
        url = request.url.replace('http://', 'https://', 1)
        return redirect(url, code=301)

def auth_required(f):
    def decorated(*args, **kwargs):
        id_token = request.cookies.get('token')
        if not id_token:
            return redirect('/login')
        try:
            decoded_token = auth.verify_id_token(id_token)
            request.uid = decoded_token['uid']
        except Exception as e:
            logging.error(f"Token verification failed: {str(e)}")
            return redirect('/login')
        return f(*args, **kwargs)
    return decorated

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/dashboard')
@auth_required
def dashboard_page():
    return render_template('dashboard.html')

@app.route('/profile')
@auth_required
def profile_form_page():
    return render_template('profile-form.html')

@app.route('/p/<token>')
def public_profile_page(token):
    return render_template('public-profile.html', token=token)

@app.route('/api/login', methods=['POST'])
def login():
    id_token = request.json.get('token')
    try:
        decoded_token = auth.verify_id_token(id_token)
        response = make_response(jsonify({"message": "Login successful"}))
        response.set_cookie('token', id_token, httponly=True, secure=True, samesite='Strict')
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Logged out"}))
    response.set_cookie('token', '', expires=0)
    return response

@app.route('/api/profile', methods=['POST'])
@auth_required
def create_profile():
    data = request.json
    if not data.get('consent'):
        return jsonify({"error": "Consent required"}), 400
    
    # Generate secure token
    public_token = secrets.token_urlsafe(16)
    
    profile = {
        "user_id": request.uid,
        "public_token": public_token,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "last_updated": datetime.utcnow(),
        "consent_given": True,
        "profile_data": {
            "full_name": data['full_name'],
            "dob": data['dob'],
            "blood_group": data['blood_group'],
            "allergies": data.get('allergies', ''),
            "conditions": data.get('conditions', ''),
            "medications": data.get('medications', ''),
            "surgeries": data.get('surgeries', ''),
            "emergency_contacts": data['emergency_contacts']
        }
    }
    
    result = profiles.insert_one(profile)
    if result.inserted_id:
        return jsonify({
            "message": "Profile created",
            "public_token": public_token
        }), 201
    return jsonify({"error": "Database error"}), 500

@app.route('/api/profile', methods=['GET'])
@auth_required
def get_profile():
    profile = profiles.find_one({"user_id": request.uid}, {'_id': 0})
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(profile), 200

@app.route('/api/profile/disable', methods=['POST'])
@auth_required
def disable_profile():
    result = profiles.update_one(
        {"user_id": request.uid},
        {"$set": {"is_active": False}}
    )
    if result.modified_count > 0:
        return jsonify({"message": "Profile disabled"}), 200
    return jsonify({"error": "Profile not found"}), 404

@app.route('/api/profile/regenerate', methods=['POST'])
@auth_required
def regenerate_token():
    new_token = secrets.token_urlsafe(16)
    result = profiles.update_one(
        {"user_id": request.uid},
        {"$set": {
            "public_token": new_token,
            "last_updated": datetime.utcnow()
        }}
    )
    if result.modified_count > 0:
        return jsonify({"public_token": new_token}), 200
    return jsonify({"error": "Profile not found"}), 404

@app.route('/api/qr/<token>', methods=['GET'])
@limiter.limit("10/minute")
def get_qr(token):
    profile = profiles.find_one({"public_token": token, "is_active": True})
    if not profile:
        return jsonify({"error": "Invalid token"}), 404
    
    url = f"{os.getenv('FRONTEND_URL')}/p/{token}"
    qr = pyqrcode.create(url)
    buffer = BytesIO()
    qr.png(buffer, scale=8)
    buffer.seek(0)
    
    response = make_response(send_file(buffer, mimetype='image/png'))
    response.headers['Cache-Control'] = 'no-store, max-age=0'
    return response

@app.route('/api/public/<token>', methods=['GET'])
@limiter.limit("10/minute")
def public_profile(token):
    profile = profiles.find_one(
        {"public_token": token, "is_active": True},
        {'_id': 0, 'user_id': 0}
    )
    if not profile:
        return jsonify({"error": "Profile not available"}), 404
    
    if not profile.get('consent_given', False):
        return jsonify({"error": "Consent withdrawn"}), 403
    
    return jsonify(profile), 200

if __name__ == '__main__':
    app.run(ssl_context='adhoc' if os.getenv('FLASK_ENV') == 'development' else None)