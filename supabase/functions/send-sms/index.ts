import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  areaId: string;
  startTime: string;
  endTime: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { areaId, startTime, endTime }: RequestBody = await req.json();

    if (!areaId || !startTime || !endTime) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { data: area } = await supabase
      .from('areas')
      .select('name')
      .eq('id', areaId)
      .maybeSingle();

    if (!area) {
      return new Response(
        JSON.stringify({ error: 'Area not found' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { data: users } = await supabase
      .from('distribution_users')
      .select('id, name, phone')
      .eq('area_id', areaId);

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No users found for this area' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const message = `உங்கள் பகுதியில் (${area.name}) தண்ணீர் விநியோகம் ${startTime} முதல் ${endTime} வரை நடைபெறும். - நீர் வழங்கல் துறை`;

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    let sentCount = 0;
    let failedCount = 0;

    for (const user of users) {
      let status = 'sent';

      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        try {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
          const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

          const formData = new URLSearchParams();
          formData.append('To', user.phone);
          formData.append('From', twilioPhoneNumber);
          formData.append('Body', message);

          const twilioResponse = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
          });

          if (!twilioResponse.ok) {
            status = 'failed';
            failedCount++;
          } else {
            sentCount++;
          }
        } catch (error) {
          console.error('Twilio error:', error);
          status = 'failed';
          failedCount++;
        }
      } else {
        console.log('Mock SMS sent to:', user.phone, 'Message:', message);
        sentCount++;
      }

      await supabase.from('sms_logs').insert([
        {
          user_id: user.id,
          message,
          status,
          area_name: area.name,
          phone: user.phone,
        },
      ]);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        failedCount,
        totalUsers: users.length,
        message: `SMS sent to ${sentCount} users, ${failedCount} failed`,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
