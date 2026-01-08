import { ActionGetResponse, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl } from "@solana/web3.js";
import { MY_WALLET, PRICES } from "@/app/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const recipientAddress = url.searchParams.get("recipient");

  if (!recipientAddress) {
    return Response.json({
      icon: new URL("/poop-cover.png", url.origin).toString(),
      title: "💩 Send Crypto Poop",
      description: "Enter a victim's address to proceed.",
      label: "Enter Address",
      links: {
        actions: [
          {
            label: "Set Recipient Address",
            href: `${url.origin}?recipient={recipientAddress}`,
          },
        ],
      },
    }, { headers: ACTIONS_CORS_HEADERS });
  }

  const response: ActionGetResponse = {
    icon: new URL("/poop-cover.png", url.origin).toString(),
    title: "💩 Confirm Poop Delivery",
    description: `Sending poop to ${recipientAddress.slice(0, 6)}...`,
    label: "Confirm Payment",
    links: [
      {
        label: `💩 Classic (${PRICES.classic} SOL)`,
        href: `${url.origin}/api/actions/poop?type=classic&recipient=${recipientAddress}`,
		type: "post", // ❗
      },
      {
        label: `😈 Revenge (${PRICES.revenge} SOL)`,
        href: `${url.origin}/api/actions/poop?type=revenge&recipient=${recipientAddress}`,
		type: "post", // ❗
      },
      {
        label: `🎁 Gift (${PRICES.gift} SOL)`,
        href: `${url.origin}/api/actions/poop?type=gift&recipient=${recipientAddress}`,
		type: "post", // ❗
      },
    ],
  };

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS() {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const prankType = url.searchParams.get("type") || "classic";
    const recipientAddress = url.searchParams.get("recipient");

    if (!recipientAddress) {
      return Response.json({ error: "No recipient provided" }, { status: 400, headers: ACTIONS_CORS_HEADERS });
    }

    const price = PRICES[prankType] || PRICES.classic;
    const userPubkey = new PublicKey(body.account);
    const recipientPubkey = new PublicKey(recipientAddress);

    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const { blockhash } = await connection.getLatestBlockhash();

    // Создаём транзакцию: 99.9% → ваш кошелёк, 0.01% → жертва
    const mainAmount = Math.round(price * 0.999 * LAMPORTS_PER_SOL);
    const dustAmount = Math.round(price * 0.0001 * LAMPORTS_PER_SOL); // 0.01%

    const tx = new Transaction({ feePayer: userPubkey, recentBlockhash: blockhash });

    // Основной перевод (вам)
    tx.add(SystemProgram.transfer({
      fromPubkey: userPubkey,
      toPubkey: MY_WALLET,
      lamports: mainAmount,
    }));

    // "Пыль" (жертве)
    tx.add(SystemProgram.transfer({
      fromPubkey: userPubkey,
      toPubkey: recipientPubkey,
      lamports: dustAmount,
    }));

    // Вызываем бэкенд для отправки "пыли" и memo
    await fetch(`${url.origin}/api/process-poop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientPubkey: recipientAddress,
        amount: price,
      }),
    });

    const payload: ActionPostResponse = await createPostResponse({
      fields: { transaction: tx },
    });

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
  } catch (err) {
    console.error("Poop route error:", err);
    return Response.json({ error: "Error creating tx" }, { status: 400, headers: ACTIONS_CORS_HEADERS });
  }
}