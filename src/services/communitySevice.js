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