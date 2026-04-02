# Smart Water Distribution Management System - Setup Guide

## Overview
This is a production-ready water distribution management system with multilingual SMS alerts built with React, Supabase, and Twilio.

## Features
- JWT-based authentication with Supabase Auth
- Multi-language support (Tamil/English)
- Dark/Light mode
- Area management
- User management with CSV bulk upload
- Water distribution scheduling
- SMS notifications in Tamil
- Real-time SMS delivery tracking
- Responsive dashboard with statistics

## Prerequisites
- Node.js (v18 or higher)
- A Supabase account (already configured in this project)
- (Optional) Twilio account for real SMS sending

## Technology Stack
- **Frontend**: React.js + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth (JWT-based)
- **SMS Service**: Twilio API (with mock fallback)
- **i18n**: react-i18next

## Database Schema
The following tables are created automatically:
- `areas` - Water distribution areas
- `distribution_users` - Users receiving water distribution notifications
- `water_schedules` - Water distribution schedules
- `sms_logs` - SMS delivery tracking logs

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Admin User
Before you can login, you need to create an admin user in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter email and password (e.g., admin@example.com)
5. Confirm the user

### 3. (Optional) Configure Twilio for Real SMS
If you want to send real SMS messages via Twilio:

1. Sign up for a Twilio account at https://www.twilio.com
2. Get your Account SID, Auth Token, and Phone Number from the Twilio Console
3. The secrets are automatically configured in Supabase Edge Functions

**Note**: If Twilio is not configured, the system will use a mock SMS service that logs messages to the console.

### 4. Run Development Server
```bash
npm run dev
```

The application will be available at http://localhost:5173

### 5. Build for Production
```bash
npm run build
```

## Default Login Credentials
Use the admin account you created in Supabase Auth:
- Email: (the email you configured)
- Password: (the password you configured)

## Application Features

### 1. Dashboard
- View total users, areas, and SMS statistics
- Real-time SMS delivery tracking
- Recent SMS logs display

### 2. Area Management
- Add/Edit/Delete water distribution areas
- Example areas: Anna Nagar, T Nagar, Adyar, etc.

### 3. User Management
- Add individual users (name, phone, area)
- Edit/Delete users
- **CSV Bulk Upload**: Upload multiple users at once
  - Download sample CSV format from the project root
  - Format: name,phone,area

### 4. Water Distribution Scheduling
- Select area
- Set start and end times (12-hour format with AM/PM)
- Automatically sends SMS to all users in the selected area
- SMS content is in Tamil

### 5. SMS Logs
- View all sent SMS messages
- Filter by status (All/Sent/Failed)
- Real-time updates every 5 seconds
- Track delivery success/failure

## CSV Upload Format

Create a CSV file with the following format:

```csv
name,phone,area
Rajesh Kumar,+919876543210,Anna Nagar
Priya Sharma,+919876543211,T Nagar
Anand Raj,+919876543212,Adyar
```

**Important**:
- First row must be the header: `name,phone,area`
- Area names must match existing areas in the system
- Phone numbers should include country code (e.g., +91 for India)

## SMS Message Format

When a water schedule is set, users receive SMS in Tamil:

```
உங்கள் பகுதியில் (Area Name) தண்ணீர் விநியோகம் 06:00 AM முதல் 09:00 AM வரை நடைபெறும். - நீர் வழங்கல் துறை
```

Translation: "Water distribution in your area (Area Name) will be from 06:00 AM to 09:00 AM. - Water Supply Department"

## Language Support

Toggle between English and Tamil using the language switcher in the sidebar:
- Click the globe icon
- Interface switches between English/Tamil
- SMS messages are always sent in Tamil

## Dark Mode

Toggle between light and dark themes using the moon/sun icon in the sidebar.

## Architecture

### Frontend Structure
```
src/
├── components/       # Reusable UI components
├── contexts/         # React contexts (Auth, Theme)
├── i18n/            # Internationalization config
├── lib/             # Supabase client config
├── pages/           # Main application pages
└── main.tsx         # App entry point
```

### Backend Structure
```
supabase/
└── functions/
    └── send-sms/    # Edge function for SMS sending
```

## Security Features

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication
- Protected API routes
- Secure password hashing
- CORS properly configured

## Troubleshooting

### Cannot Login
- Ensure you created an admin user in Supabase Auth
- Check that the user email is confirmed

### SMS Not Sending
- Check if Twilio credentials are configured (optional)
- If Twilio is not configured, the system uses mock SMS (logs to console)
- Check the SMS Logs page for delivery status

### CSV Upload Issues
- Ensure CSV format matches the required format
- Area names must exist in the system (add them first in Area Management)
- Phone numbers should be valid

## Support

For issues or questions, please check:
1. Supabase Dashboard for database/auth issues
2. Browser console for frontend errors
3. Edge Function logs in Supabase for backend errors
