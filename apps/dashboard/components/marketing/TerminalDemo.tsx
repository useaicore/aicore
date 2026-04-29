export default function TerminalDemo() {
  return (
    <div className="p-6 bg-black text-white font-mono rounded-lg border border-gray-800">
      <p className="text-blue-400">$ curl https://api.aicore.dev/v1/chat</p>
      <div className="mt-4 text-green-400">
        {`{ "status": "success", "cost": 0.03 }`}
      </div>
    </div>
  );
}
