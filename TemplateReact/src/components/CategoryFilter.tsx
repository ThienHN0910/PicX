import { type Category } from '../lib/types';
import { Button } from './ui/Button';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: number;
  onSelect: (categoryId?: number) => void;
}

export const CategoryFilter = ({
  categories,
  selectedCategory,
  onSelect,
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={!selectedCategory ? 'primary' : 'outline'}
        onClick={() => onSelect(undefined)}
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category.category_id}
          variant={selectedCategory === category.category_id ? 'primary' : 'outline'}
          onClick={() => onSelect(category.category_id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};