import { Metadata } from 'next';
import Link from 'next/link';

type Props = { searchParams: { id?: string } };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return {
    title: '⚠️ URGENT WALLET ALERT',
    description: 'Check your wallet activity immediately.',
    openGraph: {
      images: [`/poop-${searchParams.id || 'classic'}.png`], // Картинка-превью в мессенджере
    },
  };
}

export default function PrankPage({ searchParams }: Props) {
  const id = searchParams.id || 'classic';
  
  const content: Record<string, { title: string; text: string; img: string }> = {
    classic: { title: "YOU GOT POOPED", text: "Expecting alpha? You got crypto poop.", img: "/poop-classic.png" },
    revenge: { title: "REVENGE POOP", text: "Someone hit you back.", img: "/poop-revenge.png" },
    gift: { title: "A GIFT FOR YOU", text: "It's not money, it's poop.", img: "/poop-gift.png" },
  };

  const data = content[id] || content.classic;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold text-red-500 mb-6">{data.title}</h1>
      <img src={data.img} alt="Meme" className="w-64 h-64 object-contain mb-6" />
      <p className="text-xl max-w-md mb-8">{data.text}</p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link href="/api/actions/poop?type=revenge" className="bg-red-600 py-3 rounded font-bold hover:bg-red-700">
          😈 Send Revenge
        </Link>
        <Link href="/api/actions/immunity" className="bg-yellow-600 py-3 rounded font-bold hover:bg-yellow-700">
          🛡 Buy Immunity
        </Link>
      </div>
    </div>
  );
}