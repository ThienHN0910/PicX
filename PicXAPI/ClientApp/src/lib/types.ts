export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: "guest" | "buyer" | "artist" | "admin";
    bank_name: string;
    bank_account_number: string;
    momo_number: string;
    is_active: boolean;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface ArtistProfile {
  artist_id: number;
  bio?: string;
  profile_picture?: string;
  specialization?: string;
  experience_years?: number;
  website_url?: string;
  social_media_links?: Record<string, string>;
  created_at: Date;
  updated_at: Date;
}

interface ArtistProfileData {
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    role: string;
    bio: string | null;
    profilePicture: string | null;
    specialization: string | null;
    experienceYears: number | null;
    websiteUrl: string | null;
    socialMediaLinks: string | null;
    userId: number;
}

export interface Product {
  product_id: number;
  artist_id: number;
  category_id?: number;
  title: string;
  description?: string;
  price: number;
  imageFileId?: string;
  image_url?: string;
  additional_images?: string[];
  dimensions?: string;
  is_available: boolean;
  tags?: string[];
  like_count: number;
  created_at: Date;
  updated_at: Date;
  artist?: User;
  category?: Category;
}

export interface Category {
  category_id: number;
  name: string;
  description?: string;
  parent_category_id?: number;
  is_active: boolean;
}

export interface Comment {
  comment_id: number;
  user_id: number;
  product_id: number;
  content: string;
  created_at: Date;
  user?: User;
  replies?: CommentReply[];
}

export interface CommentReply {
  reply_id: number;
  comment_id: number;
  user_id: number;
  content: string;
  created_at: Date;
  user?: User;
}

export interface Favorite {
  title: any;
  description: any;
  category_id: number;
  favorite_id: number;
  user_id: number;
  product_id: number;
  created_at: Date;
  product?: Product;
}

export interface Chat {
  chat_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: boolean;
  sent_at: Date;
  sender?: User;
  receiver?: User;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: number;
  is_read: boolean;
  created_at: Date;
}

export interface Cart {
    cart_id: number;
    user_id: number;
    product_id: number;
    created_at: Date;
}

export interface Exhibition {
    title?: string | null;
    galleryOrMuseum?: string | null;
    date?: string | null;
    location?: string | null;
    url?: string | null; // URL chi tiết của triển lãm
    description?: string | null;
    imageUrl?: string | null; // URL hình ảnh của triển lãm
    sourceApi?: string | null; // Nguồn API
}

export interface OrderItem {
    orderDetailId: number; // Thêm dòng này để fix lỗi typescript
    productId: number;
    productTitle: string;
    totalPrice: number;
    image_url: string;
    artistName: string;
}

export interface Order {
    orderId: number;
    totalAmount: number;
    orderDate: string;
    buyerName: string;
    items: OrderItem[];
}

export interface Artist {
    artistId: number;
    name: string;
}