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

const IMMUNITY_PRICE = 0.05; 

// Типы для попапа подтверждения
type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    recipient: string;
    poopType: keyof typeof POOP_CONFIG;
    isSending: boolean;
};

// --- КОМПОНЕНТ МОДАЛЬНОГО ОКНА (PREVIEW) ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, recipient, poopType, isSending }: ConfirmModalProps) => {
    if (!isOpen) return null;

    const details = POOP_CONFIG[poopType];
    const shortAddress = recipient.length > 10 ? `${recipient.slice(0, 6)}...${recipient.slice(-6)}` : recipient;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-orange-100 transform transition-all scale-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Confirm Prank 🧐</h3>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Recipient:</span>
                        <span className="font-mono font-bold text-gray-700">{shortAddress}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Item:</span>
                        <span className="font-bold text-gray-800">{details.icon} {poopType}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                        <span className="text-gray-500">Total Cost:</span>
                        <span className="font-bold text-orange-600">{details.amount} SOL</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 italic text-center">
                        "I understand this is a joke transaction."
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        disabled={isSending}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isSending}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg flex justify-center items-center gap-2"
                    >
                        {isSending ? "Sending..." : "CONFIRM 🔥"}
                    </button>
                </div>
            </div>
        </div>
    );
};

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
  
  // Состояние для открытия модалки
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

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

  // --- ШАГ 1: ОТКРЫТИЕ ПРЕВЬЮ (ПРОВЕРКА ДАННЫХ) ---
  const handlePreviewClick = () => {
    if (!publicKey) return setMessage("Please connect your wallet!");
    if (!recipient) return setMessage("Enter recipient address first");
    
    try {
        new PublicKey(recipient); // Проверяем валидность адреса
        setMessage("");
        setIsModalOpen(true); // Открываем модалку
    } catch (e) {
        setMessage("Invalid Solana address");
    }
  };

  // --- ШАГ 2: РЕАЛЬНАЯ ОТПРАВКА (ВЫЗЫВАЕТСЯ ИЗ МОДАЛКИ) ---
  const executeTransaction = useCallback(async () => {
    setIsSending(true);
    setMessage("Preparing transaction...");
    
    try {
      const recipientPubkey = new PublicKey(recipient);
      const totalAmount = POOP_CONFIG[type].amount;
      const dustAmount = 0.000001; 
      const profitAmount = totalAmount - dustAmount; 

      const transaction = new Transaction();

      // 1. Прибыль тебе
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey!,
          toPubkey: TREASURY_ADDRESS,
          lamports: Math.floor(profitAmount * LAMPORTS_PER_SOL),
        })
      );

      // 2. Пыль получателю
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey!,
          toPubkey: recipientPubkey,
          lamports: Math.floor(dustAmount * LAMPORTS_PER_SOL),
        })
      );

      // 3. Memo
      const memoText = `${POOP_CONFIG[type].memo} (via Poop Protocol)`;
      transaction.add(
        new TransactionInstruction({
          keys: [{ pubkey: publicKey!, isSigner: true, isWritable: true }],
          data: Buffer.from(memoText, "utf-8"),
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        })
      );

      // Отправка
      const signature = await sendTransaction(transaction, connection, { skipPreflight: false });
      
      setMessage("Confirming...");
      await connection.confirmTransaction(signature, "confirmed");

      // Успех
      setIsModalOpen(false); // Закрываем модалку
      triggerAnimation();
      setTxSignature(signature);
      setMessage("Success! Poop thrown! 💩");
      setRecipient(""); // Очистить поле

    } catch (err: any) {
      console.error(err);
      setMessage("Error: " + (err.message || "Failed"));
    } finally {
        setIsSending(false);
    }
  }, [publicKey, recipient, type, connection, sendTransaction]);

  // --- ПОКУПКА ИММУНИТЕТА (ОСТАВЛЯЕМ КАК ЕСТЬ, ЭТО SELF-TX) ---
  const handleBuyImmunity = useCallback(async () => {
    if (!publicKey) return setMessage("Please connect your wallet!");
    setMessage(""); setTxSignature("");

    try {
        setMessage("Preparing Immunity contract...");
        const transaction = new Transaction();

        transaction.add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: TREASURY_ADDRESS,
                lamports: Math.floor(IMMUNITY_PRICE * LAMPORTS_PER_SOL),
            })
        );

        const memoText = `🛡️ Immunity Bought by ${publicKey.toString()} (via Poop Protocol)`;
        transaction.add(
            new TransactionInstruction({
                keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
                data: Buffer.from(memoText, "utf-8"),
                programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            })
        );

        const signature = await sendTransaction(transaction, connection, { skipPreflight: false });
        await connection.confirmTransaction(signature, "confirmed");

        setTxSignature(signature);
        setMessage("Success! You are now Immune! 🛡️");
    } catch (err: any) {
        setMessage("Error: " + (err.message || "Failed"));
    }
  }, [publicKey, connection, sendTransaction]);


  // Шэринг
  const getShareText = () => {
    if (message.includes("Immune")) return `I just bought Immunity 🛡️ on Poop Protocol!`;
    return `I just sent a ${type} poop 💩 via Poop Protocol!`;
  };
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://protocol-solana.space';
  const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-comic bg-cover bg-center relative overflow-hidden"
         style={{ backgroundImage: "url('/poop-cover.png')" }}>
      
      <div className="absolute inset-0 bg-white/80" />

      {/* МОДАЛКА ПРЕДПРОСМОТРА */}
      <ConfirmModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={executeTransaction}
        recipient={recipient}
        poopType={type}
        isSending={isSending}
      />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl text-center z-10 border border-gray-100">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
           <h1 className="text-3xl font-extrabold mb-2 text-gray-900 tracking-tight">💩 Poop Protocol</h1>
           <p className="text-gray-500 text-sm mb-4">The #1 Crypto Prank Service</p>
           <div className="w-full wallet-adapter-custom-wrapper">
             <WalletMultiButton style={{ width: '100%', justifyContent: 'center', backgroundColor: '#2b2b2b', borderRadius: '12px' }} />
           </div>
        </div>

        {/* Input (RENAMED TO RECIPIENT) */}
        <div className="text-left mb-2 ml-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Recipient Address (Friend)</label>
        </div>
        <input
          type="text"
          placeholder="Addr..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-orange-400 outline-none mb-6 text-black bg-gray-50 font-mono text-sm transition-all"
        />

        {/* Type Selector */}
        <div className="flex gap-3 mb-6">
          {Object.entries(POOP_CONFIG).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setType(key as keyof typeof POOP_CONFIG)}
              className={`flex-1 flex flex-col items-center p-3 rounded-2xl transition-all duration-200 border-2 ${
                type === key ? "border-orange-500 bg-orange-50 scale-105 shadow-lg" : "border-gray-100 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="text-3xl mb-2 filter drop-shadow-sm">{key === 'classic' ? '💩' : key === 'revenge' ? '👿' : '🎁'}</div>
              <span className="font-bold text-xs uppercase text-gray-800 tracking-wide">{key}</span>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full mt-1">{value.amount} SOL</span>
            </button>
          ))}
        </div>

        {/* Action Button: PREVIEW (НЕ SEND) */}
        <button
          onClick={handlePreviewClick}
          disabled={!connected}
          className={`w-full p-4 rounded-2xl font-black text-lg shadow-lg transform transition-all active:scale-95 mb-3 ${
            connected 
            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-orange-500/30" 
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {connected ? "PREVIEW PRANK 👀" : "Connect Wallet First"}
        </button>

        {/* Action Button: IMMUNITY */}
        <button
          onClick={handleBuyImmunity}
          disabled={!connected}
          className={`w-full p-3 rounded-2xl font-bold text-md shadow-md transform transition-all active:scale-95 ${
            connected 
            ? "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/30" 
            : "bg-gray-200 text-gray-400 cursor-not-allowed hidden"
          }`}
        >
          Buy Immunity 🛡️ ({IMMUNITY_PRICE} SOL)
        </button>

        {/* Status Message */}
        {message && !message.includes("Preparing") && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-bold animate-pulse ${message.includes("Error") || message.includes("Connect") || message.includes("Enter") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
            {message}
          </div>
        )}

        {/* Share Block */}
        {txSignature && (
            <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in-up">
                <a href={`https://solscan.io/tx/${txSignature}`} target="_blank" className="block text-xs text-gray-400 hover:underline">View on Solscan</a>
                <a href={twitterLink} target="_blank" className="block mt-2 font-bold text-blue-500 hover:underline">Tweet this! 🐦</a>
            </div>
        )}
      </div>

      {/* Flying Poops */}
      {poops.map((poop) => (
        <img key={poop.id} src={poop.icon} className="absolute w-10 h-10 z-50 pointer-events-none" style={{ left: `${poop.x}%`, top: `${poop.y}%`, transform: `rotate(${poop.rotation}deg)`, animation: "flyPoop 1.5s ease-out forwards" }} onAnimationEnd={() => setPoops((prev) => prev.filter((p) => p.id !== poop.id))} />
      ))}
      
      <style jsx global>{`
        @keyframes flyPoop {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          50% { transform: translateY(-300px) rotate(180deg) scale(1.5); opacity: 1; }
          100% { transform: translateY(-800px) rotate(360deg) scale(0.5); opacity: 0; }
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        .wallet-adapter-button { width: 100% !important; justify-content: center !important; font-family: inherit !important; }
      `}</style>
    </div>
  );
}
