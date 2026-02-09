
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Record {
  id: string;
  amount: number;
  categoryId: string;
  note: string;
  date: Date;
}

export enum ViewState {
  LOCKED = 'LOCKED',
  ENTRY = 'ENTRY',
  HOME = 'HOME',
  STATS = 'STATS'
}

export interface Budget {
  total: number;
  spent: number;
}
