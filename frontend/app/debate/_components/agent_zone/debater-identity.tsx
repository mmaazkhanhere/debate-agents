
type DebaterIdentityProps = {
    name: string;
    title: string;
    side: "left" | "right";
}
const DebaterIdentity = ({
    name,
    title,
    side
}: DebaterIdentityProps) => {
    return (
        <div className={side === "left" ? "text-left" : "text-right"}>
            <h3 className="text-sm font-bold">{name}</h3>
            <p className="text-xs text-muted-foreground">{title}</p>
        </div>
    );
}

export default DebaterIdentity
