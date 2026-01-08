import { PublicKey } from "@solana/web3.js";

// ТВОЙ КОШЕЛЕК SOLANA (куда пойдут деньги)
export const MY_WALLET = new PublicKey("79H21m2P9ay6twFvxoe4REB6jJ6jJ5UHT4HisqkErg83"); 

// Цены в SOL
export const PRICES: Record<string, number> = {
  classic: 0.001, // ~ $0.15
  revenge: 0.0015,
  gift: 0.001,
  immunity: 0.006 // ~ $1.00
};

// Твой домен после деплоя (пока оставь localhost, потом поменяешь на vercel.app)
export const BASE_URL = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";