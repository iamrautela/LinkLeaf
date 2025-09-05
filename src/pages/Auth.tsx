import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AuthForm from '@/components/auth/AuthForm';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <AuthForm mode={mode} onModeChange={setMode} />
      </motion.div>

      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
    </div>
  );
};

export default Auth;