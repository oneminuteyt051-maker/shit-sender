"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handlePoopAction = (type: string) => {
    if (!recipientAddress.trim()) {
      alert("Please enter a recipient address");
      return;
    }

    // Redirect to the Solana Action endpoint with the recipient and type
    const actionUrl = `/api/actions/poop?type=${type}&recipient=${encodeURIComponent(recipientAddress)}`;
    window.location.href = actionUrl;
  };

  const handleImmunityAction = () => {
    // Redirect to the immunity Solana Action
    const immunityUrl = `/api/actions/immunity`;
    window.location.href = immunityUrl;
  };

  const handleTestPoop = async () => {
    if (!recipientAddress.trim()) {
      alert("Please enter a recipient address for testing");
      return;
    }

    setIsProcessing(true);

    try {
      // Call the backend endpoint to process the poop manually
      const response = await fetch('/api/process-poop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPubkey: "FAKE_USER_PUBKEY", // Placeholder for now
          recipientPubkey: recipientAddress,
          amount: 0.002, // Default amount for testing
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(`Test poop sent successfully! Transaction ID: ${result.transactionId}`);
    } catch (error) {
      console.error("Error sending test poop:", error);
      alert("Failed to send test poop. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1>💩 Poop Protocol</h1>
      <p>Send a poop prank to someone on Solana!</p>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="recipient">Recipient Address:</label>
        <input
          id="recipient"
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Enter Solana address"
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
        />
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => handlePoopAction("classic")}
          disabled={!recipientAddress.trim()}
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: recipientAddress.trim() ? "pointer" : "not-allowed",
          }}
        >
          💩 Classic (0.002 SOL)
        </button>
        <button
          onClick={() => handlePoopAction("revenge")}
          disabled={!recipientAddress.trim()}
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: recipientAddress.trim() ? "pointer" : "not-allowed",
          }}
        >
          😈 Revenge (0.003 SOL)
        </button>
        <button
          onClick={() => handlePoopAction("gift")}
          disabled={!recipientAddress.trim()}
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: recipientAddress.trim() ? "pointer" : "not-allowed",
          }}
        >
          🎁 Gift (0.002 SOL)
        </button>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>🛡️ Get Immunity</h3>
        <button
          onClick={handleImmunityAction}
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#e6f7ff",
            border: "1px solid #91d5ff",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🛡️ Get Immunity (0.006 SOL)
        </button>
      </div>

      <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
        <h3>🔧 Debug Tools</h3>
        <button
          onClick={handleTestPoop}
          disabled={!recipientAddress.trim() || isProcessing}
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#fff2f0",
            border: "1px solid #ffccc7",
            borderRadius: "4px",
            cursor: (!recipientAddress.trim() || isProcessing) ? "not-allowed" : "pointer",
          }}
        >
          {isProcessing ? "Sending..." : "Test Poop (Debug)"}
        </button>
      </div>
    </div>
  );
}