"use client";

import { useEffect, useState } from "react";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { POOP_CONFIG } from "@/app/config";

type FlyingPoop = {
  id: number;
  icon: string;
  x: number;
  y: number;
  rotation: number;
};

export default function SendPoopPage() {
  const [recipient, setRecipient] = useState("");
  const [type, setType] = useState<keyof typeof POOP_CONFIG>("classic");
  const [message, setMessage] = useState("");
  const [poops, setPoops] = useState<FlyingPoop[]>([]);
  const [poopId, setPoopId] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleSend = async () => {
    if (!recipient) {
      setMessage("Enter victim address first");
      return;
    }

    setMessage("");

    try {
      const actionUrl = `${window.location.origin}/api/actions/poop?type=${type}&recipient=${recipient}`;

      if (isMobile) {
        // Mobile deeplink
        const phantomLink = `https://phantom.app/ul/v1/action?ref=${encodeURIComponent(actionUrl)}`;
        setMessage("Redirecting to your wallet...");
        window.location.href = phantomLink;
        return;
      }

      // Desktop: injected wallet
      const solana = (window as any).solana;
      if (!solana || !solana.isPhantom) {
        setMessage("Install Phantom Wallet to send poops");
        return;
      }

      await solana.connect();

      const res = await fetch(actionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: solana.publicKey.toString() }),
      });

      const data = await res.json();
      if (!data || !data.fields?.transaction) {
        setMessage("API did not return transaction");
        return;
      }

      // 5 летящих какашек
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

      const txBytes = Uint8Array.from(atob(data.fields.transaction), (c) =>
        c.charCodeAt(0)
      );
      const transaction = Transaction.from(txBytes);
      const signedTx = await solana.signTransaction(transaction);
      const connection = new Connection(clusterApiUrl("mainnet-beta"));
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      setMessage(`Transaction sent! Signature: ${signature}`);
    } catch (err: any) {
      console.error(err);
      setMessage("Error sending poop: " + (err.message || err));
    }
  };

  const handleBuyImmunity = async () => {
    const actionUrl = `${window.location.origin}/api/actions/immunity`;

    if (isMobile) {
      const phantomLink = `https://phantom.app/ul/v1/action?ref=${encodeURIComponent(actionUrl)}`;
      window.location.href = phantomLink;
      return;
    }

    const solana = (window as any).solana;
    if (!solana || !solana.isPhantom) {
      setMessage("Install Phantom Wallet to buy immunity");
      return;
    }

    await solana.connect();

    const res = await fetch(actionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account: solana.publicKey.toString() }),
    });

    const data = await res.json();
    if (!data || !data.fields?.transaction) {
      setMessage("API did not return transaction for immunity");
      return;
    }

    const txBytes = Uint8Array.from(atob(data.fields.transaction), (c) =>
      c.charCodeAt(0)
    );
    const transaction = Transaction.from(txBytes);
    const signedTx = await solana.signTransaction(transaction);
    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(signature, "confirmed");

    setMessage(`Immunity purchased! Signature: ${signature}`);
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
        <h1 style={{ marginBottom: 8 }}>💩 Poop Protocol</h1>
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
            color: "#000", // черный текст
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
                boxShadow: type === key ? "0 4px 12px rgba(255,102,0,0.5)" : "0 2px 6px rgba(0,0,0,0.1)",
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
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: 12,
            border: "none",
            backgroundColor: "#ff6600",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            transition: "transform 0.2s, background 0.2s",
            marginBottom: 12,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e65500")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff6600")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Throw Poop!
        </button>

        <button
          onClick={handleBuyImmunity}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: 12,
            border: "none",
            backgroundColor: "#2b7a78",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            transition: "transform 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3aafa9")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2b7a78")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Buy Immunity 🛡️
        </button>

        {message && (
          <p style={{ marginTop: 16, color: message.includes("Transaction") ? "green" : "red" }}>
            {message}
          </p>
        )}
      </div>

      {/* Летающие какашки */}
      {poops.map((poop) => (
        <img
          key={poop.id}
          src={poop.icon}
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
