import axios from "axios";

export const autoJoinBubble = async (latitude, longitude, token) => {
    const { data } = await axios.post(
        "/api/community/auto-join",
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
    const { data } = await axios.get('/api/community/discover', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return data;
};

export const joinCommunity = async (communityId, token) => {
    const { data } = await axios.post(
        '/api/community/auto-join',
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