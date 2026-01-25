export default function CreateBarbershopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen w-full bg-black text-white overflow-x-hidden">
            {children}
        </div>
    );
}
