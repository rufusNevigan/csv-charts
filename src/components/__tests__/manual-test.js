// Manual test script with enhanced logging and React-like behavior
const mockData = {
  file: null,
  data: [
    { name: 'Alice', age: '25', score: '95', grade: 'A' },
    { name: 'Bob', age: '30', score: '85', grade: 'B' },
    { name: 'Charlie', age: '35', score: '75', grade: 'C' },
  ],
  headers: ['name', 'age', 'score', 'grade'],
  loading: false,
  error: null,
  modalError: null,
  warning: null,
  selectedX: null,
  selectedY: null,
};

// Mock state management
let currentState = { ...mockData };
const listeners = new Set();

function dispatch(action) {
  console.log('[Dispatch]', action);
  switch (action.type) {
    case 'SET_KEYS':
      currentState = {
        ...currentState,
        selectedX: action.payload.x,
        selectedY: action.payload.y,
      };
      break;
    case 'SET_MODAL_ERROR':
      currentState = {
        ...currentState,
        modalError: action.payload,
      };
      break;
    case 'CLEAR_MODAL_ERROR':
      currentState = {
        ...currentState,
        modalError: null,
      };
      break;
  }
  console.log('[State Updated]', currentState);
  listeners.forEach(listener => listener(currentState));
}

// Subscribe to state changes
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Step 1: Initial render and setup
console.log('[Setup] Initial render');
const app = document.createElement('div');
app.innerHTML = `
  <div>
    <select id="x-axis" aria-label="X Axis">
      <option value="">Select X axis</option>
      ${mockData.headers.map(h => `<option value="${h}">${h}</option>`).join('')}
    </select>
    <select id="y-axis" aria-label="Y Axis">
      <option value="">Select Y axis</option>
      ${mockData.headers.map(h => `<option value="${h}" ${!['age', 'score'].includes(h) ? 'disabled' : ''}>${h}</option>`).join('')}
    </select>
    <div id="chart-container" data-testid="chart-container" data-ready="false"></div>
    ${currentState.modalError ? `<div id="error-modal" role="dialog">${currentState.modalError}</div>` : ''}
  </div>
`;
document.body.appendChild(app);

// Step 2: Get elements and setup state subscriber
console.log('[Setup] Getting elements');
const xAxisSelect = document.getElementById('x-axis');
const yAxisSelect = document.getElementById('y-axis');
const chartContainer = document.getElementById('chart-container');

// Update UI when state changes
const unsubscribe = subscribe((state) => {
  console.log('[State Change] Updating UI', state);
  
  // Update dropdowns
  if (xAxisSelect && state.selectedX) xAxisSelect.value = state.selectedX;
  if (yAxisSelect && state.selectedY) yAxisSelect.value = state.selectedY;
  
  // Update chart ready state
  if (chartContainer) {
    const isReady = Boolean(state.selectedX && state.selectedY && state.selectedX !== state.selectedY);
    chartContainer.setAttribute('data-ready', isReady.toString());
  }
  
  // Handle modal
  const existingModal = document.getElementById('error-modal');
  if (state.modalError && !existingModal) {
    const modal = document.createElement('div');
    modal.id = 'error-modal';
    modal.setAttribute('role', 'dialog');
    modal.textContent = state.modalError;
    app.appendChild(modal);
  } else if (!state.modalError && existingModal) {
    existingModal.remove();
  }
});

// Step 3: Auto-select initial values
console.log('[Test] Setting initial values');
dispatch({
  type: 'SET_KEYS',
  payload: { x: 'age', y: 'score' }
});

// Wait for initial state to settle
setTimeout(() => {
  console.log('[Test] Initial state check', {
    xValue: xAxisSelect.value,
    yValue: yAxisSelect.value,
    readyState: chartContainer?.getAttribute('data-ready'),
    modalError: currentState.modalError
  });

  // Step 4: Change X axis
  console.log('[Test] Changing X axis to score');
  xAxisSelect.value = 'score';
  xAxisSelect.dispatchEvent(new Event('change', { bubbles: true }));
  dispatch({
    type: 'SET_KEYS',
    payload: { x: 'score', y: yAxisSelect.value }
  });

  // Step 5: Verify after X change
  console.log('[Test] After X axis change', {
    xValue: xAxisSelect.value,
    yValue: yAxisSelect.value,
    readyState: chartContainer?.getAttribute('data-ready'),
    modalError: currentState.modalError
  });

  // Step 6: Change Y axis
  console.log('[Test] Changing Y axis to age');
  yAxisSelect.value = 'age';
  yAxisSelect.dispatchEvent(new Event('change', { bubbles: true }));
  dispatch({
    type: 'SET_KEYS',
    payload: { x: xAxisSelect.value, y: 'age' }
  });

  // Step 7: Final verification
  console.log('[Test] Final state', {
    xValue: xAxisSelect.value,
    yValue: yAxisSelect.value,
    readyState: chartContainer?.getAttribute('data-ready'),
    modalError: currentState.modalError
  });

  // Cleanup
  unsubscribe();
  document.body.removeChild(app);
}, 100); 