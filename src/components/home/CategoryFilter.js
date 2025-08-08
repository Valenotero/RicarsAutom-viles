import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoryFilter = ({ categories }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05 }}
          className="group"
        >
          <Link
            to={`/catalogo?type=${category.id}`}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-center group-hover:bg-primary-50"
          >
            <div className="text-4xl mb-3">{category.icon}</div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
              {category.name}
            </h3>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default CategoryFilter;
