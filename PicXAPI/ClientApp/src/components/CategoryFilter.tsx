import React from 'react';
import { Category } from '../lib/types';

interface CategoryFilterProps {
    categories: Category[];
    selectedCategory?: number;
    onSelect: (categoryId?: number) => void;
    showAll?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    categories,
    selectedCategory,
    onSelect,
    showAll = false
}) => {
    return (
        <div className="flex flex-col">
            {showAll && (
                <button
                    className={`text-left px-4 py-2 font-s rounded transition-colors mx-2
                        text-gray-800 hover:bg-gray-100`}
                    onClick={() => onSelect(undefined)}
                >
                    All
                </button>
            )}
            {categories.map((cat) => (
                <button
                    key={cat.category_id}
                    className={`text-left px-4 py-2 font-s rounded transition-colors mx-2
                        text-gray-800 hover:bg-gray-100`}
                    onClick={() => onSelect(cat.category_id)}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
};