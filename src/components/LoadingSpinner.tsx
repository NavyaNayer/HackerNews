import  { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-primary dark:border-t-primary-dark rounded-full"
      />
      <p className="mt-4 text-gray-500 dark:text-gray-400 font-mono">Loading data...</p>
    </div>
  );
}
 