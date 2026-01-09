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

/**
 * POST request handler for processing the poop prank after the main transaction.
 * This endpoint uses the HOT_WALLET_PRIVATE_KEY to send a small amount of SOL
 * and a memo to the recipient.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { userPubkey, recipientPubkey, amount } = await request.json();

    // Validate input parameters
    if (!userPubkey || !recipientPubkey || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Load the hot wallet private key from environment variables
    const hotWalletPrivateKeyString = process.env.HOT_WALLET_PRIVATE_KEY;
    if (!hotWalletPrivateKeyString) {
      console.error("HOT_WALLET_PRIVATE_KEY is not set in environment variables.");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert the private key string to a Uint8Array and create a Keypair
    const privateKeyArray = Uint8Array.from(JSON.parse(hotWalletPrivateKeyString));
    const hotWalletKeypair = Keypair.fromSecretKey(privateKeyArray);

    // Connect to the Solana network
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta"),
      "confirmed"
    );

    // Create a new transaction
    const transaction = new Transaction();

    // Calculate the "dust" amount to send (a tiny fraction of the original amount)
    const dustAmount = 0.000001 * LAMPORTS_PER_SOL; // 0.000001 SOL in Lamports

    // Add a transfer instruction to send the dust amount to the recipient
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: hotWalletKeypair.publicKey, // Hot wallet pays for this transaction
        toPubkey: new PublicKey(recipientPubkey), // Recipient receives the dust
        lamports: dustAmount, // Amount in Lamports
      })
    );

    // Prepare the memo text
    const memoText = `💩 You got a poop prank from ${userPubkey}!`;

    // Serialize the memo data according to the SPL Memo schema
    const memoData = new MemoSchema({ instruction: 0, memo: memoText });
    const serializedMemoData = serialize(MEMO_SCHEMA, memoData);

    // Create the Memo instruction
    const memoInstruction = new TransactionInstruction({
      keys: [], // Memo instruction doesn't require any accounts
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"), // SPL Memo Program ID
      data: Buffer.from(serializedMemoData), // Serialized memo data
    });

    // Add the Memo instruction to the transaction
    transaction.add(memoInstruction);

    // Set the fee payer to the hot wallet and add a recent blockhash
    transaction.feePayer = hotWalletKeypair.publicKey;
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;

    // Sign the transaction with the hot wallet's private key
    transaction.sign(hotWalletKeypair);

    // Send and confirm the transaction on the Solana network
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      hotWalletKeypair,
    ]);

    // Return the transaction signature upon success
    return new Response(
      JSON.stringify({ transactionId: signature }),
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