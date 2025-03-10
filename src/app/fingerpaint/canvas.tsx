/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import React, { useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const HandTrackingCanvas = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const handLandmarkerRef = useRef<HandLandmarker | null>(null); // Store hand landmarker instance
    const fingerColorsRef = useRef<string[]>(["#FF0000", "#FF0000"]); // Ref to store finger colors (two colors for two hands)
    const drawnColors = useRef<{ color: string, x: number, y: number, size: number }[]>([]); // Ref to store drawn colors on canvas
    const brushSizeRef = useRef<number>(20); // Default brush size (no state, to avoid re-renders)
    const colorPickerColors = [
        "#FF0000", // Red (Primary)
        "#FF7F00", // Orange
        "#FFFF00", // Yellow (Primary)
        "#00FF00", // Green (Primary)
        "#0000FF", // Blue (Primary)
        "#4B0082", // Indigo
        "#8A2BE2", // Violet
        "#FF1493", // Deep Pink (Secondary)
    ];
    let animationFrameId: number;

    useEffect(() => {
        let handLandmarker: HandLandmarker;
        let vision;

        const initializeHandDetection = async () => {
            try {
                vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );
                handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: { modelAssetPath: "/models/hand_landmarker.task" },
                    numHands: 2, // Track both hands
                    runningMode: "VIDEO",
                });
                handLandmarkerRef.current = handLandmarker;
                detectHands();
            } catch (error) {
                console.error("Error initializing hand detection:", error);
            }
        };

        const drawPointer = (landmarksArray: any[]) => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

            // Apply the flip transformation to the canvas
            ctx.save();
            ctx.scale(-1, 1); // Flip the canvas horizontally
            ctx.translate(-canvas.width, 0);

            // Draw the previously drawn colors (when fingers touch)
            drawnColors.current.forEach((drawnColor) => {
                ctx.beginPath();
                ctx.arc(drawnColor.x, drawnColor.y, drawnColor.size / 2, 0, 2 * Math.PI); // Use dynamic brush size
                ctx.fillStyle = drawnColor.color;
                ctx.fill();
            });

            // Draw the action buttons at the top of the canvas
            const buttonWidth = canvas.width / 3;
            const buttonHeight = 30;

            // 'Increase Brush Size' button
            ctx.fillStyle = "#4CAF50"; // Green for increase
            ctx.fillRect(0, 0, buttonWidth, buttonHeight);
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText("Increase Brush", buttonWidth / 2 - 40, buttonHeight / 2 + 5);

            // 'Decrease Brush Size' button
            ctx.fillStyle = "#FF9800"; // Orange for decrease
            ctx.fillRect(buttonWidth, 0, buttonWidth, buttonHeight);
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText("Decrease Brush", buttonWidth * 1.5 - 40, buttonHeight / 2 + 5);

            // 'Clear Canvas' button
            ctx.fillStyle = "#F44336"; // Red for clear
            ctx.fillRect(buttonWidth * 2, 0, buttonWidth, buttonHeight);
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText("Clear Canvas", buttonWidth * 2 + 5, buttonHeight / 2 + 5);

            // Draw color picker at the bottom
            const colorPickerWidth = canvas.width / colorPickerColors.length;
            const colorPickerHeight = 30;

            colorPickerColors.forEach((color, index) => {
                const colorX = index * colorPickerWidth;
                const colorY = canvas.height - colorPickerHeight;

                // Draw the color picker options
                ctx.fillStyle = color;
                ctx.fillRect(colorX, colorY, colorPickerWidth, colorPickerHeight);
            });

            // Handle the button clicks
            const checkButtonClick = (landmarksArray: any[]) => {
                // Detect if any finger touches one of the buttons
                landmarksArray.forEach((landmarks: any[]) => {
                    const pointer8 = landmarks[8]; // Pointer 8 is the tip of the index finger

                    if (pointer8) {
                        const x = pointer8.x * canvas.width;
                        const y = pointer8.y * canvas.height;

                        // Increase brush size if finger is over the 'Increase Brush Size' button
                        if (x >= 0 && x <= buttonWidth && y >= 0 && y <= buttonHeight) {
                            brushSizeRef.current = Math.min(brushSizeRef.current + 10, 70); // Increase brush size, max size 100
                        }
                        // Decrease brush size if finger is over the 'Decrease Brush Size' button
                        else if (x >= buttonWidth && x <= buttonWidth * 2 && y >= 0 && y <= buttonHeight) {
                            brushSizeRef.current = Math.max(brushSizeRef.current - 10, 5); // Decrease brush size, min size 10
                        }

                        // Check if the finger is touching the 'Clear Canvas' button
                        if (x >= buttonWidth * 2 && x <= buttonWidth * 3 && y >= 0 && y <= buttonHeight) {
                            drawnColors.current = []; // Clear the canvas if button is touched
                        }
                    }
                });
            };

            // Handle the color picker interaction
            const checkColorPickerClick = (landmarksArray: any[]) => {
                landmarksArray.forEach((landmarks: any[], handIndex: number) => {
                    const pointer8 = landmarks[8]; // Pointer 8 is the tip of the index finger

                    if (pointer8) {
                        const x = pointer8.x * canvas.width;
                        const y = pointer8.y * canvas.height;

                        // Check if the finger is touching the color picker area
                        colorPickerColors.forEach((color, index) => {
                            const colorX = index * colorPickerWidth;
                            const colorY = canvas.height - colorPickerHeight;

                            if (x >= colorX && x <= colorX + colorPickerWidth && y >= colorY && y <= colorY + colorPickerHeight) {
                                fingerColorsRef.current[handIndex] = color; // Change the color based on the picker
                                console.log(`Color changed to: ${color}`);
                            }
                        });
                    }
                });
            };

            checkButtonClick(landmarksArray); // Call this function to check for button clicks
            checkColorPickerClick(landmarksArray); // Call this function to check for color picker clicks
            landmarksArray.forEach((landmarks: any[], handIndex: number) => {
                const pointer8 = landmarks[8]; // Pointer 8 is the tip of the index finger
                const thumb4 = landmarks[4]; // Thumb 4 is the tip of the thumb

                if (pointer8 && thumb4) {
                    const x = pointer8.x * canvas.width;
                    const y = pointer8.y * canvas.height;
                    const thumbX = thumb4.x * canvas.width;
                    const thumbY = thumb4.y * canvas.height;

                    // Calculate the distance between the thumb and index finger
                    const distance = Math.sqrt(Math.pow(x - thumbX, 2) + Math.pow(y - thumbY, 2));
                    const touchThreshold = 20;

                    // If the fingers are close enough, paint the color at the index finger position
                    if (distance < touchThreshold) {
                        drawnColors.current.push({
                            color: fingerColorsRef.current[handIndex],
                            x,
                            y,
                            size: brushSizeRef.current, // Use the brush size for this drawing
                        });
                    }

                    // Draw the finger with the current color based on handIndex
                    ctx.beginPath();
                    ctx.arc(x, y, brushSizeRef.current / 2, 0, 2 * Math.PI); // Use dynamic brush size
                    ctx.fillStyle = fingerColorsRef.current[handIndex]; // Use the hand-specific color
                    ctx.fill();

                    // Draw a small black dot to indicate finger position
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, 2 * Math.PI); // Small black dot (2px diameter)
                    ctx.fillStyle = "black"; // Set the color of the dot to black
                    ctx.fill();
                }
            });
            ctx.restore(); // Restore the context state to prevent further scaling
        };

        const detectHands = () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
                const detections = handLandmarkerRef.current?.detectForVideo(videoRef.current, performance.now());

                if (detections?.landmarks) {
                    drawPointer(detections.landmarks);
                }
            }
            animationFrameId = requestAnimationFrame(detectHands);
        };

        const startWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current!.srcObject = stream;
                await initializeHandDetection();
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        startWebcam();

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((track: { stop: () => any }) => track.stop());
            }
            if (handLandmarker) handLandmarker.close();
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, []); // Empty dependency array to run the effect only once on mount

    return (
        <div className="flex justify-center items-center flex-col space-y-6">
            <div className="relative flex justify-center items-center w-full max-w-[600px]">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-auto rounded-md shadow-lg transform scale-x-[-1]"
                    style={{ maxWidth: "600px", height: "450px" }}
                    width="450px"
                    height="600px"
                ></video>

                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full rounded-md pointer-events-none"
                    style={{ maxWidth: "600px", height: "450px" }}
                    width="450"
                    height="600"
                ></canvas>

                {/* Overlay divs as buttons */}
                <div className="absolute top-0 left-0 w-full flex justify-between z-10">
                    <div className="bg-red-500 text-white text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-0 shadow-lg w-1/3 text-center">
                        Clear
                    </div>
                    <div className="bg-orange-500 text-white text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-0 shadow-lg w-1/3 text-center">
                        Brush Size--
                    </div>
                    <div className="bg-green-500 text-white text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-0 shadow-lg w-1/3 text-center">
                        Brush Size++
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HandTrackingCanvas;
