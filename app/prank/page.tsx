'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PrankContent() {
  const params = useSearchParams();
  const id = params.get('id') || 'classic';
  const content: any = {
    classic: { title: "URGENT WALLET ALERT", text: "You were expecting alpha. You received crypto poop.", img: "/poop-classic.png" },
    revenge: { title: "REVENGE MODE", text: "Someone sent you crypto poop. Time to send it back.", img: "/poop-revenge.png" },
    gift: { title: "YOU HAVE BEEN POOPED", text: "This is not financial advice. This is poop.", img: "/poop-gift.png" },
  };
  const data = content[id] || content.classic;

  return (
    <div style={{ background:'#000', color:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, textAlign:'center', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'red', fontSize:'3rem' }}>{data.title}</h1>
      <img src={data.img} style={{ maxWidth:400, margin:'30px 0' }} />
      <p style={{ fontSize:'1.5rem', maxWidth:600 }}>{data.text}</p>
      <div style={{ marginTop:50, display:'flex', flexDirection:'column', gap:15 }}>
        <a href="/api/actions/poop?type=revenge" style={{color:'#00ff00', textDecoration:'none', fontSize:'1.2rem'}}>😈 Send back (Revenge)</a>
        <a href="/api/actions/immunity" style={{color:'#ffd700', textDecoration:'none', fontSize:'1.2rem'}}>🛡 Buy Immunity Certificate</a>
      </div>
    </div>
  );
}

export default function Page() { return <Suspense fallback={<div>Loading...</div>}><PrankContent/></Suspense>; }