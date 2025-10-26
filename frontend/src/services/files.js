const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const uploadFile = async (file, mfaToken) => {
  const formData = new FormData();
  formData.append('file', file);

  const headers = getAuthHeaders();
  if (mfaToken) {
    headers['x-mfa-token'] = mfaToken;
  }

  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Upload failed');
  }

  return data;
};

export const downloadFile = async (fileId, mfaToken) => {
  const headers = getAuthHeaders();
  if (mfaToken) {
    headers['x-mfa-token'] = mfaToken;
  }

  const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Download failed');
  }

  return response;
};

export const getFiles = async (mfaToken) => {
  const headers = getAuthHeaders();
  if (mfaToken) {
    headers['x-mfa-token'] = mfaToken;
  }

  const response = await fetch(`${API_BASE_URL}/files`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch files');
  }

  return data;
};

export const shareFile = async (fileId, userId, mfaToken) => {
  const headers = {
    ...getAuthHeaders(),
    'Content-Type': 'application/json',
  };
  if (mfaToken) {
    headers['x-mfa-token'] = mfaToken;
  }

  const response = await fetch(`${API_BASE_URL}/files/${fileId}/share`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to share file');
  }

  return data;
};

export const deleteFile = async (fileId, mfaToken) => {
  const headers = getAuthHeaders();
  if (mfaToken) {
    headers['x-mfa-token'] = mfaToken;
  }

  const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete file');
  }

  return data;
};
