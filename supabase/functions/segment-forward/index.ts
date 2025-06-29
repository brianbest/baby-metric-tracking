import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const segmentWriteKey = Deno.env.get('SEGMENT_WRITE_KEY');

    if (!segmentWriteKey) {
      return new Response(JSON.stringify({ error: 'Segment write key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.type || !body.userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields: type, userId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Forward to Segment
    const segmentResponse = await fetch('https://api.segment.io/v1/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(segmentWriteKey + ':')}`,
      },
      body: JSON.stringify({
        userId: body.userId,
        event: body.event || 'Unknown Event',
        properties: body.properties || {},
        context: {
          app: {
            name: 'Baby Metrics Tracker',
            version: '2.0.0',
          },
          library: {
            name: 'supabase-edge-function',
            version: '1.0.0',
          },
          ...body.context,
        },
        timestamp: body.timestamp || new Date().toISOString(),
      }),
    });

    if (!segmentResponse.ok) {
      const errorText = await segmentResponse.text();
      throw new Error(`Segment API error: ${segmentResponse.status} ${errorText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
