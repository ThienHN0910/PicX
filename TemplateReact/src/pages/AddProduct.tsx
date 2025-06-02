import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, Plus, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface ProductForm {
  title: string;
  description: string;
  price: number;
  category: string;
  medium: string;
  dimensions: string;
  isDigital: boolean;
  isOriginal: boolean;
  tags: string;
}

export default function AddProduct() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<ProductForm>();

  const onSubmit = (data: ProductForm) => {
    // TODO: Implement product creation logic
    console.log(data);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Artwork</h1>
        <p className="mt-2 text-gray-600">Create a new listing for your artwork</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Image Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-900">Drag and drop your artwork image</p>
              <p className="mt-1 text-sm text-gray-500">or click to browse</p>
              <input type="file" className="hidden" accept="image/*" />
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <Input
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter artwork title"
                error={errors.title?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Describe your artwork"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <Input
                  type="number"
                  {...register('price', { required: 'Price is required', min: 0 })}
                  placeholder="0.00"
                  error={errors.price?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select a category</option>
                  <option value="paintings">Paintings</option>
                  <option value="photography">Photography</option>
                  <option value="digital">Digital Art</option>
                  <option value="sculptures">Sculptures</option>
                  <option value="mixed">Mixed Media</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Medium</label>
                <Input
                  {...register('medium')}
                  placeholder="e.g., Oil on canvas"
                  error={errors.medium?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                <Input
                  {...register('dimensions')}
                  placeholder="e.g., 24 x 36 inches"
                  error={errors.dimensions?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <Input
                {...register('tags')}
                placeholder="Enter tags separated by commas"
                error={errors.tags?.message}
              />
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('isDigital')}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Digital Artwork</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('isOriginal')}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Original Piece</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </div>
      </form>
    </div>
  );
}