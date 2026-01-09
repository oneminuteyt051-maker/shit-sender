"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { POOP_CONFIG, SIGN_MESSAGE_TEXT } from "@/app/config";

// Типы для анимации
type FlyingPoop = {
  id: number;
  icon: string;
  x: number;
  y: number;
  rotation: number;
};

export default function SendPoopPage() {
  // HOOKS: Используем официальный хук вместо window.solana
  const { publicKey, signMessage, connected } = useWallet();
  
  const [recipient, setRecipient] = useState("");
  const [type, setType] = useState<keyof typeof POOP_CONFIG>("classic");
  const [message, setMessage] = useState(""); // Используем message для статуса, как в оригинале
  const [poops, setPoops] = useState<FlyingPoop[]>([]);
  const [poopId, setPoopId] = useState(0);

  // --- ЛОГИКА АНИМАЦИИ (ОСТАВЛЕНА КАК БЫЛА) ---
  const triggerAnimation = () => {
    for (let i = 0; i < 5; i++) {
      setPoopId((id) => id + 1);
      setPoops((prev) => [
        ...prev,
        {
          id: poopId + i,
          icon: POOP_CONFIG[type].icon,
          x: 50 + Math.random() * 80,
          y: 90,
          rotation: Math.random() * 360,
        },
      ]);
    }
  };

  // --- ЛОГИКА ОТПРАВКИ POOP ---
  const handleSend = async () => {
    if (!connected || !publicKey || !signMessage) {
      setMessage("Please connect your wallet first!");
      return;
    }

    if (!recipient) {
      setMessage("Enter victim address first");
      return;
    }

    setMessage("");

    try {
      // 1. Подписываем сообщение (работает и на Mobile Phantom/Trust)
      setMessage("Please sign the request in your wallet...");
      const messageBytes = new TextEncoder().encode(SIGN_MESSAGE_TEXT);
      const signature = await signMessage(messageBytes);

      // 2. Отправляем на сервер для Process-Poop (Hot Wallet)
      setMessage("Sending request to server...");
      
      const response = await fetch("/api/process-poop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPubkey: publicKey.toBase58(),
          recipientPubkey: recipient,
          amount: POOP_CONFIG[type].amount,
          signature: Array.from(signature), // Преобразуем Uint8Array в массив
          poopType: type
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error");
      }

      // 3. Успех
      triggerAnimation();
      setMessage(`Poop sent! Tx: ${data.transactionId?.slice(0, 8)}...`);

    } catch (err: any) {
      console.error(err);
      setMessage("Error: " + (err.message || err));
    }
  };

  // --- ЛОГИКА BUY IMMUNITY (Адаптирована под useWallet) ---
  const handleBuyImmunity = async () => {
    if (!connected || !publicKey || !signMessage) {
        setMessage("Connect wallet to buy immunity");
        return;
    }

    try {
        setMessage("Sign immunity request...");
        const messageBytes = new TextEncoder().encode(SIGN_MESSAGE_TEXT);
        const signature = await signMessage(messageBytes);

        // Здесь вызываем твой старый endpoint или новый process-immunity (если есть)
        // Для примера оставим вызов старого, но с передачей подписи
        const actionUrl = `/api/actions/immunity`;
        
        const res = await fetch(actionUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                account: publicKey.toBase58(),
                signature: Array.from(signature),
                // Дополнительные данные если нужны
            }),
        });
        
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || "Failed");

        setMessage("Immunity request sent! Check wallet.");
    } catch (err: any) {
        setMessage("Error buying immunity: " + err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        fontFamily: "Comic Sans MS, Arial, sans-serif",
        backgroundImage: "url('/poop-cover.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Полупрозрачный слой */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255,255,255,0.8)",
        }}
      />

      {/* Карточка формы */}
      <div
        style={{
          position: "relative",
          maxWidth: 480,
          width: "100%",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
          textAlign: "center",
          zIndex: 1,
          backgroundColor: "rgba(255,255,255,0.95)",
        }}
      >
        {/* Кнопка кошелька в правом верхнем углу или по центру */}
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
            <WalletMultiButton style={{ backgroundColor: '#1a1a1a', fontFamily: 'inherit' }} />
        </div>

        <h1 style={{ marginBottom: 8, fontSize: '2rem' }}>💩 Poop Protocol</h1>
        <p style={{ color: "#555", marginBottom: 24 }}>
          Send a prank SOL to someone on Solana!
        </p>

        <input
          type="text"
          placeholder="Enter victim's address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 24,
            fontSize: 16,
            color: "#000",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          {Object.entries(POOP_CONFIG).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setType(key as keyof typeof POOP_CONFIG)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0.5rem",
                margin: "0 4px",
                borderRadius: 12,
                border: type === key ? "3px solid #ff6600" : "1px solid #ccc",
                backgroundColor: "#fff",
                cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
                boxShadow:
                  type === key
                    ? "0 4px 12px rgba(255,102,0,0.5)"
                    : "0 2px 6px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img
                src={value.icon}
                alt={key}
                style={{ width: 48, height: 48, marginBottom: 8 }}
              />
              <span style={{ fontWeight: 600, fontSize: 14 }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <span style={{ fontSize: 12, color: "#888" }}>{value.amount} SOL</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleSend}
          disabled={!connected}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: 12,
            border: "none",
            backgroundColor: connected ? "#ff6600" : "#ccc",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            cursor: connected ? "pointer" : "not-allowed",
            transition: "transform 0.2s, background 0.2s",
            marginBottom: 12,
          }}
          onMouseEnter={(e) => { if(connected) e.currentTarget.style.backgroundColor = "#e65500" }}
          onMouseLeave={(e) => { if(connected) e.currentTarget.style.backgroundColor = "#ff6600" }}
          onMouseDown={(e) => { if(connected) e.currentTarget.style.transform = "scale(0.95)" }}
          onMouseUp={(e) => { if(connected) e.currentTarget.style.transform = "scale(1)" }}
        >
          {connected ? "Throw Poop!" : "Connect Wallet First"}
        </button>

        <button
          onClick={handleBuyImmunity}
          disabled={!connected}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: 12,
            border: "none",
            backgroundColor: connected ? "#2b7a78" : "#ccc",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            cursor: connected ? "pointer" : "not-allowed",
            transition: "transform 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => { if(connected) e.currentTarget.style.backgroundColor = "#3aafa9" }}
          onMouseLeave={(e) => { if(connected) e.currentTarget.style.backgroundColor = "#2b7a78" }}
          onMouseDown={(e) => { if(connected) e.currentTarget.style.transform = "scale(0.95)" }}
          onMouseUp={(e) => { if(connected) e.currentTarget.style.transform = "scale(1)" }}
        >
          Buy Immunity 🛡️
        </button>

        {message && (
          <p style={{ marginTop: 16, color: message.toLowerCase().includes("error") ? "red" : "green", fontWeight: "bold" }}>
            {message}
          </p>
        )}
      </div>

      {/* Летающие какашки */}
      {poops.map((poop) => (
        <img
          key={poop.id}
          src={poop.icon}
          alt="flying poop"
          style={{
            position: "absolute",
            width: 32,
            height: 32,
            left: `${poop.x}%`,
            top: `${poop.y}%`,
            transform: `rotate(${poop.rotation}deg)`,
            animation: "flyPoop 1s ease-out forwards",
            zIndex: 2,
          }}
          onAnimationEnd={() => setPoops((prev) => prev.filter((p) => p.id !== poop.id))}
        />
      ))}

      <style>
        {`
          @keyframes flyPoop {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            50% { transform: translateY(-150px) rotate(180deg); opacity: 1; }
            100% { transform: translateY(-250px) rotate(360deg); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}
