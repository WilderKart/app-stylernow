'use client'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        if (document.documentElement.classList.contains('dark')) {
            setIsDark(true)
        }
    }, [])

    const toggle = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
            setIsDark(false)
        } else {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            setIsDark(true)
        }
    }

    return (
        <button onClick={toggle} className="pointer-events-auto bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-xl">
            {isDark ? '☀️' : '🌙'}
        </button>
    )
}
