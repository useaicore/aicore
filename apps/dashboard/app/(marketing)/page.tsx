import Hero from '@/components/marketing/Hero';
import ProvidersBar from '@/components/marketing/ProvidersBar';
import FeaturesGrid from '@/components/marketing/FeaturesGrid';
import CodeSample from '@/components/marketing/CodeSample';
import Pricing from '@/components/marketing/Pricing';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <ProvidersBar />
      <FeaturesGrid />
      <CodeSample />
      <Pricing />
    </div>
  );
}
