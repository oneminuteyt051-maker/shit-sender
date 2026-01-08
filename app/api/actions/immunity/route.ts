import { ActionGetResponse, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl } from "@solana/web3.js";

const MY_WALLET = new PublicKey("79H21m2P9ay6twFvxoe4REB6jJ6jJ5UHT4HisqkErg83");
const IMMUNITY_PRICE = 0.006; 

export async function GET(request: Request) {
  const response: ActionGetResponse = {
    icon: new URL("/immunity-badge.png", request.url).toString(),
    title: "🛡 Poop Immunity Certificate",
    description: "Buy a meme immunity badge. Pure joke. Pure vibes.",
    label: "Buy Immunity",
  };
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS() { return new Response(null, { headers: ACTIONS_CORS_HEADERS }); }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userPubkey = new PublicKey(body.account);
    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const { blockhash } = await connection.getLatestBlockhash();
    const tx = new Transaction({ feePayer: userPubkey, recentBlockhash: blockhash });
    tx.add(SystemProgram.transfer({ fromPubkey: userPubkey, toPubkey: MY_WALLET, lamports: Math.round(IMMUNITY_PRICE * LAMPORTS_PER_SOL) }));

    const host = request.headers.get("host")!;
    const protocol = host.includes("localhost") ? "http" : "https";
    const immuneLink = `${protocol}://${host}/immune`;

    const payload: ActionPostResponse = await createPostResponse({
      fields: { transaction: tx, message: `Immunity unlocked:\n${immuneLink}` },
    });
    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
  } catch {
    return Response.json({ error: "Error" }, { status: 400, headers: ACTIONS_CORS_HEADERS });
  }
}