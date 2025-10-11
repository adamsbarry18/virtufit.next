import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  brand: string;
  price: number;
  rating: number;
  reviews: number;
  status: string | null;
  originalPrice?: number;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
