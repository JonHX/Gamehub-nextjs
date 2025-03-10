import Link from "next/link";
import HandTrackingCanvas from "./canvas";

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen px-4 top-20 lg:top-0 relative">
      {/* Updated title */}
      <h1 className="text-3xl font-bold mb-2 text-center">Finger Paint</h1>

      {/* Instructions */}
      <p className="text-center text-gray-600 max-w-sm mb-4">
        Pinch to paint, like you were holding a pen. Hover over the buttons to use them. Hover corresponding finger on the desired colour to change. 
      </p>

      {/* HandTrackingCanvas component */}
      <div className="w-full max-w-[600px] flex justify-center mt-4">
          <HandTrackingCanvas />
      </div>

      {/* Back to Menu Link */}
      <Link 
          href="/" 
          className="fixed top-3 left-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm md:text-md rounded-lg shadow-md transition-all duration-300"
      >
          ⬅ Back to Menu
      </Link>
    </main>
  );
}
