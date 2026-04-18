import { BrowserRouter } from 'react-router-dom';
import ExpenseTrackerScreen from './screens/ExpenseTrackerScreen';

function App() {
  return (
    <BrowserRouter>
      <ExpenseTrackerScreen />
    </BrowserRouter>
  );
}

export default App;
