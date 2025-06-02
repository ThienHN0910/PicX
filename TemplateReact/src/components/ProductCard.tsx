import { type Product } from '../lib/types';
import { Heart } from 'lucide-react';
import { Button } from './ui/Button';
import { formatDistanceToNow } from 'date-fns';

interface ProductCardProps {
  product: Product;
  onLike?: () => void;
  onAddToCart?: () => void;
}

export const ProductCard = ({ product, onLike, onAddToCart }: ProductCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
      <div className="aspect-h-3 aspect-w-4 relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        <button
          onClick={onLike}
          className="absolute right-2 top-2 rounded-full bg-white p-2 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          <Heart className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {formatDistanceToNow(new Date(product.created_at), { addSuffix: true })}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-medium text-indigo-600">
            ${product.price.toLocaleString()}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{product.like_count} likes</span>
            <Button onClick={onAddToCart} size="sm">
              Add to Cart
            </Button>
          </div>
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};