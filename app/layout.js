import './globals.css';

export const metadata = {
  title: 'Manhwa Studio AI - Dark Edition',
  description: 'Buat komik manhwa dengan AI, potong panel otomatis, dan ekspor!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-inter">
        {children}
      </body>
    </html>
  )
}
