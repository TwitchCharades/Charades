import { router } from './routes/router';
import { RouterProvider } from 'react-router';


const App = () => {
  return (
    <RouterProvider router={router} />
  );
}

export default App
