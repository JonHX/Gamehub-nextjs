'use client'
import Link from "next/link";
import { useEffect, useState } from "react";

const terms = [
    'How about',
    'Is it',
    'Could it be',
    'Let me try again,'
]

const Page = () => {
    const [gameStarted, setGameStarted] = useState<boolean>(false)
    const [gameStateText, setGameStateText] = useState<string>(`Hello, think of a number between 1-100 and i'll guess it`)
    // @ts-expect-error just ignoring for build
    const [guess, setGuess] = useState<number>(null)
    const [highest, setHighest] = useState<number>(100)
    const [lowest, setLowest] = useState<number>(0)
    const [guesses, setGuesses] = useState<number[]>([])

    useEffect(() => {
        if (guess !== null) {
            setGuesses((prevGuesses) => [...prevGuesses, guess]);
        }
    }, [guess]);

    const startGame = () => {
        setGuesses([])
        setGameStarted(true)
        const startNumber = Math.floor(Math.random() * 100);
        setGameStateText(`Is it ${startNumber}?`)
        setGuess(startNumber)
    }

    const guessNumber = (higherOrLower?: 'h' | 'l') => {
        let newGuess = 0
        if (higherOrLower === 'h') {
            if (guess >= highest) {
                setGameStateText("That's impossible, you sure?");
                return;
            }
            const newLowest = guess + 1;
            setLowest(newLowest);
            newGuess = Math.floor(Math.random() * (highest - newLowest + 1)) + newLowest
        }
    
        if (higherOrLower === 'l') {
            if (guess <= lowest) {
                setGameStateText("That's impossible, you sure?");
                return;
            }
            const newHighest = guess - 1;
            setHighest(newHighest);
            newGuess = Math.floor(Math.random() * (newHighest - lowest + 1)) + lowest
        }

        setGuess(newGuess)
        setGameStateText(`${getTerm()} ${newGuess}?`);
    };
    

    const getTerm = () => terms[Math.floor(Math.random() * (3 - 0 + 1)) + 0];

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white px-4">
            <h1 className="text-4xl font-bold mb-6 text-center">Guessing Game by JT</h1>
            
            {!gameStarted && (
                <button 
                    onClick={() => startGame()} 
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-md transition-all duration-300"
                >
                    Start Game
                </button>
            )}
        
            <p className="text-xl mt-4">{gameStateText}</p>
        
            {gameStarted && (
                <div className="flex flex-col items-center mt-6 space-y-4">
                    <div className="flex space-x-4">
                        <button 
                            onClick={() => guessNumber('h')} 
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold text-lg rounded-lg shadow-md transition-all duration-300"
                        >
                            Higher
                        </button>
                        <button 
                            onClick={() => guessNumber('l')} 
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold text-lg rounded-lg shadow-md transition-all duration-300"
                        >
                            Lower
                        </button>
                    </div>
        
                    <button 
                        onClick={() => startGame()} 
                        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-lg rounded-lg shadow-md transition-all duration-300"
                    >
                        You got it! Let&apos;s play again.
                    </button>
                    Guesses so far {guesses.map( (guess) => <>{guess}, </>)}
                </div>
            )}
            <Link 
                href="/" 
                className="absolute top-4 right-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold text-md rounded-lg shadow-md transition-all duration-300"
            >
                ⬅ Back to Menu
            </Link>
        </main>    
    )
}

export default Page