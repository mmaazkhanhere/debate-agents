const ArenaBackground = () => {
    return (
        <section className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />

            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `
                    radial-gradient(circle at 50% 100%, hsl(var(--primary) / 0.2) 0%, transparent 50%),
                    linear-gradient(to right, transparent 49%, hsl(var(--primary) / 0.1) 50%, transparent 51%)
                    `,
                }}
            />

            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `
                    linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                }}
            />
        </section>
    );
}

export default ArenaBackground