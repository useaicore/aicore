export default function ProvidersBar() {
  const providers = [
    'OpenAI', 'Anthropic', 'Google Gemini', 'Mistral', 
    'Groq', 'Cohere', 'Together AI', 'Perplexity'
  ];

  return (
    <section className="py-12 border-y border-[var(--text-faint)]/30">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.2em] text-center mb-8">Works with</p>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 opacity-60">
          {providers.map((p) => (
            <div 
              key={p}
              className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--text-faint)] rounded-[var(--radius-md)] text-[var(--text-secondary)] text-sm font-medium hover:border-[var(--gold-dim)] hover:text-[var(--text-primary)] transition-all cursor-default"
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
