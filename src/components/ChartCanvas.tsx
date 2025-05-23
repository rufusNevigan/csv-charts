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

  // Auto-detect numeric columns if not already set
  useEffect(() => {
    if (headers && rows && !xKey && !yKey) {
      const { xKey: detectedXKey, yKey: detectedYKey } = detectNumericColumns(headers, rows);
      if (detectedXKey && detectedYKey) {
        dispatch({ type: 'SET_KEYS', payload: { xKey: detectedXKey, yKey: detectedYKey } });
      }
    }
  }, [headers, rows, xKey, yKey, dispatch]);

  // Set chart ready state when data is available
  useEffect(() => {
    if (headers && rows && xKey && yKey && !loading) {
      setIsChartReady(true);
    } else {
      setIsChartReady(false);
    }
  }, [headers, rows, xKey, yKey, loading]);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 w-full bg-gray-50 rounded-lg border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" role="status" />
      </div>
    );
  }

  // If no dataset is loaded, show a prompt
  if (!headers || !rows || headers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 w-full bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">Upload a CSV file to visualize data</p>
      </div>
    );
  }

  // If no numeric columns are detected, show a message
  if (!xKey || !yKey) {
    return (
      <div className="flex items-center justify-center h-96 w-full bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No numeric columns found in the dataset</p>
      </div>
    );
  }

  // Convert string values to numbers for the chart
  const chartData = rows.map((row: Record<string, string>) => ({
    [xKey]: Number(row[xKey]),
    [yKey]: Number(row[yKey]),
  }));

  return (
    <div
      className="block relative h-96 w-full"
      data-testid="chart-container"
      data-ready={isChartReady}
      style={{
        width: '100%',
        height: '400px',
        minHeight: '400px',
        visibility: 'visible',
        display: 'block',
        position: 'relative',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20, right: 30, left: 20, bottom: 5,
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
              value: yKey, angle: -90, position: 'left', offset: -5,
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
