// components/ExhibitionCard.tsx
import { useNavigate } from 'react-router-dom';
import { type Exhibition } from '../lib/types'; // Import kiểu Exhibition

interface ExhibitionCardProps {
    exhibition: Exhibition;
}

export const ExhibitionCard = ({ exhibition }: ExhibitionCardProps) => {
    const navigate = useNavigate();

    // Xử lý khi nhấn vào card hoặc hình ảnh
    const handleCardClick = () => {
        if (exhibition.url) {
            // Điều hướng đến URL chi tiết của triển lãm (có thể là trang ngoài)
            window.open(exhibition.url, '_blank');
        }
        // Hoặc nếu bạn có trang chi tiết nội bộ:
        // navigate(`/exhibition/${exhibition.id}`); // Nếu Exhibition có một ID duy nhất
    };

    return (
        <div
            className="w-full mb-4 relative group cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            onClick={handleCardClick} // Bắt sự kiện click trên toàn bộ card
        >
            {exhibition.imageUrl ? (
                <img
                    src={exhibition.imageUrl}
                    alt={exhibition.title || 'Exhibition image'}
                    className="w-full h-48 object-cover rounded-t-lg transition-opacity duration-300 group-hover:opacity-90"
                    onError={(e) => {
                        // Ảnh lỗi thì hiển thị ảnh placeholder
                        e.currentTarget.src = '/img/placeholder-image.png'; // Đảm bảo bạn có file này
                        e.currentTarget.onerror = null; // Tránh lặp lại lỗi
                    }}
                />
            ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-t-lg">
                    <span className="text-gray-400">No Image Available</span>
                </div>
            )}

            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                    {exhibition.title || 'Untitled Exhibition'}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                    Gallery/Museum: {exhibition.galleryOrMuseum || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                    Date: {exhibition.date || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                    Location: {exhibition.location || 'N/A'}
                </p>
                {exhibition.sourceApi && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                        Source: {exhibition.sourceApi}
                    </p>
                )}
                {/* Có thể thêm mô tả ngắn nếu muốn */}
                {/* {exhibition.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                        {exhibition.description}
                    </p>
                )} */}
            </div>
        </div>
    );
};