export interface ShopBanner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  backgroundColor: string;
  textColor: string;
  ctaText: string;
  ctaBgColor: string;
  ctaTextColor: string;
  discount?: string;
}

export interface ShopCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  imageUrl: string;
  imageBgColor: string;
  tag?: string;
  tagColor?: string;
  isFavorite: boolean;
  category: string;
  description?: string;
  rating?: number;
  reviews?: number;
}