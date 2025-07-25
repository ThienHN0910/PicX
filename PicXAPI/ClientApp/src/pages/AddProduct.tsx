﻿import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import axios from 'axios';
import Loading from '../components/Loading';

interface ProductForm {
    title: string;
    description: string;
    price: number;
    categoryName: string;
    dimensions: string;
    tags: string;
    image: FileList;
}

export default function AddProduct() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProductForm>();
    const [preview, setPreview] = useState<string | null>(null);
    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [categoryError, setCategoryError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false); 
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            setCategoryError("Bạn chưa đăng nhập.");
            setIsLoadingCategories(false);
            return;
        }

        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/product/categories', {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });
                setCategories(response.data.map((c: { name: string }) => c.name));
            } catch (error) {
                console.error('Lỗi khi lấy danh mục:', error);
                setCategoryError('Không thể tải danh mục. Vui lòng thử lại.');
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);


    // Function to get image dimensions
    const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
                URL.revokeObjectURL(img.src);
            };
        });
    };

    // Handle drag and drop for main image
    const handleMainImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleMainImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                setValue('image', files);
                setPreview(URL.createObjectURL(file));
                // Get and set dimensions
                const dimensions = await getImageDimensions(file);
                setValue('dimensions', `${dimensions.width} x ${dimensions.height} pixels`);
            } else {
                alert('Please drop an image file.');
            }
        }
    };

    // Handle click to open file picker
    const openMainImagePicker = () => {
        mainImageInputRef.current?.click();
    };

    // Handle main image change
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setValue('image', files);
            setPreview(URL.createObjectURL(files[0]));
            // Get and set dimensions
            const dimensions = await getImageDimensions(files[0]);
            setValue('dimensions', `${dimensions.width} x ${dimensions.height} pixels`);
        }
    };

    const onSubmit = async (data: ProductForm) => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Bạn cần đăng nhập để tạo sản phẩm.");
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('categoryName', data.categoryName);
        formData.append('dimensions', data.dimensions);
        formData.append('tags', data.tags);

        if (data.image?.[0]) {
            formData.append('image', data.image[0]);
        }

        try {
            const response = await axios.post('/api/product/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
                withCredentials: true
            });
            console.log('Tạo sản phẩm thành công:', response.data);
            navigate('/products');
        } catch (error: any) {
            console.error('Lỗi khi tạo sản phẩm:', error);
            alert(error.response?.data?.message || 'Lỗi không xác định');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Add New Artwork</h1>
                <p className="mt-2 text-gray-600">Create a new listing for your artwork</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                    {/* Main Image Upload */}
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer"
                        onDragOver={handleMainImageDragOver}
                        onDrop={handleMainImageDrop}
                        onClick={openMainImagePicker}
                    >
                        <div className="flex flex-col items-center">
                            <Upload className="h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm font-medium text-gray-900">Drag and drop your artwork image</p>
                            <p className="mt-1 text-sm text-gray-500">or click to browse</p>
                            <input
                                type="file"
                                accept="image/*"
                                {...register('image', { required: 'Main image is required' })}
                                onChange={handleImageChange}
                                ref={mainImageInputRef}
                                className="hidden"
                            />
                            {errors.image && (
                                <p className="mt-1 text-sm text-red-500">{errors.image.message}</p>
                            )}
                            {preview && (
                                <div className="mt-4">
                                    <img src={preview} alt="Main Preview" className="max-w-xs rounded-md" />
                                </div>
                            )}
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
                                    {...register('categoryName', { required: 'Category is required' })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    disabled={isLoadingCategories}
                                >
                                    <option value="">{isLoadingCategories ? 'Loading categories...' : 'Select a category'}</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                                {errors.categoryName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.categoryName.message}</p>
                                )}
                                {categoryError && (
                                    <p className="mt-1 text-sm text-red-500">{categoryError}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                                <Input
                                    {...register('dimensions')}
                                    placeholder="e.g., 24 x 36 inches"
                                    error={errors.dimensions?.message}
                                    readOnly // Make the dimensions field read-only since it's auto-filled
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
                     <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loading /> : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Listing
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}