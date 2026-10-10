import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL : 'https://jinustan-sharon-reimagined.neonbloom64.chatgpt.site'),title:'Jinustan & Sharon — The Beginning of Forever',description:'Join Jinustan Raj and Sharon Roja for their wedding reception on 20 October 2026, 5:30 PM, at Fr. Lopez Hall, Colachel.',openGraph:{title:'Jinustan & Sharon — You’re Invited',description:'20 October 2026 · 5:30 PM · Fr. Lopez Hall, Colachel',images:['/images/couple.webp']},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
