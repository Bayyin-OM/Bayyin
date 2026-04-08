// ============================================================
// بيّن — Lemon Squeezy Webhook
// المسار: supabase/functions/stripe-webhook/index.ts
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// التحقق من توقيع Lemon Squeezy
async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const hex = Array.from(new Uint8Array(signed))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === signature;
}

serve(async (req) => {
  const signature = req.headers.get("x-signature") ?? "";
  const secret    = Deno.env.get("LEMONSQUEEZY_WEBHOOK_SECRET")!;
  const body      = await req.text();

  // التحقق أن الطلب فعلاً من Lemon Squeezy
  const valid = await verifySignature(body, signature, secret);
  if (!valid) {
    console.error("Invalid signature");
    return new Response("Invalid signature", { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventName = payload.meta?.event_name;
  const data      = payload.data?.attributes;
  const email     = data?.user_email;

  console.log("Event:", eventName, "| Email:", email);

  try {
    switch (eventName) {

      // ✅ اشتراك جديد أو دفع ناجح → فعّل الحساب
      case "order_created":
      case "subscription_created": {
        if (!email) break;
        const expiresAt = data?.ends_at
          ? new Date(data.ends_at).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await supabase.from("profiles").update({
          subscription_status:     "active",
          subscription_expires_at: expiresAt,
        }).eq("email", email);

        console.log("✅ Activated:", email);
        break;
      }

      // 🔄 تجديد الاشتراك
      case "subscription_updated": {
        if (!email) break;
        const status    = data?.status;
        const expiresAt = data?.ends_at
          ? new Date(data.ends_at).toISOString()
          : null;

        if (status === "active") {
          await supabase.from("profiles").update({
            subscription_status:     "active",
            subscription_expires_at: expiresAt,
          }).eq("email", email);
          console.log("🔄 Renewed:", email);
        }
        break;
      }

      // ❌ إلغاء الاشتراك
      case "subscription_cancelled": {
        if (!email) break;
        await supabase.from("profiles").update({
          subscription_status:     "pending",
          subscription_expires_at: new Date().toISOString(),
        }).eq("email", email);
        console.log("❌ Cancelled:", email);
        break;
      }

      // ⏰ انتهاء الاشتراك تلقائياً
      case "subscription_expired": {
        if (!email) break;
        await supabase.from("profiles").update({
          subscription_status:     "pending",
          subscription_expires_at: new Date().toISOString(),
        }).eq("email", email);
        console.log("⏰ Expired:", email);
        break;
      }

      // 💳 فشل الدفع
      case "subscription_payment_failed": {
        if (!email) break;
        await supabase.from("profiles").update({
          subscription_status: "pending",
        }).eq("email", email);
        console.log("💳 Payment failed:", email);
        break;
      }

      default:
        console.log("Unhandled event:", eventName);
    }
  } catch (err) {
    console.error("Handler error:", err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
