import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Share2, ShoppingCart, Edit } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import Loading from '../components/Loading';
import ArtistProducts from '../components/ArtistProducts';
import { useAuth } from '../components/AuthProvider';

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
    const { user } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentInput, setCommentInput] = useState('');
    const [commentError, setCommentError] = useState<string | null>(null);
    const [commentLoading, setCommentLoading] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const [reportError, setReportError] = useState('');
    const [reportSuccess, setReportSuccess] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`/api/product/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });
                setProduct(res.data);
            } catch (err) {
                if (axios.isAxiosError(err) && [401, 403].includes(err.response?.status ?? 0)) {
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    useEffect(() => {
        if (!id) return;
        axios.get(`/api/comments/product/${id}`, { withCredentials: true })
            .then(res => setComments(res.data))
            .catch(() => setComments([]));
    }, [id]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim()) return;
        setCommentLoading(true);
        try {
            await axios.post(`/api/comments/product/${id}`, commentInput, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
            setCommentInput('');
            const updated = await axios.get(`/api/comments/product/${id}`, { withCredentials: true });
            setComments(updated.data);
        } catch (err) {
            setCommentError('Failed to add comment.');
            if (axios.isAxiosError(err) && err.response?.status === 401) navigate('/login');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setReportError('');
        setReportSuccess('');
        setReportLoading(true);
        try {
            await axios.post('/api/report', {
                productId: product?.productId,
                content: reportContent,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportSuccess('Report submitted successfully!');
            setReportContent('');
            setTimeout(() => setShowReport(false), 1500);
        } catch (err) {
            setReportError('Failed to submit report.');
        } finally {
            setReportLoading(false);
        }
    };

    const handleAction = (permission: boolean | undefined, fallback: () => void) => {
        if (!permission) return navigate('/login');
        fallback();
    };

    const handleDeleteProduct = async () => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`/api/product/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Product deleted successfully!');
            navigate('/');
        } catch (err) {
            alert('Failed to delete product.');
        }
    };

    if (isLoading) return <div className="flex justify-center py-12"><Loading /></div>;
    if (!product) return <div className="text-center text-red-500 py-12">Artwork not found</div>;

    const imageUrl = `/api/product/image/${product.imageFileId}`;
    const additionalImageUrls = product.additionalImages ? JSON.parse(product.additionalImages).map((id: string) => `/api/product/image/${id}`) : [];
    const tags = product.tags ? product.tags.split(',').map(t => t.trim()) : [];
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Images */}
                <div className="space-y-4">
                    <img src={imageUrl} onError={(e) => e.currentTarget.src = '/placeholder-image.jpg'} alt={product.title} className="rounded-lg w-full h-auto object-cover" />
                    <div className="grid grid-cols-4 gap-2">
                        {additionalImageUrls.map((src, i) => (
                            <img key={i} src={src} onError={(e) => e.currentTarget.src = '/placeholder-image.jpg'} alt="" className="rounded-lg object-cover" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 ">
                        <h2 className="text-lg font-semibold">More from {product.artist.name}</h2>
                        <ArtistProducts artistId={product.artist.id} />
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{product.title}</h1>
                        <p className="text-lg text-gray-800 mt-1">${product.price?.toLocaleString()}</p>
                    </div>
                    <p className="text-gray-600">{product.description}</p>

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleAction(product.permissions?.canAddToCart, () => alert('Add to cart API needed'))}
                            disabled={!product.isAvailable}
                        >
                            <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleAction(product.permissions?.canLike, () => alert('Like API needed'))}
                        >
                            <Heart className="h-5 w-5" /> <span className="ml-2">{product.likeCount || 0}</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleAction(product.permissions?.canComment, () => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Link copied!');
                            })}
                        >
                            <Share2 className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => product.permissions?.canEdit && navigate(`/edit/${id}`)}
                            disabled={!product.permissions?.canEdit}
                        >
                            <Edit className="h-5 w-5" />
                        </Button>
                        <Button onClick={() => setShowReport(true)} variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                            Report
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteProduct}
                            className="border-red-500 ml-2 text-red-500 hover:bg-red-50"
                            style={{ display: user?.role === 'admin' ? 'inline-flex' : 'none' }}
                        >
                            Delete
                        </Button>
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-gray-100 text-sm rounded-full">{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Artist */}
                    <div className="pt-6 border-t">
                        <h2 className="font-semibold text-gray-800 mb-2">About the Artist</h2>
                        <p className="text-gray-600">{product.artist.name} - Member since {new Date(product.artist.createdAt).getFullYear()}</p>
                    </div>

                    {/* Comments */}
                    <div className="pt-6 border-t">
                        <h2 className="font-semibold text-gray-800 mb-4">Comments</h2>
                        {product.permissions?.canComment ? (
                            <form onSubmit={handleCommentSubmit} className="mb-4">
                                <textarea
                                    className="w-full p-2 border rounded"
                                    placeholder="Write a comment..."
                                    value={commentInput}
                                    onChange={(e) => setCommentInput(e.target.value)}
                                />
                                <div className="mt-2 flex gap-2">
                                    <Button type="submit" disabled={commentLoading || !commentInput.trim()}>
                                        {commentLoading ? 'Posting...' : 'Post Comment'}
                                    </Button>
                                    {commentError && <span className="text-red-500 text-sm">{commentError}</span>}
                                </div>
                            </form>
                        ) : (
                            <p className="text-gray-500">Login to comment.</p>
                        )}

                        <div className="space-y-4 mt-4">
                            {comments.length === 0 && <p className="text-gray-500">No comments yet.</p>}
                            {comments.map(c => (
                                <div key={c.id} className="border-b pb-3">
                                    <p className="font-medium text-sm text-gray-900">{c.userName}</p>
                                    <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</p>
                                    <p className="mt-1 text-sm text-gray-700">{c.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Popup */}
            {showReport && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <form onSubmit={handleReportSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4 text-center text-red-600">Report Product</h2>
                        <textarea
                            className="w-full border rounded px-3 py-2 mb-2"
                            placeholder="Describe the issue..."
                            value={reportContent}
                            onChange={e => setReportContent(e.target.value)}
                            rows={4}
                            required
                        />
                        {reportError && <div className="text-red-500 text-sm mb-2 text-center">{reportError}</div>}
                        {reportSuccess && <div className="text-green-600 text-sm mb-2 text-center">{reportSuccess}</div>}
                        <div className="flex gap-2 mt-2">
                            <button type="button" className="flex-1 py-2 rounded bg-gray-200" onClick={() => setShowReport(false)}>Cancel</button>
                            <button type="submit" className="flex-1 py-2 rounded bg-red-500 text-white" disabled={reportLoading}>
                                {reportLoading ? 'Reporting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ArtDetail;
