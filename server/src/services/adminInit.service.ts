import { UserModel } from '../models/User.model';
import bcrypt from 'bcrypt';

/**
 * Auto-initialize admin user when server starts
 * Checks if an admin exists, if not creates one using env variables
 */
export const initializeAdmin = async (): Promise<void> => {
  try {
    console.log('🔍 Checking for existing admin user...');
    
    // Check if any admin user already exists
    const existingAdmin = await UserModel.findOne({ isAdmin: true });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      console.log('📊 Admin user status:', existingAdmin.status);
      return;
    }

    // Get admin credentials from environment variables
    const adminEmail = process.env.Admin_Email;
    const adminPassword = process.env.Admin_Password;

    // Validate environment variables
    if (!adminEmail || !adminPassword) {
      console.error('❌ Admin credentials not found in environment variables!');
      console.error('Please set Admin_Email and Admin_Password in your .env file');
      console.error('Example:');
      console.error('Admin_Email=admin@yourdomain.com');
      console.error('Admin_Password=your-secure-password');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      console.error('❌ Invalid admin email format in environment variables');
      console.error('Please provide a valid email address');
      return;
    }

    // Validate password strength (minimum 6 characters)
    if (adminPassword.length < 6) {
      console.error('❌ Admin password must be at least 6 characters long');
      console.error('Please use a stronger password for security');
      return;
    }

    // Check if user with this email already exists (admin or regular user)
    const existingUser = await UserModel.findOne({ email: adminEmail });
    if (existingUser) {
      if (existingUser.isAdmin) {
        console.error('❌ user with this email already exists');
        console.error('Please use a different email for login');
      } else {
        console.error('❌ Regular user with this email already exists');
        console.error('Please use a different email for the admin account');
      }
      return;
    }

    console.log('🔐 Creating admin user...');

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminUser = new UserModel({
      name: 'Administrator',
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
      status: 'active',
      profileImage: 'avatar.png',
      reviews: []
    });

    // Save to database
    await adminUser.save();

    console.log('🎉 Admin user created successfully!');
    console.log(`📧 Admin Email: ${adminEmail}`);
    console.log('🔒 Admin Password: [HIDDEN FOR SECURITY]');
    console.log('⚠️  IMPORTANT: Please change the default admin password after first login');
    console.log('🔐 You can now login to the admin panel with these credentials');

  } catch (error) {
    console.error('❌ Error initializing admin user:', error);
    
    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes('E11000')) {
        console.error('💡 Duplicate key error: Admin user with this email already exists');
      } else if (error.message.includes('validation')) {
        console.error('💡 Validation error: Please check the admin credentials format');
      } else {
        console.error('💡 Error details:', error.message);
      }
    }
  }
};

/**
 * Utility function to check admin status
 */
export const checkAdminExists = async (): Promise<boolean> => {
  try {
    const adminCount = await UserModel.countDocuments({ isAdmin: true });
    return adminCount > 0;
  } catch (error) {
    console.error('Error checking admin existence:', error);
    return false;
  }
};

/**
 * Utility function to get admin info (for debugging)
 */
export const getAdminInfo = async (): Promise<any> => {
  try {
    const admin = await UserModel.findOne({ isAdmin: true }).select('-password');
    return admin;
  } catch (error) {
    console.error('Error getting admin info:', error);
    return null;
  }
};

/**
 * Utility function to count total admins
 */
export const getAdminCount = async (): Promise<number> => {
  try {
    const count = await UserModel.countDocuments({ isAdmin: true });
    return count;
  } catch (error) {
    console.error('Error counting admins:', error);
    return 0;
  }
};

/**
 * Utility function to reset admin password (for emergency use)
 */
export const resetAdminPassword = async (newPassword: string): Promise<boolean> => {
  try {
    if (newPassword.length < 6) {
      console.error('New password must be at least 6 characters long');
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const admin = await UserModel.findOne({ isAdmin: true });
    
    if (!admin) {
      console.error('No admin user found');
      return false;
    }

    admin.password = hashedPassword;
    await admin.save();
    
    console.log('✅ Admin password reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting admin password:', error);
    return false;
  }
}; 