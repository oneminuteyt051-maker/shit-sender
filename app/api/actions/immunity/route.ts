import { ActionGetResponse, ActionPostResponse, createPostResponse } from "@solana/actions";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { NextRequest } from "next/server";
import { COLD_WALLET } from "../../../config";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const baseHref = `${url.origin}/api/actions/immunity`;

  const payload: ActionGetResponse = {
    title: "🛡️ Immunity Purchase",
    icon: `${url.origin}/immunity-badge.png`,
    description: "Purchase immunity from future poop pranks for 0.006 SOL",
    label: "🛡️ Immunity (0.006 SOL)",
    links: {
      actions: [
        {
          label: "🛡️ Immunity (0.006 SOL)",
          href: baseHref,
        }
      ]
    }
  };

  return Response.json(payload);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const account = new PublicKey(body.account);

    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const recipient = new PublicKey(COLD_WALLET);
    const amount = 0.006 * LAMPORTS_PER_SOL;

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: recipient,
        lamports: amount,
      })
    );

    tx.feePayer = account;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction: tx as any,
        message: "Immunity Badge Unlocked! 🛡️",
      },
    });

    return Response.json(payload);
  } catch (err) {
    console.error("Error in POST /api/actions/immunity:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}