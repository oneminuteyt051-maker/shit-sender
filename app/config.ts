import { PublicKey } from "@solana/web3.js";

// Твой кошелек, куда будет капать прибыль (99.9%)
export const TREASURY_ADDRESS = new PublicKey("79H21m2P9ay6twFvxoe4REB6jJ6jJ5UHT4HisqkErg83"); 

export const POOP_CONFIG = {
  classic: {
    amount: 0.002, // Полная цена, которую платит юзер
    icon: "/poop-classic.png",
    memo: "💩 You got a classic poop prank!"
  },
  revenge: {
    amount: 0.003,
    icon: "/poop-revenge.png",
    memo: "😈 You got a revenge poop prank!"
  },
  gift: {
    amount: 0.002,
    icon: "/poop-gift.png",
    memo: "🎁 You got a gift poop prank!"
  }
} as const;

export const SIGN_MESSAGE_TEXT = "I approve sending a poop prank via Poop Protocol";
