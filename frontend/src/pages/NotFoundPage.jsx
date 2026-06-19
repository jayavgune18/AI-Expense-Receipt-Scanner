import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Receipt, Home } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <Receipt className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-700 mb-6" />
      <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
      <p className="text-xl text-gray-500 mb-8">Page not found</p>
      <Link to="/" className="btn-primary"><Home className="w-4 h-4 mr-2" /> Go Home</Link>
    </motion.div>
  </div>
);

export default NotFoundPage;