import useAutoJoinBubble from "../hooks/useAutoJoinBubble";

function Home() {

    const token = localStorage.getItem("token");

    const [currentBubble, setCurrentBubble] = useState(null);

    useAutoJoinBubble(token, setCurrentBubble);

    return (
        <>
            <Sidebar />

            <BubbleChat bubble={currentBubble} />
        </>
    );
}