
import React from 'react';
import Link from 'next/link';
;

const categories = [
  { name: 'Mobiles', imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=100&h=100&fit=crop&q=60', href: '/shop?category=Mobiles' },
  { name: 'Electronics', imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=100&h=100&fit=crop&q=60', href: '/shop?category=Electronics' },
  { name: 'Fashion', imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=100&h=100&fit=crop&q=60', href: '/shop?category=Fashion' },
  { name: 'Beauty', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop&q=60', href: '/beauty' },
  { name: 'Home', imageUrl: 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=100&h=100&fit=crop&q=60', href: '/shop?category=Home' },
  { name: 'Appliances', imageUrl: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=100&h=100&fit=crop&q=60', href: '/shop?category=Appliances' },
  { name: 'Groceries', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&q=60', href: '/shop?category=Groceries' },
];

export const CategoryGrid: React.FC = () => {
  return (
    <section className="container mx-auto px-4 mt-6 md:mt-8">
      <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-y-4 gap-x-2">
          {categories.map((category) => (
            <Link href={category.href}
              key={category.name}
              className="flex flex-col items-center gap-2 text-center group"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center group-hover:bg-[#f28c28]/10 transition-colors duration-300 overflow-hidden">
                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-semibold text-gray-800">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
