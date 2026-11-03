import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';
export const metadata:Metadata={title:'Discrete Protocol · Zero to Hero',description:'7 sektor interaktif untuk menguasai Matematika Diskrit LC75. Belajar, bedah soal, buka gerbang.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>}
