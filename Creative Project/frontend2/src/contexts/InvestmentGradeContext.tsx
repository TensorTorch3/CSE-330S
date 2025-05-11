import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { getInvestmentGrade } from '../api';

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

interface InvestmentGradeContextType {
  gradeData: InvestmentGradeData | null;
  loading: boolean;
  error: string | null;
  getGrade: (ticker: string) => Promise<void>;
  clearGrade: () => void;
}

export const InvestmentGradeContext = createContext<InvestmentGradeContextType>({
  gradeData: null,
  loading: false,
  error: null,
  getGrade: async () => {},
  clearGrade: () => {},
});

interface InvestmentGradeProviderProps {
  children: ReactNode;
}

export const InvestmentGradeProvider: React.FC<InvestmentGradeProviderProps> = ({ children }) => {
  const [gradeData, setGradeData] = useState<InvestmentGradeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getGrade = useCallback(async (ticker: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getInvestmentGrade(ticker);
      setGradeData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch investment grade data');
      console.error('Error fetching investment grade:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearGrade = useCallback(() => {
    setGradeData(null);
    setError(null);
  }, []);

  return (
    <InvestmentGradeContext.Provider
      value={{
        gradeData,
        loading,
        error,
        getGrade,
        clearGrade,
      }}
    >
      {children}
    </InvestmentGradeContext.Provider>
  );
};
