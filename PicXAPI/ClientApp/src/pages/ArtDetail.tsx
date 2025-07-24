import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Share2, ShoppingCart, Edit } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import Loading from '../components/Loading';
import ArtistProducts from '../components/ArtistProducts';
import { useAuth } from '../components/AuthProvider';
import { Modal } from '../components/ui/Modal';
import { toast } from 'react-toastify';

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
    const { isAuthenticated, user } = useAuth();
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const token = localStorage.getItem('authToken');
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteId, setFavoriteId] = useState<number | null>(null);

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
    }, [id, navigate, token]);

    useEffect(() => {
        if (!id) return;
        axios.get(`/api/comments/product/${id}`, { withCredentials: true })
            .then(res => setComments(res.data))
            .catch(() => setComments([]));
    }, [id]);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!isAuthenticated || !user?.id || !product) return;
            try {
                const response = await axios.get(`/api/favorites/user/${user.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader(),
                    },
                });
                const favorites = response.data;
                const favorite = favorites.find(
                    (fav: any) => fav.productId === product.productId
                );
                setIsFavorited(!!favorite);
                setFavoriteId(favorite ? favorite.favoriteId : null);
            } catch (error) {
                console.error('Error checking favorite status:', error);
            }
        };
        checkFavoriteStatus();
    }, [isAuthenticated, user, product]);

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
        } catch {
            setReportError('Failed to submit report.');
        } finally {
            setReportLoading(false);
        }
    };

    const getAuthHeader = () => {
        const token = localStorage.getItem("authToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handleFavoriteToggle = async (action: 'like' | 'dislike') => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!user?.id || !product) {
            toast.error('Invalid user or product data.');
            return;
        }

        try {
            if (action === 'like') {
                const favoriteDto = {
                    userId: user.id,
                    productId: product.productId,
                };
                const response = await axios.post('/api/favorites', favoriteDto, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader(),
                    },
                });
                setIsFavorited(true);
                setFavoriteId(response.data.id); // Giả sử API trả về ID của favorite mới
                setProduct({
                    ...product,
                    likeCount: (product.likeCount || 0) + 1,
                });
                toast.success('Added to favorites');
            } else {
                if (!favoriteId) {
                    toast.error('Product is not favorited.');
                    return;
                }
                await axios.delete(`/api/favorites/${favoriteId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader(),
                    },
                });
                setIsFavorited(false);
                setFavoriteId(null);
                setProduct({
                    ...product,
                    likeCount: (product.likeCount || 0) - 1,
                });
                toast.success('Removed from favorites');
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            toast.error(`Failed to ${action} product: ${error.message}`);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!product) return;
        const cartDto = {
            ProductId: product.productId
        };
        try {
            await axios.post('/api/cart/add', cartDto, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });
            toast.success('Added to cart successfully');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart.');
        }
    };

    const handleDeleteProduct = async () => {
        setShowDeleteModal(true);
    };

    const confirmDeleteProduct = async () => {
        setDeleteReason("the reason is not important");
        setDeleteLoading(true);
        setDeleteError('');
        try {
            // Gọi API lock sản phẩm (set isAvailable = 0)
            await axios.put(`/api/product/set-unavailable/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Product locked successfully!');
            navigate('/');
        } catch (err: any) {
            let msg = 'Failed to lock product.';
            if (err.response) {
                console.error('Lock product error response:', err.response);
                if (err.response.data && err.response.data.error) {
                    msg = err.response.data.error;
                }
            }
            setDeleteError(msg);
            console.error('Lock product error:', err);
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
        }
    };

    if (isLoading) return <div className="flex justify-center py-12"><Loading /></div>;
    if (!product) return <div className="text-center text-red-500 py-12">Artwork not found</div>;

    const imageUrl = `/api/product/image/${product.imageFileId}`;
    const tags = product.tags ? product.tags.split(',').map(t => t.trim()) : [];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Images */}
                <div className="space-y-4">
                    <img src={imageUrl} onError={(e) => e.currentTarget.src = '/placeholder-image.jpg'} alt={product.title} className="rounded-lg w-full h-auto object-cover" />
                    <div className="grid grid-cols-1 ">
                        <h2 className="text-lg font-semibold">More from {product.artist.name}</h2>
                        <ArtistProducts artistId={product.artist.id} />
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{product.title}</h1>
                        <p className="text-lg text-gray-800 mt-1">{product.price?.toLocaleString()} VND</p>
                    </div>
                    <p className="text-gray-600">{product.description}</p>

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <Button
                            onClick={handleAddToCart}
                            disabled={!product.isAvailable}
                        >
                            <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleFavoriteToggle(isFavorited ? 'dislike' : 'like')}
                        >
                            <Heart className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} /> <span className="ml-2">{product.likeCount || 0}</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Link copied!');
                            }}
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
                            variant="outline"
                            onClick={handleDeleteProduct}
                            className="border-red-500 ml-2 text-red-500 hover:bg-red-50"
                            style={{ display: user?.role === 'admin' ? 'inline-flex' : 'none' }}
                        >
                            Lock
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
                        <Link to={`/artist/${product.artist.id}`}>View Artist portfolio </Link>
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

            {/* Delete Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Lock Artwork">
                <div>
                    <span>Are you sure you want to lock this artwork? This action cannot be undone.</span>
                    <div className="flex gap-2 mt-2">
                        <button type="button" className="flex-1 py-2 rounded bg-gray-200" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                        <button type="button" className="flex-1 py-2 rounded bg-red-500 text-white" onClick={confirmDeleteProduct} disabled={deleteLoading}>
                            {deleteLoading ? 'Locking...' : 'Lock'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ArtDetail;
