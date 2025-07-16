

const sectionBtn =
  "w-full flex items-center justify-between px-3 py-2 rounded border border-zinc-300 bg-white hover:bg-zinc-50 active:bg-zinc-100 transition-all duration-150 cursor-pointer font-mono text-xs text-black mb-1";

const Settings = ({
  onOpenFloatingCalculator,
  onOpenPreferences,
}: {
  onOpenFloatingCalculator?: () => void;
  onOpenPreferences?: () => void;
}) => {
  return (
    <div className="w-[280px] h-auto mx-auto p-3 rounded-lg bg-white text-black shadow-lg box-border flex flex-col gap-1 font-mono">
      <h2 className="text-sm font-bold mb-2 font-mono text-zinc-800">
        Quick Actions
      </h2>

      {/* Section Buttons */}
      <button className={sectionBtn} type="button">
        <span>Change Theme</span>
        <span className="text-zinc-400 text-sm">🌓</span>
      </button>

      <button className={sectionBtn} type="button">
        <span>Set Default Sign</span>
        <span className="text-zinc-400 font-bold">+</span>
      </button>

      <button className={sectionBtn} type="button">
        <span>Export as JSON</span>
        <span className="text-zinc-400">{}</span>
      </button>

      <button className={sectionBtn} type="button">
        <span>Check History</span>
        <span className="text-zinc-400">📄</span>
      </button>

      <button className={sectionBtn} type="button">
        <span>Shortcuts</span>
        <span className="text-zinc-400">⚡</span>
      </button>

      {/* Start Button */}
      <button
        className="w-full mt-3 mb-2 py-2.5 rounded bg-black text-white font-semibold font-mono text-xs hover:bg-zinc-800 active:bg-zinc-900 transition-all duration-150 shadow-sm"
        onClick={onOpenFloatingCalculator}
        type="button"
      >
        Start Floating Calculator
      </button>

      <hr className="my-2 border-zinc-200" />

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono px-1">
        <span>muyiwa johnson</span>
        <button
          className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-700 font-mono border border-zinc-200 text-xs transition-all duration-150"
          onClick={onOpenPreferences}
          type="button"
        >
          Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
