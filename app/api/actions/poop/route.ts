import { ActionGetResponse, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl } from "@solana/web3.js";

const MY_WALLET = new PublicKey("79H21m2P9ay6twFvxoe4REB6jJ6jJ5UHT4HisqkErg83");
const PRICES: Record<string, number> = { classic: 0.001, revenge: 0.0012, gift: 0.001 };

export async function GET(request: Request) {
  const response: ActionGetResponse = {
    icon: new URL("/poop-cover.png", request.url).toString(),
    title: "💩 Send Crypto Poop",
    description: "Send your friend a fake crypto alert. Pure meme. Costs a few cents.",
    label: "Send Poop",
    links: {
      actions: [
        { label: "💩 Send Poop", href: "/api/actions/poop?type=classic" },
        { label: "😈 Revenge Poop", href: "/api/actions/poop?type=revenge" },
        { label: "🎁 Gift Poop", href: "/api/actions/poop?type=gift" },
      ],
    },
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
    const url = new URL(request.url);
    const prankType = url.searchParams.get("type") || "classic";
    const price = PRICES[prankType] || 0.001;

    const tx = new Transaction({ feePayer: userPubkey, recentBlockhash: blockhash });
    tx.add(SystemProgram.transfer({ fromPubkey: userPubkey, toPubkey: MY_WALLET, lamports: Math.round(price * LAMPORTS_PER_SOL) }));

    const host = request.headers.get("host")!;
    const protocol = host.includes("localhost") ? "http" : "https";
    const prankLink = `${protocol}://${host}/prank?id=${prankType}`;

    const payload: ActionPostResponse = await createPostResponse({
      fields: { transaction: tx, message: `Payment received.\nSend this link to your friend:\n${prankLink}` },
    });
    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
  } catch {
    return Response.json({ error: "Failed to create transaction" }, { status: 400, headers: ACTIONS_CORS_HEADERS });
  }
}