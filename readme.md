
# 🏥 Patient QR Medical Record Web App

Securely store and share medical records using QR codes. This full-stack web application enables users to generate unique, public-friendly QR links to share their vital health data — instantly accessible in emergencies.

---

## 🚀 Features

✅ Secure user registration using Firebase Authentication  
✅ Input medical details via a clean, user-friendly form  
✅ Auto-generate a secure, unguessable public link + QR code  
✅ Download and share QR code image  
✅ Public page displays vital health and emergency contact info  
✅ Explicit user consent required before sharing  
✅ Mobile-first, responsive design  
✅ Data encryption and secure connections

---

## 🖼️ Demo

![QR Demo Screenshot](https://via.placeholder.com/600x300.png?text=QR+Profile+Demo)

> Scan the QR to see a read-only medical profile!

---

## 🛠️ Tech Stack

| Layer       | Technology             |
|------------|------------------------|
| Frontend   | HTML, CSS, JS (No Tailwind) |
| Backend    | Python, Flask           |
| Database   | MongoDB (Local or Atlas) |
| Auth       | Firebase Authentication |
| QR Code    | `pyqrcode`, `pypng`     |
| Hosting    | Flask: Render/Fly.io/Heroku<br>Frontend: (optional) Vercel |

---

## ⚙️ Local Development Setup (Windows)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/patient-qr-app.git
cd patient-qr-app
```

### 2. Create and Activate a Virtual Environment

```bash
py -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup Firebase

- Go to [Firebase Console](https://console.firebase.google.com)
- Create a new project
- Enable **Email/Password** authentication
- Generate a **private key** (Service account)
- Store credentials as environment variables in `.env` (see `.env.example`)

```env
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
...
```

### 5. Setup MongoDB

#### Option 1: Local MongoDB (default)

```env
MONGO_URI=mongodb://localhost:27017
```

#### Option 2: MongoDB Atlas

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/patientqr?retryWrites=true&w=majority
```

### 6. Run the App

```bash
python app.py
```

Navigate to: http://localhost:5000

---

## 📝 Usage

### 🧑‍⚕️ 1. Register/Login
Users can create an account via email/password (Firebase).

### 🧾 2. Fill Medical Profile
Form includes:
- Full name, DOB, blood group
- Allergies, conditions, medications
- Past surgeries
- Emergency contact (name, phone, relation)

### 🧬 3. Generate QR Code
Once submitted, a secure URL is created and encoded into a downloadable QR code.

### 🆘 4. Scan to View
Scanning the QR code opens a clean, public page showing the user’s medical info and emergency contacts.

---

## 🔐 Security & Privacy

- ✅ Firebase Authentication for secure login
- ✅ Non-sequential, tokenized public URLs (e.g. `/p/a83b2kz91`)
- ✅ Consent required before sharing public data
- ✅ HTTPS for encrypted transport (in deployment)
- ✅ No sensitive data displayed without user approval

---

## 📦 Deployment

### Backend

| Platform | Steps |
|----------|-------|
| **Render** | Set up Python environment, add environment variables |
| **Fly.io** | Use Docker or flyctl to deploy |
| **Heroku** | `git push heroku main` with config vars set |

### Optional: Frontend (if decoupled)

Use **Vercel**, **Netlify**, or serve via Flask templates directly.

---

## 📁 Project Structure

```
patient-qr-app/
├── app.py
├── .env
├── requirements.txt
├── static/
│   └── qr_codes/
├── templates/
│   ├── register.html
│   ├── login.html
│   ├── dashboard.html
│   └── public_profile.html
```

---

## 🧪 Testing

Manual testing steps:

1. Register new user
2. Fill out form with test data
3. Generate and scan QR code
4. Confirm data displays correctly
5. Try invalid tokens (404 page)

---

## 💡 Future Improvements

- ✅ Regenerate or expire QR codes
- ✅ Multi-language support
- ✅ Upload medical documents
- ✅ FHIR API integration
- ✅ Progressive Web App (PWA) version

---

## 🙌 Acknowledgements

- [Firebase](https://firebase.google.com)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [`pyqrcode`](https://pypi.org/project/PyQRCode/)
- [Flask](https://flask.palletsprojects.com)

---

## 📫 Contact

📧 [bakshivaishvik@gmail.com](mailto:bakshivaishvik@gmail.com)  


---

> “life saving information in the matter of seconds”
