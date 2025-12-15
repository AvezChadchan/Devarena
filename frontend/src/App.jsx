import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Login from './pages/LoginPage.jsx';
function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: (<Login></Login>)
    }
  ])
  return <RouterProvider router={router} />


}

export default App
