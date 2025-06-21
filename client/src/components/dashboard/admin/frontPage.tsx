import { useSelector } from 'react-redux';
import { RootState } from '../../../hooks/store/store';
import { motion } from 'framer-motion';
import { useProfileLoader } from '../../../hooks/useProfileLoader';

export const FrontPage = () => {
    // Get user data from Redux store
    const { data: userData } = useSelector((state: RootState) => state.user);
    // Ensure user data is loaded
    useProfileLoader();
    
    // Helper function to get the profile image URL
    const getProfileImageUrl = (imagePath: string | undefined): string => {
        if (!imagePath) return `http://localhost:5000/profileImages/avatar.png`;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000/profileImages/${imagePath}`;
    };
    
    // Get the profile image URL
    const profileImage = userData?.data?.profileImage 
        ? getProfileImageUrl(userData.data.profileImage)
        : `http://localhost:5000/profileImages/avatar.png`;
    
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-2rem)] bg-gray-100">
            <motion.div 
                className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="mb-6 flex justify-center">
                    <motion.div
                        className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary-500"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <img
                            src={profileImage}
                            alt={userData?.data?.name || "Admin User"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `http://localhost:5000/profileImages/avatar.png`;
                            }}
                        />
                    </motion.div>
                </div>
                
                <motion.h1 
                    className="text-3xl font-bold text-gray-800 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Welcome, {userData?.data?.name || "Admin"}!
                </motion.h1>
                
                <motion.p
                    className="text-gray-600 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    You're logged in as an administrator
                </motion.p>
                
                <motion.div
                    className="p-4 bg-primary-50 rounded-lg border border-primary-100 text-primary-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Use the sidebar to navigate through admin features
                </motion.div>
            </motion.div>
        </div>
    );
};
