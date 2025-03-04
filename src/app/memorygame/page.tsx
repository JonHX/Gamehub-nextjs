/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck for build
'use client'

import Link from "next/link";
import { useEffect, useRef, useState } from "react"

type Card = {
    id: number;
    value: number; 
    flipped: boolean; 
    matched: boolean; 
}
const Page = () => {
    const [cards, setCards] = useState<Card[]>(() =>
        Array.from({ length: 16 }, (_, index) => ({
          id: index,
          value: null,
          flipped: false,
          matched: false,
        }))
      );
      const [flippedCard, setFlippedCard] = useState<number | null>(null);
      const [matchedCards, setMatchedCards] = useState<number[]>([]);
      const [actionsTaken, setActionsTaken] = useState<number>(0);
    
      useEffect(() => {
        const cardValues = [...Array(8).keys()].map((i) => i + 1);
        const shuffledCards = [...cardValues, ...cardValues].sort(() => Math.random() - 0.5);
    
        setCards((prevCards) =>
          prevCards.map((card, index) => ({
            ...card,
            value: shuffledCards[index],
          }))
        );
      }, []);
    const isProcessing = useRef(false);

    const handleCardClick = (index: number) => {
        if (isProcessing.current || matchedCards.includes(index) || cards[index].flipped) return; 

        const newCards = [...cards];
        newCards[index] = { ...newCards[index], flipped: true };
        setCards(newCards);
        setActionsTaken(actionsTaken+1)
        if (flippedCard === null) {
            setFlippedCard(index);
        } else {
            isProcessing.current = true;
            
            const firstIndex = flippedCard;
            const secondIndex = index;

            if (newCards[firstIndex].value === newCards[secondIndex].value) {
                newCards[firstIndex].matched = true;
                newCards[secondIndex].matched = true;
                setMatchedCards((prev) => [...prev, firstIndex, secondIndex]);
                setCards(newCards);
                setFlippedCard(null);
                isProcessing.current = false; 
            } else {
                setTimeout(() => {
                    newCards[firstIndex].flipped = false;
                    newCards[secondIndex].flipped = false;
                    setCards([...newCards]);
                    setFlippedCard(null);
                    isProcessing.current = false;
                }, 1000);
            }
        }
    };

    

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-4">Memory Game by JT</h1>
    
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg">
           {cards.map((card, index) => (
                    <div
                        key={card.id}
                        className={`w-20 h-20 bg-blue-500 text-center flex items-center justify-center rounded-lg cursor-pointer ${
                            card.flipped || card.matched ? "bg-green-500" : "bg-gray-700"
                        }`}
                        onClick={() => handleCardClick(index)}
                    >
                        {card.flipped || card.matched ? card.value : "?"}
                    </div>
                )) }
        </div>
        <div>
            {matchedCards.length < 16 && actionsTaken / 2}
            {matchedCards.length === 16 && (`Result: ${actionsTaken / 2}`)}
        </div>
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
