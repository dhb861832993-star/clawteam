export function Header() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="h-20 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 border-b border-accent-orange/60 flex items-center justify-between px-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-mono font-light tracking-widest text-accent-orange">
          AGENT MANAGEMENT
        </h1>
        <p className="text-xs font-mono tracking-widest text-gray-600 mt-1">
          SYSTEM MONITORING INTERFACE // V10
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-4 h-4 rounded-full bg-accent-green animate-pulse glow-green" />
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-accent-green">SYSTEM ONLINE</p>
          <p className="text-xs font-mono text-gray-600">
            {dateStr} // {timeStr} CST
          </p>
        </div>
      </div>
    </header>
  );
}