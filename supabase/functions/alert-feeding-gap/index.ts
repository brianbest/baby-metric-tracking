import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get babies that haven't been fed in the last 3 hours during waking hours (6 AM - 10 PM)
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const currentHour = new Date().getHours();

    // Only check during waking hours
    if (currentHour < 6 || currentHour > 22) {
      return new Response(JSON.stringify({ message: 'Outside monitoring hours' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find babies with no recent feeding entries
    const { data: babies, error: babiesError } = await supabaseClient
      .from('baby')
      .select(
        `
        id,
        name,
        caregiver_relationship (
          caregiver_id
        )
      `
      )
      .is('deleted_at', null);

    if (babiesError) {
      throw babiesError;
    }

    const alertsToSend = [];

    for (const baby of babies) {
      const { data: recentFeeds } = await supabaseClient
        .from('entry')
        .select('created_at')
        .eq('baby_id', baby.id)
        .eq('type', 'feed')
        .gte('created_at', threeHoursAgo)
        .is('deleted_at', null)
        .limit(1);

      if (!recentFeeds || recentFeeds.length === 0) {
        // No recent feeds - create alert
        alertsToSend.push({
          babyId: baby.id,
          babyName: baby.name,
          caregivers: baby.caregiver_relationship.map((rel) => rel.caregiver_id),
          lastFeedTime: threeHoursAgo,
        });
      }
    }

    // Send notifications to caregivers
    for (const alert of alertsToSend) {
      for (const caregiverId of alert.caregivers) {
        // In production, you would send push notifications here
        // For now, we'll log the alert
        console.log(
          `Feeding gap alert for ${alert.babyName} (ID: ${alert.babyId}) - Caregiver: ${caregiverId}`
        );

        // You could also save alert to a notifications table
        await supabaseClient.from('notifications').insert({
          caregiver_id: caregiverId,
          baby_id: alert.babyId,
          type: 'feeding_gap',
          message: `${alert.babyName} hasn't been fed in over 3 hours`,
          created_at: new Date().toISOString(),
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${alertsToSend.length} feeding gap alerts`,
        alerts: alertsToSend.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
