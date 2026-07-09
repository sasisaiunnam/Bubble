import axiosInstance from '../components/axiosInstance';

export const getUserById = async (userId, token) => {
  const { data } = await axiosInstance.get(`/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getFriendshipStatus = async (otherUserId, token) => {
  const { data } = await axiosInstance.get(`/user/friend-status/${otherUserId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getAllUsers = async (token) => {
  const { data } = await axiosInstance.get('/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getFriendRequests = async (token) => {
  const { data } = await axiosInstance.get('/user/friend-requests', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const acceptFriendRequest = async (requestId, token) => {
  const { data } = await axiosInstance.put(`/user/friend-request/${requestId}/accept`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const rejectFriendRequest = async (requestId, token) => {
  const { data } = await axiosInstance.put(`/user/friend-request/${requestId}/reject`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getFriendSuggestions = async (token) => {
  const { data } = await axiosInstance.get('/user/suggestions', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const unfriendUser = async (userId, token) => {
  const { data } = await axiosInstance.post(`/user/unfriend/${userId}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};