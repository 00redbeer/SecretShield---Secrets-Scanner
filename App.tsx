
import React from 'react';
// Fix: Use namespace import to bypass missing exported member errors for HashRouter, Routes, and Route
import * as ReactRouterDOM from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import NewScan from './components/NewScan';
import ScanDetails from './components/ScanDetails';
import History from './components/History';
import Settings from './components/Settings';

const { HashRouter, Routes, Route } = ReactRouterDOM as any;
const Router = HashRouter;

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-scan" element={<NewScan />} />
          <Route path="/scan/:id" element={<ScanDetails />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
