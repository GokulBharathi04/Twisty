// GET /api — health check. Reports which bindings are wired up, never their values.
export function onRequestGet({ env }) {
  return Response.json({
    message: "Twisty Wrap Enterprises API",
    status: "ok",
    database: Boolean(env.DB),
    attachments: Boolean(env.ATTACHMENTS),
    email: env.RESEND_API_KEY ? "configured" : "not_configured",
  });
}
