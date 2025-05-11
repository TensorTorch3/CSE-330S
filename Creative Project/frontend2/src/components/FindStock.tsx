// src/components/FindStock.tsx
import React, { useContext, useState, ChangeEvent, FormEvent } from 'react';
import { FindStockContext } from '../contexts/FindStockContext';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface FormData {
    ticker: string;
}

const FindStock: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    ticker: ""
  });

  const { findStock, loading, error, userStocks, loadingUserStocks, deleteUserStock } = useContext(FindStockContext);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.ticker.trim()) {
      await findStock(formData.ticker.trim());
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewStock = (ticker: string) => {
    navigate(`/stock/${ticker}`);
  };

  const handleDeleteStock = async (stockId: number) => {
    try {
      await deleteUserStock(stockId);
    } catch (err) {
      toast.error("Failed to remove stock from history");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-center">Find a Stock</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="ticker">Stock Ticker Symbol</label>
                  <input
                    type="text"
                    className="form-control"
                    id="ticker"
                    name="ticker"
                    placeholder="Enter ticker symbol (e.g., AAPL, MSFT, GOOGL)"
                    value={formData.ticker}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Find Stock'}
                </button>
              </form>

              {/* Previously searched stocks */}
              <div className="mt-4">
                <h4>Previously Searched Stocks</h4>
                {loadingUserStocks ? (
                  <p>Loading your stocks...</p>
                ) : userStocks.length === 0 ? (
                  <p>No stocks in your history yet.</p>
                ) : (
                  <div className="list-group">
                    {userStocks.map(stock => (
                      <div key={stock.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <button 
                          className="btn btn-link text-start p-0" 
                          onClick={() => handleViewStock(stock.ticker)}
                          style={{ textDecoration: 'none', flex: 1 }}
                        >
                          <span className="fw-bold">{stock.ticker}</span> - {stock.name}
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDeleteStock(stock.id)}
                          aria-label={`Remove ${stock.ticker} from history`}
                        >
                          <i className="bi bi-trash"></i> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="card-footer text-center">
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindStock;
