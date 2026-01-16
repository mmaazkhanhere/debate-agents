import DebateLayout from "./debate-layout";

const DebateStage = () => {
    const debate = mockDebate;
    const navigate = useNavigate();

    const engine = useDebateEngine(debate);
    useDebateAudio(engine.phase, true);

    if (engine.phase === "intro") {
        return (
            <ModeratorZone
                topic={debate.topic}
                presenterName={debate.presenter.name}
                announcement={debate.presenter.introText}
                onAnnouncementComplete={engine.nextRound}
            />
        );
    }

    return (
        <DebateLayout
            debate={debate}
            engine={engine}
            onExit={() => navigate("/select")}
        />
    );
}

export default DebateStage