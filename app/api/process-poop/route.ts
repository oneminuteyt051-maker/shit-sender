import { NextRequest, NextResponse } from "next/server";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { serialize } from "borsh";
import nacl from "tweetnacl";
import { SIGN_MESSAGE_TEXT, POOP_CONFIG } from "@/app/config";

// --- MEMO SCHEMA (Borsh) ---
class MemoSchema {
  instruction: number; // Instruction index (0 for Memo)
  memo: string; // The memo text

  constructor(obj: { instruction: number; memo: string }) {
    this.instruction = obj.instruction;
    this.memo = obj.memo;
  }
}

const MEMO_SCHEMA = new Map([
  [
    MemoSchema,
    {
      kind: "struct",
      fields: [
        ["instruction", "u8"],
        ["memo", "string"],
      ],
    },
  ],
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userPubkey, recipientPubkey, amount, signature, poopType } = body;

    // 1. ВАЛИДАЦИЯ ВХОДНЫХ ДАННЫХ
    if (!userPubkey || !recipientPubkey || !amount || !signature) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 2. ПРОВЕРКА ПОДПИСИ (Security)
    try {
        const userPub = new PublicKey(userPubkey);
        // Важно: signature приходит как массив чисел [12, 244, ...], превращаем в Uint8Array
        const sigBytes = new Uint8Array(signature);
        const messageBytes = new TextEncoder().encode(SIGN_MESSAGE_TEXT);

        const isValid = nacl.sign.detached.verify(messageBytes, sigBytes, userPub.toBytes());
        
        if (!isValid) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
    } catch (e) {
        return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }

    // 3. ПОДГОТОВКА HOT WALLET
    const hotWalletPrivateKeyString = process.env.HOT_WALLET_PRIVATE_KEY;
    if (!hotWalletPrivateKeyString) {
      console.error("HOT_WALLET_PRIVATE_KEY missing");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const privateKeyArray = Uint8Array.from(JSON.parse(hotWalletPrivateKeyString));
    const hotWalletKeypair = Keypair.fromSecretKey(privateKeyArray);

    const connection = new Connection(
      process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta"),
      "confirmed"
    );

    // 4. СБОРКА ТРАНЗАКЦИИ
    const transaction = new Transaction();

    // "Dust" amount (пыль)
    const dustAmount = Math.round(amount * LAMPORTS_PER_SOL * 0.000001) || 1000;

    // Перевод пыли от Hot Wallet к Жертве
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: hotWalletKeypair.publicKey,
        toPubkey: new PublicKey(recipientPubkey),
        lamports: dustAmount,
      })
    );

    // Формирование Memo
    // Берем текст из конфига или дефолтный
    const configMemo = POOP_CONFIG[poopType as keyof typeof POOP_CONFIG]?.memo || "💩 You got a poop prank!";
    const fullMemo = `${configMemo} (from: ${userPubkey.slice(0, 6)}...${userPubkey.slice(-4)})`;

    const memoData = new MemoSchema({ instruction: 0, memo: fullMemo });
    const serializedMemoData = serialize(MEMO_SCHEMA, memoData);

    const memoInstruction = new TransactionInstruction({
      keys: [],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(serializedMemoData),
    });

    transaction.add(memoInstruction);

    // 5. ОТПРАВКА
    transaction.feePayer = hotWalletKeypair.publicKey;
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;

    // Подписываем серверным кошельком (он платит комиссию)
    transaction.sign(hotWalletKeypair);

    const signatureTx = await sendAndConfirmTransaction(connection, transaction, [
      hotWalletKeypair,
    ]);

    return NextResponse.json(
      { transactionId: signatureTx, success: true },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("Error in process-poop:", err);
    return NextResponse.json(
      { error: "Internal server error: " + err.message },
      { status: 500 }
    );
  }
}
