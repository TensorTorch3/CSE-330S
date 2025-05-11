// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FindStockProvider } from './contexts/FindStockContext';
import { InvestmentGradeProvider } from './contexts/InvestmentGradeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthPage from './components/AuthPage';
import FindStock from './components/FindStock';
import StockDetails from './components/StockDetails';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <FindStockProvider>
          <InvestmentGradeProvider>
            <div style={{ padding: '20px' }}>
              <ToastContainer position="top-right" autoClose={5000} />
              <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/findstock" element={<FindStock />} />
                <Route path="/stock/:ticker" element={<StockDetails />} />
              </Routes>
            </div>
          </InvestmentGradeProvider>
        </FindStockProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
