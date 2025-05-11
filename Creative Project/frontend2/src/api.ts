// src/api.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000';

interface Credentials {
  username: string;
  password: string;
  [key: string]: string;
}

interface UserData {
  username: string;
  email: string;
  password: string;
  [key: string]: any;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  // Include additional fields if returned by your API
}

interface User {
  username: string;
  email: string;
  // Add any other fields returned by /users/me/
}

const loginUser = async (credentials: Credentials): Promise<LoginResponse> => {
  try {
    const params = new URLSearchParams();
    for (const key in credentials) {
      params.append(key, credentials[key]);
    }

    const response = await axios.post<LoginResponse>(
      `${API_URL}/auth/token`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

const registerUser = async (userData: UserData): Promise<void> => {
  try {
    await axios.post(`${API_URL}/auth/register`, userData);
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

const fetchUserProfile = async (token: string): Promise<User> => {
  try {
    const response = await axios.get<User>(`${API_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fetch user profile error:", error);
    throw error;
  }
};

const deleteUser = async (username: string, password: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/auth/delete-user`, {
      data: { username, password }
    });
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
};

interface StockData {
  exists: boolean;
  ticker: string;
  name: string;
  price: number;
  currency: string;
  marketCap: number;
  sector: string;
  industry: string;
  website: string;
  description: string;
  freeCashFlowMargin: number;
  returnOnEquity: number;
  revenueGrowth: number;
  epsGrowth: number;
  peRatio: number;
  pfcfRatio: number;
  debtToEquity: number;
  interestCoverage: number;
  shareBuybackTrend: number;
  grossMargin: number;
}

interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface BollingerBandsData {
  date: string;
  middle: number;
  upper: number;
  lower: number;
  close: number;
}

interface RSIData {
  date: string;
  rsi: number;
}

interface MACDData {
  date: string;
  macd: number;
  signal: number;
  histogram: number;
}

interface IndicatorDescription {
  name: string;
  description: string;
  interpretation: string;
}

interface StockChartData {
  ticker: string;
  candlestick_data: CandlestickData[];
  indicators?: {
    bollinger_bands: BollingerBandsData[];
    rsi: RSIData[];
    macd: MACDData[];
    descriptions: {
      bollinger_bands: IndicatorDescription;
      rsi: IndicatorDescription;
      macd: IndicatorDescription;
    };
  };
}

interface MetricGrade {
  value: number | string;
  grade: string;
  reason: string;
  explanation: string;
  weight: number;
}

interface SubcategoryGrade {
  score: number;
  grade: string;
}

interface InvestmentGradeData {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  industry_averages?: {
    [key: string]: number | null;
  };
  metrics: {
    [key: string]: MetricGrade;
  };
  subcategories?: {
    [key: string]: SubcategoryGrade;
  };
  score: number;
  max_score: number;
  weighted_score?: number;  // New weighted score based on category weights
  final_grade: string;
  grade_meaning?: {
    [key: string]: string;
  };
}

interface TickerRequest {
  ticker: string;
}

const findStock = async (tickerRequest: TickerRequest, token?: string): Promise<StockData> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get<StockData>(
      `${API_URL}/findstock/search/${tickerRequest.ticker}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Find stock error:", error);
    throw error;
  }
};

const getInvestmentGrade = async (ticker: string): Promise<InvestmentGradeData> => {
  try {
    const response = await axios.get<InvestmentGradeData>(
      `${API_URL}/investment/grade/${ticker}`
    );
    return response.data;
  } catch (error) {
    console.error("Investment grade error:", error);
    throw error;
  }
};

interface UserStock {
  id: number;
  ticker: string;
  name: string;
}

const getUserStocks = async (token: string): Promise<UserStock[]> => {
  try {
    const response = await axios.get<UserStock[]>(`${API_URL}/user-stocks/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Get user stocks error:", error);
    throw error;
  }
};

const saveStock = async (token: string, ticker: string, name: string): Promise<UserStock> => {
  try {
    const response = await axios.post<UserStock>(
      `${API_URL}/user-stocks/`,
      { ticker, name },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Save stock error:", error);
    throw error;
  }
};

const removeStock = async (token: string, stockId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/user-stocks/${stockId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Remove stock error:", error);
    throw error;
  }
};

const getStockChartData = async (
  ticker: string,
  period: string = "1y",
  interval: string = "1d",
  includeIndicators: boolean = true
): Promise<StockChartData> => {
  try {
    const response = await axios.get<StockChartData>(
      `${API_URL}/stock-chart/history/${ticker}`,
      {
        params: {
          period,
          interval,
          include_indicators: includeIndicators
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Get stock chart data error:", error);
    throw error;
  }
};

export { 
  loginUser, 
  registerUser, 
  fetchUserProfile, 
  deleteUser, 
  findStock, 
  getInvestmentGrade,
  getUserStocks,
  saveStock,
  removeStock,
  getStockChartData
};
