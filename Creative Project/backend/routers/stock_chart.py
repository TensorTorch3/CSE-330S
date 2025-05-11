from fastapi import APIRouter, HTTPException
import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

router = APIRouter()

@router.get("/history/{ticker}")
def get_stock_history(
    ticker: str,
    period: str = "1y",
    interval: str = "1d",
    include_indicators: bool = True
) -> Dict[str, Any]:
    """
    Get historical stock data with optional technical indicators.
    
    Parameters:
    - ticker: Stock ticker symbol
    - period: Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
    - interval: Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)
    - include_indicators: Whether to include technical indicators
    
    Returns:
    - Dictionary with historical data and indicators
    """
    try:
        # Get stock data from yfinance
        stock = yf.Ticker(ticker)
        
        # Get historical data
        hist = stock.history(period=period, interval=interval)
        
        # Reset index to make Date a column
        hist = hist.reset_index()
        
        # Convert dates to string format for JSON serialization
        hist['Date'] = hist['Date'].dt.strftime('%Y-%m-%d %H:%M:%S')
        
        # Prepare data for candlestick chart
        candlestick_data = []
        for _, row in hist.iterrows():
            candlestick_data.append({
                'date': row['Date'],
                'open': row['Open'],
                'high': row['High'],
                'low': row['Low'],
                'close': row['Close'],
                'volume': row['Volume']
            })
        
        result = {
            "ticker": ticker,
            "candlestick_data": candlestick_data,
        }
        
        # Calculate technical indicators if requested
        if include_indicators:
            # Create a DataFrame with just the closing prices for indicator calculations
            df = hist[['Date', 'Close']].copy()
            df.set_index('Date', inplace=True)
            
            # 1. Bollinger Bands (20)
            window = 20
            rolling_mean = df['Close'].rolling(window=window).mean()
            rolling_std = df['Close'].rolling(window=window).std()
            
            upper_band = rolling_mean + (rolling_std * 2)
            lower_band = rolling_mean - (rolling_std * 2)
            
            bollinger_bands = []
            for i, (date, close) in enumerate(zip(hist['Date'], hist['Close'])):
                if i >= window - 1:  # Only include data points where BB is defined
                    bollinger_bands.append({
                        'date': date,
                        'middle': rolling_mean.iloc[i],
                        'upper': upper_band.iloc[i],
                        'lower': lower_band.iloc[i],
                        'close': close
                    })
            
            # 2. Relative Strength Index (14)
            window = 14
            delta = df['Close'].diff()
            gain = delta.where(delta > 0, 0)
            loss = -delta.where(delta < 0, 0)
            
            avg_gain = gain.rolling(window=window).mean()
            avg_loss = loss.rolling(window=window).mean()
            
            # Calculate RS and RSI
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))
            
            rsi_data = []
            for i, (date, rsi_val) in enumerate(zip(hist['Date'], rsi)):
                if i >= window and not np.isnan(rsi_val):  # Only include data points where RSI is defined
                    rsi_data.append({
                        'date': date,
                        'rsi': rsi_val
                    })
            
            # 3. MACD (12, 26, 9)
            exp1 = df['Close'].ewm(span=12, adjust=False).mean()
            exp2 = df['Close'].ewm(span=26, adjust=False).mean()
            macd_line = exp1 - exp2
            signal_line = macd_line.ewm(span=9, adjust=False).mean()
            histogram = macd_line - signal_line
            
            macd_data = []
            for i, (date, macd, signal, hist_val) in enumerate(zip(hist['Date'], macd_line, signal_line, histogram)):
                if not np.isnan(macd) and not np.isnan(signal):  # Only include data points where MACD is defined
                    macd_data.append({
                        'date': date,
                        'macd': macd,
                        'signal': signal,
                        'histogram': hist_val
                    })
            
            # Add indicators to result
            result["indicators"] = {
                "bollinger_bands": bollinger_bands,
                "rsi": rsi_data,
                "macd": macd_data,
                "descriptions": {
                    "bollinger_bands": {
                        "name": "Bollinger Bands (20)",
                        "description": "Bollinger Bands are volatility bands placed above and below a moving average. They consist of a middle band (20-day SMA), an upper band (20-day SMA + 2 standard deviations), and a lower band (20-day SMA - 2 standard deviations).",
                        "interpretation": "When price touches or exceeds the upper band, the stock may be overbought. When price touches or falls below the lower band, the stock may be oversold. The width of the bands indicates volatility - wider bands suggest higher volatility."
                    },
                    "rsi": {
                        "name": "Relative Strength Index (14)",
                        "description": "RSI is a momentum oscillator that measures the speed and change of price movements on a scale from 0 to 100.",
                        "interpretation": "Traditional interpretation considers RSI values over 70 as overbought and values below 30 as oversold. Current RSI value: " + (f"{rsi.iloc[-1]:.2f}" if not rsi.empty and not np.isnan(rsi.iloc[-1]) else "N/A")
                    },
                    "macd": {
                        "name": "MACD (12, 26, 9)",
                        "description": "MACD (Moving Average Convergence Divergence) is a trend-following momentum indicator that shows the relationship between two moving averages of a security's price.",
                        "interpretation": "When the MACD line crosses above the signal line, it's a bullish signal. When it crosses below, it's bearish. The histogram represents the difference between MACD and signal line - positive values are bullish, negative values are bearish."
                    }
                }
            }
        
        return result
    
    except Exception as e:
        if "Symbol" in str(e) and "not found" in str(e):
            raise HTTPException(status_code=404, detail=f"Stock ticker '{ticker}' not found")
        raise HTTPException(status_code=500, detail=f"Unable to fetch stock data: {str(e)}")