export default function GradientOverlay({ className = "" }: { className?: string }) {
    return (
        <div
            className={`absolute inset-0 bg-gradient-to-b from-transparent to-pure-black pointer-events-none ${className}`}
            style={{
                background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000000 100%)"
            }}
        />
    );
}
