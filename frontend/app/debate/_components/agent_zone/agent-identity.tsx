
type Props = {
    name: string;
    title: string;
    side: "left" | "right";
}
const AgentIdentity = ({
    name,
    title,
    side
}: Props) => {
    return (
        <div className={side === "left" ? "text-left" : "text-right"}>
            <h3 className="text-sm font-bold">{name}</h3>
            <p className="text-xs text-muted-foreground">{title}</p>
        </div>
    );
}

export default AgentIdentity
