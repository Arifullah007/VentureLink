// Follow this guide to debug functions locally:
// https://supabase.com/docs/guides/functions/tooling#local-debugging

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient()
});


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
    
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;

        if (!userId) {
          throw new Error('User ID not found in Stripe session metadata.');
        }

        // Update or create subscription
        const { error } = await supabaseAdmin.from('investor_subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: 'active',
          current_period_end: new Date(session.expires_at * 1000).toISOString(),
        }, { onConflict: 'user_id'});

        if (error) throw error;
        
        // Record the transaction
        await supabaseAdmin.from('transactions').insert({
            user_id: userId,
            stripe_charge_id: session.payment_intent,
            amount: session.amount_total,
            currency: session.currency,
            status: 'succeeded'
        });

        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const { error } = await supabaseAdmin.from('investor_subscriptions').update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }).eq('stripe_subscription_id', subscription.id);

        if (error) throw error;
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
     return new Response(JSON.stringify({ error: `Webhook error: ${error.message}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
