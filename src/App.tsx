import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home, Faq, Tradutor, Discord } from './pages';

import { Sidebar } from './components/Sidebar';
import { BlogDetails } from './components/BlogDetails';
export function App() {
  return (
    <Router>
      <div>
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/faq/:id" element={<BlogDetails />} />
          <Route path="/tradutor" element={<Tradutor />} />
          <Route path="/discord" element={<Discord />} />
        </Routes>
      </div>
    </Router>
  );
}
