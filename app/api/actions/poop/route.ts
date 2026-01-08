import { ActionGetResponse, ActionPostResponse, createPostResponse } from "@solana/actions";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { NextRequest } from "next/server";
import { COLD_WALLET } from "../../config";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const recipientParam = url.searchParams.get("recipient");

  if (!recipientParam) {
    // Return form for recipient input
    const baseHref = `${url.origin}/api/actions/poop`;
    const payload: ActionGetResponse = {
      title: "💩 Poop Sender",
      icon: `${url.origin}/poop-cover.png`,
      description: "Send a poop prank to a friend!",
      label: "Enter Address",
      links: {
        actions: [
          {
            label: "Send Poop",
            href: `${baseHref}?recipient={recipient}`,
            parameters: [
              {
                name: "recipient",
                label: "Enter recipient's address",
              },
            ],
          },
        ],
      },
    };

    return Response.json(payload);
  }

  try {
    const recipient = new PublicKey(recipientParam);
    const baseHref = `${url.origin}/api/actions/poop?recipient=${recipient.toBase58()}`;

    const payload: ActionGetResponse = {
      title: "💩 Poop Sender",
      icon: `${url.origin}/poop-cover.png`,
      description: `Send a poop prank to ${recipient.toBase58()}!`,
      label: "Select Poop Type",
      links: {
        actions: [
          {
            label: "💩 Classic (0.002 SOL)",
            href: baseHref + "&type=classic",
          },
          {
            label: "😈 Revenge (0.003 SOL)",
            href: baseHref + "&type=revenge",
          },
          {
            label: "🎁 Gift (0.002 SOL)",
            href: baseHref + "&type=gift",
          },
        ],
      },
    };

    return Response.json(payload);
  } catch (err) {
    console.error("Error in GET /api/actions/poop:", err);
    return new Response("Invalid recipient address", { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const recipientParam = url.searchParams.get("recipient");
    const type = url.searchParams.get("type") || "classic";

    if (!recipientParam) {
      return new Response("Missing recipient parameter", { status: 400 });
    }

    const body = await req.json();
    const account = new PublicKey(body.account);
    const recipient = new PublicKey(recipientParam);

    let amount: number;
    switch (type) {
      case "classic":
        amount = 0.002;
        break;
      case "revenge":
        amount = 0.003;
        break;
      case "gift":
        amount = 0.002;
        break;
      default:
        amount = 0.002;
    }

    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const recipientMain = new PublicKey(COLD_WALLET);

    // Calculate amounts
    const totalLamports = amount * LAMPORTS_PER_SOL;
    const mainRecipientLamports = Math.floor(totalLamports * 0.999); // 99.9%
    const targetRecipientLamports = totalLamports - mainRecipientLamports; // 0.1%

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: recipientMain,
        lamports: mainRecipientLamports,
      }),
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: recipient,
        lamports: targetRecipientLamports,
      })
    );

    tx.feePayer = account;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction: tx as any,
        message: `Sending 💩 Poop to ${recipient.toBase58().slice(0, 6)}...`,
      },
    });

    return Response.json(payload);
  } catch (err) {
    console.error("Error in POST /api/actions/poop:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}