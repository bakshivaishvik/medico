const API_BASE = window.location.origin;

document.addEventListener('DOMContentLoaded', async () => {
    const token = window.location.pathname.split('/p/')[1];
    if (!token) {
        renderError('Invalid profile URL');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/public/${token}`);
        
        if (response.ok) {
            const profile = await response.json();
            renderPublicProfile(profile);
        } else {
            const errorData = await response.json();
            renderError(errorData.error || 'Profile not available');
        }
    } catch (error) {
        renderError('Network error. Please try again.');
    }
});

function renderPublicProfile(profile) {
    const profileData = profile.profile_data;
    const lastUpdated = new Date(profile.last_updated);
    
    const profileHTML = `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="bg-blue-800 text-white p-6">
                <h1 class="text-2xl font-bold">${profileData.full_name}'s Medical Profile</h1>
                <p class="opacity-80 text-sm mt-1">Last updated: ${lastUpdated.toLocaleDateString()}</p>
            </div>
            
            <div class="p-6">
                <div class="mb-8 bg-red-50 border-l-4 border-red-500 p-4">
                    <h2 class="text-xl font-bold text-red-700 mb-2">Emergency Contacts</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${profileData.emergency_contacts.map(contact => `
                            <div class="bg-white p-3 rounded shadow">
                                <h3 class="font-bold">${contact.name}</h3>
                                <p class="text-gray-600">${contact.relation}</p>
                                <a href="tel:${contact.phone}" class="text-blue-700 hover:underline">
                                    ${contact.phone}
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div class="border rounded-lg p-4">
                        <h2 class="text-lg font-bold mb-3">Personal Information</h2>
                        <div class="space-y-2">
                            <div><strong>Date of Birth:</strong> ${profileData.dob}</div>
                            <div><strong>Blood Group:</strong> ${profileData.blood_group}</div>
                        </div>
                    </div>
                    
                    <div class="border rounded-lg p-4">
                        <h2 class="text-lg font-bold mb-3">Allergies</h2>
                        <div>${profileData.allergies || 'None reported'}</div>
                    </div>
                    
                    <div class="border rounded-lg p-4">
                        <h2 class="text-lg font-bold mb-3">Medical Conditions</h2>
                        <div>${profileData.conditions || 'None reported'}</div>
                    </div>
                    
                    <div class="border rounded-lg p-4">
                        <h2 class="text-lg font-bold mb-3">Medications</h2>
                        <div>${profileData.medications || 'None reported'}</div>
                    </div>
                    
                    <div class="border rounded-lg p-4">
                        <h2 class="text-lg font-bold mb-3">Past Surgeries</h2>
                        <div>${profileData.surgeries || 'None reported'}</div>
                    </div>
                </div>
                
                <div class="text-center text-sm text-gray-500">
                    <p>This information is provided by the patient for emergency use only</p>
                    <p>Do not share or use for non-emergency purposes</p>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('profileContainer').innerHTML = profileHTML;
}

function renderError(message) {
    document.getElementById('profileContainer').innerHTML = `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="bg-red-100 text-red-700 p-6">
                <h1 class="text-xl font-bold">Profile Unavailable</h1>
            </div>
            <div class="p-8 text-center">
                <p class="text-lg mb-4">${message}</p>
                <p class="text-gray-600">This profile may have been disabled or the link may be incorrect.</p>
            </div>
        </div>
    `;
}