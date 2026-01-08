import { ActionGetResponse, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl } from "@solana/web3.js";
import { MY_WALLET, PRICES } from "@/app/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const response: ActionGetResponse = {
    icon: new URL("/immunity-badge.png", url.origin).toString(),
    title: "🛡 Poop Immunity Certificate",
    description: "Get the badge. Stay safe from crypto poop.",
    label: "Buy Immunity",
  };
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS() {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userPubkey = new PublicKey(body.account);
    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const { blockhash } = await connection.getLatestBlockhash();

    const tx = new Transaction({ feePayer: userPubkey, recentBlockhash: blockhash }).add(
      SystemProgram.transfer({
        fromPubkey: userPubkey,
        toPubkey: MY_WALLET,
        lamports: Math.round(PRICES.immunity * LAMPORTS_PER_SOL),
      })
    );

    const url = new URL(request.url);
    const immuneLink = `${url.origin}/immune`;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction: tx,
        message: `Unlocked! Share your badge: ${immuneLink}`,
      },
    });

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
  } catch (err) {
    return Response.json({ error: "Error creating tx" }, { status: 400, headers: ACTIONS_CORS_HEADERS });
  }
}