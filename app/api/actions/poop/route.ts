import { 
  ActionGetResponse, 
  ActionPostRequest, 
  createPostResponse,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import { 
  clusterApiUrl, 
  Connection, 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  SystemProgram, 
  Transaction 
} from "@solana/web3.js";
import { POOP_CONFIG } from "@/app/config"; // Используем абсолютный путь через @

// Укажи сюда адрес cold wallet
const coldWallet = new PublicKey(process.env.COLD_WALLET_PUBKEY || "");

export const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      ...ACTIONS_CORS_HEADERS,
      "X-Action-Version": "1",
      "X-Blockchain-Ids": "mainnet-beta",
    },
  });
};

export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const recipientParam = requestUrl.searchParams.get("recipient");

    let recipientAddress = "";
    if (recipientParam) {
      try {
        const pubkey = new PublicKey(recipientParam);
        recipientAddress = pubkey.toString();
      } catch (error) {
        return new Response("Invalid recipient address", {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...ACTIONS_CORS_HEADERS,
            "X-Action-Version": "1",
            "X-Blockchain-Ids": "mainnet-beta",
          },
        });
      }
    }

    const payload: ActionGetResponse = {
      title: "Poop Protocol",
      icon: new URL("/poop-cover.png", req.url).toString(),
      description: "Send a poop prank to someone on Solana!",
      label: "Poop",
      links: recipientAddress
        ? [
            {
              label: "💩 Classic (0.002 SOL)",
              href: `${req.url}?type=classic&recipient=${recipientAddress}`,
              type: "transaction",
            },
            {
              label: "😈 Revenge (0.003 SOL)",
              href: `${req.url}?type=revenge&recipient=${recipientAddress}`,
              type: "transaction",
            },
            {
              label: "🎁 Gift (0.002 SOL)",
              href: `${req.url}?type=gift&recipient=${recipientAddress}`,
              type: "transaction",
            },
          ]
        : [
            {
              label: "Enter recipient address",
              href: `${req.url}?recipient={recipient}`,
              type: "transaction",
              parameters: [
                {
                  name: "recipient",
                  label: "Recipient address",
                  required: true,
                },
              ],
            },
          ],
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
        ...ACTIONS_CORS_HEADERS,
        "X-Action-Version": "1",
        "X-Blockchain-Ids": "mainnet-beta",
      },
    });
  } catch (err) {
    console.log("Error in GET /api/actions/poop:", err);
    return new Response("An error occurred", {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...ACTIONS_CORS_HEADERS,
        "X-Action-Version": "1",
        "X-Blockchain-Ids": "mainnet-beta",
      },
    });
  }
};

export const POST = async (req: Request) => {
  try {
    const body: ActionPostRequest = await req.json();
    const account = new PublicKey(body.account);
    const url = new URL(req.url);

    const recipientParam = url.searchParams.get("recipient");
    const type = url.searchParams.get("type") || "classic";

    if (!recipientParam) {
      return new Response("Missing recipient parameter", {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...ACTIONS_CORS_HEADERS,
          "X-Action-Version": "1",
          "X-Blockchain-Ids": "mainnet-beta",
        },
      });
    }

    let recipientAddress: PublicKey;
    try {
      recipientAddress = new PublicKey(recipientParam);
    } catch (error) {
      return new Response("Invalid recipient address", {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...ACTIONS_CORS_HEADERS,
          "X-Action-Version": "1",
          "X-Blockchain-Ids": "mainnet-beta",
        },
      });
    }

    const config = POOP_CONFIG[type as keyof typeof POOP_CONFIG];
    if (!config) {
      return new Response("Invalid poop type", {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...ACTIONS_CORS_HEADERS,
          "X-Action-Version": "1",
          "X-Blockchain-Ids": "mainnet-beta",
        },
      });
    }

    const amount = config.amount;
    const totalLamports = Math.floor(amount * LAMPORTS_PER_SOL);
    const recipientLamports = Math.floor(totalLamports / 1000);
    const coldLamports = totalLamports - recipientLamports;

    const connection = new Connection(
      process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta")
    );

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: coldWallet,
        lamports: coldLamports,
      }),
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: recipientAddress,
        lamports: recipientLamports,
      })
    );

    transaction.feePayer = account;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    const payload = await createPostResponse({
      fields: {
        type: "transaction",
        transaction: serializedTransaction as any,
        message: `Sent ${amount} SOL to ${recipientAddress.toString()} via Poop Protocol`,
      },
    });

    return new Response(JSON.stringify(payload), {
      headers: {
        ...ACTIONS_CORS_HEADERS,
        "Content-Type": "application/json",
        "X-Action-Version": "1",
        "X-Blockchain-Ids": "mainnet-beta",
        "Access-Control-Expose-Headers": "X-Action-Version, X-Blockchain-Ids",
      },
    });
  } catch (err) {
    console.log("Error in POST /api/actions/poop:", err);
    return new Response("An error occurred", {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...ACTIONS_CORS_HEADERS,
        "X-Action-Version": "1",
        "X-Blockchain-Ids": "mainnet-beta",
      },
    });
  }
};
