import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { createMemoInstruction } from "@solana/spl-memo";
import { Keypair } from "@solana/web3.js";

export async function POST(request: Request) {
  try {
    const { userPubkey, recipientPubkey, amount } = await request.json();

    // Получаем приватный ключ из env (горячий кошелёк)
    const secretKey = Uint8Array.from(JSON.parse(process.env.HOT_WALLET_PRIVATE_KEY!));
    const keypair = Keypair.fromSecretKey(secretKey);

    const connection = new Connection("https://api.mainnet-beta.solana.com");

    const tx = new Transaction();

    // Отправляем "пыль" жертве
    const dustAmount = Math.round(amount * 0.0001 * LAMPORTS_PER_SOL);

    tx.add(SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: new PublicKey(recipientPubkey),
      lamports: dustAmount,
    }));

    // Генерируем уникальный ID (например, timestamp)
    const uniqueId = Date.now().toString();

    // Добавляем memo с уникальным ID
    tx.add(createMemoInstruction(`💩 You got a poop prank from ${userPubkey}! ID: ${uniqueId}`, [keypair.publicKey]));

    // Подписываем и отправляем транзакцию
    const signature = await sendAndConfirmTransaction(connection, tx, [keypair]);

    return Response.json({ success: true, signature, uniqueId });
  } catch (err) {
    console.error("Process poop error:", err);
    return Response.json({ error: "Failed to send poop" }, { status: 500 });
  }
}