import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { createMemoInstruction } from "@solana/spl-memo";
import { Keypair } from "@solana/web3.js";

export async function POST(request: Request) {
  try {
    const { recipientPubkey, amount } = await request.json();

    // Получаем приватный ключ из env
    const secretKey = Uint8Array.from(JSON.parse(process.env.HOT_WALLET_PRIVATE_KEY!));
    const keypair = Keypair.fromSecretKey(secretKey);

    const connection = new Connection("https://api.mainnet-beta.solana.com");

    const tx = new Transaction();

    // Отправляем "пыль" жертве (0.01%)
    const dustAmount = Math.round(amount * 0.0001 * LAMPORTS_PER_SOL);

    tx.add(SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: new PublicKey(recipientPubkey),
      lamports: dustAmount,
    }));

    // Добавляем memo
    tx.add(createMemoInstruction(`💩 You got a poop prank!`, [keypair.publicKey]));

    // Подписываем и отправляем
    await sendAndConfirmTransaction(connection, tx, [keypair]);

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to send poop" }, { status: 500 });
  }
}