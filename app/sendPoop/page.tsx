"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { 
    PublicKey, 
    Transaction, 
    SystemProgram, 
    LAMPORTS_PER_SOL, 
    TransactionInstruction 
} from "@solana/web3.js";
import { POOP_CONFIG, TREASURY_ADDRESS } from "@/app/config";

// Типы для анимации
type FlyingPoop = {
  id: number;
  icon: string;
  x: number;
  y: number;
  rotation: number;
};

export default function SendPoopPage() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  
  const [recipient, setRecipient] = useState("");
  const [type, setType] = useState<keyof typeof POOP_CONFIG>("classic");
  const [message, setMessage] = useState(""); 
  const [poops, setPoops] = useState<FlyingPoop[]>([]);
  const [poopId, setPoopId] = useState(0);
  const [txSignature, setTxSignature] = useState("");

  // --- АНИМАЦИЯ ---
  const triggerAnimation = () => {
    for (let i = 0; i < 15; i++) {
      setPoopId((id) => id + 1);
      setPoops((prev) => [
        ...prev,
        {
          id: poopId + i,
          icon: POOP_CONFIG[type].icon,
          x: 10 + Math.random() * 80,
          y: 100,
          rotation: Math.random() * 360,
        },
      ]);
    }
  };

  // --- ЛОГИКА ОТПРАВКИ (Client-Side) ---
  const handleSend = useCallback(async () => {
    if (!publicKey) {
      setMessage("Please connect your wallet!");
      return;
    }
    if (!recipient) {
      setMessage("Enter victim address first");
      return;
    }

    setMessage("");
    setTxSignature("");

    try {
      setMessage("Preparing transaction...");

      // 1. Валидация адреса жертвы
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(recipient);
      } catch (e) {
        setMessage("Invalid victim address");
        return;
      }

      // 2. Расчет сумм
      const totalAmount = POOP_CONFIG[type].amount;
      // Пыль жертве (например, 0.000001 SOL, чтобы транзакция прошла как перевод)
      const dustAmount = 0.000001; 
      // Остальное тебе (Прибыль)
      const profitAmount = totalAmount - dustAmount;

      const transaction = new Transaction();

      // Инструкция 1: Перевод прибыли ТЕБЕ (Treasury)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY_ADDRESS,
          lamports: Math.floor(profitAmount * LAMPORTS_PER_SOL),
        })
      );

      // Инструкция 2: Перевод пыли ЖЕРТВЕ
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: Math.floor(dustAmount * LAMPORTS_PER_SOL),
        })
      );

      // Инструкция 3: Memo (Текст какашки)
      // Memo Program ID: MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
      const memoText = `${POOP_CONFIG[type].memo} (via Poop Protocol)`;
      transaction.add(
        new TransactionInstruction({
          keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
          data: Buffer.from(memoText, "utf-8"),
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        })
      );

      setMessage("Please approve transaction in your wallet...");

      // 3. Отправка транзакции (Пользователь платит газ)
      // skipPreflight: false гарантирует проверку симуляции перед отправкой
      const signature = await sendTransaction(transaction, connection, { skipPreflight: false });

      setMessage("Confirming transaction...");
      
      // Ждем подтверждения блока
      await connection.confirmTransaction(signature, "confirmed");

      // Успех!
      triggerAnimation();
      setTxSignature(signature);
      setMessage("Success! Poop thrown! 💩");

    } catch (err: any) {
      console.error(err);
      // Обработка отказа пользователя
      if (err.message?.includes("User rejected")) {
        setMessage("Transaction rejected by user");
      } else {
        setMessage("Error: " + (err.message || "Transaction failed"));
      }
    }
  }, [publicKey, recipient, type, connection, sendTransaction]);

  // --- ШАРИНГ ---
  const getShareText = () => {
    const shortRec = recipient.slice(0, 4) + "..." + recipient.slice(-4);
    return `I just sent a ${type} poop 💩 to ${shortRec} via Poop Protocol! Send yours here:`;
  };
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shit-sender.vercel.app';
  const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(shareUrl)}`;
  const telegramLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(getShareText())}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-comic bg-cover bg-center relative overflow-hidden"
         style={{ backgroundImage: "url('/poop-cover.png')" }}>
      
      <div className="absolute inset-0 bg-white/80" />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl text-center z-10 border border-gray-100">
        
        <div className="flex flex-col items-center mb-6">
           <h1 className="text-3xl font-extrabold mb-2 text-gray-900 tracking-tight">💩 Poop Protocol</h1>
           <p className="text-gray-500 text-sm mb-4">The #1 Crypto Prank Service</p>
           
           <div className="w-full wallet-adapter-custom-wrapper">
             <WalletMultiButton style={{ 
                width: '100%', 
                justifyContent: 'center', 
                backgroundColor: '#2b2b2b',
                height: '50px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px'
             }} />
           </div>
        </div>

        <div className="text-left mb-2 ml-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Victim's Address</label>
        </div>
        <input
          type="text"
          placeholder="Addr..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-orange-400 outline-none mb-6 text-black bg-gray-50 font-mono text-sm transition-all"
        />

        <div className="flex gap-3 mb-6">
          {Object.entries(POOP_CONFIG).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setType(key as keyof typeof POOP_CONFIG)}
              className={`flex-1 flex flex-col items-center p-3 rounded-2xl transition-all duration-200 border-2 ${
                type === key 
                ? "border-orange-500 bg-orange-50 scale-105 shadow-lg" 
                : "border-gray-100 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="text-3xl mb-2 filter drop-shadow-sm">{key === 'classic' ? '💩' : key === 'revenge' ? '👿' : '🎁'}</div>
              <span className="font-bold text-xs uppercase text-gray-800 tracking-wide">{key}</span>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full mt-1">{value.amount} SOL</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleSend}
          disabled={!connected}
          className={`w-full p-4 rounded-2xl font-black text-lg shadow-lg transform transition-all active:scale-95 ${
            connected 
            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-orange-500/30" 
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {connected ? "THROW POOP! 🚀" : "Connect Wallet to Start"}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-bold animate-pulse ${message.includes("Error") || message.includes("rejected") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
            {message}
          </div>
        )}

        {txSignature && (
            <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in-up">
                <p className="text-sm font-bold text-gray-600 mb-3">Tell the world! 👇</p>
                <div className="flex gap-2">
                    <a href={twitterLink} target="_blank" rel="noreferrer" 
                       className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition flex items-center justify-center gap-2">
                       <span>🐦</span> Tweet
                    </a>
                    <a href={telegramLink} target="_blank" rel="noreferrer" 
                       className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-600 transition flex items-center justify-center gap-2">
                       <span>✈️</span> Telegram
                    </a>
                </div>
                <a href={`https://solscan.io/tx/${txSignature}`} target="_blank" className="block mt-4 text-xs text-gray-400 hover:underline">
                    View on Solscan
                </a>
            </div>
        )}

      </div>

      {poops.map((poop) => (
        <img
          key={poop.id}
          src={poop.icon}
          className="absolute w-10 h-10 z-50 pointer-events-none"
          style={{
            left: `${poop.x}%`,
            top: `${poop.y}%`,
            transform: `rotate(${poop.rotation}deg)`,
            animation: "flyPoop 1.5s ease-out forwards",
          }}
          onAnimationEnd={() => setPoops((prev) => prev.filter((p) => p.id !== poop.id))}
        />
      ))}
      
      <style jsx global>{`
        @keyframes flyPoop {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          50% { transform: translateY(-300px) rotate(180deg) scale(1.5); opacity: 1; }
          100% { transform: translateY(-800px) rotate(360deg) scale(0.5); opacity: 0; }
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
        }
        .wallet-adapter-button {
            width: 100% !important;
            justify-content: center !important;
            font-family: inherit !important;
        }
      `}</style>
    </div>
  );
}
