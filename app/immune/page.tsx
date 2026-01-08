export default function ImmunePage() {
  const tweet = encodeURIComponent("🛡 I am officially POOP‑IMMUNE. No crypto poop can stick to me. Get yours here: https://shit-sender.vercel.app/api/actions/immunity");
  return (
    <div style={{ background:'#050505', color:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:40, fontFamily:'sans-serif' }}>
      <img src="/immunity-badge.png" style={{ maxWidth:320, marginBottom:30 }} />
      <h1 style={{ fontSize:'3rem' }}>POOP IMMUNITY CERTIFICATE</h1>
      <p style={{ maxWidth:600, marginTop:20 }}>Certified by Poop Protocol. Blockchain secured by vibes.</p>
      <div style={{ marginTop:40 }}>
        <a href={`https://twitter.com/intent/tweet?text=${tweet}`} target="_blank" style={{ background:'#1d9bf0', color:'#fff', padding:'15px 30px', borderRadius:'30px', textDecoration:'none', fontWeight:'bold' }}>Post to X</a>
      </div>
    </div>
  );
}