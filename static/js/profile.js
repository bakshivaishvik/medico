const API_BASE = window.location.origin;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_BASE}/api/profile`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const profile = await response.json();
            populateForm(profile);
        }
        
        // Add contact button functionality
        document.getElementById('addContact').addEventListener('click', addContactField);
        
        // Remove contact buttons
        document.querySelectorAll('.remove-contact').forEach(button => {
            button.addEventListener('click', removeContactField);
        });
        
        // Form submission
        document.getElementById('profileForm').addEventListener('submit', handleSubmit);
    } catch (error) {
        showError('Failed to load profile data');
    }
});

function populateForm(profile) {
    if (!profile) return;
    
    const form = document.getElementById('profileForm');
    const profileData = profile.profile_data;
    
    // Fill basic fields
    form.elements.full_name.value = profileData.full_name || '';
    form.elements.dob.value = profileData.dob || '';
    form.elements.blood_group.value = profileData.blood_group || '';
    form.elements.allergies.value = profileData.allergies || '';
    form.elements.conditions.value = profileData.conditions || '';
    form.elements.medications.value = profileData.medications || '';
    form.elements.surgeries.value = profileData.surgeries || '';
    document.getElementById('consent').checked = profile.consent_given || false;
    
    // Clear existing contacts
    const contactsContainer = document.getElementById('contactsContainer');
    contactsContainer.innerHTML = '';
    
    // Add contact fields
    profileData.emergency_contacts.forEach(contact => {
        addContactField(contact);
    });
}

function addContactField(contact = {}) {
    const contactsContainer = document.getElementById('contactsContainer');
    const contactId = Date.now();
    
    const contactHtml = `
        <div class="contact-group border p-3 rounded-lg mb-3" data-id="${contactId}">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label class="block text-xs font-medium mb-1">Name</label>
                    <input type="text" name="contact_name[]" value="${contact.name || ''}" required 
                           class="w-full p-2 border rounded">
                </div>
                <div>
                    <label class="block text-xs font-medium mb-1">Phone</label>
                    <input type="tel" name="contact_phone[]" value="${contact.phone || ''}" required 
                           class="w-full p-2 border rounded">
                </div>
                <div>
                    <label class="block text-xs font-medium mb-1">Relation</label>
                    <input type="text" name="contact_relation[]" value="${contact.relation || ''}" required 
                           class="w-full p-2 border rounded">
                </div>
            </div>
            <button type="button" class="remove-contact mt-2 text-red-600 text-sm">Remove</button>
        </div>
    `;
    
    contactsContainer.insertAdjacentHTML('beforeend', contactHtml);
    
    // Add event listener to new remove button
    const newGroup = contactsContainer.querySelector(`[data-id="${contactId}"]`);
    newGroup.querySelector('.remove-contact').addEventListener('click', removeContactField);
}

function removeContactField(e) {
    const contactGroup = e.target.closest('.contact-group');
    if (contactGroup) {
        contactGroup.remove();
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const errorElement = document.getElementById('errorMessage');
    errorElement.classList.add('hidden');
    
    // Validate consent
    if (!form.consent.checked) {
        showError('You must consent to share your data');
        return;
    }
    
    // Gather contact data
    const contacts = [];
    const contactGroups = form.querySelectorAll('.contact-group');
    
    contactGroups.forEach(group => {
        contacts.push({
            name: group.querySelector('[name="contact_name[]"]').value,
            phone: group.querySelector('[name="contact_phone[]"]').value,
            relation: group.querySelector('[name="contact_relation[]"]').value
        });
    });
    
    if (contacts.length === 0) {
        showError('At least one emergency contact is required');
        return;
    }
    
    // Prepare data
    const profileData = {
        full_name: form.elements.full_name.value,
        dob: form.elements.dob.value,
        blood_group: form.elements.blood_group.value,
        allergies: form.elements.allergies.value,
        conditions: form.elements.conditions.value,
        medications: form.elements.medications.value,
        surgeries: form.elements.surgeries.value,
        emergency_contacts: contacts,
        consent: form.consent.checked
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/dashboard';
        } else {
            const errorData = await response.json();
            showError(errorData.error || 'Failed to save profile');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    }
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}