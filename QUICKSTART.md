# Quick Start Guide - Water Distribution Management System

## Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Admin Account
1. Open your Supabase Dashboard
2. Go to Authentication > Users
3. Click "Add User"
4. Create account with:
   - Email: admin@example.com
   - Password: (choose a secure password)

### Step 3: Start the Application
```bash
npm run dev
```

### Step 4: Login
1. Open http://localhost:5173
2. Login with the credentials you created in Step 2

### Step 5: Set Up Your System

#### Add Areas
1. Click "Area Management" in the sidebar
2. Click "Add Area"
3. Add areas like:
   - Anna Nagar
   - T Nagar
   - Adyar

#### Add Users (Method 1: CSV Upload)
1. Click "User Management"
2. Click "Upload CSV"
3. Select the `sample-users.csv` file from the project folder
4. Review the preview
5. Click "Upload"

#### Add Users (Method 2: Manual)
1. Click "User Management"
2. Click "Add User"
3. Fill in:
   - Name: Rajesh Kumar
   - Phone: +919876543210
   - Area: Anna Nagar
4. Click "Save"

#### Schedule Water Distribution & Send SMS
1. Click "Water Schedule" in the sidebar
2. Select an area
3. Set start time (e.g., 06:00 AM)
4. Set end time (e.g., 09:00 AM)
5. Click "Set Schedule & Send SMS"
6. Users in that area will receive SMS notifications in Tamil

#### View SMS Logs
1. Click "SMS Logs" in the sidebar
2. See all sent messages with delivery status
3. Filter by Sent/Failed status

## Features to Try

### Toggle Language
- Click the globe icon in the sidebar
- Switch between English and Tamil
- Notice the entire UI changes language

### Toggle Dark Mode
- Click the moon/sun icon in the sidebar
- Experience the beautiful dark theme

### Real-time Updates
- Dashboard updates every 5 seconds
- SMS logs update automatically
- Watch statistics change in real-time

## SMS Format Example

When you schedule water distribution, users receive:

```
உங்கள் பகுதியில் (Anna Nagar) தண்ணீர் விநியோகம் 06:00 AM முதல் 09:00 AM வரை நடைபெறும். - நீர் வழங்கல் துறை
```

## Production Deployment

### Build for Production
```bash
npm run build
```

The optimized build will be in the `dist` folder.

## Optional: Real SMS with Twilio

By default, the system uses mock SMS (logs to console). To send real SMS:

1. Sign up at https://www.twilio.com
2. Get your credentials from Twilio Console
3. Secrets are automatically configured in Supabase

That's it! You're ready to manage water distribution with multilingual SMS alerts.

## Need Help?

- Check `SETUP.md` for detailed documentation
- Review `sample-users.csv` for CSV upload format
- Check Supabase Dashboard for database/auth issues
