import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Models from "./pages/Models";
import Visualizer from "./pages/Visualizer";
import About from "./pages/About";
import StarryBackground from "./components/StarryBackground"; // --- 1. Import the component ---

// This "Layout" component wraps your pages
// to keep the Navbar and Footer on every screen.
const PageLayout = () => (
  <>
    <Navbar />
    <main className="flex-grow">
      {/* Outlet renders the current route's component (Home, Models, etc.) */}
      <Outlet />
    </main>
    <Footer />
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      {/* --- 2. Add the background component here --- */}
      <StarryBackground /> 
      
      {/* --- 3. Make this div transparent so the canvas is visible ---
        The 'z-0' and 'relative' establish a stacking context
        above the background's 'z-[-1]'.
      */}
      <div className="relative z-0 min-h-screen flex flex-col bg-transparent text-white">
        <Routes>
          {/* All your pages are nested inside the PageLayout */}
          <Route path="/" element={<PageLayout />}>
            <Route index element={<Home />} />
            <Route path="models" element={<Models />} />
            <Route path="visualizer" element={<Visualizer />} />
            <Route path="about" element={<About />} />
            {/* You can add a 404 page here if you like */}
            <Route path="*" element={<Home />} /> 
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}