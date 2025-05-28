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
  console.log('[ChartCanvas] Component rendering');
  const { state, dispatch } = useDataset();
  const {
    headers, data, selectedX, selectedY, loading,
  } = state;
  console.log('[ChartCanvas] Current dataset state:', {
    hasHeaders: Boolean(headers?.length),
    hasData: Boolean(data?.length),
    selectedX,
    selectedY,
    loading
  });
  
  const [isChartReady, setIsChartReady] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [chartData, setChartData] = useState<Record<string, any>[]>([]);

  // Add effect to log isChartReady changes
  useEffect(() => {
    console.log('[ChartCanvas] isChartReady state changed to:', isChartReady);
  }, [isChartReady]);

  // Function to prepare chart data
  const prepareChartData = useCallback(() => {
    if (!data || !selectedX || !selectedY) return [];

    return data.map((row) => {
      const xValue = row[selectedX];
      const yValue = row[selectedY];
      
      // Check for missing values
      if (xValue === '' || yValue === '') {
        dispatch({
          type: 'SET_WARNING',
          payload: 'Warning: Some rows contain missing values'
        });
      }
      
      return {
        ...row,
        [selectedX]: xValue === '' ? 0 : Number(xValue),
        [selectedY]: yValue === '' ? 0 : Number(yValue),
      };
    });
  }, [data, selectedX, selectedY, dispatch]);

  // Effect to handle error messages and chart ready state
  useEffect(() => {
    console.log('[ChartCanvas] Validation effect triggered with:', {
      loading,
      hasHeaders: Boolean(headers?.length),
      hasData: Boolean(data?.length),
      selectedX,
      selectedY,
      hasAutoSelected,
      currentIsChartReady: isChartReady
    });

    // Reset chart-specific error state, but don't clear file parsing errors
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_WARNING', payload: null });
    // Note: Don't clear SET_MODAL_ERROR here as it might contain file parsing errors

    // Basic data validation
    if (loading || !headers?.length || !data?.length) {
      console.log('[ChartCanvas] Skipping validation - missing data or loading');
      setIsChartReady(false);
      return;
    }

    const numericCols = detectNumericColumns(data, headers);
    console.log('[ChartCanvas] Numeric columns:', numericCols);

    // Only validate and show errors if both axes are selected
    if (selectedX && selectedY) {
      console.log('[ChartCanvas] Both axes selected:', { selectedX, selectedY });
      
      // Check for same column error
      if (selectedX === selectedY) {
        console.log('[ChartCanvas] Same column selected for both axes');
        dispatch({
          type: 'SET_MODAL_ERROR',
          payload: 'X and Y axes must be different columns'
        });
        setIsChartReady(false);
        console.log('[ChartCanvas] Set isChartReady to false due to same column');
        return;
      }

      console.log('[ChartCanvas] Checking if columns are numeric:', {
        selectedX,
        selectedY,
        xIsNumeric: numericCols.includes(selectedX),
        yIsNumeric: numericCols.includes(selectedY),
        numericCols
      });

      // Check for non-numeric column error
      if (!numericCols.includes(selectedX) || !numericCols.includes(selectedY)) {
        console.log('[ChartCanvas] Non-numeric column selected:', { selectedX, selectedY, numericCols });
        dispatch({
          type: 'SET_MODAL_ERROR',
          payload: 'Selected columns must be numeric'
        });
        setIsChartReady(false);
        console.log('[ChartCanvas] Set isChartReady to false due to non-numeric column');
        return;
      }

      // Both axes are selected and valid - prepare chart data
      console.log('[ChartCanvas] Both axes are valid, preparing chart data');
      const newChartData = prepareChartData();
      console.log('[ChartCanvas] Prepared chart data:', { length: newChartData.length, data: newChartData });
      setChartData(newChartData);
      
      // Set chart ready when we have valid data
      if (newChartData.length > 0) {
        console.log('[ChartCanvas] Setting chart ready to true - valid axes and data');
        setIsChartReady(true);
        console.log('[ChartCanvas] isChartReady set to true');
      } else {
        console.log('[ChartCanvas] No chart data, setting ready to false');
        setIsChartReady(false);
      }
    } else {
      console.log('[ChartCanvas] One or both axes not selected:', { selectedX, selectedY });
      // One or both axes not selected - set to false
      setIsChartReady(false);
      console.log('[ChartCanvas] Set isChartReady to false due to missing axis selection');
    }
  }, [headers, data, selectedX, selectedY, loading, hasAutoSelected, dispatch]);

  // Effect to auto-select numeric columns when data is loaded
  useEffect(() => {
    console.log('[ChartCanvas] Auto-select effect triggered with:', {
      hasHeaders: Boolean(headers?.length),
      hasData: Boolean(data?.length),
      selectedX,
      selectedY,
      hasAutoSelected
    });
    
    if (!headers?.length || !data?.length || hasAutoSelected) {
      console.log('[ChartCanvas] Skipping auto-select - already auto-selected or missing data');
      return;
    }

    const numericCols = detectNumericColumns(data, headers);
    console.log('[ChartCanvas] Auto-select effect - numeric columns:', numericCols);
    if (numericCols.length >= 2) {
      console.log('[ChartCanvas] Auto-selecting first two numeric columns');
      dispatch({
        type: 'SET_KEYS',
        payload: { x: numericCols[0], y: numericCols[1] },
      });
      setHasAutoSelected(true);
      console.log('[ChartCanvas] Auto-select completed, hasAutoSelected set to true');
    }
  }, [headers, data, dispatch, hasAutoSelected]);

  // Reset states when data changes
  useEffect(() => {
    if (!data?.length || !headers?.length) {
      setHasAutoSelected(false);
      setIsChartReady(false);
      setChartData([]);
      dispatch({
        type: 'SET_KEYS',
        payload: { x: null, y: null },
      });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_WARNING', payload: null });
    }
  }, [data, headers, dispatch]);

  if (loading) {
    console.log('[ChartCanvas] Showing loading state');
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
    console.log('[ChartCanvas] No dataset loaded');
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
    console.log('[ChartCanvas] Not enough numeric columns');
    dispatch({
      type: 'SET_ERROR',
      payload: 'No numeric columns found in the dataset'
    });
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
    console.log('[ChartCanvas] No columns selected');
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

  console.log('[ChartCanvas] Rendering chart with data:', {
    selectedX,
    selectedY,
    isChartReady,
    dataLength: chartData.length,
  });

  console.log('[ChartCanvas] Rendered output:', { isChartReady, dataReady: isChartReady.toString() });

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
