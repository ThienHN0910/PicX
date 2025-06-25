import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import axios from 'axios';
import Loading from '../components/Loading';

interface Product {
    productId: number;
    title: string;
    description: string;
    price: number;
    categoryName: string;
    dimensions: string;
    isAvailable: boolean;
    tags: string;
    imageFileId: string;
    additionalImages: string; // JSON string
}

export default function ProductManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Helper to get auth header
    const getAuthHeader = () => {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/product', {
                    headers: getAuthHeader()
                });
                setProducts(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load products. Please try again.');
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                <Link
                    to="/products/add"
                    className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-2 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Plus className="h-5 w-5" />
                    Add New Product
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline">Filter</Button>
                <Button variant="outline">Sort</Button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="max-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dimensions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tags
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Additional Images
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((product) => {
                            let additionalImageIds: string[] = [];
                            try {
                                additionalImageIds = JSON.parse(product.additionalImages || '[]');
                            } catch (e) {
                                console.error('Error parsing additionalImages:', e);
                            }

                            const additionalImageUrls = additionalImageIds.map(
                                (id: string) => `/api/product/image/${id}`
                            );

                            return (
                                <tr key={product.productId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-3">
                                            <Link
                                                to={`/art/${product.productId}`}
                                                className="text-gray-400 hover:text-gray-500"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                to={`/products/edit/${product.productId}`}
                                                className="text-indigo-400 hover:text-indigo-500"
                                            >
                                                <Edit2 className="h-5 w-5" />
                                            </Link>
                                            <button
                                                className="text-red-400 hover:text-red-500"
                                                onClick={() => setProductToDelete(product)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                    src={`/api/product/image/${product.imageFileId}`}
                                                    alt={product.title}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        console.error(`Failed to load image: ${product.imageFileId}`);
                                                        e.currentTarget.src = 'https://via.placeholder.com/150';
                                                    }}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {product.title}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 line-clamp-2">
                                            {product.description || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            ${product.price.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {product.categoryName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {product.dimensions || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {product.tags || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {additionalImageUrls.length > 0 ? (
                                                additionalImageUrls.map((url, index) => (
                                                    <img
                                                        key={index}
                                                        className="h-8 w-8 rounded object-cover"
                                                        src={url}
                                                        alt={`Additional ${index}`}
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            console.error(`Failed to load additional image: ${url}`);
                                                            e.currentTarget.src = 'https://via.placeholder.com/150';
                                                        }}
                                                    />
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500">None</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isAvailable
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {product.isAvailable ? 'Available' : 'Sold'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {productToDelete && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                            <p className="text-sm text-gray-700 mb-6">
                                Are you sure you want to delete <strong>{productToDelete.title}</strong>?
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <Button variant="outline" onClick={() => setProductToDelete(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={deleting}
                                    onClick={async () => {
                                        try {
                                            setDeleting(true);
                                            await axios.delete(`/api/product/${productToDelete.productId}`, {
                                                headers: getAuthHeader()
                                            });
                                            setProducts((prev) =>
                                                prev.filter((p) => p.productId !== productToDelete.productId)
                                            );
                                            setProductToDelete(null);
                                            setDeleting(false);
                                        } catch (err) {
                                            console.error("Delete failed", err);
                                            alert("Failed to delete the product.");
                                            setDeleting(false);
                                        }
                                    }}
                                >
                                    {deleting ? "Deleting..." : "Delete"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}