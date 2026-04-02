# Smart Water Distribution Management System

A production-ready SaaS application for managing water distribution schedules with multilingual SMS alerts.

## Overview

This system helps water distribution authorities manage areas, users, and schedules while automatically sending SMS notifications to residents in Tamil about water supply timings.

## Key Features

### Authentication & Security
- JWT-based authentication with Supabase Auth
- Row Level Security (RLS) on all database tables
- Protected routes and secure API endpoints
- Session persistence

### Multilingual Support
- Complete UI in English and Tamil
- One-click language switching
- SMS notifications sent in Tamil
- Uses react-i18next for translations

### Modern UI/UX
- Beautiful, responsive design (mobile + desktop)
- Dark mode / Light mode support
- Smooth animations with Framer Motion
- Modern card-based dashboard
- Toast notifications
- Loading states and skeletons

### Dashboard
- Real-time statistics
  - Total users count
  - Total areas count
  - SMS sent today
  - Failed SMS count
- Recent SMS logs display
- Auto-refresh every 5 seconds

### Area Management
- Add/Edit/Delete water distribution areas
- Simple CRUD operations
- Immediate updates

### User Management
- Add individual users manually
- Edit/Delete existing users
- **CSV Bulk Upload**
  - Upload multiple users at once
  - Preview before import
  - Validation and error handling
  - Sample CSV provided

### Water Distribution Scheduling
- Select area for distribution
- Set start and end times (12-hour format)
- Automatic SMS notification to all users in area
- Schedule history tracking
- Active/Inactive status

### SMS Notification System
- Tamil language SMS messages
- Twilio API integration
- Mock SMS fallback for testing
- Real-time delivery tracking
- Success/Failure status

### SMS Delivery Logs
- Complete SMS history
- Filter by status (All/Sent/Failed)
- View message content
- Delivery timestamps
- Area and user details

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- react-i18next for internationalization
- date-fns for date formatting
- PapaParse for CSV parsing

### Backend
- Supabase (PostgreSQL database)
- Supabase Edge Functions (Deno runtime)
- Row Level Security (RLS)
- Real-time subscriptions

### Authentication
- Supabase Auth
- JWT tokens
- Secure session management

### SMS Service
- Twilio API for real SMS
- Mock SMS system for development
- Automatic fallback

## Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Loading.tsx
│   │   ├── Modal.tsx
│   │   ├── Sidebar.tsx
│   │   └── Toast.tsx
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── i18n/               # Internationalization
│   │   └── config.ts
│   ├── lib/                # Libraries and configs
│   │   └── supabase.ts
│   ├── pages/              # Application pages
│   │   ├── Areas.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Schedule.tsx
│   │   ├── SmsLogs.tsx
│   │   └── Users.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── functions/
│       └── send-sms/        # Edge function for SMS
├── SETUP.md                 # Detailed setup guide
├── QUICKSTART.md           # Quick start guide
└── sample-users.csv        # Sample CSV for bulk upload
```

## Database Schema

### Tables
- `areas` - Water distribution areas
- `distribution_users` - Users receiving notifications
- `water_schedules` - Distribution schedules
- `sms_logs` - SMS delivery tracking

All tables have RLS enabled with proper policies for authenticated users.

## Getting Started

See [QUICKSTART.md](QUICKSTART.md) for a 5-minute setup guide.

See [SETUP.md](SETUP.md) for detailed documentation.

## Quick Setup

```bash
# Install dependencies
npm install

# Create admin user in Supabase Dashboard
# Auth > Users > Add User

# Start development server
npm run dev

# Build for production
npm run build
```

## Screenshots & Features

### Login Page
- Secure authentication
- Beautiful gradient background
- Responsive design

### Dashboard
- Real-time statistics
- Recent SMS logs
- Color-coded status indicators

### Area Management
- Simple CRUD interface
- Inline editing
- Smooth animations

### User Management
- Table view with all users
- CSV bulk upload
- Preview before import

### Water Scheduling
- Area selection
- Time picker (12-hour format)
- One-click SMS sending

### SMS Logs
- Complete history
- Filter options
- Status tracking
- Auto-refresh

## SMS Example

```
உங்கள் பகுதியில் (Anna Nagar) தண்ணீர் விநியோகம் 06:00 AM முதல் 09:00 AM வரை நடைபெறும். - நீர் வழங்கல் துறை
```

Translation: "Water distribution in your area (Anna Nagar) will be from 06:00 AM to 09:00 AM. - Water Supply Department"

## CSV Upload Format

```csv
name,phone,area
Rajesh Kumar,+919876543210,Anna Nagar
Priya Sharma,+919876543211,T Nagar
```

## Development

```bash
# Development
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build
```

## Security Features

- JWT-based authentication
- Row Level Security (RLS) on all tables
- Secure password hashing
- Protected API endpoints
- CORS configuration
- Input validation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is built for production use in water distribution management.

## Support

For setup help, see [SETUP.md](SETUP.md)

For quick start, see [QUICKSTART.md](QUICKSTART.md)
