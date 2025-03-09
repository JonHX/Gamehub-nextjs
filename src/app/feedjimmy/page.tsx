import Link from "next/link";
import Canvas from "./canvas";

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen px-4 py-6 relative">
          <h1 className="text-3xl font-bold mb-2 text-center">Feed Jimmy the Snake</h1>
          <p className="text-center text-gray-600 max-w-sm">
            See how much you can feed Jimmy the snake in X seconds. (Use your finger(s)) (WIP) <a className="text-purple-800" href="#options">[Options]</a>
          </p>
    
          <div className="w-full max-w-[600px] flex justify-center mt-4">
            <Canvas />
          </div>
    
          <Link 
            href="/" 
            className="fixed top-3 sm:top-8 left-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm md:text-md rounded-lg shadow-md transition-all duration-300"
          >
            ⬅ Back to Menu
          </Link>
        </main>
      );
}
