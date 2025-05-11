import React, { useState, useEffect } from 'react';
import { getStockChartData } from '../api';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface StockChartProps {
  ticker: string;
}

const StockChart: React.FC<StockChartProps> = ({ ticker }) => {
  const [period, setPeriod] = useState<string>('1y');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [showBollingerBands, setShowBollingerBands] = useState<boolean>(false);
  const [showRSI, setShowRSI] = useState<boolean>(false);
  const [showMACD, setShowMACD] = useState<boolean>(false);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getStockChartData(ticker, period, '1d', true);
        setChartData(data);
      } catch (err) {
        setError('Failed to fetch chart data. Please try again later.');
        console.error('Error fetching chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchChartData();
    }
  }, [ticker, period]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-3">
        <p>{error}</p>
      </div>
    );
  }

  if (!chartData || !chartData.candlestick_data || chartData.candlestick_data.length === 0) {
    return (
      <div className="alert alert-warning my-3">
        <p>No chart data available for {ticker}.</p>
      </div>
    );
  }

  // Prepare data for ApexCharts
  const candlestickSeries = [{
    name: 'Candle',
    data: chartData.candlestick_data.map((item: any) => ({
      x: new Date(item.date),
      y: [item.open, item.high, item.low, item.close]
    }))
  }];

  // Prepare Bollinger Bands data
  const bollingerBandsSeries = showBollingerBands && chartData.indicators ? [
    {
      name: 'Upper Band',
      type: 'line',
      data: chartData.indicators.bollinger_bands.map((item: any) => ({
        x: new Date(item.date),
        y: item.upper
      }))
    },
    {
      name: 'Middle Band',
      type: 'line',
      data: chartData.indicators.bollinger_bands.map((item: any) => ({
        x: new Date(item.date),
        y: item.middle
      }))
    },
    {
      name: 'Lower Band',
      type: 'line',
      data: chartData.indicators.bollinger_bands.map((item: any) => ({
        x: new Date(item.date),
        y: item.lower
      }))
    }
  ] : [];

  // Prepare RSI data
  const rsiSeries = showRSI && chartData.indicators ? [
    {
      name: 'RSI',
      data: chartData.indicators.rsi.map((item: any) => ({
        x: new Date(item.date),
        y: item.rsi
      }))
    }
  ] : [];

  // Prepare MACD data
  const macdSeries = showMACD && chartData.indicators ? [
    {
      name: 'MACD',
      type: 'line',
      data: chartData.indicators.macd.map((item: any) => ({
        x: new Date(item.date),
        y: item.macd
      }))
    },
    {
      name: 'Signal',
      type: 'line',
      data: chartData.indicators.macd.map((item: any) => ({
        x: new Date(item.date),
        y: item.signal
      }))
    },
    {
      name: 'Histogram',
      type: 'bar',
      data: chartData.indicators.macd.map((item: any) => ({
        x: new Date(item.date),
        y: item.histogram
      }))
    }
  ] : [];

  // Configure chart options
  const candlestickOptions: ApexOptions = {
    chart: {
      type: 'candlestick',
      height: 350,
      id: 'candles',
      toolbar: {
        autoSelected: 'zoom',
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    title: {
      text: `${ticker} Stock Price`,
      align: 'left'
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false
      }
    },
    yaxis: {
      tooltip: {
        enabled: true
      }
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      theme: 'dark',
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: (value) => value.toFixed(2)
      }
    }
  };

  // RSI chart options
  const rsiOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 160,
      id: 'rsi',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    title: {
      text: 'RSI (14)',
      align: 'left'
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        show: false
      }
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (val) => val.toFixed(0)
      }
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: (value) => value.toFixed(2)
      }
    },
    markers: {
      size: 3
    },
    stroke: {
      width: 2
    },
    grid: {
      borderColor: '#f1f1f1',
      padding: {
        bottom: 5,
        left: 10
      }
    },
    annotations: {
      yaxis: [
        {
          y: 30,
          borderColor: '#ff9800',
          label: {
            text: 'Oversold',
            style: {
              color: '#fff',
              background: '#ff9800'
            }
          }
        },
        {
          y: 70,
          borderColor: '#ff9800',
          label: {
            text: 'Overbought',
            style: {
              color: '#fff',
              background: '#ff9800'
            }
          }
        }
      ]
    }
  };

  // MACD chart options
  const macdOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 160,
      id: 'macd',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    title: {
      text: 'MACD (12, 26, 9)',
      align: 'left'
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        show: false
      }
    },
    yaxis: {
      tickAmount: 5,
      labels: {
        formatter: (val) => val.toFixed(2)
      }
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: (value) => value.toFixed(2)
      }
    },
    markers: {
      size: 0
    },
    stroke: {
      width: [2, 2, 0]
    },
    plotOptions: {
      bar: {
        columnWidth: '60%'
      }
    },
    colors: ['#2196f3', '#ff9800', '#00e396'],
    legend: {
      show: true
    }
  };

  return (
    <div className="stock-chart-container my-4">
      <h3>Stock Chart for {ticker}</h3>

      {/* Time period selector */}
      <div className="btn-group mb-3">
        <button 
          className={`btn ${period === '1mo' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handlePeriodChange('1mo')}
        >
          1 Month
        </button>
        <button 
          className={`btn ${period === '3mo' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handlePeriodChange('3mo')}
        >
          3 Months
        </button>
        <button 
          className={`btn ${period === '6mo' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handlePeriodChange('6mo')}
        >
          6 Months
        </button>
        <button 
          className={`btn ${period === '1y' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handlePeriodChange('1y')}
        >
          1 Year
        </button>
        <button 
          className={`btn ${period === '5y' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handlePeriodChange('5y')}
        >
          5 Years
        </button>
      </div>

      {/* Candlestick Chart */}
      <div className="chart-container mb-4">
        <ReactApexChart 
          options={candlestickOptions} 
          series={[...candlestickSeries, ...bollingerBandsSeries]} 
          type="candlestick" 
          height={350} 
        />
      </div>

      {/* RSI Chart */}
      {showRSI && chartData.indicators && (
        <div className="chart-container mb-4">
          <ReactApexChart 
            options={rsiOptions} 
            series={rsiSeries} 
            type="line" 
            height={160} 
          />
        </div>
      )}

      {/* MACD Chart */}
      {showMACD && chartData.indicators && (
        <div className="chart-container mb-4">
          <ReactApexChart 
            options={macdOptions} 
            series={macdSeries} 
            type="line" 
            height={160} 
          />
        </div>
      )}

      {/* Technical indicators toggles */}
      <div className="technical-indicators mb-4">
        <h4>Technical Indicators</h4>
        <div className="form-check mb-2">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="bollingerBands" 
            checked={showBollingerBands}
            onChange={() => setShowBollingerBands(!showBollingerBands)}
          />
          <label className="form-check-label" htmlFor="bollingerBands">
            Bollinger Bands (20)
          </label>
        </div>
        <div className="form-check mb-2">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="rsi" 
            checked={showRSI}
            onChange={() => setShowRSI(!showRSI)}
          />
          <label className="form-check-label" htmlFor="rsi">
            Relative Strength Index (14)
          </label>
        </div>
        <div className="form-check mb-2">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="macd" 
            checked={showMACD}
            onChange={() => setShowMACD(!showMACD)}
          />
          <label className="form-check-label" htmlFor="macd">
            MACD (12, 26, 9)
          </label>
        </div>
      </div>

      {/* Indicator descriptions */}
      {chartData.indicators && (
        <div className="indicator-descriptions">
          <h4>Indicator Descriptions</h4>

          {showBollingerBands && (
            <div className="card mb-3">
              <div className="card-header bg-primary text-white">
                {chartData.indicators.descriptions.bollinger_bands.name}
              </div>
              <div className="card-body">
                <p>{chartData.indicators.descriptions.bollinger_bands.description}</p>
                <p><strong>Interpretation:</strong> {chartData.indicators.descriptions.bollinger_bands.interpretation}</p>
              </div>
            </div>
          )}

          {showRSI && (
            <div className="card mb-3">
              <div className="card-header bg-primary text-white">
                {chartData.indicators.descriptions.rsi.name}
              </div>
              <div className="card-body">
                <p>{chartData.indicators.descriptions.rsi.description}</p>
                <p><strong>Interpretation:</strong> {chartData.indicators.descriptions.rsi.interpretation}</p>
              </div>
            </div>
          )}

          {showMACD && (
            <div className="card mb-3">
              <div className="card-header bg-primary text-white">
                {chartData.indicators.descriptions.macd.name}
              </div>
              <div className="card-body">
                <p>{chartData.indicators.descriptions.macd.description}</p>
                <p><strong>Interpretation:</strong> {chartData.indicators.descriptions.macd.interpretation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockChart;
