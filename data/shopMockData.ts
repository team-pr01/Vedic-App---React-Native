import { ShopBanner, ShopCategory, ShopProduct } from '../types/shop';

export const MOCK_SHOP_BANNERS: ShopBanner[] = [
  {
    id: '1',
    title: 'Sacred Books Collection',
    description: 'Discover ancient wisdom with our curated collection of Vedic texts and spiritual books.',
    imageUrl: 'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=400',
    backgroundColor: '#FF6F00',
    textColor: '#FFFFFF',
    ctaText: 'Shop Now',
    ctaBgColor: '#FFFFFF',
    ctaTextColor: '#FF6F00',
    discount: '20% OFF'
  },
  {
    id: '2',
    title: 'Meditation Essentials',
    description: 'Create your perfect meditation space with our spiritual accessories and tools.',
    imageUrl: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400',
    backgroundColor: '#10B981',
    textColor: '#FFFFFF',
    ctaText: 'Explore',
    ctaBgColor: '#FFFFFF',
    ctaTextColor: '#10B981'
  },
  {
    id: '3',
    title: 'Ayurvedic Products',
    description: 'Natural healing products based on ancient Ayurvedic principles for wellness.',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    backgroundColor: '#8B5CF6',
    textColor: '#FFFFFF',
    ctaText: 'Discover',
    ctaBgColor: '#FFFFFF',
    ctaTextColor: '#8B5CF6'
  }
];

export const MOCK_SHOP_CATEGORIES: ShopCategory[] = [
  { id: 'all', name: 'All Products' },
  { id: 'books', name: 'Sacred Books' },
  { id: 'meditation', name: 'Meditation' },
  { id: 'ayurveda', name: 'Ayurveda' },
  { id: 'jewelry', name: 'Spiritual Jewelry' },
  { id: 'incense', name: 'Incense & Oils' },
  { id: 'statues', name: 'Statues & Idols' },
  { id: 'clothing', name: 'Traditional Wear' }
];

export const MOCK_SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: '1',
    name: 'Bhagavad Gita (Sanskrit-English)',
    subtitle: 'Sacred Text',
    price: 25.99,
    imageUrl: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
    imageBgColor: '#FFF7ED',
    tag: 'Bestseller',
    tagColor: '#FF6F00',
    isFavorite: false,
    category: 'books',
    description: 'Complete Bhagavad Gita with Sanskrit text and English translation',
    rating: 4.8,
    reviews: 156
  },
  {
    id: '2',
    name: 'Meditation Cushion Set',
    subtitle: 'Comfort & Support',
    price: 45.00,
    imageUrl: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400',
    imageBgColor: '#F0FDF4',
    tag: 'Premium',
    tagColor: '#10B981',
    isFavorite: true,
    category: 'meditation',
    description: 'Comfortable meditation cushion with perfect height and support',
    rating: 4.9,
    reviews: 89
  },
  {
    id: '3',
    name: 'Rudraksha Mala (108 Beads)',
    subtitle: 'Spiritual Jewelry',
    price: 35.50,
    imageUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    imageBgColor: '#FEF3C7',
    tag: 'Authentic',
    tagColor: '#F59E0B',
    isFavorite: false,
    category: 'jewelry',
    description: 'Genuine Rudraksha beads mala for meditation and spiritual practice',
    rating: 4.7,
    reviews: 234
  },
  {
    id: '4',
    name: 'Sandalwood Incense Sticks',
    subtitle: 'Natural Fragrance',
    price: 12.99,
    imageUrl: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=400',
    imageBgColor: '#F3E8FF',
    tag: 'Organic',
    tagColor: '#8B5CF6',
    isFavorite: true,
    category: 'incense',
    description: 'Pure sandalwood incense sticks for meditation and prayer',
    rating: 4.6,
    reviews: 78
  },
  {
    id: '5',
    name: 'Ganesha Brass Statue',
    subtitle: 'Divine Blessing',
    price: 89.99,
    imageUrl: 'https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg?auto=compress&cs=tinysrgb&w=400',
    imageBgColor: '#FEF2F2',
    tag: 'Handcrafted',
    tagColor: '#EF4444',
    isFavorite: false,
    category: 'statues',
    description: 'Beautiful handcrafted brass Ganesha statue for home temple',
    rating: 4.9,
    reviews: 45
  },
  {
    id: '6',
    name: 'Ayurvedic Herbal Tea',
    subtitle: 'Wellness Blend',
    price: 18.75,
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    imageBgColor: '#ECFDF5',
    tag: 'New',
    tagColor: '#059669',
    isFavorite: true,
    category: 'ayurveda',
    description: 'Organic herbal tea blend for health and vitality',
    rating: 4.5,
    reviews: 67
  },
  {
    id: '7',
    name: 'Silk Prayer Shawl',
    subtitle: 'Traditional Wear',
    price: 65.00,
    imageUrl: 'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=400',
    imageBgColor: '#FDF4FF',
    tag: 'Handwoven',
    tagColor: '#D946EF',
    isFavorite: false,
    category: 'clothing',
    description: 'Beautiful silk prayer shawl with traditional patterns',
    rating: 4.8,
    reviews: 23
  },
  {
    id: '8',
    name: 'Crystal Singing Bowl',
    subtitle: 'Sound Healing',
    price: 125.00,
    imageUrl: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400',
    imageBgColor: '#F0F9FF',
    tag: 'Premium',
    tagColor: '#0EA5E9',
    isFavorite: true,
    category: 'meditation',
    description: 'High-quality crystal singing bowl for meditation and healing',
    rating: 4.9,
    reviews: 34
  }
];