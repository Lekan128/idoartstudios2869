import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import SpotOnCaricature from "./pages/SpotOnCaricature";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Commission from "./pages/Commission";

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Exact URL matches with the old WordPress pages so these ranking-critical
            pages need zero redirect at cutover. Both slash forms are routed to the
            same page since either could be the one actually indexed. */}
        <Route path="/about-i-do-art-studios" element={<About />} />
        <Route path="/about-i-do-art-studios/" element={<About />} />
        <Route path="/spot-on-caricature" element={<SpotOnCaricature />} />
        <Route path="/spot-on-caricature/" element={<SpotOnCaricature />} />
        {/* New page, no legacy URL to honour — both slash forms routed so the
            static /styles/index.html head and in-app links agree. */}
        <Route path="/styles" element={<Commission />} />
        <Route path="/styles/" element={<Commission />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
    </MainLayout>
  );
}
