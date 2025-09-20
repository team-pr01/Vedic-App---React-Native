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
  _id: string;
  name: string;
  subtitle: string;
  price: number;
  imageUrl: string;
  imageBgColor: string;
  tags?: string[];
  tagColor?: string;
  category: string;
  productLink:string;
  currency:string
}