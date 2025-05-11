import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FindStockContext } from '../contexts/FindStockContext';
import { AuthContext } from '../contexts/AuthContext';
import InvestmentGrade from './InvestmentGrade';
import StockChart from './StockChart';

const StockDetails: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const { stockData, loading, error, findStock: contextFindStock } = useContext(FindStockContext);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showInvestmentGrade, setShowInvestmentGrade] = useState<boolean>(false);
  const [showStockChart, setShowStockChart] = useState<boolean>(true);

  useEffect(() => {
    // Always fetch the stock data when the ticker changes
    if (ticker) {
      // Pass false for both navigation and toast to prevent infinite loop and repeated notifications
      contextFindStock(ticker, false, false);
    }
    // contextFindStock is now memoized and won't change on each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  const handleBack = () => {
    navigate('/findstock');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading stock data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4>No Stock Data</h4>
          <p>No stock data available. Please search for a stock.</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h2>{stockData.name} ({stockData.ticker})</h2>
            <div className="btn-group">
              <button 
                className={`btn ${showStockChart ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => {
                  setShowStockChart(true);
                  setShowInvestmentGrade(false);
                }}
              >
                Stock Chart
              </button>
              <button 
                className={`btn ${showInvestmentGrade ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => {
                  setShowInvestmentGrade(true);
                  setShowStockChart(false);
                }}
              >
                Investment Grade
              </button>
              <button 
                className={`btn ${!showStockChart && !showInvestmentGrade ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => {
                  setShowInvestmentGrade(false);
                  setShowStockChart(false);
                }}
              >
                Basic Info
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          {showInvestmentGrade ? (
            <InvestmentGrade ticker={stockData.ticker} />
          ) : showStockChart ? (
            <StockChart ticker={stockData.ticker} />
          ) : (
            <>
              <div className="row">
                <div className="col-md-6">
                  <h4>Stock Information</h4>
                  <table className="table">
                    <tbody>
                      <tr>
                        <th>Current Price</th>
                        <td>{stockData.price} {stockData.currency}</td>
                      </tr>
                      <tr>
                        <th>Market Cap</th>
                        <td>{stockData.marketCap.toLocaleString()} {stockData.currency}</td>
                      </tr>
                      <tr>
                        <th>Sector</th>
                        <td>{stockData.sector}</td>
                      </tr>
                      <tr>
                        <th>Industry</th>
                        <td>{stockData.industry}</td>
                      </tr>
                      {stockData.website && (
                        <tr>
                          <th>Website</th>
                          <td>
                            <a href={stockData.website} target="_blank" rel="noopener noreferrer">
                              {stockData.website}
                            </a>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h4>Description</h4>
                  <p>{stockData.description}</p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="card-footer">
          <div className="d-flex justify-content-between">
            <button className="btn btn-secondary" onClick={handleBack}>
              Back to Search
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetails;
