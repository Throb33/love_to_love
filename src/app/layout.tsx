import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Love to Love 相亲平台',
  description: '面向城市白领的真实相亲 Web 平台',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
