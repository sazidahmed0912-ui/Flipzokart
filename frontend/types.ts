
export interface VariantGroup {
  name: string;
  options: string[];
}

export interface VariantCombination {
  options: Record<string, string>;
  stock: number;
  price?: number;
  sku?: string;
  image?: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  images?: string[];
  category: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  isFeatured?: boolean;
  variants?: VariantGroup[];
  inventory?: VariantCombination[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  avatar?: string;
  joinedDate?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'COD' | 'Razorpay';
  createdAt: string;
  address: {
    fullName: string;
    street: string;
    city: string;
    zipCode: string;
  };
}

export interface Coupon {
  code: string;
  discount: number;
  expiry: string;
}
