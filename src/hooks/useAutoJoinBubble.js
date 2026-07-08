import { useEffect } from "react";
import { autoJoinBubble } from "../services/communityService";

const useAutoJoinBubble = (token, setCurrentBubble) => {
    useEffect(() => {
        if (!token) return;

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const bubble = await autoJoinBubble(
                        coords.latitude,
                        coords.longitude,
                        token
                    );

                    setCurrentBubble(bubble);
                } catch (err) {
                    console.error(err);
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }, [token]);
};

export default useAutoJoinBubble;