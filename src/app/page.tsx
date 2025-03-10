import Link from "next/link";

export default function Home() {
  const games = [
    { name: "⚡ Click Fast", path: "/clickfast" },
    { name: "⌨️ Type Fast", path: "/typefast" },
    { name: "🧠 Memory Game", path: "/memorygame" },
    { name: "🔢 Number Guesser", path: "/numberguesser" },
    { name: "🔤 Word Scrambler", path: "/wordscrambler" },
    { name: "❓ Guess My Number", path: "/guessmynumber" },
    { name: "🐍 Feed Jimmy", path: "/feedjimmy" },
    { name: "🎨 Finger Paint", path: "/fingerpaint" }
  ];


  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4 py-4">
      <h1 className="text-5xl font-bold mb-8 text-center tracking-wide">🎮 Game Hub</h1>
      <p className="text-lg text-gray-300 mb-6 text-center">A random collection of react-games I speed coded to entertain the GF whilst she has no signal on the tube. <br/>By <a className="text-amber-300" href="https://www.linkedin.com/in/jtarrant/">Jon Tarrant</a></p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl">
        {games.map((game, index) => (
          <Link
            key={index}
            href={game.path}
            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-105 text-white font-semibold text-lg rounded-lg text-center shadow-md w-full"
          >
            {game.name}
          </Link>
        ))}
      </div>
    </main>
  );
}
