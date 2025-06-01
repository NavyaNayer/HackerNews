import  { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertOctagon } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-16 text-center"
    >
      <div className="flex justify-center mb-6">
        <AlertOctagon size={64} className="text-primary dark:text-primary-dark" />
      </div>
      
      <h1 className="text-4xl font-mono font-bold mb-4">404 - Page Not Found</h1>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <Link 
        to="/"
        className="btn btn-primary inline-flex items-center"
      >
        <Home size={18} className="mr-2" />
        Return to Home
      </Link>
    </motion.div>
  );
}
 