import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component for testing
const ExampleComponent = ({ title = 'Test Title' }: { title?: string }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>This is a test component</p>
      <button>Click me</button>
    </div>
  );
};

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    render(<ExampleComponent />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Title');
    expect(screen.getByText('This is a test component')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<ExampleComponent title="Custom Title" />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Custom Title');
  });

  it('has accessible button', () => {
    render(<ExampleComponent />);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('type', 'button');
  });
});