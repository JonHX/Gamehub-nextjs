/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const HandTrackingGame = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const timerRef = useRef(null);  // Store the timer interval in a ref
    const gameStartedRef = useRef(false);  // Use ref for gameStarted

    const [score, setScore] = useState(0);  // Use state for score
    const [timeLeft, setTimeLeft] = useState(20);  // Use state for time left
    const [imageURL, setImageURL] = useState("https://cdn.creazilla.com/cliparts/68113/snake-face-clipart-xl.png");  // URL for the finger image
    const [dotImageURL, setDotImageURL] = useState("https://purepng.com/public/uploads/large/purepng.com-rat-mousemouseanimalratmicerodent-981524651565fwflu.png");  // URL for the dot image
    let dot = { x: Math.random(), y: Math.random() };  // Dot stored in a regular variable

    useEffect(() => {
        let handLandmarker: HandLandmarker;
        let animationFrameId: number;
        let vision;

        // Load the images
        const image = new Image();
        image.src = imageURL;  // Use the state URL for the image

        const dotImage = new Image();  // Image for the red dot
        dotImage.src = dotImageURL;  // Use the state URL for the dot image

        const initializeHandDetection = async () => {
            try {
                vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );
                handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: { modelAssetPath: "/models/hand_landmarker.task" },
                    numHands: 2,
                    runningMode: "video",
                });
                detectHands();
            } catch (error) {
                console.error("Error initializing hand detection:", error);
            }
        };

        const drawGame = (landmarksArray: any[]) => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the custom dot image
            if (dotImage.complete) {  // Ensure the image is loaded before drawing
                const dotX = dot.x * canvas.width;
                const dotY = dot.y * canvas.height;
                const size = 30;  // Adjust size as needed

                // Draw the dot image without flipping
                ctx.drawImage(dotImage, dotX - size / 2, dotY - size / 2, size, size);  // Draw the dot image
            }

            // Draw the custom image at pointer 8 (index finger tip)
            landmarksArray.forEach((landmarks: any[]) => {
                // Check if landmarks exist and get pointer 8 (index finger tip)
                const pointer8 = landmarks[8];  // Pointer 8 is the tip of the index finger

                if (pointer8 && image.complete) {  // Ensure the image is loaded before drawing
                    const x = pointer8.x * canvas.width;
                    const y = pointer8.y * canvas.height;
                    const size = 30;  // Adjust size as needed

                    // Draw image at pointer 8 without flipping
                    ctx.drawImage(image, x - size / 2, y - size / 2, size, size);  // Draw image at pointer 8
                }
            });
        };

        const detectHands = () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
                const detections = handLandmarker.detectForVideo(videoRef.current, performance.now());

                if (detections.landmarks) {
                    drawGame(detections.landmarks);
                    checkCollision(detections.landmarks);
                }
            }
            animationFrameId = requestAnimationFrame(detectHands);
        };

        const checkCollision = (landmarksArray: any[]) => {
            const canvas = canvasRef.current;
            const dotX = dot.x * canvas.width;
            const dotY = dot.y * canvas.height;

            landmarksArray.forEach((landmarks: any[]) => {
                const pointer8 = landmarks[8];  // Get pointer 8 (index finger tip)
                if (pointer8) {
                    const x = pointer8.x * canvas.width;  // Normal X position (no flip)
                    const y = pointer8.y * canvas.height;

                    // Adjust the distance threshold for collision detection
                    const distance = Math.hypot(x - dotX, y - dotY);

                    if (distance < 20) {  // Increased distance threshold for collision
                        if (gameStartedRef.current) setScore(prevScore => prevScore + 1);
                        dot = {  // Update the dot position directly
                            x: Math.random() * 0.9 + 0.05,
                            y: Math.random() * 0.9 + 0.05,
                        };
                    }
                }
            });
        };

        const startWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                await initializeHandDetection();
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        startWebcam();

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((track: { stop: () => any; }) => track.stop());
            }
            if (handLandmarker) handLandmarker.close();
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (timerRef.current) clearInterval(timerRef.current);  // Clear interval correctly
        };
    }, [imageURL, dotImageURL]);  // Re-run effect when image URLs change

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prevTimeLeft => {
                if (prevTimeLeft <= 1) {
                    clearInterval(timerRef.current);
                    gameStartedRef.current = false;
                    return 0;
                }
                return prevTimeLeft - 1;
            });
        }, 1000);
    };

    const startOrResetGame = () => {
        gameStartedRef.current = true;
        setScore(0);
        setTimeLeft(20);  // Reset time to 10 when starting a new game
        startTimer();
    };

    return (
        <div className="flex justify-center items-center flex-col space-y-6">
            <div className="relative flex justify-center items-center w-full max-w-[600px]">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="transform scale-x-[-1] w-full h-auto rounded-md shadow-lg"
                    style={{ maxWidth: "600px", height: "450px" }}
                ></video>
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full rounded-md pointer-events-none transform scale-x-[-1]"
                    style={{ maxWidth: "600px", height: "450px" }}
                ></canvas>
            </div>
            <div className="w-full text-center mt-6">
                {!gameStartedRef.current && (
                    <button
                        onClick={startOrResetGame}
                        className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none"
                    >
                        Start Game
                    </button>
                )}

                {gameStartedRef.current && (
                    <div className="text-center mb-4">
                        <h2 className="text-xl font-semibold">Score: {score}</h2>
                        <h2 className="text-xl font-semibold">Time Left: {timeLeft}s</h2>
                    </div>
                )}

                {timeLeft === 0 && (
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-green-500">
                            Well done! You Scored {score}!
                        </h2>
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center space-y-4">
                <div className="border p-4 rounded-lg w-full max-w-[400px]">
                    <h2 className="text-xl font-semibold text-center mb-4">Options</h2>
                    <div className="flex flex-col space-y-2">
                        <label className="text-lg font-semibold">Finger Image URL</label>
                        <input
                            type="text"
                            value={imageURL}
                            onChange={(e) => setImageURL(e.target.value)}
                            className="border p-2 rounded-md"
                        />
                    </div>
                    
                    <div className="flex flex-col space-y-2 mt-4">
                        <label className="text-lg font-semibold">Dot Image URL</label>
                        <input
                            type="text"
                            value={dotImageURL}
                            onChange={(e) => setDotImageURL(e.target.value)}
                            className="border p-2 rounded-md"
                        />
                    </div>
                </div>
            </div>

            
        </div>
    );
};

export default HandTrackingGame;
