
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
  countInStock: number; // Added to match backend response
  isFeatured?: boolean;
  variants?: VariantGroup[];
  inventory?: VariantCombination[];
  seller?: string;
  deliveryDate?: string;
  selectedVariants?: Record<string, string>;
  defaultColor?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  avatar?: string;
  joinedDate?: string;
  createdAt?: string;
  status?: string;
  suspensionEnd?: string;
  banReason?: string;
}

export interface Address {
  id: string | number;
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  email?: string; // Populated from User
  items: CartItem[];
  total: number;
  status: string;
  shippingSnapshot?: any;
  trackingId?: string;
  orderNumber?: string;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
  user?: User; // Populated field
  address: string | { // Allow string (legacy/backend) or object
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

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  product: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}
