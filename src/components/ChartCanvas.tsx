/* eslint-disable no-console */
import { useEffect, useState, useCallback } from 'react';
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
    headers, data, filteredData, selectedX, selectedY, loading,
  } = state;

  const [isChartReady, setIsChartReady] = useState(false);
  const [chartData, setChartData] = useState<Record<string, string | number>[]>([]);

  // Function to prepare chart data - use filteredData for chart rendering
  const prepareChartData = useCallback(() => {
    if (!filteredData || !selectedX || !selectedY) return [];

    let hasWarning = false;
    const processedData = filteredData.map((row) => {
      const xValue = row[selectedX];
      const yValue = row[selectedY];

      // Check for missing values
      if (xValue === '' || yValue === '') {
        hasWarning = true;
      }

      return {
        ...row,
        [selectedX]: xValue === '' ? 0 : Number(xValue),
        [selectedY]: yValue === '' ? 0 : Number(yValue),
      };
    });

    // Set warning outside of the data processing to avoid side effects
    if (hasWarning) {
      setTimeout(() => {
        dispatch({
          type: 'SET_WARNING',
          payload: 'Warning: Some rows contain missing values',
        });
      }, 0);
    }

    return processedData;
  }, [filteredData, selectedX, selectedY, dispatch]);

  // Effect to handle error messages and chart ready state - only run when not loading
  useEffect(() => {
    if (loading) return undefined; // Don't run any logic when loading

    // Reset chart-specific error state, but don't clear file parsing errors
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_WARNING', payload: null });

    // Basic data validation - use original data for column detection
    if (!headers?.length || !data?.length) {
      setIsChartReady(false);
      return undefined;
    }

    const numericCols = detectNumericColumns(data, headers);

    // Only validate and show errors if both axes are selected
    if (selectedX && selectedY) {
      // Check for same column error
      if (selectedX === selectedY) {
        dispatch({
          type: 'SET_MODAL_ERROR',
          payload: 'X and Y axes must be different columns',
        });
        setIsChartReady(false);
        return undefined;
      }

      // Check for non-numeric column error
      if (!numericCols.includes(selectedX) || !numericCols.includes(selectedY)) {
        dispatch({
          type: 'SET_MODAL_ERROR',
          payload: 'Selected columns must be numeric',
        });
        setIsChartReady(false);
        return undefined;
      }

      // Both axes are selected and valid - prepare chart data
      const newChartData = prepareChartData();
      setChartData(newChartData);

      // Set chart ready when we have valid data
      if (newChartData.length > 0) {
        setIsChartReady(true);
      } else {
        setIsChartReady(false);
      }
    } else {
      // One or both axes not selected - set to false
      setIsChartReady(false);
    }

    // Cleanup function to prevent memory leaks
    return () => {
      // Clear any pending timeouts or cleanup if needed
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers, data, filteredData, selectedX, selectedY, loading, prepareChartData]);

  // Reset states when data changes - only run when not loading
  useEffect(() => {
    if (loading) return; // Don't reset states when loading

    if (!data?.length || !headers?.length) {
      setIsChartReady(false);
      setChartData([]);
      dispatch({
        type: 'SET_KEYS',
        payload: { x: null, y: null },
      });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_WARNING', payload: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, headers, loading]);

  // Effect to handle "no numeric columns" error - only run when not loading
  useEffect(() => {
    if (loading || !headers || !data || headers.length === 0) {
      return;
    }

    const numericColumns = detectNumericColumns(data, headers);
    if (numericColumns.length < 2) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'No numeric columns found in the dataset',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers, data, loading]);

  // Loading state takes absolute precedence
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

  if (!headers || !data || headers.length === 0) {
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

  const numericColumns = detectNumericColumns(data, headers);

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

  if (!selectedX || !selectedY) {
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

  return (
    <div
      className="block relative h-96 w-full"
      data-testid="chart-container"
      data-ready={isChartReady.toString()}
      style={{
        width: '100%',
        height: '400px',
        minWidth: '300px',
        minHeight: '400px',
        display: 'block',
        position: 'relative',
      }}
    >
      <ResponsiveContainer width="100%" height={400} aspect={undefined}>
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
            dataKey={selectedX}
            label={{ value: selectedX, position: 'bottom', offset: 0 }}
            stroke="#6b7280"
            tick={{ fill: '#4b5563' }}
          />
          <YAxis
            dataKey={selectedY}
            label={{
              value: selectedY,
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
            dataKey={selectedY}
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
