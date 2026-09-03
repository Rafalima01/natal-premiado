import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ChristmasEvent } from '@/components/home/ChristmasEvent';
import { DailyGift } from '@/components/home/DailyGift';
import { FeaturedChristmas } from '@/components/home/FeaturedChristmas';
import { GamificationPanel } from '@/components/home/GamificationPanel';
import { HeroBanner } from '@/components/home/HeroBanner';
import { PackagesSection } from '@/components/home/PackagesSection';
import { RecentWins } from '@/components/home/RecentWins';
import { ScratchSection } from '@/components/home/ScratchSection';

export function Home() {
  return (
    <>
      <HeroBanner />
      <RecentWins />
      <FeaturedChristmas />
      <CategoryGrid />
      <ScratchSection />
      <DailyGift />
      <ChristmasEvent />
      <PackagesSection />
      <GamificationPanel />
    </>
  );
}
