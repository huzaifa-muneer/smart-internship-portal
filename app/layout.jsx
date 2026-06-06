import './globals.css';

export const metadata = {
  title: 'Smart Internship Intelligence Portal',
  description: 'AI-powered verified internship matching portal for university students. Created, Researched & Managed by Malik Mohazin.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
