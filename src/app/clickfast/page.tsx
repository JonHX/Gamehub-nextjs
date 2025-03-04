"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function GamePage() {
    const [isWaiting, setIsWaiting] = useState<boolean>(true);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [results, setResults] = useState<number[]>([]);
    const [buttonText, setButtonText] = useState<string>('Start');

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isWaiting) return;

        const randomDelay = Math.random() * 3000 + 2000;
        timerRef.current = setTimeout(() => {
            setStartTime(performance.now());
            setButtonText('Click Now!');
        }, randomDelay);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isWaiting]);

    const reset = () => {
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current); // ✅ Ensure previous timer is cleared
        resetTimerRef.current = setTimeout(() => {
            setButtonText('Start');
            setIsWaiting(true);
        }, 2000);
    };

    const handleClick = () => {
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        if (timerRef.current) clearTimeout(timerRef.current); // ✅ Clear reaction timer if clicking too soon

        if (startTime) {
            const endTime = performance.now();
            setResults([endTime - startTime, ...results]);
            setStartTime(null);
            setButtonText(`Nice! ${(endTime - startTime).toFixed(2)}ms!`);
            reset(); // ✅ No need to `return` here
        } else if (isWaiting) {
            setButtonText("Wait for it...");
            setIsWaiting(false);
        } else {
            setButtonText("Too soon!");
            setIsWaiting(true); // ✅ Reset immediately if clicked too soon
            reset();
        }
    };

    const sortedResults = [...results].sort((a, b) => a - b).slice(0, 10);

    return (
      <main className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome to the Game!</h1>
        <p className="mb-4">The aim of the game is to click the button as fast as you can. Press start to give it a go.</p>
        
        <button 
          onClick={handleClick} 
          className="cursor-pointer rounded-full px-6 py-3 bg-blue-500 hover:bg-blue-700 text-lg mb-4"
        >
            {buttonText}
        </button>

        {sortedResults.length > 0 && (
            <div className="mt-5 border-2 border-white p-5 rounded-lg">
                <h2 className="mb-2 text-lg font-semibold">Scoreboard</h2>
                <ol className="list-decimal pl-5">
                    {sortedResults.map((item, i) => (
                        <li key={i}>
                            <span className="font-semibold">{item.toFixed(2)} ms</span>
                        </li>
                    ))}
                </ol>
            </div>
        )}
        <Link 
            href="/" 
            className="absolute top-4 right-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold text-md rounded-lg shadow-md transition-all duration-300"
        >
            ⬅ Back to Menu
        </Link>
      </main>
    );
}
