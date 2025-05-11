import React, { createContext, useState, ReactNode, useEffect, useContext, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { findStock as apiFindStock, getUserStocks, removeStock } from "../api";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

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
    // Financial metrics
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

interface UserStock {
    id: number;
    ticker: string;
    name: string;
}

interface FindStockContextType {
    stockData: StockData | null;
    loading: boolean;
    error: string | null;
    userStocks: UserStock[];
    loadingUserStocks: boolean;
    findStock: (ticker: string, navigate?: boolean, showToast?: boolean) => Promise<void>;
    clearStockData: () => void;
    fetchUserStocks: () => Promise<void>;
    deleteUserStock: (stockId: number) => Promise<void>;
}

export const FindStockContext = createContext<FindStockContextType>({
    stockData: null,
    loading: false,
    error: null,
    userStocks: [],
    loadingUserStocks: false,
    findStock: async () => {},
    clearStockData: () => {},
    fetchUserStocks: async () => {},
    deleteUserStock: async () => {}
});

interface FindStockProviderProps {
    children: ReactNode;
}

export const FindStockProvider: React.FC<FindStockProviderProps> = ({ children }) => {
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userStocks, setUserStocks] = useState<UserStock[]>([]);
    const [loadingUserStocks, setLoadingUserStocks] = useState<boolean>(false);
    const [currentTicker, setCurrentTicker] = useState<string | null>(null);
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const isFirstRender = useRef(true);

    // Fetch user's stocks when the component mounts or when the token changes
    useEffect(() => {
        if (token) {
            fetchUserStocks();
        }
    }, [token]);

    const fetchUserStocks = useCallback(async (): Promise<void> => {
        if (!token) return;

        setLoadingUserStocks(true);
        try {
            const stocks = await getUserStocks(token);
            setUserStocks(stocks);
        } catch (err: any) {
            console.error("Error fetching user stocks:", err);
            toast.error("Failed to fetch your saved stocks");
        } finally {
            setLoadingUserStocks(false);
        }
    }, [token]);

    const deleteUserStock = useCallback(async (stockId: number): Promise<void> => {
        if (!token) return;

        try {
            await removeStock(token, stockId);
            // Update the user stocks list after deletion
            setUserStocks(prevStocks => prevStocks.filter(stock => stock.id !== stockId));
            toast.success("Stock removed from your history");
        } catch (err: any) {
            console.error("Error removing stock:", err);
            toast.error("Failed to remove stock from your history");
        }
    }, [token]);

    const findStock = useCallback(async (ticker: string, shouldNavigate: boolean = true, showToast: boolean = true): Promise<void> => {
        // Skip API call if the ticker hasn't changed and it's not the first render
        if (ticker === currentTicker && !isFirstRender.current) {
            return;
        }

        // Update current ticker and mark as not first render
        setCurrentTicker(ticker);
        isFirstRender.current = false;

        setLoading(true);
        setError(null);

        try {
            const response = await apiFindStock({ ticker }, token);
            setStockData(response);

            // Only show toast if showToast is true
            if (showToast) {
                toast.success(`Successfully found stock: ${response.name} (${response.ticker})`);
            }

            // Refresh user stocks after finding a new stock
            if (token) {
                fetchUserStocks();
            }

            // Only navigate if shouldNavigate is true
            if (shouldNavigate) {
                navigate(`/stock/${response.ticker}`);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || "Failed to find stock";
            // Don't set error state since we're only showing toast notifications
            if (showToast) {
                toast.error(errorMessage);
            }
            console.error("Error finding stock:", err);
        } finally {
            setLoading(false);
        }
    }, [currentTicker, token, navigate, fetchUserStocks]);

    const clearStockData = useCallback(() => {
        setStockData(null);
        setError(null);
    }, []);

    return (
        <FindStockContext.Provider value={{ 
            stockData, 
            loading, 
            error, 
            userStocks,
            loadingUserStocks,
            findStock, 
            clearStockData,
            fetchUserStocks,
            deleteUserStock
        }}>
            {children}
        </FindStockContext.Provider>
    );
};
