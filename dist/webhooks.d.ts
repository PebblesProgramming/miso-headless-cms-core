/**
 * Verifies the `X-Miso-Signature` header on an incoming miso-cms webhook
 * (currently just `order.paid`, see `OrderWebhookPayload`).
 *
 * Server-only — uses Node's `crypto`, which is why this lives on its own
 * entry point (`@miso-software/headless-cms-core/webhooks`) instead of the
 * main client export. `CmsClient` sometimes runs client-side (e.g. a
 * `"use client"` checkout form calling `checkout()`), and that bundle must
 * never pull in Node built-ins.
 *
 * `rawBody` must be the exact, unparsed request body string — the signature
 * is computed over those exact bytes on the miso-cms side, so parsing the
 * JSON first (which can reorder or reformat it) breaks the comparison.
 *
 * @example
 * ```ts
 * // Next.js route handler
 * export async function POST(req: Request) {
 *   const rawBody = await req.text();
 *   const signature = req.headers.get('x-miso-signature') ?? '';
 *
 *   if (!verifyOrderWebhookSignature(rawBody, signature, process.env.MISO_WEBHOOK_SECRET!)) {
 *     return new Response('Invalid signature', { status: 401 });
 *   }
 *
 *   const payload: OrderWebhookPayload = JSON.parse(rawBody);
 *   // ...
 * }
 * ```
 */
declare function verifyOrderWebhookSignature(rawBody: string, signatureHeader: string, secret: string): boolean;

export { verifyOrderWebhookSignature };
