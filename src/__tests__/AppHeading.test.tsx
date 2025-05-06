import { render, screen } from '@testing-library/react';
import App from '../App';
import DatasetProvider from '../contexts/DatasetContext';

describe('App', () => {
  it('renders the correct heading text', () => {
    render(
      <DatasetProvider>
        <App />
      </DatasetProvider>,
    );
    expect(screen.getByRole('heading')).toHaveTextContent('CSV Charts');
  });
});
