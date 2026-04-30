import Hero from '@/components/marketing/Hero';
import ProvidersBar from '@/components/marketing/ProvidersBar';
import SocialProof from '@/components/marketing/SocialProof';
import FourPillars from '@/components/marketing/FourPillars';
import TokenSavingsChart from '@/components/marketing/TokenSavingsChart';
import DashboardPreview from '@/components/marketing/DashboardPreview';
import Pricing from '@/components/marketing/Pricing';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <ProvidersBar />
      <SocialProof />
      <FourPillars />
      <TokenSavingsChart />
      <DashboardPreview />
      <Pricing />
    </div>
  );
}
