import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
