import { 
  ActionGetResponse, 
  ActionPostResponse, 
  ACTIONS_CORS_HEADERS, 
  createPostResponse 
} from "@solana/actions";
import { 
  Connection, 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  SystemProgram, 
  Transaction, 
  clusterApiUrl 
} from "@solana/web3.js";
import { COLD_WALLET, PRICES } from "@/app/config";

// --- GET: Описание действия для кошелька ---
export async function GET(request: Request) {
  const url = new URL(request.url);
  const response: ActionGetResponse = {
    icon: new URL("/immunity-badge.png", url.origin).toString(),
    title: "🛡️ Get Poop Immunity",
    description: "Pay to unlock your immunity badge and avoid future poops!",
    label: "Unlock Immunity",
    links: {
      actions: [
        {
          label: `🛡️ Immunity (${PRICES.immunity} SOL)`,
          href: `${url.origin}/api/actions/immunity`,
          type: "post",
        },
      ],
    },
  };
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}

// --- OPTIONS: Обработка CORS (обязательно для Blink) ---
export async function OPTIONS() {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}

// --- POST: Создание транзакции ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Проверка наличия публичного ключа пользователя
    if (!body?.account) {
      return Response.json(
        { error: "Missing account" }, 
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    const userPubkey = new PublicKey(body.account);
    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const { blockhash } = await connection.getLatestBlockhash();

    // Проверяем, установлена ли цена для immunity
    const amount = PRICES.immunity;
    if (!amount) {
        throw new Error("Price for immunity not found in config");
    }

    // Создаем транзакцию
    const tx = new Transaction({ 
      feePayer: userPubkey, 
      recentBlockhash: blockhash 
    }).add(
      SystemProgram.transfer({
        fromPubkey: userPubkey,
        toPubkey: COLD_WALLET, // Используем напрямую, так как это уже PublicKey в config.ts
        lamports: Math.round(amount * LAMPORTS_PER_SOL),
      })
    );

    // Формируем ответ согласно спецификации Solana Actions
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction: tx,
        message: "You have successfully purchased immunity! 🛡️",
      },
    });

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
  } catch (err) {
    console.error("Build Error:", err);
    return Response.json(
      { error: "Failed to create transaction. Please try again." }, 
      { status: 400, headers: ACTIONS_CORS_HEADERS }
    );
  }
}