// Configuration for Poop Protocol
export const POOP_CONFIG = {
  classic: {
    amount: 0.002,
    icon: "/poop-classic.png",
    memo: "💩 You got a classic poop prank!"
  },
  revenge: {
    amount: 0.003,
    icon: "/poop-revenge.png",
    memo: "💩 You got a revenge poop prank!"
  },
  gift: {
    amount: 0.002,
    icon: "/poop-gift.png",
    memo: "💩 You got a gift poop prank!"
  }
} as const;

// Default recipient address if none is provided
export const DEFAULT_RECIPIENT_ADDRESS = "Bg9fFUiD8wxYVJ6E46a6zqgpGykb5N7FbU2g2PGnQCQc";

// Reward address for development
export const REWARD_ADDRESS = "79H21m2P9ay6twFvxoe4REB6jJ6jJ5UHT4HisqkErg83";

// Text to sign for signMessage verification (used by all wallets)
export const SIGN_MESSAGE_TEXT = "I approve sending a poop prank via Poop Protocol";
