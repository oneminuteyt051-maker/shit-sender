import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";

export async function GET() {
  const payload: ActionsJson = {
    rules: [
      {
        pathPattern: "/api/actions/**",
        apiPath: "/api/actions/**",
      },
    ],
  };

  return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS() {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}