'use client'

import { useState, useEffect, SetStateAction } from 'react'
import sentences  from './sentences'
import Link from 'next/link'


const Page = () => {
    const [selectedText, setSelectedText] = useState<string>('')
    const [inputValue, setInputValue] = useState<string>('')
    const [result, setResult] = useState<string>('')
    const [gameStarted, setGameStarted] = useState<boolean>(false)
    const [startTime, setStartTime] = useState<number>()

    // Detect if input matches selected text
    useEffect(() => {
        if (!selectedText || inputValue !== selectedText) return

        const timeTaken = `${(performance.now() - (startTime || 0)).toFixed(2)} ms`
        setResult(timeTaken)
        setGameStarted(false)
        setInputValue('')
    }, [inputValue, selectedText, startTime])
    
    useEffect(() => {
        if (!gameStarted) return
        const sentence = sentences[Math.floor(Math.random() * (50 - 0) + 0)]
        setSelectedText(sentence)
        setStartTime(performance.now())
    }, [gameStarted])

    const progressiveText = () => {
        if (!selectedText) return
        const inputArray = inputValue.split('')
        return selectedText.split('').map((letter, index) => {
            if (letter === inputArray[index]) return <span key={index} className="bg-green-400">{letter}</span>
            if (inputArray[index]) return <span key={index} className="bg-red-400">{letter}</span>
            else return letter
        })
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white px-4">
            <h1 className="text-4xl font-bold mb-6">Type fast by JT</h1>
            <h2 className="mb-5">The game is easy, type the sentence as correct as possible, as quickly as possible</h2>
            {(!gameStarted && !result) && (
                <button 
                    onClick={() => setGameStarted(true)} 
                    className="cursor-pointer px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-md transition-all duration-300"
                >
                    Start Game
                </button>
                )
            }
            { gameStarted && 
                (
                    <>
                    <div className="text-2xl font-mono bg-gray-700 p-3 rounded-lg shadow-md">
                    {progressiveText()}
                    </div>
                    <input 
                        autoFocus
                        type="text"
                        onChange={(e: { target: { value: SetStateAction<string> } }) => setInputValue(e.target.value)}
                        value={inputValue}
                        className="mt-6 text-xl p-3 w-full max-w-md text-center border-b-4 border-blue-500 bg-transparent outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </>
                )
            }
            {result && (
                <>
                    <h2 
                        className={`mt-6 text-2xl font-semibold p-3 rounded-lg shadow-md transition-all duration-500 
                        ${parseFloat(result) < 2000 ? 'text-green-400' : 'text-yellow-400'}`}
                    >
                        🚀 You completed it in <span className="font-bold">{result}</span>
                    </h2>
                    <button 
                        onClick={() => setGameStarted(true)} 
                        className="cursor-pointer px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-md transition-all duration-300"
                    >
                        Play again!
                    </button>
                    
                </>
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