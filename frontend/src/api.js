const BASE = '/api';

async function request(url, options = {}) {
  const token = localStorage.getItem('ss_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE + url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  register:         (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:            (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  profile:          ()     => request('/auth/profile'),
  campaigns:        (cat)  => request('/campaigns' + (cat && cat !== 'All' ? `?category=${cat}` : '')),
  pendingCampaigns: ()     => request('/campaigns/pending'),
  createCampaign:   (body) => request('/campaigns', { method: 'POST', body: JSON.stringify(body) }),
  approveCampaign:  (id)   => request(`/campaigns/${id}/approve`, { method: 'PUT' }),
  rejectCampaign:   (id)   => request(`/campaigns/${id}/reject`,  { method: 'PUT' }),
};
