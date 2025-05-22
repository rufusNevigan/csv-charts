import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import useDataset from '../contexts/useDataset';
import detectNumericColumns from '../utils/detectNumericColumns';

function ChartCanvas(): JSX.Element {
  const { state, dispatch } = useDataset();
  const {
    headers, rows, xKey, yKey, loading,
  } = state;
  const [isChartReady, setIsChartReady] = useState(false);

  // Effect to auto-select numeric columns when data is loaded
  useEffect(() => {
    if (!headers?.length || !rows?.length) return;

    // Find numeric columns
    const numericCols = detectNumericColumns(rows, headers);
    if (numericCols.length >= 2 && !xKey && !yKey) {
      dispatch({
        type: 'SET_KEYS',
        payload: { xKey: numericCols[0], yKey: numericCols[1] },
      });
    }
  }, [headers, rows, dispatch, xKey, yKey]);

  // Set chart ready state when data is available
  useEffect(() => {
    const numericCols = headers && rows ? detectNumericColumns(rows, headers) : [];
    const hasValidData = headers && rows && xKey && yKey && !loading;
    const hasNumericColumns = numericCols.length >= 2;
    setIsChartReady(Boolean(hasValidData && hasNumericColumns));
  }, [headers, rows, xKey, yKey, loading]);

  // If loading, show loading state
  if (loading) {
    return (
      <div
        data-testid="chart-container"
        data-ready="false"
        className="flex items-center justify-center h-96 w-full bg-gray-50 rounded-lg border border-gray-200"
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
          role="status"
        />
      </div>
    );
  }

  // If no dataset is loaded, show a prompt
  if (!headers || !rows || headers.length === 0) {
    return (
      <div
        data-testid="chart-container"
        data-ready="false"
        className="text-center text-gray-500 mt-8"
      >
        Upload a CSV file to visualize data
      </div>
    );
  }

  const numericColumns = detectNumericColumns(rows, headers);
  if (numericColumns.length < 2) {
    return (
      <div
        data-testid="chart-container"
        data-ready="false"
        className="text-center text-gray-500 mt-8"
      >
        No numeric columns found in the dataset
      </div>
    );
  }

  if (!xKey || !yKey) {
    return (
      <div
        data-testid="chart-container"
        data-ready="false"
        className="text-center text-gray-500 mt-8"
      >
        Select columns to visualize
      </div>
    );
  }

  // Convert values to numbers, using 0 for missing values
  const chartData = rows.map((row) => ({
    ...row,
    [xKey]: row[xKey] === '' ? 0 : Number(row[xKey]),
    [yKey]: row[yKey] === '' ? 0 : Number(row[yKey]),
  }));

  return (
    <div
      className="block relative h-96 w-full"
      data-testid="chart-container"
      data-ready={isChartReady.toString()}
      style={{
        width: '100%',
        height: '400px',
        minHeight: '400px',
        display: 'block',
        position: 'relative',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={xKey}
            label={{ value: xKey, position: 'bottom', offset: 0 }}
            stroke="#6b7280"
            tick={{ fill: '#4b5563' }}
          />
          <YAxis
            dataKey={yKey}
            label={{
              value: yKey,
              angle: -90,
              position: 'left',
              offset: -5,
            }}
            stroke="#6b7280"
            tick={{ fill: '#4b5563' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          />
          <Bar
            dataKey={yKey}
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartCanvas;
