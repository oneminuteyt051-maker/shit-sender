import { ActionGetResponse, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl } from "@solana/web3.js";
import { MY_WALLET, PRICES } from "@/app/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  const response: ActionGetResponse = {
    icon: new URL("/poop-cover.png", url.origin).toString(),
    title: "💩 Send Crypto Poop",
    description: "Choose your prank level. Send a blockchain surprise to your friends!",
    label: "Send Poop",
    links: {
      actions: [
        { 
          label: `💩 Classic (${PRICES.classic} SOL)`, 
          href: `${url.origin}/api/actions/poop?type=classic` 
        },
        { 
          label: `😈 Revenge (${PRICES.revenge} SOL)`, 
          href: `${url.origin}/api/actions/poop?type=revenge` 
        },
        { 
          label: `🎁 Gift (${PRICES.gift} SOL)`, 
          href: `${url.origin}/api/actions/poop?type=gift` 
        },
      ],
    },
  };
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}}

export async function OPTIONS() {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const prankType = url.searchParams.get("type") || "classic";
    const price = PRICES[prankType] || PRICES.classic;
    const userPubkey = new PublicKey(body.account);
    
    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const { blockhash } = await connection.getLatestBlockhash();

    const tx = new Transaction({ feePayer: userPubkey, recentBlockhash: blockhash }).add(
      SystemProgram.transfer({
        fromPubkey: userPubkey,
        toPubkey: MY_WALLET,
        lamports: Math.round(price * LAMPORTS_PER_SOL),
      })
    );

    const host = url.origin; // Автоопределение домена
    const prankLink = `${host}/prank?id=${prankType}`;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction: tx,
        message: `Sent! Send this link to your friend: ${prankLink}`,
      },
    });

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
  } catch (err) {
    return Response.json({ error: "Error creating tx" }, { status: 400, headers: ACTIONS_CORS_HEADERS });
  }
}