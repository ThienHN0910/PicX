import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, Save, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import axios from 'axios';

interface ProductForm {
    title: string;
    description: string;
    price: number;
    categoryName: string;
    medium: string;
    dimensions: string;
    isAvailable: boolean;
    tags: string;
    image: File | null;
    additionalImages: File[] | null;
}

interface Category {
    name: string;
}

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [currentAdditionalImages, setCurrentAdditionalImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingImageId, setExistingImageId] = useState<string | null>(null);
    const [existingAdditionalImageIds, setExistingAdditionalImageIds] = useState<string[]>([]);

    const { register, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm<ProductForm>({
        defaultValues: {
            image: null,
            additionalImages: null
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const categoriesResponse = await axios.get('/api/product/categories', {
                    withCredentials: true
                });
                setCategories(categoriesResponse.data);

                // Fetch product
                const productResponse = await axios.get(`/api/product/${id}`, {
                    withCredentials: true
                });
                const product = productResponse.data;

                reset({
                    title: product.title,
                    description: product.description || '',
                    price: product.price,
                    categoryName: product.categoryName,
                    medium: product.medium || '',
                    dimensions: product.dimensions || '',
                    isAvailable: product.isAvailable,
                    tags: product.tags || '',
                    image: null,
                    additionalImages: null
                });

                setCurrentImage(`/api/product/image/${product.imageFileId}`);
                setExistingImageId(product.imageFileId);
                const additionalImageIds = product.additionalImages ? JSON.parse(product.additionalImages) : [];
                setCurrentAdditionalImages(
                    additionalImageIds.map(id => `/api/product/image/${id}`)
                );
                setExistingAdditionalImageIds(additionalImageIds);

                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load product or categories. Please try again.');
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, reset]);

    const onSubmit = async (data: ProductForm) => {
        if (!window.confirm('Are you sure you want to save changes?')) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description || '');
            formData.append('price', data.price.toString());
            formData.append('categoryName', data.categoryName);
            formData.append('medium', data.medium || '');
            formData.append('dimensions', data.dimensions || '');
            formData.append('isAvailable', data.isAvailable.toString());
            formData.append('tags', data.tags || '');

            // Handle main image
            if (data.image) {
                formData.append('image', data.image);
            } else if (existingImageId) {
                // Send existing image ID as a placeholder to satisfy [Required]
                formData.append('image', new File([], existingImageId, { type: 'text/plain' }));
            } else {
                throw new Error('No main image provided or existing image available.');
            }

            // Handle additional images (optional)
            if (data.additionalImages && data.additionalImages.length > 0) {
                Array.from(data.additionalImages).forEach((file) => {
                    formData.append('additionalImages', file);
                });
            } else if (existingAdditionalImageIds.length > 0) {
                // Send existing additional image IDs if no new images
                existingAdditionalImageIds.forEach((id) => {
                    formData.append('additionalImages', new File([], id, { type: 'text/plain' }));
                });
            }

            await axios.put(`/api/product/edit/${id}`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/products');
        } catch (err) {
            console.error('Error updating product:', err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.error || 'Failed to update product.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const maxSize = 50 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                setError('Main image must be smaller than 5MB.');
                return;
            }
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                setError('Only JPEG or PNG images are allowed.');
                return;
            }
            setValue('image', file);
            setCurrentImage(URL.createObjectURL(file));
        }
    };

    const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const maxSize = 50 * 1024 * 1024; // 5MB
            for (const file of files) {
                if (file.size > maxSize) {
                    setError('Each additional image must be smaller than 5MB.');
                    return;
                }
                if (!['image/jpeg', 'image/png'].includes(file.type)) {
                    setError('Only JPEG or PNG images are allowed.');
                    return;
                }
            }
            setValue('additionalImages', files);
            setCurrentAdditionalImages(files.map(file => URL.createObjectURL(file)));
        }
    };

    const removeAdditionalImage = (index: number) => {
        setCurrentAdditionalImages(prev => prev.filter((_, i) => i !== index));
        const currentFiles = getValues('additionalImages') || [];
        setValue('additionalImages', currentFiles.filter((_, i) => i !== index));
        setExistingAdditionalImageIds(prev => prev.filter((_, i) => i !== index));
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-6">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back</span>
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Artwork</h1>
                    </div>
                </div>
                <p className="mt-2 text-gray-600">Update your artwork details</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                    {/* Main Image */}
                    <div>
                        <label htmlFor="main-image-upload" className="block text-sm font-medium text-gray-700">Main Image</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mt-2">
                            <div className="flex flex-col items-center">
                                {currentImage && (
                                    <img
                                        src={currentImage}
                                        alt="Current main image"
                                        className="w-32 h-32 object-cover rounded-lg mb-4"
                                    />
                                )}
                                <Upload className="w-16 h-16 text-gray-400" />
                                <p className="mt-2 text-sm font-medium text-gray-700">Update artwork image</p>
                                <p className="mt-1 text-sm text-gray-500">Click to browse (JPEG, PNG)</p>
                                <input
                                    type="file"
                                    id="main-image-upload"
                                    accept="image/jpeg,image/png"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="main-image-upload"
                                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 cursor-pointer"
                                >
                                    Select Image
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Additional Images */}
                    <div>
                        <label htmlFor="additional-images-upload" className="block text-sm font-medium text-gray-700">Additional Images</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mt-2">
                            <div className="flex flex-col items-center">
                                {currentAdditionalImages.length > 0 && (
                                    <div className="flex flex-wrap gap-4 mb-4">
                                        {currentAdditionalImages.map((url, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={url}
                                                    alt={`Additional image ${index + 1}`}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeAdditionalImage(index)}
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Upload className="w-16 h-16 text-gray-400" />
                                <p className="mt-2 text-sm font-medium text-gray-700">Update additional images</p>
                                <p className="mt-1 text-sm text-gray-500">Click to browse (JPEG, PNG)</p>
                                <input
                                    type="file"
                                    id="additional-images-upload"
                                    accept="image/jpeg,image/png"
                                    multiple
                                    onChange={handleAdditionalImagesChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="additional-images-upload"
                                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 cursor-pointer"
                                >
                                    Select Images
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <Input
                                id="title"
                                {...register('title', { required: 'Title is required' })}
                                placeholder="Enter artwork title"
                                error={errors.title?.message}
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="description"
                                {...register('description')}
                                rows={4}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Describe your artwork"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    {...register('price', {
                                        required: 'Price is required',
                                        min: { value: 0, message: 'Price must be non-negative' }
                                    })}
                                    placeholder="0.00"
                                    error={errors.price?.message}
                                />
                            </div>

                            <div>
                                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    id="categoryName"
                                    {...register('categoryName', { required: 'Category is required' })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category.name} value={category.name}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.categoryName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.categoryName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="medium" className="block text-sm font-medium text-gray-700">Medium</label>
                                <Input
                                    id="medium"
                                    {...register('medium')}
                                    placeholder="E.g., Oil on canvas"
                                    error={errors.medium?.message}
                                />
                            </div>

                            <div>
                                <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">Dimensions</label>
                                <Input
                                    id="dimensions"
                                    {...register('dimensions')}
                                    placeholder="E.g., 24 x 36 inches"
                                    error={errors.dimensions?.message}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                            <Input
                                id="tags"
                                {...register('tags')}
                                placeholder="Enter tags separated by commas"
                                error={errors.tags?.message}
                            />
                        </div>

                        <div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    {...register('isAvailable')}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">Available for sale</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                        <Save className="w-4 h-4 mr-2" />
                    </Button>
                </div>
            </form>
        </div>
    );
}