import { Header } from '@/components/shared/header';
import { VirtuFitClient } from '@/components/virtufit/virtufit-client';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

export default function Home() {
  const catalogItems: ImagePlaceholder[] = PlaceHolderImages.filter((img) =>
    img.id.startsWith('item-')
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow overflow-y-auto">
        <VirtuFitClient catalogItems={catalogItems} />
      </main>
    </div>
  );
}
