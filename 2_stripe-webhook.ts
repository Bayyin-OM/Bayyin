// ============================================================
// بيّن — Stripe Webhook
// المسار: supabase/functions/stripe-webhook/index.ts
//
// كيف تثبّته:
// 1. supabase functions new stripe-webhook
// 2. انسخ هذا الكود داخل index.ts
// 3. supabase functions deploy stripe-webhook
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13?target=deno";

// ── يتصل بـ Supabase بصلاحيات كاملة (service_role) ──
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  const signature    = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
  const body         = await req.text();

  // ── التحقق أن الطلب فعلاً من Stripe ──
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return new Response("Invalid signature", { status: 400 });
  }

  // ── معالجة الأحداث ──
  try {
    switch (event.type) {

      // ✅ دفع ناجح → فعّل الاشتراك
      case "checkout.session.completed": {
        const session      = event.data.object as Stripe.Checkout.Session;
        const email        = session.customer_details?.email;
        const customerId   = session.customer as string;
        const subId        = session.subscription as string;
        if (!email) break;

        let expiresAt: string | null = null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          expiresAt = new Date(sub.current_period_end * 1000).toISOString();
        }

        await supabase.from("profiles").update({
          subscription_status:     "active",
          stripe_customer_id:      customerId,
          stripe_subscription_id:  subId,
          subscription_expires_at: expiresAt,
        }).eq("email", email);

        console.log("✅ Activated:", email);
        break;
      }

      // 🔄 تجديد تلقائي → مدّد الاشتراك
      case "invoice.payment_succeeded": {
        const invoice    = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subId      = invoice.subscription as string;
        if (!subId) break;

        const sub      = await stripe.subscriptions.retrieve(subId);
        const expiresAt = new Date(sub.current_period_end * 1000).toISOString();

        await supabase.from("profiles").update({
          subscription_status:     "active",
          subscription_expires_at: expiresAt,
        }).eq("stripe_customer_id", customerId);

        console.log("🔄 Renewed for customer:", customerId);
        break;
      }

      // ❌ إلغاء الاشتراك → أوقف الوصول
      case "customer.subscription.deleted": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase.from("profiles").update({
          subscription_status:     "expired",
          subscription_expires_at: new Date().toISOString(),
        }).eq("stripe_customer_id", customerId);

        console.log("❌ Expired for customer:", customerId);
        break;
      }

      default:
        console.log("Unhandled event:", event.type);
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
