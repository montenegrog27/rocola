import "../styles/globals.css";

export const metadata = {
  title: "Rocola",
  description: "Rocola Digital conectada a Spotify",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
