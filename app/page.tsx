"use client";

import { useState } from "react";

export default function Home() {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Универсальная функция для вызова action и получения ответа
  const performAction = async (actionUrl: string) => {
    if (!recipientAddress.trim()) {
      alert("Please enter a recipient address");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${actionUrl}?recipient=${encodeURIComponent(recipientAddress)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: "FAKE_USER_PUBKEY" }) // В реальном случае заменить на wallet publicKey
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(`Action successful!\nTransaction ID: ${result.transaction?.signature || "N/A"}`);
    } catch (err) {
      console.error(err);
      alert("Action failed. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePoopAction = (type: string) => performAction(`/api/actions/poop?type=${type}`);
  const handleImmunityAction = () => performAction("/api/actions/immunity");

  return (
    <div style={{ padding: "2rem", maxWidth: "720px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Poop Protocol</h1>
      <p>On-chain prank and immunity protocol on Solana.</p>

      {/* Protocol Hub */}
      <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #eee", borderRadius: "6px" }}>
        <h3>Protocol Hub</h3>
        <ul style={{ lineHeight: "1.8" }}>
          <li><strong>Send Poop</strong> — on-chain prank action</li>
          <li><strong>Buy Immunity</strong> — protection badge</li>
          <li style={{ opacity: 0.5 }}>(soon) Leaderboard</li>
          <li style={{ opacity: 0.5 }}>(soon) Wipe Poop</li>
        </ul>
      </div>

      {/* Send Poop */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Send Poop</h3>

        <label>Recipient Address</label>
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Enter Solana address"
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
        />

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <button onClick={() => handlePoopAction("classic")} disabled={!recipientAddress.trim() || isProcessing}>
            💩 Classic (0.002 SOL)
          </button>
          <button onClick={() => handlePoopAction("revenge")} disabled={!recipientAddress.trim() || isProcessing}>
            😈 Revenge (0.003 SOL)
          </button>
          <button onClick={() => handlePoopAction("gift")} disabled={!recipientAddress.trim() || isProcessing}>
            🎁 Gift (0.002 SOL)
          </button>
        </div>
      </div>

      {/* Immunity */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Immunity</h3>
        <button onClick={handleImmunityAction} disabled={isProcessing}>
          🛡️ Get Immunity (0.006 SOL)
        </button>
      </div>

      {/* Debug */}
      <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
        <h3>Debug</h3>
        <button onClick={() => handlePoopAction("classic")} disabled={!recipientAddress.trim() || isProcessing}>
          {isProcessing ? "Sending..." : "Test Poop"}
        </button>
      </div>
    </div>
  );
}
