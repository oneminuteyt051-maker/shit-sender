import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'POOP IMMUNITY CERTIFICATE',
  description: 'This user is protected by the blockchain.',
  openGraph: { images: ['/immunity-badge.png'] },
};

export default function ImmunePage() {
  const tweetText = encodeURIComponent(`🛡️ I'm officially POOP-IMMUNE! Try it: https://shit-sender.vercel.app`);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <img src="/immunity-badge.png" alt="Badge" className="w-64 h-64 mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">OFFICIALLY IMMUNE</h1>
      <p className="max-w-md mb-8 text-gray-400">
        This wallet is socially protected.<br />Certified by Poop Protocol.
      </p>

      <a
        href={`https://twitter.com/intent/tweet?text=${tweetText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-500 px-8 py-3 rounded-full font-bold hover:bg-blue-600"
      >
        🐦 Share on X
      </a>
    </div>
  );
}