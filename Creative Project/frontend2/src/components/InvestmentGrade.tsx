import React, { useContext, useEffect } from 'react';
import { InvestmentGradeContext } from '../contexts/InvestmentGradeContext';

interface InvestmentGradeProps {
  ticker: string;
}

const InvestmentGrade: React.FC<InvestmentGradeProps> = ({ ticker }) => {
  const { gradeData, loading, error, getGrade } = useContext(InvestmentGradeContext);

  useEffect(() => {
    if (!ticker) return;
    getGrade(ticker);
  }, [ticker, getGrade]);

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Calculating investment grade...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-4">
        <h4>Error</h4>
        <p>{error}</p>
      </div>
    );
  }

  if (!gradeData) {
    return (
      <div className="alert alert-warning my-4">
        <h4>No Data</h4>
        <p>No investment grade data available.</p>
      </div>
    );
  }

  // Helper function to get badge color based on grade
  const getBadgeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'success';
      case 'B': return 'info';
      case 'C': return 'warning';
      case 'D': return 'warning text-dark';
      case 'F': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="investment-grade my-4">
      <div className="card">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h3>Investment Grade Analysis</h3>
          <div className="text-end">
            <span className={`badge bg-${getBadgeColor(gradeData.final_grade)} fs-4`}>
              Grade: {gradeData.final_grade}
            </span>
            {gradeData.grade_meaning && gradeData.final_grade && (
              <div className="small text-white mt-1">
                {gradeData.grade_meaning[gradeData.final_grade]}
              </div>
            )}
          </div>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <h4>
              Final Score: {gradeData.weighted_score !== undefined 
                ? `${gradeData.weighted_score}% (Category-Weighted)` 
                : `${gradeData.score} / ${gradeData.max_score} (Simple Average)`}
            </h4>
            <p className="lead">
              This analysis grades {gradeData.name} ({gradeData.ticker}) based on key financial metrics 
              compared to industry averages and absolute thresholds. The final grade is calculated using a 
              weighted average of category scores.
            </p>
          </div>

          {gradeData.industry_averages && (
            <div className="mb-4">
              <h4>Industry Averages</h4>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Industry Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(gradeData.industry_averages).map(([metric, value]) => (
                      <tr key={metric}>
                        <td className="fw-bold">{metric}</td>
                        <td>{value !== null ? value : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {gradeData.subcategories && (
            <div className="mb-4">
              <h4>Subcategory Performance</h4>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Weight</th>
                      <th>Grade</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(gradeData.subcategories).map(([category, data]: [string, any]) => (
                      <tr key={category}>
                        <td className="fw-bold">{category}</td>
                        <td>
                          {category === "Profitability" ? "40%" : 
                           category === "Growth" ? "25%" : 
                           category === "Valuation" ? "20%" : 
                           category === "Financial Health" ? "15%" : ""}
                        </td>
                        <td>
                          <span className={`badge bg-${getBadgeColor(data.grade)}`}>
                            {data.grade}
                          </span>
                        </td>
                        <td>{data.score}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          <div className="mb-4">
            <h4>Metric Breakdown</h4>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Grade</th>
                    <th>Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(gradeData.metrics).map(([metric, details]: [string, any]) => (
                    <tr key={metric}>
                      <td className="fw-bold">{metric}</td>
                      <td>{details.value}</td>
                      <td className="text-center">
                        <span className={`badge bg-${getBadgeColor(details.grade)}`}>
                          {details.grade}
                        </span>
                      </td>
                      <td>
                        <div>{details.reason}</div>
                        <small className="text-muted">{details.explanation}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvestmentGrade;
