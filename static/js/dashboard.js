const API_BASE = window.location.origin;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_BASE}/api/profile`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const profile = await response.json();
            renderProfile(profile);
        } else if (response.status === 404) {
            document.getElementById('noProfile').classList.remove('hidden');
            document.getElementById('hasProfile').classList.add('hidden');
        } else {
            throw new Error('Failed to load profile');
        }
    } catch (error) {
        showError(error.message);
    }
});

function renderProfile(profile) {
    document.getElementById('noProfile').classList.add('hidden');
    document.getElementById('hasProfile').classList.remove('hidden');
    
    // Set last updated
    const lastUpdated = new Date(profile.last_updated);
    document.getElementById('lastUpdated').textContent = `Last updated: ${lastUpdated.toLocaleDateString()}`;
    
    // Update status badge
    const statusBadge = document.getElementById('statusBadge');
    if (!profile.is_active) {
        statusBadge.textContent = "Profile Disabled";
        statusBadge.classList.remove('bg-green-100', 'text-green-800');
        statusBadge.classList.add('bg-red-100', 'text-red-800');
    }
    
    // Render QR code
    const qrContainer = document.getElementById('qrContainer');
    qrContainer.innerHTML = `
        <img src="${API_BASE}/api/qr/${profile.public_token}" 
             alt="Medical QR Code" 
             class="w-48 h-48">
        <p class="mt-2 text-sm text-gray-600">Scan this code to access medical information</p>
    `;
    
    // Set up QR actions
    document.getElementById('downloadQR').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = `${API_BASE}/api/qr/${profile.public_token}`;
        link.download = 'medical-qr.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    document.getElementById('regenerateQR').addEventListener('click', regenerateToken);
    document.getElementById('disableProfile').addEventListener('click', disableProfile);
    
    // Render profile summary
    const profileData = profile.profile_data;
    const profileSummary = document.getElementById('profileSummary');
    profileSummary.innerHTML = `
        <div class="mb-2"><strong>Name:</strong> ${profileData.full_name}</div>
        <div class="mb-2"><strong>Date of Birth:</strong> ${profileData.dob}</div>
        <div class="mb-2"><strong>Blood Group:</strong> ${profileData.blood_group}</div>
        <div class="mb-2"><strong>Allergies:</strong> ${profileData.allergies || 'None reported'}</div>
        <div class="mb-2"><strong>Conditions:</strong> ${profileData.conditions || 'None reported'}</div>
        <div class="mb-2"><strong>Medications:</strong> ${profileData.medications || 'None reported'}</div>
        <div class="mb-2"><strong>Surgeries:</strong> ${profileData.surgeries || 'None reported'}</div>
        <div><strong>Emergency Contacts:</strong> ${profileData.emergency_contacts.length}</div>
    `;
}

async function regenerateToken() {
    try {
        const response = await fetch(`${API_BASE}/api/profile/regenerate`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            // Refresh the page to show new QR code
            window.location.reload();
        } else {
            throw new Error('Failed to regenerate token');
        }
    } catch (error) {
        showError(error.message);
    }
}

async function disableProfile() {
    if (!confirm('Disable your medical profile? This will make your QR code invalid.')) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/profile/disable`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.reload();
        } else {
            throw new Error('Failed to disable profile');
        }
    } catch (error) {
        showError(error.message);
    }
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}