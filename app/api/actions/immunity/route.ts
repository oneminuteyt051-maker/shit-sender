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

// OPTIONS request handler for CORS
export const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: ACTIONS_CORS_HEADERS,
  });
};

// GET request handler - Returns the immunity action UI
export const GET = async (req: Request) => {
  try {
    // Define the response for the immunity action
    const payload: ActionGetResponse = {
      title: "🛡️ Immunity Badge",
      icon: new URL("/immunity-badge.png", req.url).toString(), // Absolute URL for icon
      description: "Purchase immunity from poop pranks",
      label: "Get Immunity",
      links: {
        actions: [
          // Single button to purchase immunity
          {
            label: "🛡️ Get Immunity (0.006 SOL)",
            href: `${req.url}?action=purchase`, // Absolute URL for href
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
    console.log("Error in GET /api/actions/immunity:", err);
    return new Response("An error occurred", { status: 500 });
  }
};

// POST request handler - Creates the immunity purchase transaction
export const POST = async (req: Request) => {
  try {
    // Parse the incoming request body containing the user's account info
    const body: ActionPostRequest = await req.json();

    // Extract user's public key from the request
    const account = new PublicKey(body.account);
    const url = new URL(req.url);
    
    // Get action from URL query parameters
    const action = url.searchParams.get("action");

    // Validate that the action is 'purchase'
    if (action !== "purchase") {
      return new Response("Invalid action", { status: 400 });
    }

    // Fixed amount for immunity purchase
    const amount = 0.006;

    // Connect to Solana network
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta")
    );

    // Create a transaction to send the immunity payment to the cold wallet
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: account, // User pays
        toPubkey: new PublicKey(process.env.COLD_WALLET_PUBLIC_KEY!), // Cold wallet receives the payment
        lamports: Math.round(amount * LAMPORTS_PER_SOL),
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
        message: "Purchased immunity from poop pranks!", // Confirmation message for the user
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
    console.log("Error in POST /api/actions/immunity:", err);
    return new Response("An error occurred", { status: 500 });
  }
};