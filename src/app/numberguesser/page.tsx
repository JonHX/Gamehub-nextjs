'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';

const Page = () => {
    const [number, setNumber] = useState<number | null>(null);
    const [resultText, setResultText] = useState<string>('What’s your first guess?');
    const [attempts, setAttempts] = useState<number>(0)
    
    useEffect(() => {
        setNumber(Math.floor(Math.random() * 100) + 1);
    }, []);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const guess = (event.currentTarget.elements.namedItem("number") as HTMLInputElement).value;
        if (!guess || !number) return;
        if (Number(guess) === number) {
            return setResultText("Correct! Well done!");
        }
        setAttempts(attempts+1)
        if (Number(guess) > number) setResultText("Too high!");
        if (Number(guess) < number) setResultText("Too low!");
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white px-4">
            <h1 className="text-4xl font-bold mb-6">Number guesser by JT</h1>
            <h2>Guess a number between 1-100</h2>
            <br />
            <p className="text-xl mb-4 text-amber-300">{resultText}</p>

            <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
                <label htmlFor="number" className="text-lg">Enter your guess here:</label>
                <input 
                    id="number" 
                    type="number" 
                    min="1" 
                    max="100" 
                    className="px-4 py-2 text-xl rounded-md bg-gray-700 border-2 border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required 
                />
                <button 
                    type="submit" 
                    className="px-6 py-2 text-lg font-semibold bg-blue-600 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Submit Guess
                </button>
                <p className="text-xl">Guesses so far: {attempts}</p>
            </form>
            <Link 
                href="/" 
                className="absolute top-4 right-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold text-md rounded-lg shadow-md transition-all duration-300"
            >
                ⬅ Back to Menu
            </Link>
        </main>
    );
};

export default Page;
