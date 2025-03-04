/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck for build
'use client'

import { useState, FormEvent } from 'react' 
import Words from './words'
import Link from 'next/link'

const incorrectTerms = [
    'Incorrect, try again!',
    'Nope, give it another go!',
    'Want a hint? Well unfortunately I havent coded that yet',
    'Nope...',
    'Try again',
    'That aint it champ'
]

const Page = () => {
    const [currentWord, setCurrentWord] = useState<string | null>('')
    // const [scoreboard, setScoreBoard] = useState<number[]>([]) to implement
    const [scrambledWord, setScrambledWord] = useState<string>('')
    const [message, setMessage] = useState<string>('Unscramble the word as fast as possible! Just press GO!')
    const [startTime, setStartTime] = useState<number>(null)
    const [endTime, setEndTime] = useState<number>(null)

    const startGame = () => {
        const word = Words[Math.floor(Math.random() * 100) + 1]
        setCurrentWord(word);
        const scrambledWord = word
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
        setScrambledWord(scrambledWord)
        setStartTime(performance.now())
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const guess = (event.currentTarget.elements.namedItem("guess") as HTMLInputElement).value;
        if (guess === currentWord) {
            setEndTime(performance.now())
            setMessage(`Congrats! You've done it in ${(performance.now() - startTime).toFixed(2)}ms!`)
            setCurrentWord(null)
        }
        if (guess !== currentWord) {
            setMessage(incorrectTerms[Math.floor(Math.random() * (5 - 0 + 1)) + 0])
        }
    }



    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white px-4">
            <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Unscrambling Game by JT</h1>
            
            {message && (
                <div className="text-lg mb-4 text-center text-gray-300">
                    <strong>{message}</strong>
                </div>
            )}
    
            { !currentWord && (
                <button
                    className="cursor-pointer px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-md transition-all duration-300"
                    onClick={() => startGame()}
                >
                    Start Game
                </button>
            )}
    
            { currentWord && scrambledWord && (
                <div className="cursor-pointer text-3xl text-center mt-10 font-semibold text-gray-700 bg-yellow-100 px-4 py-2 rounded-lg shadow-md">
                    Scrambled: <span className="text-red-500"><br />{scrambledWord}</span>
                </div>
            )}
            
            { currentWord &&
            <form onSubmit={(e) => handleSubmit(e)} >
                <input
                    name="guess"
                    type="text"
                    autoComplete="off" 
                    autoCorrect="off" 
                    maxLength={10}
                    placeholder={new Array(currentWord.length).fill('_').join(' ')}
                    className="mt-6 text-center text-3xl w-[10ch] p-3 border-b-2 border-gray-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                />
            </form>
            }
            {startTime && endTime && <p className="mt-10">Time taken: {(performance.now() - startTime).toFixed(2)}ms</p>}
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