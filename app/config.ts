import { PublicKey } from "@solana/web3.js";

// ХОЛОДНЫЙ КОШЕЛЕК — для получения основной части средств
export const COLD_WALLET = new PublicKey("79H21m2P9ay6twFvxoe4REB6jJ6jJ5UHT4HisqkErg83");

// Цены в SOL (новые)
export const PRICES: Record<string, number> = {
  classic: 0.002, // ~ $0.30
  revenge: 0.003, // ~ $0.45
  gift: 0.002,    // ~ $0.30
  immunity: 0.006 // ~ $0.90
};

// Твой домен после деплоя (автоопределение)
export const BASE_URL = process.env.NEXT_PUBLIC_HOST || "https://shit-sender.vercel.app";