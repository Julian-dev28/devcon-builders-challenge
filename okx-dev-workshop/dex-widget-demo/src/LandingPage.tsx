import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <h2>Welcome to Our DEX Application</h2>
      <p>Experience seamless trading with our integrated OKX DEX Widget.</p>
      <Link to="/widget">
        <button>Go to DEX Widget</button>
      </Link>
    </div>
  );
};

export default LandingPage;