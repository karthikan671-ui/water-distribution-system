# API Documentation

## Overview

This application uses Supabase for backend services, including PostgreSQL database and Edge Functions.

## Database Tables

### Areas Table
```sql
Table: areas
- id: uuid (primary key)
- name: text (unique)
- created_at: timestamptz
- updated_at: timestamptz
```

### Distribution Users Table
```sql
Table: distribution_users
- id: uuid (primary key)
- name: text
- phone: text
- area_id: uuid (foreign key -> areas.id)
- created_at: timestamptz
- updated_at: timestamptz
```

### Water Schedules Table
```sql
Table: water_schedules
- id: uuid (primary key)
- area_id: uuid (foreign key -> areas.id)
- start_time: text (e.g., "06:00 AM")
- end_time: text (e.g., "09:00 AM")
- is_active: boolean
- created_at: timestamptz
- updated_at: timestamptz
```

### SMS Logs Table
```sql
Table: sms_logs
- id: uuid (primary key)
- user_id: uuid (foreign key -> distribution_users.id, nullable)
- message: text
- status: text ('sent' or 'failed')
- area_name: text
- phone: text
- sent_at: timestamptz
```

## Database Operations

All database operations use Supabase client with automatic RLS policy enforcement.

### Areas

#### Get All Areas
```typescript
const { data, error } = await supabase
  .from('areas')
  .select('*')
  .order('created_at', { ascending: false });
```

#### Create Area
```typescript
const { error } = await supabase
  .from('areas')
  .insert([{ name: 'Anna Nagar' }]);
```

#### Update Area
```typescript
const { error } = await supabase
  .from('areas')
  .update({ name: 'Updated Name' })
  .eq('id', areaId);
```

#### Delete Area
```typescript
const { error } = await supabase
  .from('areas')
  .delete()
  .eq('id', areaId);
```

### Users

#### Get All Users with Area Details
```typescript
const { data, error } = await supabase
  .from('distribution_users')
  .select('*, areas(*)')
  .order('created_at', { ascending: false });
```

#### Create User
```typescript
const { error } = await supabase
  .from('distribution_users')
  .insert([{
    name: 'Rajesh Kumar',
    phone: '+919876543210',
    area_id: 'area-uuid'
  }]);
```

#### Bulk Insert Users (CSV)
```typescript
const usersToImport = csvData.map(row => ({
  name: row.name,
  phone: row.phone,
  area_id: areaId
}));

const { error } = await supabase
  .from('distribution_users')
  .insert(usersToImport);
```

### Schedules

#### Get Schedules with Area Info
```typescript
const { data, error } = await supabase
  .from('water_schedules')
  .select('*, areas(*)')
  .order('created_at', { ascending: false });
```

#### Create Schedule
```typescript
const { error } = await supabase
  .from('water_schedules')
  .insert([{
    area_id: areaId,
    start_time: '06:00 AM',
    end_time: '09:00 AM',
    is_active: true
  }]);
```

### SMS Logs

#### Get All SMS Logs
```typescript
const { data, error } = await supabase
  .from('sms_logs')
  .select('*')
  .order('sent_at', { ascending: false })
  .limit(100);
```

#### Get Today's SMS Count
```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

const { data, error } = await supabase
  .from('sms_logs')
  .select('*')
  .gte('sent_at', today.toISOString());

const sentCount = data?.filter(log => log.status === 'sent').length;
const failedCount = data?.filter(log => log.status === 'failed').length;
```

## Edge Functions

### Send SMS Function

**Endpoint**: `POST /functions/v1/send-sms`

**Purpose**: Sends SMS notifications to all users in a specific area when water distribution is scheduled.

#### Request

**Headers**:
```
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
```

**Body**:
```json
{
  "areaId": "uuid-of-area",
  "startTime": "06:00 AM",
  "endTime": "09:00 AM"
}
```

#### Response

**Success (200)**:
```json
{
  "success": true,
  "sentCount": 10,
  "failedCount": 0,
  "totalUsers": 10,
  "message": "SMS sent to 10 users, 0 failed"
}
```

**Error (400)**:
```json
{
  "error": "Missing required fields"
}
```

**Error (404)**:
```json
{
  "error": "Area not found"
}
```

**Error (500)**:
```json
{
  "error": "Internal server error"
}
```

#### Function Logic

1. Validates input parameters (areaId, startTime, endTime)
2. Fetches area details from database
3. Fetches all users in the specified area
4. Constructs Tamil SMS message:
   ```
   உங்கள் பகுதியில் (Area Name) தண்ணீர் விநியோகம் {startTime} முதல் {endTime} வரை நடைபெறும். - நீர் வழங்கல் துறை
   ```
5. Sends SMS via Twilio (if configured) or uses mock SMS
6. Logs each SMS attempt to `sms_logs` table with status
7. Returns summary of sent/failed messages

#### Twilio Integration

The function checks for these environment variables:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

If all are configured, it sends real SMS via Twilio API:
```typescript
const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
const auth = btoa(`${accountSid}:${authToken}`);

const formData = new URLSearchParams();
formData.append('To', user.phone);
formData.append('From', twilioPhoneNumber);
formData.append('Body', message);

await fetch(twilioUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: formData,
});
```

If not configured, it uses mock SMS (logs to console).

#### Error Handling

- Missing parameters → 400 Bad Request
- Area not found → 404 Not Found
- No users in area → 404 Not Found
- Twilio errors → Logs as 'failed' but continues processing
- Database errors → 500 Internal Server Error

#### CORS

The function includes proper CORS headers:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};
```

## Frontend API Usage

### Example: Sending SMS

```typescript
const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`;

const headers = {
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

const response = await fetch(apiUrl, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    areaId: selectedAreaId,
    startTime: '06:00 AM',
    endTime: '09:00 AM',
  }),
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.error || 'Failed to send SMS');
}

console.log(`SMS sent to ${result.sentCount} users`);
```

## Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow authenticated users to SELECT
- Allow authenticated users to INSERT
- Allow authenticated users to UPDATE
- Allow authenticated users to DELETE

Example policy:
```sql
CREATE POLICY "Authenticated users can view areas"
  ON areas FOR SELECT
  TO authenticated
  USING (true);
```

## Authentication

Uses Supabase Auth with email/password:

### Sign In
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'password',
});
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Get Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

### Auth State Change
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth changes
});
```

## Real-time Updates

The dashboard uses polling for real-time updates:

```typescript
useEffect(() => {
  loadDashboardData();
  const interval = setInterval(loadDashboardData, 5000); // Update every 5 seconds
  return () => clearInterval(interval);
}, []);
```

## Error Handling

All database operations include error handling:

```typescript
try {
  const { data, error } = await supabase
    .from('areas')
    .select('*');

  if (error) throw error;
  // Process data
} catch (error) {
  console.error('Error:', error);
  setToast({ message: 'Error loading data', type: 'error' });
}
```

## Environment Variables

Required environment variables (automatically configured in Supabase):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

Optional (for Twilio SMS):
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio authentication token
- `TWILIO_PHONE_NUMBER` - Twilio phone number for sending SMS
