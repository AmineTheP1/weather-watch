import { useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        <h1>Weather Watch</h1>
        <div className="header-right">
          <p className="developer-name">By Amine Aichane</p>
          <button 
            className="info-button"
            onClick={() => setShowInfo(!showInfo)}
            aria-label="Information"
          >
            <FaInfoCircle />
          </button>
        </div>
      </div>
      
      {showInfo && (
        <div className="info-modal">
          <div className="info-content">
            <h2>About PM Accelerator</h2>
            <p>
              Product Manager Accelerator (PMA) is a company dedicated to accelerating 
              product management careers through training, mentorship, and community support.
            </p>
            <p>
              Visit the LinkedIn page:{' '}
              <a 
                href="https://www.linkedin.com/school/pmaccelerator/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Product Manager Accelerator
              </a>
            </p>
            <button onClick={() => setShowInfo(false)}>Close</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
