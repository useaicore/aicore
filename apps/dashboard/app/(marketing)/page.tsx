import Hero from '@/components/marketing/Hero';
import ProvidersBar from '@/components/marketing/ProvidersBar';
import FourPillars from '@/components/marketing/FourPillars';
import TokenSavingsChart from '@/components/marketing/TokenSavingsChart';
import Pricing from '@/components/marketing/Pricing';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <ProvidersBar />
      <FourPillars />
      <TokenSavingsChart />
      <Pricing />
    </div>
  );
}
