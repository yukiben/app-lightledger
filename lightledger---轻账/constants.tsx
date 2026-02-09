
import React from 'react';
import { 
  Utensils, 
  Bus, 
  ShoppingBag, 
  Home, 
  BookOpen, 
  Palmtree, 
  Smartphone, 
  MoreHorizontal 
} from 'lucide-react';
import { Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'food', name: '餐饮', icon: 'Utensils', color: '#FF9500' },
  { id: 'transport', name: '交通', icon: 'Bus', color: '#007AFF' },
  { id: 'shopping', name: '购物', icon: 'ShoppingBag', color: '#FF2D55' },
  { id: 'house', name: '居住', icon: 'Home', color: '#5856D6' },
  { id: 'culture', name: '文化', icon: 'BookOpen', color: '#FFCC00' },
  { id: 'travel', name: '旅游', icon: 'Palmtree', color: '#4CD964' },
  { id: 'tech', name: '数码', icon: 'Smartphone', color: '#1D1D1F' },
  { id: 'other', name: '其他', icon: 'MoreHorizontal', color: '#8E8E93' },
];

export const getIcon = (name: string, size = 18) => {
  switch (name) {
    case 'Utensils': return <Utensils size={size} />;
    case 'Bus': return <Bus size={size} />;
    case 'ShoppingBag': return <ShoppingBag size={size} />;
    case 'Home': return <Home size={size} />;
    case 'BookOpen': return <BookOpen size={size} />;
    case 'Palmtree': return <Palmtree size={size} />;
    case 'Smartphone': return <Smartphone size={size} />;
    default: return <MoreHorizontal size={size} />;
  }
};
