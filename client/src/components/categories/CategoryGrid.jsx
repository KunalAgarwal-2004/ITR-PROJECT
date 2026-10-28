import React from 'react';
import CategoryCard from './CategoryCard';
import { MARKETPLACE_CATEGORIES } from '../../constants/categories';

export const CategoryGrid = ({ limit = 10, className = '' }) => {
  const displayedCategories = MARKETPLACE_CATEGORIES.slice(0, limit);

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 ${className}`}
    >
      {displayedCategories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
};

export default CategoryGrid;
