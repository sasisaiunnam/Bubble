import axiosInstance from "../components/axiosInstance";

export const autoJoinBubble = async (latitude, longitude, token) => {
    const { data } = await axiosInstance.post(
        "/community/auto-join",
        {
            latitude,
            longitude,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return data;
};

export const getDiscoverableCommunities = async (token) => {
    const { data } = await axiosInstance.get('/community/discover', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return data;
};

export const joinCommunity = async (communityId, token) => {
    const { data } = await axiosInstance.post(
        '/community/auto-join',
        { communityId },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return data;
};

export const sendFriendRequest = async (receiverId, token) => {
    const { data } = await axiosInstance.post(
        `/user/friend-request/${receiverId}`,
        {}, // No body needed as receiverId is in the URL
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return data;
};

// =============================================
// CREATE COMMUNITY
// =============================================
export const createCommunity = async (communityData, token) => {
    const { data } = await axiosInstance.post(
        '/community',
        communityData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return data;
};

// =============================================
// INVITE FLOW (Admin-initiated)
// =============================================
export const inviteToCommunity = async (communityId, userId, token) => {
    const { data } = await axiosInstance.post(
        `/community/${communityId}/invite`,
        { userId },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return data;
};

export const getMyInvites = async (token) => {
    const { data } = await axiosInstance.get('/community/my-invites', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return data;
};

export const acceptInvite = async (communityId, token) => {
    const { data } = await axiosInstance.post(
        `/community/${communityId}/accept-invite`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return data;
};

export const declineInvite = async (communityId, token) => {
    const { data } = await axiosInstance.post(
        `/community/${communityId}/decline-invite`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return data;
};

// =============================================
// JOIN REQUEST FLOW (User-initiated)
// =============================================
export const requestToJoinCommunity = async (communityId, token) => {
    const { data } = await axiosInstance.post(
        `/community/${communityId}/request-join`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return data;
};

export const getJoinRequests = async (communityId, token) => {
    const { data } = await axiosInstance.get(
        `/community/${communityId}/join-requests`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return data;
};

export const approveJoinRequest = async (communityId, userId, token) => {
    const { data } = await axiosInstance.post(
        `/community/${communityId}/approve-join`,
        { userId },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return data;
};

export const rejectJoinRequest = async (communityId, userId, token) => {
    const { data } = await axiosInstance.post(
        `/community/${communityId}/reject-join`,
        { userId },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return data;
};

export const deleteCommunity = async (communityId, token) => {
    const { data } = await axiosInstance.delete(
        `/community/${communityId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return data;
};