import React from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Share2, ShoppingCart } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';

const ArtDetail = () => {
  const { id } = useParams();
  const { products, addToCart } = useStore();
  const product = products.find(p => p.product_id.toString() === id);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Artwork not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          {product.additional_images && product.additional_images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.additional_images.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${product.title} - View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <p className="mt-2 text-lg text-gray-900">${product.price.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">About the Artwork</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {(product.dimensions || product.medium) && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.dimensions && (
                  <div>
                    <dt className="text-sm text-gray-500">Dimensions</dt>
                    <dd className="text-sm text-gray-900">{product.dimensions}</dd>
                  </div>
                )}
                {product.medium && (
                  <div>
                    <dt className="text-sm text-gray-500">Medium</dt>
                    <dd className="text-sm text-gray-900">{product.medium}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button
                onClick={() => addToCart(product)}
                className="flex-1"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.artist && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900">About the Artist</h2>
              <div className="mt-4 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{product.artist.name}</p>
                  <p className="text-sm text-gray-500">Member since {new Date(product.artist.created_at).getFullYear()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtDetail;