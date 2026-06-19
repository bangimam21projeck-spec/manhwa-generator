import './globals.css';

export const metadata = {
  title: 'Manhwa Studio AI - Dark Mode',
  description: 'Buat komik manhwa dengan AI, potong panel otomatis, dan ekspor!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gradient-to-br from-gray-900 via-purple-950 to-black min-h-screen text-white font-inter">
        {children}
      </body>
    </html>
  )
}
