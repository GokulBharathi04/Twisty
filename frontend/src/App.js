import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { EnquiryProvider } from "./components/EnquiryContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Sustainability from "./pages/Sustainability";
import Applications from "./pages/Applications";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

let lenis;

const SmoothScroll = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    lenis = new Lenis({ autoRaf: true, lerp: 0.09 });
    return () => {
      lenis.destroy();
      lenis = null;
    };
  }, []);
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <EnquiryProvider>
        <SmoothScroll />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/enquire" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </EnquiryProvider>
    </BrowserRouter>
  );
}

export default App;
