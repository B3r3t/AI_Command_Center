# API verification

Use these steps to verify the authenticated API routes in a running local environment.

## Prerequisites

- Install dependencies with `npm install`.
- Ensure the following environment variables are set in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `CORPORATE_ACCOUNT_ID`
  - `API_AUTH_TOKEN` (Bearer token required by the API routes)
- Start the dev server with `npm run dev`.

## Dashboard endpoint (`/api/dashboard`)

1. Without auth: `curl -i http://localhost:3000/api/dashboard` → returns **401** with `Missing bearer token`.
2. With an invalid token: `curl -i http://localhost:3000/api/dashboard -H "Authorization: Bearer wrong"` → returns **403**.
3. With a valid token: `curl http://localhost:3000/api/dashboard -H "Authorization: Bearer $API_AUTH_TOKEN" | jq` → returns **200** with a payload containing `hero`, `pipeline`, `cadence`, `sms`, and `email` objects.

## Conversation detail endpoint (`/api/conversations/:id`)

1. Pick a conversation that belongs to the configured corporate account (for example, query Supabase for a known `conversations.id`).
2. Without auth: `curl -i http://localhost:3000/api/conversations/<conversationId>` → returns **401**.
3. With an invalid token: `curl -i http://localhost:3000/api/conversations/<conversationId> -H "Authorization: Bearer wrong"` → returns **403**.
4. With a valid token: `curl http://localhost:3000/api/conversations/<conversationId> -H "Authorization: Bearer $API_AUTH_TOKEN" | jq` → returns **200** with `conversation`, `lead`, `location`, and `messages` fields.

## Verification status

Manual checks were not run in this environment because Supabase credentials and sample data were unavailable.
