
import { Product, Coupon } from './types';

export const CATEGORIES = [
  'Mobiles', 'Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Books', 'Groceries'
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '65f6170d4f3b7d1e8c7c9f1a', // Example ObjectId
    name: 'iPhone 15 Pro Max - Natural Titanium',
    description: 'The ultimate iPhone experience with A17 Pro chip and advanced camera system.',
    price: 159900,
    originalPrice: 169900,
    image: 'https://picsum.photos/seed/iphone/600/600',
    category: 'Mobiles',
    rating: 4.8,
    reviewsCount: 1250,
    stock: 15,
    countInStock: 15,
    isFeatured: true,
    variants: [
      { name: 'Storage', options: ['128GB', '256GB', '512GB', '1TB'] },
      { name: 'Color', options: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'] }
    ]
  },
  {
    id: '65f6170d4f3b7d1e8c7c9f1b', // Example ObjectId
    name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    description: 'Industry-leading noise cancellation with two processors and eight microphones.',
    price: 29990,
    originalPrice: 34990,
    image: 'https://picsum.photos/seed/headphones/600/600',
    category: 'Electronics',
    rating: 4.9,
    reviewsCount: 850,
    stock: 25,
    countInStock: 25,
    isFeatured: true,
    variants: [
      { name: 'Color', options: ['Black', 'Silver', 'Midnight Blue'] }
    ]
  },
  {
    id: '65f6170d4f3b7d1e8c7c9f1c', // Example ObjectId
    name: 'Nike Air Max 270',
    description: 'Large Air unit delivers responsive cushioning for a comfortable ride.',
    price: 12995,
    originalPrice: 14995,
    image: 'https://picsum.photos/seed/nike/600/600',
    category: 'Fashion',
    rating: 4.5,
    reviewsCount: 430,
    stock: 40,
    countInStock: 40,
    variants: [
      { name: 'Size', options: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'] },
      { name: 'Color', options: ['Triple Black', 'White/Blue', 'Red/White'] }
    ]
  },
  {
    id: '65f6170d4f3b7d1e8c7c9f1d', // Example ObjectId
    name: 'MacBook Air M3 Chip',
    description: 'The world\'s most popular laptop is even better with the M3 chip.',
    price: 114900,
    originalPrice: 119900,
    image: 'https://picsum.photos/seed/macbook/600/600',
    category: 'Electronics',
    rating: 4.7,
    reviewsCount: 320,
    stock: 10,
    countInStock: 10,
    isFeatured: true,
    variants: [
      { name: 'RAM', options: ['8GB', '16GB', '24GB'] },
      { name: 'Storage', options: ['256GB', '512GB', '1TB'] }
    ]
  },
  {
    id: '65f6170d4f3b7d1e8c7c9f1e', // Example ObjectId
    name: 'Samsung Galaxy S24 Ultra',
    description: 'AI-powered smartphone with 200MP camera and integrated S Pen.',
    price: 129999,
    originalPrice: 139999,
    image: 'https://picsum.photos/seed/samsung/600/600',
    category: 'Mobiles',
    rating: 4.8,
    reviewsCount: 910,
    stock: 20,
    countInStock: 20
  },
  {
    id: '65f6170d4f3b7d1e8c7c9f1f', // Example ObjectId
    name: 'Philips Air Fryer XL',
    description: 'Healthy frying with Rapid Air technology. Large 1.2kg capacity.',
    price: 9999,
    originalPrice: 12999,
    image: 'https://picsum.photos/seed/fryer/600/600',
    category: 'Home & Kitchen',
    rating: 4.6,
    reviewsCount: 2100,
    stock: 50,
    countInStock: 50
  },
  {
    id: '65f6170d4f3b7d1e8c7c9f20', // Example ObjectId
    name: 'Fresh Organic Tomatoes - 1kg',
    description: 'Premium quality organic tomatoes, farm fresh and naturally ripened.',
    price: 60,
    originalPrice: 80,
    image: 'https://picsum.photos/seed/tomatoes/600/600',
    category: 'Groceries',
    rating: 4.7,
    reviewsCount: 450,
    stock: 100,
    countInStock: 100,
    isFeatured: true
  },
  {
    id: '65f6170d4f3b7d1e8c7c9f21', // Example ObjectId
    name: 'Basmati Rice - 5kg Pack',
    description: 'Premium quality long grain basmati rice, aged for perfect aroma and taste.',
    price: 450,
    originalPrice: 550,
    image: 'https://picsum.photos/seed/rice/600/600',
    category: 'Groceries',
    rating: 4.8,
    reviewsCount: 890,
    stock: 75,
    countInStock: 75
  },
  {
    id: '65f6170d4f3b7d1e8c7c9f22', // Example ObjectId
    name: 'Fresh Milk - 1L Pack',
    description: 'Farm fresh pure cow milk, pasteurized and ready to consume.',
    price: 55,
    originalPrice: 65,
    image: 'https://picsum.photos/seed/milk/600/600',
    category: 'Groceries',
    rating: 4.6,
    reviewsCount: 320,
    stock: 50,
    countInStock: 50
  },
  {
    id: '65f6170d4f3b7d1e8c7c9f23', // Example ObjectId
    name: 'Whole Wheat Atta - 10kg',
    description: 'Premium quality whole wheat flour, stone ground for better nutrition.',
    price: 380,
    originalPrice: 450,
    image: 'https://picsum.photos/seed/atta/600/600',
    category: 'Groceries',
    rating: 4.7,
    reviewsCount: 670,
    stock: 60,
    countInStock: 60
  },
  {
    id: '65f6170d4f3b7d1e8c7c9f24', // Example ObjectId
    name: 'Fresh Apples - 1kg',
    description: 'Crisp and sweet red apples, imported from the best orchards.',
    price: 120,
    originalPrice: 150,
    image: 'https://picsum.photos/seed/apples/600/600',
    category: 'Groceries',
    rating: 4.8,
    reviewsCount: 540,
    stock: 80,
    countInStock: 80,
    isFeatured: true
  },
  {
    id: '65f6170d4f3b7d1e8c7c9f25', // Example ObjectId
    name: 'Cooking Oil - 5L Jar',
    description: 'Pure refined sunflower oil, rich in vitamin E and low cholesterol.',
    price: 850,
    originalPrice: 950,
    image: 'https://picsum.photos/seed/oil/600/600',
    category: 'Groceries',
    rating: 4.5,
    reviewsCount: 780,
    stock: 40,
    countInStock: 40
  }
];

export const MOCK_COUPONS: Coupon[] = [
  { code: 'FLIPZO20', discount: 20, expiry: '2025-12-31' },
  { code: 'NEWUSER10', discount: 10, expiry: '2025-12-31' }
];
