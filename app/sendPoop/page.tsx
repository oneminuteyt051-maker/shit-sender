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

export default function SendPoopPage() {
  const [recipient, setRecipient] = useState("");
  const [type, setType] = useState("classic");
  const [message, setMessage] = useState("");
  const [wallet, setWallet] = useState<any>(null);

  // Подключаем Phantom кошелек
  useEffect(() => {
    const solana = (window as any).solana; // ✅ локальный кастинг
    if (solana && solana.isPhantom) {
      setWallet(solana);
    } else {
      setMessage("Install Phantom Wallet to send poops");
    }
  }, []);

  const handleSend = async () => {
    if (!recipient || !wallet) {
      setMessage("Recipient address and wallet required");
      return;
    }

    try {
      const apiUrl = `/api/actions/poop?type=${type}&recipient=${recipient}`;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: wallet.publicKey.toString() }),
      });

      const data = await res.json();
      if (!data || !data.fields?.transaction) {
        setMessage("API did not return transaction");
        return;
      }

      // Десериализация транзакции из base64
      const txBytes = Uint8Array.from(atob(data.fields.transaction), (c) =>
        c.charCodeAt(0)
      );
      const transaction = Transaction.from(txBytes);

      // Подписываем транзакцию через Phantom
      const signedTx = await wallet.signTransaction(transaction);

      // Отправляем транзакцию
      const connection = new Connection(clusterApiUrl("mainnet-beta"));
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      setMessage(`Transaction sent! Signature: ${signature}`);
    } catch (err: any) {
      console.error(err);
      setMessage("Error sending poop: " + (err.message || err));
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 500, margin: "auto" }}>
      <h1>💩 Poop Protocol</h1>
      <p>Send a prank SOL to someone on Solana!</p>

      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        style={{ width: "100%", margin: "1rem 0", padding: "0.5rem" }}
      />

      <div style={{ margin: "1rem 0" }}>
        {["classic", "revenge", "gift"].map((p) => (
          <button
            key={p}
            onClick={() => setType(p)}
            style={{
              padding: "0.5rem 1rem",
              marginRight: "0.5rem",
              backgroundColor: type === p ? "#ffcc00" : "#eee",
            }}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <button
        onClick={handleSend}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#ff6600",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Send Poop
      </button>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}
