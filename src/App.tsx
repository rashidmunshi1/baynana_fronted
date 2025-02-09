import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Master from './MasterLayout/Master';
import { AdminRoutes } from './Route';
import './App.css';
import NotFound from './Components/NotFound';

const App: React.FC = () => {

  const token = localStorage.getItem('token');

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='*' element={<NotFound />} />
            {AdminRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<Master children={<route.component />} />}
              />
            ))}

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
