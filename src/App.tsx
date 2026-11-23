import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { AnimeDetailPage } from "./pages/AnimeDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { WatchlistPage } from "./pages/WatchlistPage";
import { ManageCatalogPage } from "./pages/ManageCatalogPage";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-brand-dark text-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/animes/:id" element={<AnimeDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/manage" element={<ManageCatalogPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;