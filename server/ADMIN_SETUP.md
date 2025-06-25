# Auto Admin Initialization

This feature automatically creates an admin user when the server starts if no admin exists in the database.

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Admin Auto-Initialization
Admin_Email=admin@yourdomain.com
Admin_Password=your-secure-admin-password
```

### 2. Requirements

- **Admin_Email**: Must be a valid email format
- **Admin_Password**: Must be at least 6 characters long
- The email should not already exist in the database

## How It Works

1. **Server Startup**: When the server starts, it runs the `initializeAdmin()` function
2. **Check Existing Admin**: It checks if any admin user already exists in the database
3. **Create Admin**: If no admin exists, it creates one using the environment variables
4. **Skip Creation**: If an admin already exists, it skips the creation process

## Console Output

### When Admin Already Exists
```
🔍 Checking for existing admin user...
✅ Admin user already exists: admin@yourdomain.com
📊 Admin user status: active
```

### When Creating New Admin
```
🔍 Checking for existing admin user...
🔐 Creating admin user...
🎉 Admin user created successfully!
📧 Admin Email: admin@yourdomain.com
🔒 Admin Password: [HIDDEN FOR SECURITY]
⚠️  IMPORTANT: Please change the default admin password after first login
🔐 You can now login to the admin panel with these credentials
```

### Error Cases
```
❌ Admin credentials not found in environment variables!
Please set Admin_Email and Admin_Password in your .env file
```

## Security Features

- ✅ Password is automatically hashed using bcrypt
- ✅ Email format validation
- ✅ Password strength validation (minimum 6 characters)
- ✅ Checks for existing users with the same email
- ✅ Passwords are never logged to console
- ✅ Handles MongoDB duplicate key errors

## Utility Functions

The service also provides utility functions:

```typescript
// Check if admin exists
const adminExists = await checkAdminExists();

// Get admin info (without password)
const adminInfo = await getAdminInfo();

// Count total admins
const adminCount = await getAdminCount();

// Reset admin password (emergency use)
const success = await resetAdminPassword('newPassword123');
```

## Default Admin User Properties

When created, the admin user will have:

- **Name**: "Administrator"
- **Email**: From `Admin_Email` environment variable
- **Password**: Hashed version of `Admin_Password` environment variable
- **isAdmin**: `true`
- **Status**: "active"
- **Profile Image**: "avatar.png"
- **Reviews**: Empty array

## Troubleshooting

### Common Issues

1. **"Admin credentials not found"**
   - Make sure you have `Admin_Email` and `Admin_Password` in your `.env` file
   - Check for typos in the environment variable names

2. **"Invalid admin email format"**
   - Ensure the email follows the format: `user@domain.com`

3. **"Admin password must be at least 6 characters long"**
   - Use a stronger password with at least 6 characters

4. **"User with this email already exists but is not an admin"**
   - Use a different email address for the admin account
   - Or promote the existing user to admin manually

## Best Practices

1. **Use a strong password** for the admin account
2. **Change the default password** after first login
3. **Use a dedicated email** for the admin account
4. **Keep your `.env` file secure** and never commit it to version control
5. **Consider using environment-specific credentials** for different deployments

## Example .env File

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/your-database-name

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Server Configuration
PORT=5000

# Admin Auto-Initialization
Admin_Email=admin@yourdomain.com
Admin_Password=SecureAdminPassword123

# Other configurations...
```

## Integration

The admin initialization is automatically called in `app.ts` after the database connection is established:

```typescript
// Connect to database first
await connectDB();
console.log('✅ Database connected successfully');

// Initialize admin user after database connection
await initializeAdmin();
```

This ensures that the admin user is created every time the server starts, but only if no admin exists. 