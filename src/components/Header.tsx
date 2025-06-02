import  { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, MessageCircle, Image, Briefcase, Code } from 'lucide-react';

export default function Header() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);
  const y = useTransform(scrollY, [0, 100], [0, -50]);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-[250px] md:h-[300px] overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjB0ZWNoJTIwbmV3cyUyMGludGVyZmFjZSUyMGRhcmslMjBtb2RlJTIwZ2xhc3Ntb3JwaGlzbXxlbnwwfHx8fDE3NDg3ODI1MDF8MA&ixlib=rb-4.1.0&fit=fillmax&h=600&w=800" 
          alt="Modern tech interface in dark mode" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
        <motion.div style={{ opacity, y }}>
          <h1 className="text-4xl md:text-5xl font-mono font-bold text-white mb-4">
            Hacker<span className="text-primary-dark">News</span>
          </h1>
          
          <p className="text-white text-lg max-w-xl mb-6">
            A modern, accessible reimagining of Hacker News with AI-powered summaries and enhanced features.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <CategoryButton icon={<Zap size={16} />} text="Trending" path="/" />
            <CategoryButton icon={<MessageCircle size={16} />} text="Ask" path="/ask" />
            <CategoryButton icon={<Image size={16} />} text="Show" path="/show" />
            <CategoryButton icon={<Briefcase size={16} />} text="Jobs" path="/jobs" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface CategoryButtonProps {
  icon: React.ReactNode;
  text: string;
  path: string;
}

function CategoryButton({ icon, text, path }: CategoryButtonProps) {
  return (
    <a 
      href={path}
      className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-200 text-white"
    >
      {icon}
      <span>{text}</span>
    </a>
  );
}
