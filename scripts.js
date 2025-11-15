// API Base URL Configuration
function getApiUrl() {
    return document.getElementById('apiUrl').value.trim();
}

// Utility Functions
function showResult(elementId, data, isError = false) {
    const resultDiv = document.getElementById(elementId);
    resultDiv.classList.add('show');
    resultDiv.classList.remove('success', 'error');
    resultDiv.classList.add(isError ? 'error' : 'success');
    resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

function hideResult(elementId) {
    const resultDiv = document.getElementById(elementId);
    resultDiv.classList.remove('show');
}

// API Request Handler
async function apiRequest(endpoint, method = 'GET', body = null) {
    const baseUrl = getApiUrl();
    const url = `${baseUrl}${endpoint}`;
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        return {
            ok: response.ok,
            status: response.status,
            data: data
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            data: { error: error.message }
        };
    }
}

// Load All Users (GET /api/users)
async function loadUsers() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '<div class="loading"></div>';
    
    const result = await apiRequest('/api/users');
    
    if (result.ok && Array.isArray(result.data)) {
        if (result.data.length === 0) {
            usersList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">ไม่มีผู้ใช้ในระบบ</p>';
            return;
        }
        
        usersList.innerHTML = result.data.map(user => `
            <div class="user-card">
                <h3>👤 ${user.name}</h3>
                <p><strong>ID:</strong> ${user.id}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> ${user.role || 'N/A'}</p>
                <div class="user-actions">
                    <button class="btn btn-warning" onclick="fillUpdateForm('${user.id}', '${user.name}', '${user.email}', '${user.role}')">แก้ไข</button>
                    <button class="btn btn-danger" onclick="deleteUserById('${user.id}')">ลบ</button>
                </div>
            </div>
        `).join('');
    } else {
        usersList.innerHTML = `<p style="color: var(--danger);">เกิดข้อผิดพลาด: ${result.data.error || 'ไม่สามารถโหลดข้อมูลได้'}</p>`;
    }
}

// Get Single User (GET /api/users/<id>)
async function getUser() {
    const userId = document.getElementById('getUserId').value.trim();
    
    if (!userId) {
        showResult('getUserResult', { error: 'กรุณาใส่ User ID' }, true);
        return;
    }
    
    const result = await apiRequest(`/api/users/${userId}`);
    showResult('getUserResult', result.data, !result.ok);
}

// Create User (POST /api/users)
async function createUser() {
    const customId = document.getElementById('postUserId').value.trim();
    const name = document.getElementById('postUserName').value.trim();
    const email = document.getElementById('postUserEmail').value.trim();
    const role = document.getElementById('postUserRole').value.trim();
    
    if (!name || !email) {
        showResult('postUserResult', { error: 'กรุณาใส่ Name และ Email' }, true);
        return;
    }
    
    const body = {
        name: name,
        email: email,
        role: role
    };
    
    // เพิ่ม custom ID ถ้ามี
    if (customId) {
        body.id = customId;
    }
    
    const result = await apiRequest('/api/users', 'POST', body);
    showResult('postUserResult', result.data, !result.ok);
    
    if (result.ok) {
        // Clear form
        document.getElementById('postUserId').value = '';
        document.getElementById('postUserName').value = '';
        document.getElementById('postUserEmail').value = '';
        document.getElementById('postUserRole').value = '';
        
        // Refresh users list
        loadUsers();
    }
}

// Update User (PUT /api/users/<id>)
async function updateUser() {
    const userId = document.getElementById('putUserId').value.trim();
    const name = document.getElementById('putUserName').value.trim();
    const email = document.getElementById('putUserEmail').value.trim();
    const role = document.getElementById('putUserRole').value.trim();
    
    if (!userId) {
        showResult('putUserResult', { error: 'กรุณาใส่ User ID' }, true);
        return;
    }
    
    // สร้าง body เฉพาะ field ที่มีค่า
    const body = {};
    if (name) body.name = name;
    if (email) body.email = email;
    if (role) body.role = role;
    
    if (Object.keys(body).length === 0) {
        showResult('putUserResult', { error: 'กรุณาใส่ข้อมูลที่ต้องการอัปเดตอย่างน้อย 1 field' }, true);
        return;
    }
    
    const result = await apiRequest(`/api/users/${userId}`, 'PUT', body);
    showResult('putUserResult', result.data, !result.ok);
    
    if (result.ok) {
        // Clear form
        document.getElementById('putUserId').value = '';
        document.getElementById('putUserName').value = '';
        document.getElementById('putUserEmail').value = '';
        document.getElementById('putUserRole').value = '';
        
        // Refresh users list
        loadUsers();
    }
}

// Delete User (DELETE /api/users/<id>)
async function deleteUser() {
    const userId = document.getElementById('deleteUserId').value.trim();
    
    if (!userId) {
        showResult('deleteUserResult', { error: 'กรุณาใส่ User ID' }, true);
        return;
    }
    
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบ User ID: ${userId}?`)) {
        return;
    }
    
    const result = await apiRequest(`/api/users/${userId}`, 'DELETE');
    showResult('deleteUserResult', result.data, !result.ok);
    
    if (result.ok) {
        document.getElementById('deleteUserId').value = '';
        loadUsers();
    }
}

// Delete User by ID (helper function for user card)
async function deleteUserById(userId) {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบ User ID: ${userId}?`)) {
        return;
    }
    
    const result = await apiRequest(`/api/users/${userId}`, 'DELETE');
    
    if (result.ok) {
        loadUsers();
        showResult('deleteUserResult', result.data, false);
    } else {
        showResult('deleteUserResult', result.data, true);
    }
}

// Fill Update Form (helper function for user card)
function fillUpdateForm(id, name, email, role) {
    document.getElementById('putUserId').value = id;
    document.getElementById('putUserName').value = name;
    document.getElementById('putUserEmail').value = email;
    document.getElementById('putUserRole').value = role;
    
    // Scroll to update section
    document.querySelector('.section:nth-of-type(5)').scrollIntoView({ behavior: 'smooth' });
}

// Health Check (GET /health)
async function checkHealth() {
    const result = await apiRequest('/health');
    showResult('healthResult', result.data, !result.ok);
}

// Initialize: Load users on page load
window.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});