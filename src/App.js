import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home.jsx';
import CocktailDetails from './CocktailDetails.jsx';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cocktail/:cocktailId" element={<CocktailDetails />} />
      </Routes>
    </Router>
  );
};

export default App;