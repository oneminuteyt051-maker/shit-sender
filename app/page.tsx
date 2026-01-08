import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [recipientAddress, setRecipientAddress] = useState("");

  const handleSubmit = (e: React.FormEvent, type: string) => {
    e.preventDefault();
    if (!recipientAddress) return alert("Введите адрес жертвы!");
    window.location.href = `/api/actions/poop?type=${type}&recipient=${encodeURIComponent(recipientAddress)}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white font-sans p-8">
      <main className="max-w-2xl text-center flex flex-col items-center gap-8">
        {/* Лого / Иконка */}
        <div className="text-8xl">💩</div>

        <h1 className="text-5xl font-extrabold tracking-tighter sm:text-7xl">
          POOP <span className="text-yellow-500">PROTOCOL</span>
        </h1>

        <p className="text-xl text-zinc-400 leading-relaxed">
          The first micro-payment prank service on Solana.
          Send a "crypto-poop" to your friends via Blink.
          Pure memes, pure vibes, instant transactions.
        </p>

        {/* Форма ввода адреса жертвы */}
        <form className="w-full max-w-md">
          <input
            type="text"
            placeholder="Enter victim's Solana address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="w-full p-4 rounded-lg bg-gray-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </form>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
          {/* Кнопки с отправкой через форму */}
          <button
            onClick={(e) => handleSubmit(e, "classic")}
            className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-200 transition-all w-full sm:w-auto"
          >
            💩 Classic (0.002 SOL)
          </button>

          <button
            onClick={(e) => handleSubmit(e, "revenge")}
            className="bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-red-700 transition-all w-full sm:w-auto"
          >
            😈 Revenge (0.003 SOL)
          </button>

          <button
            onClick={(e) => handleSubmit(e, "gift")}
            className="bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition-all w-full sm:w-auto"
          >
            🎁 Gift (0.002 SOL)
          </button>
        </div>

        <Link
          href="/api/actions/immunity"
          className="border border-zinc-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-900 transition-all w-full sm:w-auto"
        >
          🛡️ Get Immunity (0.006 SOL)
        </Link>

        {/* Футер для солидности */}
        <div className="mt-12 pt-8 border-t border-zinc-800 w-full flex justify-between text-zinc-500 text-sm">
          <span>Built on Solana Blinks</span>
          <span>No utility. Only poop.</span>
        </div>
      </main>
    </div>
  );
}