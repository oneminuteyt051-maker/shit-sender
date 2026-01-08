import { ACTIONS_CORS_HEADERS } from "@solana/actions";

export const GET = async () => {
  const payload = {
    rules: [
      {
        pathPattern: "/api/actions/poop*",
        apiPath: "/api/actions/poop",
      },
      {
        pathPattern: "/api/actions/immunity*",
        apiPath: "/api/actions/immunity",
      },
    ],
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      ...ACTIONS_CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
};

export const OPTIONS = async () => {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
};