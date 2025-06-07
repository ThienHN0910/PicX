import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Share2, ShoppingCart, Edit } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/Button';

interface Comment {
    id: number;
    userName: string;
    content: string;
    createdAt: string;
}

interface Artist {
    id: number;
    name: string;
    createdAt: string;
}

interface Product {
    productId: number;
    title: string;
    description: string;
    price: number;
    categoryName: string;
    medium: string;
    dimensions: string;
    isAvailable: boolean;
    tags: string;
    imageFileId: string;
    additionalImages: string;
    artist: Artist;
    likeCount?: number;
    comments?: Comment[];
    permissions?: {
        canView: boolean;
        canLike: boolean;
        canComment: boolean;
        canAddToCart: boolean;
        canEdit: boolean;
    };
}

const ArtDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/api/product/${id}`, {
                    withCredentials: true,
                });
                setProduct(response.data);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching product:', err);
                if (axios.isAxiosError(err) && [401, 403].includes(err.response?.status)) {
                    navigate('/login');
                } else {
                    setError('Failed to load artwork. Please try again.');
                }
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

    const handleAddToCart = () => {
        if (!product?.permissions?.canAddToCart) {
            navigate('/login');
            return;
        }
        // Placeholder: Replace with actual cart API call
        alert('Added to cart! (API call needed)');
    };

    const handleLike = () => {
        if (!product?.permissions?.canLike) {
            navigate('/login');
            return;
        }
        // Placeholder: Replace with actual like API call
        alert('Liked! (API call needed)');
    };

    const handleShare = () => {
        if (!product?.permissions?.canComment) {
            navigate('/login');
            return;
        }
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    const handleEdit = () => {
        if (!product?.permissions?.canEdit) {
            console.log('Edit not allowed');
            return;
        }
        navigate(`/edit/${id}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-red-500">{error || 'Artwork not found'}</p>
            </div>
        );
    }

    const imageUrl = `/api/product/image/${product.imageFileId}`;
    const additionalImageUrls = product.additionalImages
        ? JSON.parse(product.additionalImages).map((fileId: string) => `/api/product/image/${fileId}`)
        : [];
    const tags = product.tags ? product.tags.split(',').map(tag => tag.trim()) : [];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="space-y-4">
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-400">No image available</span>
                            </div>
                        )}
                    </div>
                    {additionalImageUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                            {additionalImageUrls.map((image: string, index: number) => (
                                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                    <img
                                        src={image}
                                        alt={`${product.title} - View ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')}
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
                        <p className="mt-2 text-lg text-gray-900">${product.price?.toLocaleString() || 'N/A'}</p>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-gray-900">About the Artwork</h2>
                        <p className="text-gray-600">{product.description || 'No description available'}</p>
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
                                onClick={handleAddToCart}
                                className="flex-1"
                                disabled={!product.isAvailable || !product.permissions?.canAddToCart}
                            >
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                {!product.permissions?.canAddToCart ? 'Login to Add' : product.isAvailable ? 'Add to Cart' : 'Unavailable'}
                            </Button>
                            <Button variant="outline" onClick={handleLike} disabled={!product.permissions?.canLike}>
                                <Heart className={`h-5 w-5 ${product.likeCount === 0 ? 'fill-red-500 text-red-500' : ''}`} />
                                <span className="ml-2">{product.likeCount || 0}</span>
                            </Button>
                            <Button variant="outline" onClick={handleShare} disabled={!product.permissions?.canComment}>
                                <Share2 className="h-5 w-5" />
                            </Button>
                            <Button variant="outline" onClick={handleEdit} disabled={!product.permissions?.canEdit}>
                                <Edit className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {tags.length > 0 && (
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
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
                                    <p className="text-sm text-gray-500">
                                        Member since {new Date(product.artist.createdAt).getFullYear()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {product.comments && product.comments.length > 0 && (
                        <div className="border-t pt-6 mt-6">
                            <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
                            <div className="mt-4 space-y-4">
                                {product.comments.map((comment) => (
                                    <div key={comment.id} className="border-b pb-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900">{comment.userName}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600">{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArtDetail;