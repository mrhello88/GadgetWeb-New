import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Error404 = () => {
  const navigate = useNavigate();

  const floatingShapes = [
    { color: 'bg-pink-400', size: 'w-16 h-16', initialY: -20 },
    { color: 'bg-teal-400', size: 'w-20 h-20', initialY: 20 },
    { color: 'bg-yellow-400', size: 'w-12 h-12', initialY: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative overflow-hidden">
      {/* Floating shapes */}
      {floatingShapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`${shape.color} ${shape.size} rounded-full absolute opacity-70`}
          initial={{
            x: Math.random() * 100 - 50,
            y: shape.initialY,
          }}
          animate={{
            x: Math.random() * 200 - 100,
            y: [shape.initialY - 50, shape.initialY + 50, shape.initialY - 50],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            left: `${30 + index * 20}%`,
          }}
        />
      ))}

      <div className="text-center z-10">
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-6xl font-bold text-gray-800 mb-4"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-600 mb-8"
        >
          Oops! Page not found
        </motion.p>
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-pink-400 via-teal-400 to-yellow-400 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Back to Home
        </motion.button>
      </div>
    </div>
  );
};

export default Error404;
