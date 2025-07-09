export interface Court {
  _id: string;
  name: string;
  type: 'Indoor' | 'Outdoor';
  price: number;
  description?: string;
  imageUrl?: string;
}
