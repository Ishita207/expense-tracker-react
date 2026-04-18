import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders dashboard navigation heading', () => {
  render(<App />);
  expect(screen.getByText(/expense dashboard/i)).toBeInTheDocument();
});
