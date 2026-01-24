export interface Product {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: number;
  discountPrice: number;
  discountPercentage: number;
  assured: boolean;
  deliveryText: string;
  brand: string;
  category: string;
}

// Mock product data for Fzokart
export const products: Product[] = [
  {
    id: '1',
    name: 'Fzokart Smartwatch with Health Tracking',
    image: 'https://via.placeholder.com/150/2874F0/FFFFFF?text=Smartwatch',
    rating: 4.5,
    reviewCount: 12345,
    price: 3999,
    discountPrice: 1999,
    discountPercentage: 50,
    assured: true,
    deliveryText: 'Free delivery by Tomorrow',
    brand: 'SmartTech',
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Organic Basmati Rice 5kg',
    image: 'https://via.placeholder.com/150/388E3C/FFFFFF?text=Basmati+Rice',
    rating: 4.2,
    reviewCount: 876,
    price: 600,
    discountPrice: 499,
    discountPercentage: 17,
    assured: false,
    deliveryText: 'Delivery in 2 days',
    brand: 'GreenHarvest',
    category: 'Groceries',
  },
  {
    id: '3',
    name: "Men's Casual Cotton Shirt - Blue",
    image: 'https://via.placeholder.com/150/2874F0/FFFFFF?text=Men%27s+Shirt',
    rating: 3.9,
    reviewCount: 543,
    price: 1299,
    discountPrice: 899,
    discountPercentage: 30,
    assured: true,
    deliveryText: 'Free delivery by Thu, Jan 18',
    brand: 'FashionHub',
    category: 'Apparel',
  },
  {
    id: '4',
    name: 'Wireless Bluetooth Earbuds with ANC',
    image: 'https://via.placeholder.com/150/FF9F00/FFFFFF?text=Earbuds',
    rating: 4.7,
    reviewCount: 2300,
    price: 2999,
    discountPrice: 1499,
    discountPercentage: 50,
    assured: true,
    deliveryText: 'Free delivery by Tomorrow',
    brand: 'AudioPro',
    category: 'Electronics',
  },
  {
    id: '5',
    name: 'Stainless Steel Water Bottle 1L',
    image: 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=Water+Bottle',
    rating: 4.1,
    reviewCount: 78,
    price: 450,
    discountPrice: 349,
    discountPercentage: 22,
    assured: false,
    deliveryText: 'Delivery in 3-4 days',
    brand: 'AquaFresh',
    category: 'Home & Kitchen',
  },
  {
    id: '6',
    name: "Kids' Learning Tablet 7-inch",
    image: 'https://via.placeholder.com/150/FF9F00/FFFFFF?text=Kids+Tablet',
    rating: 4.0,
    reviewCount: 321,
    price: 7999,
    discountPrice: 5999,
    discountPercentage: 25,
    assured: true,
    deliveryText: 'Free delivery by Sat, Jan 20',
    brand: 'EduPlay',
    category: 'Toys & Gaming',
  },
  {
    id: '7',
    name: "Women's Ethnic Kurti - Red",
    image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Women%27s+Kurti',
    rating: 4.3,
    reviewCount: 112,
    price: 1500,
    discountPrice: 999,
    discountPercentage: 33,
    assured: true,
    deliveryText: 'Delivery in 2 days',
    brand: 'VogueIndia',
    category: 'Apparel',
  },
  {
    id: '8',
    name: 'Gaming Headset with Mic',
    image: 'https://via.placeholder.com/150/222222/FFFFFF?text=Gaming+Headset',
    rating: 4.6,
    reviewCount: 987,
    price: 3499,
    discountPrice: 1999,
    discountPercentage: 43,
    assured: true,
    deliveryText: 'Free delivery by Tomorrow',
    brand: 'GameBlast',
    category: 'Electronics',
  },
  {
    id: '9',
    name: 'Non-Stick Frying Pan',
    image: 'https://via.placeholder.com/150/E0E0E0/FFFFFF?text=Frying+Pan',
    rating: 4.4,
    reviewCount: 210,
    price: 800,
    discountPrice: 599,
    discountPercentage: 25,
    assured: false,
    deliveryText: 'Delivery in 3 days',
    brand: 'CookMaster',
    category: 'Home & Kitchen',
  },
  {
    id: '10',
    name: 'Bluetooth Portable Speaker',
    image: 'https://via.placeholder.com/150/2874F0/FFFFFF?text=Speaker',
    rating: 4.1,
    reviewCount: 450,
    price: 1800,
    discountPrice: 1199,
    discountPercentage: 33,
    assured: true,
    deliveryText: 'Free delivery by Thu, Jan 18',
    brand: 'SoundWave',
    category: 'Electronics',
  },
];

// Helper to generate a skeleton product
export const createSkeletonProduct = (id: string): Product => ({
  id: id,
  name: 'Loading Product Name', // Placeholder name
  image: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', // Tiny transparent GIF
  rating: 0,
  reviewCount: 0,
  price: 0,
  discountPrice: 0,
  discountPercentage: 0,
  assured: false,
  deliveryText: 'Loading delivery info',
  brand: 'Loading Brand',
  category: 'Loading Category',
});
