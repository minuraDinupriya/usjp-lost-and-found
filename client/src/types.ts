
export enum ItemType {
  LOST = 'Lost',
  FOUND = 'Found'
}

export interface ILostFoundItem {
  _id?: string;
  title: string;
  description: string;
  type: ItemType;
  category: string;
  location: string;
  date: string;
  contactNumber: string;
  imageUrl: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
