/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const Canvas = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const pointsCanvasRef = useRef(null); // Second canvas for hand points
    const timerRef = useRef(null);
    const gameStartedRef = useRef(false);

    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [imageURL, setImageURL] = useState("https://png.pngtree.com/png-clipart/20230412/ourmid/pngtree-green-snake-head-png-image_6704095.png");
    const [dotImageURL, setDotImageURL] = useState("https://purepng.com/public/uploads/large/purepng.com-rat-mousemouseanimalratmicerodent-981524651565fwflu.png");
    const [showPointsCanvas, setShowPointsCanvas] = useState(false); // State to toggle second canvas
    let dot = { x: Math.random(), y: Math.random() };

    useEffect(() => {
        let handLandmarker: HandLandmarker;
        let animationFrameId: number;
        let vision;

        const image = new Image();
        image.src = imageURL;

        const dotImage = new Image();
        dotImage.src = dotImageURL;

        const initializeHandDetection = async () => {
            try {
                vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );
                handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: { modelAssetPath: "/models/hand_landmarker.task" },
                    numHands: 2,
                    runningMode: "VIDEO",
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

            if (dotImage.complete) {
                const dotX = dot.x * canvas.width;
                const dotY = dot.y * canvas.height;
                const size = 80;

                ctx.drawImage(dotImage, dotX - size / 2, dotY - size / 2, size, size);
            }

            landmarksArray.forEach((landmarks: any[]) => {
                const pointer8 = landmarks[8];

                if (pointer8 && image.complete) {
                    const x = pointer8.x * canvas.width;
                    const y = pointer8.y * canvas.height;
                    const size = 80;

                    // To keep the image in its aspect ratio and prevent distortion, use the naturalWidth and naturalHeight of the image
                    const aspectRatio = image.naturalWidth / image.naturalHeight;
                    const imageWidth = size;
                    const imageHeight = imageWidth / aspectRatio;

                    ctx.drawImage(image, x - imageWidth / 2, y - imageHeight / 2, imageWidth, imageHeight);
                }
            });

            if (showPointsCanvas) {
                drawHandPoints(landmarksArray);  // Draw points on the second canvas
            }
        };

        const drawHandPoints = (landmarksArray: any[]) => {
            const pointsCanvas = pointsCanvasRef.current;
            const pointsCtx = pointsCanvas.getContext("2d");
            pointsCtx.clearRect(0, 0, pointsCanvas.width, pointsCanvas.height);

            landmarksArray.forEach((landmarks: any[]) => {
                landmarks.forEach((landmark: any) => {
                    if (landmark) {
                        const x = landmark.x * pointsCanvas.width;
                        const y = landmark.y * pointsCanvas.height;
                        pointsCtx.beginPath();
                        pointsCtx.arc(x, y, 3, 0, Math.PI * 2);  // Increase point size
                        pointsCtx.fillStyle = "white";
                        pointsCtx.fill();
                    }
                });
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
                const pointer8 = landmarks[8];
                if (pointer8) {
                    const x = pointer8.x * canvas.width;
                    const y = pointer8.y * canvas.height;

                    const distance = Math.hypot(x - dotX, y - dotY);

                    if (distance < 50) {
                        if (gameStartedRef.current) setScore(prevScore => prevScore + 1);
                        dot = { x: Math.random() * 0.9 + 0.05, y: Math.random() * 0.9 + 0.05 };
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
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [imageURL, dotImageURL, showPointsCanvas]);

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
        setTimeLeft(20);
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
                    width="600px"
                    height="450px"
                ></video>
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full rounded-md pointer-events-none transform scale-x-[-1]"
                    width="600px"
                    height="450px"
                ></canvas>
                {showPointsCanvas && (
                    <canvas
                        ref={pointsCanvasRef}
                        className="transform scale-x-[-1] absolute top-0 left-0 w-full h-full rounded-md pointer-events-none"
                        width="600px"
                        height="450px"
                    ></canvas>
                )}
            </div>
            <div className="w-full text-center mt-6">
                {!gameStartedRef.current && (
                    <button
                        onClick={startOrResetGame}
                        className="cursor-pointer px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none"
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
            <div className="w-full flex justify-center align-middle text-center items-center space-y-4" id="options">
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

                    <div className="flex items-center space-x-2 mt-4">
                        <label className="text-lg font-semibold">Show Hand Points</label>
                        <input
                            type="checkbox"
                            checked={showPointsCanvas}
                            onChange={(e) => setShowPointsCanvas(e.target.checked)}
                            className="border p-2 rounded-md"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Canvas;
