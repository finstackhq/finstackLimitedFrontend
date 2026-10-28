# Finstack Admin Dashboard

A clean, modern admin dashboard for the Finstack money transfer platform.

## Features

- **Secure Authentication**: Session-based authentication with environment variable credentials
- **Dashboard Overview**: Key metrics and recent transactions
- **KYC Management**: Review and approve/reject KYC requests for foreign users
- **User Management**: View, search, suspend/activate, and manage user accounts
- **Transaction Monitoring**: View all transactions with filtering and CSV export
- **System Settings**: Manage transaction fee settings and authenticated email announcements

## Access

- **URL**: `http://localhost:3000/admin`
- **Login**: Redirects to `/admin/login` if not authenticated
- **Credentials**: Stored in environment variables

## Environment Variables

Add these to your `.env.local` file:

```env
ADMIN_EMAIL=admin@usefinstack.co
ADMIN_PASSWORD=YourSecurePasswordHere
```

## Routes

- `/admin` - Dashboard overview
- `/admin/login` - Admin login page
- `/admin/kyc` - KYC requests management
- `/admin/users` - User management
- `/admin/transactions` - Transaction monitoring
- `/admin/settings` - System settings and announcements

## Security Features

- **Route Protection**: Middleware protects all admin routes
- **Session Management**: HTTP-only cookies for admin sessions
- **Auto-redirect**: Redirects to login if not authenticated
- **Secure Logout**: Proper session cleanup

## Design

- **Clean & Modern**: White background with royal blue accents
- **Responsive**: Mobile-friendly with collapsible sidebar
- **Professional**: Minimal design focused on usability
- **Accessible**: Proper labels, keyboard navigation, and color contrast

## Key Components

### API Routes
- `/api/admin/auth` - Authentication (login/logout)
- `/api/admin/dashboard` - Dashboard statistics
- `/api/admin/kyc` - KYC request management
- `/api/admin/users` - User management
- `/api/admin/transactions` - Transaction data
- `/api/admin/settings` - System settings

### UI Components
- `AdminSidebar` - Navigation sidebar with mobile support
- `AdminHeader` - Top header with user info
- `StatsCards` - Dashboard metrics display
- `RecentTransactions` - Recent transaction table
- `KYCRequestsTable` - KYC request management
- `UsersTable` - User management with filters
- `TransactionsTable` - Transaction monitoring
- `PasswordSettings` - Admin password change
- `SystemSettings` - System toggle controls
- `AnnouncementSettings` - Compose test emails, queue email announcements for all users, and review delivery history

## Usage

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/admin`
3. Login with the credentials from your `.env.local` file
4. Access all admin features through the sidebar navigation

## Data

Admin email announcements use the authenticated backend announcement API. Other admin areas may still use mock data for demonstration; verify the corresponding route handlers before deploying them.

## Security Notes

- Change default admin credentials before deployment
- Use HTTPS in production
- Consider implementing 2FA for additional security
- Regularly audit admin access logs
- Use strong, unique passwords