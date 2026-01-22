export function HomeHeader({ userName }: { userName: string }) {
    return (
        <header className="flex justify-between items-center py-4 mb-2">
            <div>
                <p className="text-gray-500 text-sm">Hola, bienvenido</p>
                <h1 className="text-xl font-bold text-gray-900 truncate max-w-[200px]">
                    {userName || 'Usuario'}
                </h1>
            </div>
            <div className="bg-gray-100 p-2 rounded-full">
                {/* Placeholder Avatar/Details */}
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                    {userName ? userName[0].toUpperCase() : 'U'}
                </div>
            </div>
        </header>
    )
}
