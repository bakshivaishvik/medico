// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Handle login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('errorMessage');
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const idToken = await userCredential.user.getIdToken();
        
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: idToken })
        });
        
        if (response.ok) {
            window.location.href = '/dashboard';
        } else {
            const errorData = await response.json();
            showError(errorData.error || 'Login failed');
        }
    } catch (error) {
        showError(error.message);
    }
});

// Handle registration
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    const errorElement = document.getElementById('errorMessage');
    
    if (password !== passwordConfirm) {
        showError("Passwords don't match");
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const idToken = await userCredential.user.getIdToken();
        
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: idToken })
        });
        
        if (response.ok) {
            window.location.href = '/profile';
        } else {
            const errorData = await response.json();
            showError(errorData.error || 'Registration failed');
        }
    } catch (error) {
        showError(error.message);
    }
});

// Handle logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
        await fetch('/api/logout', { method: 'POST' });
        await auth.signOut();
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Auth state listener
auth.onAuthStateChanged(user => {
    const publicProfilePaths = window.location.pathname.startsWith('/p/');
    
    if (!user && !publicProfilePaths) {
        // Redirect to login if not authenticated and not on a public page
        if (window.location.pathname !== '/login' && 
            window.location.pathname !== '/register') {
            window.location.href = '/login';
        }
    }
});

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}