import CodeTabs from './CodeTabs';

export default function CodeSample() {
  const checklist = [
    'OpenAI SDK compatible',
    'Anthropic SDK compatible (via translation)',
    'Works with LangChain & Vercel AI SDK',
    'Streaming supported',
    'Function calling supported'
  ];

  return (
    <section className="py-24 max-w-[1100px] mx-auto px-6">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        {/* Left Column */}
        <div className="flex-1">
          <span className="text-[var(--gold-mid)] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">Integration</span>
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
            Change one line.<br />
            <span className="gradient-sky">Keep everything else.</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-10 opacity-90">
            AICore speaks OpenAI's API. That means you update your baseURL and nothing else. 
            Your existing SDK, your existing prompts, your existing retry logic — all unchanged.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {checklist.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="text-[var(--gold-bright)] font-bold">✓</span>
                <span className="text-[var(--text-secondary)] text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 w-full max-w-[540px]">
          <CodeTabs />
        </div>
      </div>
    </section>
  );
}
