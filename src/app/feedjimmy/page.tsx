import Link from "next/link";
import PoseDectector from "./PoseDectector";

export default function Home() {
  return (
    <main>
        <h1 className="text-center text-3xl font-bold mb-4">Feed Jimmy the snake</h1>
        <p className="mb-4">See how much you can feed jimmy the snake in X seconds. (use your finger(s)) (WIP)</p>
        <h2></h2>
        <PoseDectector />
        <Link 
            href="/" 
            className="absolute top-4 right-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold text-md rounded-lg shadow-md transition-all duration-300"
        >
            ⬅ Back to Menu
        </Link>
    </main>
  );
}
