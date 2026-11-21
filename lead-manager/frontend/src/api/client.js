const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
class ApiError extends Error {
constructor(message, status, errors = []) {
super(message);
this.status = status;
this.errors = errors;
}
}

async function request(endpoint, options = {}) {
const token = localStorage.getItem('lm_token');
const headers = {
'Content-Type': 'application/json',
...(token ? { Authorization: `Bearer ${token}` } : {}),
...options.headers,
};

let response;
try {
response = await fetch(`${API_BASE}${endpoint}`, {
...options,
headers,
});
} catch (networkErr) {
throw new ApiError(
'Unable to reach the server. Please verify the backend API is running.',
0
);
}

const data = await response.json().catch(() => ({}));

if (!response.ok) {
throw new ApiError(
data.message || `Request failed with status ${response.status}`,
response.status,
data.errors || []
);
}

return data;
}

export const api = {
// Auth
login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
demoLogin: () => request('/auth/demo', { method: 'POST' }),

// Leads
getLeads: (params = {}) => {
const query = new URLSearchParams();
Object.entries(params).forEach(([k, v]) => {
if (v !== undefined && v !== null && v !== '') query.append(k, v);
});
return request(`/leads?${query.toString()}`);
},
createLead: (payload) => request('/leads', { method: 'POST', body: JSON.stringify(payload) }),
updateLead: (id, payload) => request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
updateLeadStatus: (id, status) =>
request(`/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
deleteLead: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
};