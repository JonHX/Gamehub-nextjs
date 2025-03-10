/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import React, { useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const HandTrackingCanvas = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const fingerColorsRef = useRef<string[]>(["#FF0000", "#FF0000"]);
    const drawnColors = useRef<{ color: string, x: number, y: number, size: number }[]>([]);
    const brushSizeRef = useRef<number>(20);
    const colorPickerColors = [
        "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8A2BE2", "#FF1493",
    ];

    // Initialize hand detection
    const initializeHandDetection = async () => {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: "/models/hand_landmarker.task" },
                numHands: 2,
                runningMode: "VIDEO",
            });
            handLandmarkerRef.current = handLandmarker;
        } catch (error) {
            console.error("Error initializing hand detection:", error);
        }
    };

    // Check if the palm is facing forward
    const isPalmForward = (landmarks: any[]) => {
        const wrist = landmarks[0]; // Wrist landmark
        const middleBase = landmarks[9]; // Base of the middle finger
        const middleTip = landmarks[12]; // Tip of the middle finger

        // Calculate vectors for the palm orientation
        const palmVector = { x: middleBase.x - wrist.x, y: middleBase.y - wrist.y };
        const fingerVector = { x: middleTip.x - middleBase.x, y: middleTip.y - middleBase.y };

        // Calculate the dot product to determine the angle
        const dotProduct = palmVector.x * fingerVector.x + palmVector.y * fingerVector.y;
        const palmMagnitude = Math.sqrt(palmVector.x ** 2 + palmVector.y ** 2);
        const fingerMagnitude = Math.sqrt(fingerVector.x ** 2 + fingerVector.y ** 2);
        const angle = Math.acos(dotProduct / (palmMagnitude * fingerMagnitude)) * (180 / Math.PI);

        // Allow drawing if the palm is facing forward (angle close to 0 or 180 degrees)
        return angle < 45 || angle > 135;
    };

    // Draw buttons and color picker
    const drawUI = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {

        // Draw color picker
        const colorPickerWidth = canvas.width / colorPickerColors.length;
        const colorPickerHeight = 30;

        colorPickerColors.forEach((color, index) => {
            const colorX = index * colorPickerWidth;
            const colorY = canvas.height - colorPickerHeight;
            ctx.fillStyle = color;
            ctx.fillRect(colorX, colorY, colorPickerWidth, colorPickerHeight);
        });
    };

    // Handle button clicks
    const handleButtonClick = (landmarks: any[], canvas: HTMLCanvasElement) => {
        const buttonWidth = canvas.width / 3;
        const buttonHeight = 30;

        landmarks.forEach((landmark) => {
            const pointer8 = landmark[8];
            if (pointer8) {
                const x = pointer8.x * canvas.width;
                const y = pointer8.y * canvas.height;

                if (x >= 0 && x <= buttonWidth && y >= 0 && y <= buttonHeight) {
                    brushSizeRef.current = Math.min(brushSizeRef.current + 10, 100);
                } else if (x >= buttonWidth && x <= buttonWidth * 2 && y >= 0 && y <= buttonHeight) {
                    brushSizeRef.current = Math.max(brushSizeRef.current - 10, 10);
                } else if (x >= buttonWidth * 2 && x <= buttonWidth * 3 && y >= 0 && y <= buttonHeight) {
                    drawnColors.current = [];
                }
            }
        });
    };

    // Handle color picker clicks
    const handleColorPickerClick = (landmarks: any[], canvas: HTMLCanvasElement) => {
        const colorPickerWidth = canvas.width / colorPickerColors.length;
        const colorPickerHeight = 30;

        landmarks.forEach((landmark, handIndex) => {
            const pointer8 = landmark[8];
            if (pointer8) {
                const x = pointer8.x * canvas.width;
                const y = pointer8.y * canvas.height;

                colorPickerColors.forEach((color, index) => {
                    const colorX = index * colorPickerWidth;
                    const colorY = canvas.height - colorPickerHeight;

                    if (x >= colorX && x <= colorX + colorPickerWidth && y >= colorY && y <= colorY + colorPickerHeight) {
                        fingerColorsRef.current[handIndex] = color;
                    }
                });
            }
        });
    };

    // Draw finger pointers
    const drawFingers = (landmarks: any[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        landmarks.forEach((landmark, handIndex) => {
            if (!isPalmForward(landmark)) return;

            const pointer8 = landmark[8];
            const thumb4 = landmark[4];

            if (pointer8 && thumb4) {
                const x = pointer8.x * canvas.width;
                const y = pointer8.y * canvas.height;
                const thumbX = thumb4.x * canvas.width;
                const thumbY = thumb4.y * canvas.height;

                const distance = Math.sqrt(Math.pow(x - thumbX, 2) + Math.pow(y - thumbY, 2));
                const touchThreshold = 20;

                if (distance < touchThreshold) {
                    drawnColors.current.push({
                        color: fingerColorsRef.current[handIndex],
                        x,
                        y,
                        size: brushSizeRef.current,
                    });
                }

                ctx.beginPath();
                ctx.arc(x, y, brushSizeRef.current / 2, 0, 2 * Math.PI);
                ctx.fillStyle = fingerColorsRef.current[handIndex];
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                ctx.fillStyle = "black";
                ctx.fill();
            }
        });
    };

    // Main drawing function
    const drawPointer = (landmarksArray: any[]) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);

        // Draw previously drawn colors
        drawnColors.current.forEach((drawnColor) => {
            ctx.beginPath();
            ctx.arc(drawnColor.x, drawnColor.y, drawnColor.size / 2, 0, 2 * Math.PI);
            ctx.fillStyle = drawnColor.color;
            ctx.fill();
        });

        // Draw UI
        drawUI(ctx, canvas);

        // Handle interactions
        handleButtonClick(landmarksArray, canvas);
        handleColorPickerClick(landmarksArray, canvas);

        // Draw fingers
        drawFingers(landmarksArray, ctx, canvas);

        ctx.restore();
    };

    // Detect hands and draw
    const detectHands = () => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
            const detections = handLandmarkerRef.current?.detectForVideo(videoRef.current, performance.now());
            if (detections?.landmarks) {
                drawPointer(detections.landmarks);
            }
        }
        requestAnimationFrame(detectHands);
    };

    // Set canvas size to match video size
    const setCanvasSize = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }
    };

    // Start webcam and initialize hand detection
    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current!.srcObject = stream;

            // Wait for the video metadata to load
            videoRef.current!.onloadedmetadata = () => {
                setCanvasSize(); // Set canvas size to match video size
                initializeHandDetection().then(() => detectHands());
            };
        } catch (error) {
            console.error("Error accessing webcam:", error);
        }
    };

    // Set initial canvas size based on container dimensions
    const setInitialCanvasSize = () => {
        const container = document.querySelector(".video-container");
        if (container && canvasRef.current) {
            const { width, height } = container.getBoundingClientRect();
            canvasRef.current.width = width;
            canvasRef.current.height = height;
        }
    };

    useEffect(() => {
        setInitialCanvasSize(); // Set initial canvas size
        startWebcam();

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((track: { stop: () => any }) => track.stop());
            }
            if (handLandmarkerRef.current) handLandmarkerRef.current.close();
        };
    }, []);

    return (
<div className="flex justify-center items-center flex-col space-y-6">
  <div className="relative flex justify-center items-center w-full min-w-[300px] md:min-w-[600px] max-w-[800px] h-[300px] md:h-[500px] bg-gray-200 rounded-md shadow-lg overflow-hidden">
    {/* Video element */}
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"
    ></video>

    {/* Canvas element */}
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    ></canvas>

    {/* Buttons */}
    <div className="absolute top-0 left-0 w-full flex justify-between z-10">
      {/* Clear Button */}
      <div className="bg-red-500 text-white text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 shadow-lg w-1/3 text-center rounded-tl-lg flex items-center justify-center leading-tight truncate">
        Clear
      </div>

      {/* Brush Size-- Button */}
      <div className="bg-orange-500 text-white text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 shadow-lg w-1/3 text-center flex items-center justify-center leading-tight truncate">
        Brush Size--
      </div>

      {/* Brush Size++ Button */}
      <div className="bg-green-500 text-white text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 shadow-lg w-1/3 text-center rounded-tr-lg flex items-center justify-center leading-tight truncate">
        Brush Size++
      </div>
    </div>
  </div>
</div>
    );
};

export default HandTrackingCanvas;