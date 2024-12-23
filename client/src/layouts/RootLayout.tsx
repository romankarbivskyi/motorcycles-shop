import { ReactNode } from "react";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
