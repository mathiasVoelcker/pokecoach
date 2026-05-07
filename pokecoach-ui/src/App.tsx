import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import './App.css';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

function App() {
	  return (
	    <div className="App">
	      <BrowserRouter>
	        <Routes>
	          <Route path="/" element={<Index />} />
	          <Route path="*" element={<NotFound />} />
	        </Routes>
	      </BrowserRouter>
	      <Toaster richColors position="top-right" />
	    </div>
	  );
}

export default App;
