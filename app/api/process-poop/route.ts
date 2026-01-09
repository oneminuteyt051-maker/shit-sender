import { NextRequest } from "next/server"; 
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
import { SIGN_MESSAGE_TEXT } from "@/app/config";

// Define the structure for the Memo instruction data according to SPL Memo spec
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
    const { userPubkey, recipientPubkey, amount, signature } = await request.json();

    if (!userPubkey || !recipientPubkey || !amount || !signature) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Проверка подписи signMessage
    const userPub = new PublicKey(userPubkey);
    const sigBytes = Uint8Array.from(signature);
    const messageBytes = new TextEncoder().encode(SIGN_MESSAGE_TEXT);

    const isValid = nacl.sign.detached.verify(messageBytes, sigBytes, userPub.toBytes());
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const hotWalletPrivateKeyString = process.env.HOT_WALLET_PRIVATE_KEY;
    if (!hotWalletPrivateKeyString) {
      console.error("HOT_WALLET_PRIVATE_KEY is not set in environment variables.");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const privateKeyArray = Uint8Array.from(JSON.parse(hotWalletPrivateKeyString));
    const hotWalletKeypair = Keypair.fromSecretKey(privateKeyArray);

    const connection = new Connection(
      process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta"),
      "confirmed"
    );

    const transaction = new Transaction();

    // "Dust" amount в lamports
    const dustAmount = Math.round(amount * LAMPORTS_PER_SOL * 0.000001); // tiny fraction

    // Добавляем перевод "пустышки"
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: hotWalletKeypair.publicKey,
        toPubkey: new PublicKey(recipientPubkey),
        lamports: dustAmount,
      })
    );

    // Memo с упоминанием отправителя
    const memoText = `💩 You got a poop prank from ${userPubkey}!`;
    const memoData = new MemoSchema({ instruction: 0, memo: memoText });
    const serializedMemoData = serialize(MEMO_SCHEMA, memoData);

    const memoInstruction = new TransactionInstruction({
      keys: [],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(serializedMemoData),
    });

    transaction.add(memoInstruction);

    transaction.feePayer = hotWalletKeypair.publicKey;
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;

    transaction.sign(hotWalletKeypair);

    const signatureTx = await sendAndConfirmTransaction(connection, transaction, [
      hotWalletKeypair,
    ]);

    return new Response(
      JSON.stringify({ transactionId: signatureTx }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error in POST /api/process-poop:", err);
    return new Response(
      JSON.stringify({ error: "An internal server error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
