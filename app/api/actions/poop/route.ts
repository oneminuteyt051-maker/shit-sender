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
import nacl from "tweetnacl";
import { POOP_CONFIG, SIGN_MESSAGE_TEXT } from "@/app/config";

// OPTIONS handler
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

// GET handler — оставляем без изменений
export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const recipientParam = requestUrl.searchParams.get("recipient");

    let recipientAddress = "";
    if (recipientParam) {
      try {
        recipientAddress = new PublicKey(recipientParam).toString();
      } catch {
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
      links: {
        actions: recipientAddress
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
      },
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
    console.log("GET error:", err);
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

// POST handler с поддержкой signMessage
export const POST = async (req: Request) => {
  try {
    const body: ActionPostRequest & { signature?: number[] } = await req.json();

    if (!body.account || !body.signature) {
      return new Response("Missing account or signature", {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...ACTIONS_CORS_HEADERS,
        },
      });
    }

    const userPubkey = new PublicKey(body.account);
    const signature = Uint8Array.from(body.signature);

    // Проверяем подпись на заранее заданное сообщение
    const messageBytes = new TextEncoder().encode(SIGN_MESSAGE_TEXT);
    const isValid = nacl.sign.detached.verify(messageBytes, signature, userPubkey.toBytes());

    if (!isValid) {
      return new Response("Invalid signature", {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...ACTIONS_CORS_HEADERS,
        },
      });
    }

    const url = new URL(req.url);
    const recipientParam = url.searchParams.get("recipient");
    const type = url.searchParams.get("type") || "classic";

    if (!recipientParam) {
      return new Response("Missing recipient parameter", {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...ACTIONS_CORS_HEADERS,
        },
      });
    }

    let recipientAddress: PublicKey;
    try {
      recipientAddress = new PublicKey(recipientParam);
    } catch {
      return new Response("Invalid recipient address", {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...ACTIONS_CORS_HEADERS,
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
        },
      });
    }

    const coldWalletPubkey = process.env.COLD_WALLET_PUBKEY;
    if (!coldWalletPubkey) {
      return new Response("Server misconfiguration: cold wallet missing", {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...ACTIONS_CORS_HEADERS,
        },
      });
    }
    const coldWallet = new PublicKey(coldWalletPubkey);

    const amount = config.amount;
    const totalLamports = Math.floor(amount * LAMPORTS_PER_SOL);
    const recipientLamports = Math.floor(totalLamports / 1000);
    const coldLamports = totalLamports - recipientLamports;

    const connection = new Connection(
      process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta")
    );

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: userPubkey,
        toPubkey: coldWallet,
        lamports: coldLamports,
      }),
      SystemProgram.transfer({
        fromPubkey: userPubkey,
        toPubkey: recipientAddress,
        lamports: recipientLamports,
      })
    );

    transaction.feePayer = userPubkey;
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
    console.log("POST error:", err);
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
