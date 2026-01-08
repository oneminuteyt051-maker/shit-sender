import Link from "next/link";

export default function Home() {
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

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
          {/* Главная кнопка - ссылка на Action */}
          <Link 
            href="/api/actions/poop"
            className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-200 transition-all w-full sm:w-auto"
          >
            Launch App (Blink)
          </Link>
          
          <Link 
            href="/immune"
            className="border border-zinc-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-900 transition-all w-full sm:w-auto"
          >
            Get Immunity
          </Link>
        </div>

        {/* Футер для солидности */}
        <div className="mt-12 pt-8 border-t border-zinc-800 w-full flex justify-between text-zinc-500 text-sm">
          <span>Built on Solana Blinks</span>
          <span>No utility. Only poop.</span>
        </div>
      </main>
    </div>
  );
}