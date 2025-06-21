import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Artist {
    artistId: number;
    name: string;
}

interface OrderItem {
    productId: number;
    productTitle: string;
    totalPrice: number;
    imageUrl: string;
    artistName: string;
}

interface Order {
    orderId: number;
    totalAmount: number;
    orderDate: string;
    items: OrderItem[];
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [selectedArtist, setSelectedArtist] = useState("all");
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/orders/admin/artists').then(res => {
            setArtists(res.data);
        });
        fetchOrders("all");
    }, []);

    const fetchOrders = async (artistId: string | number) => {
        let res;
        if (artistId === "all") {
            res = await axios.get('/api/orders/admin');
        } else {
            res = await axios.get(`/api/orders/admin/by-artist/${artistId}`);
        }
        setOrders(res.data.orders || []);
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const artistId = e.target.value;
        setSelectedArtist(artistId);
        fetchOrders(artistId);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Admin Order Management</h1>
            <select
                value={selectedArtist}
                onChange={handleSelectChange}
                className="mb-6 px-4 py-2 border rounded bg-white shadow"
            >
                <option value="all">All</option>
                {artists.map((a) => (
                    <option key={a.artistId} value={a.artistId}>
                        {a.name}
                    </option>
                ))}
            </select>

            {orders.length === 0 ? (
                <p className="text-gray-500">No orders found.</p>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.orderId}
                            className="border p-4 rounded hover:bg-gray-50 cursor-pointer shadow"
                            onClick={() => navigate(`/admin/order/${order.orderId}`)}
                        >
                            <h2 className="text-lg font-semibold">Order #{order.orderId}</h2>
                            <p>Total: ${order.totalAmount}</p>
                            <p>Date: {new Date(order.orderDate).toLocaleString()}</p>
                            <p>{order.items.length} item(s)</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
