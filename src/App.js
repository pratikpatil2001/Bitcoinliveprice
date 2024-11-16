import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import ChartAnnotation from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartAnnotation
);

function App() {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(null);
  const [graphData, setGraphData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Price (USD)',
        data: [],
        borderColor: '#4B40EE',
        backgroundColor: 'rgba(75, 64, 238, 0.2)',
        fill: true,
      },
    ],
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [activeSection, setActiveSection] = useState('chart');

  const fetchBitcoinPrice = async (timeframe) => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
      setPrice(response.data.bitcoin.usd);
      
      let priceChange = 0;
      if (timeframe === '1d') {
        priceChange = response.data.bitcoin.usd_24h_change;
      } else {
        priceChange = await getHistoricalPriceChange(timeframe);
      }
      setChange(priceChange);
    } catch (error) {
      console.error("Error fetching Bitcoin price:", error);
    }
  };

  const getHistoricalPriceChange = async (timeframe) => {
    let days = 1;
    switch (timeframe) {
      case '1w':
        days = 7;
        break;
      case '1m':
        days = 30;
        break;
      case '3m':
        days = 90;
        break;
      case '6m':
        days = 180;
        break;
      case 'max':
        days = 1000;
        break;
      default:
        days = 1;
    }

    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`);
      const prices = response.data.prices;
      const firstPrice = prices[0][1];
      const latestPrice = prices[prices.length - 1][1];
      const change = ((latestPrice - firstPrice) / firstPrice) * 100;
      return change;
    } catch (error) {
      console.error("Error fetching historical price change:", error);
      return 0;
    }
  };

  const fetchHistoricalData = async (timeframe) => {
    let days = 1;
    let interval = 'daily';
    switch (timeframe) {
      case '1d':
        days = 1;
        break;
      case '3d':
        days = 3;
        break;
      case '1w':
        days = 7;
        break;
      case '1m':
        days = 30;
        break;
      case '3m':
        days = 90;
        break;
      case '6m':
        days = 180;
        break;
      case 'max':
        days = 1000;
        interval = 'daily';
        break;
      default:
        days = 1;
    }

    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=${interval}`);
      const prices = response.data.prices;

      const labels = prices.map(item => new Date(item[0]).toLocaleDateString());
      const data = prices.map(item => item[1]);

      setGraphData({
        labels: labels,
        datasets: [
          {
            label: 'Price (USD)',
            data: data,
            borderColor: '#4B40EE',
            backgroundColor: 'rgba(75, 64, 238, 0.2)',
            fill: true,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  useEffect(() => {
    fetchBitcoinPrice(selectedTimeframe);
    fetchHistoricalData(selectedTimeframe);
    const interval = setInterval(() => fetchBitcoinPrice(selectedTimeframe), 60000);

    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handlePeriodChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    fetchBitcoinPrice(timeframe);
    fetchHistoricalData(timeframe);
  };

  return (
    <div className="container">
      <div className="App">
        <div className="con1">
          <div>
            <h1 id="price">
              {price ? price.toLocaleString() : 'Loading...'}<sup id="fiat">USD</sup>
            </h1>
          </div>
          <div>
            {change !== null && (
              <p className="pricechange" style={{ color: change >= 0 ? 'green' : 'red' }}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)}% ({change >= 0 ? '+' : ''}${(price * change / 100).toFixed(2)})
              </p>
            )}
          </div>
        </div>

        <div className="menu">
          <button
            className={`menu-btn ${activeSection === 'summary' ? 'active' : ''}`}
            onClick={() => handleSectionChange('summary')}
          >
            Summary
          </button>
          <button
            className={`menu-btn ${activeSection === 'chart' ? 'active' : ''}`}
            onClick={() => handleSectionChange('chart')}
          >
            Chart
          </button>
          <button
            className={`menu-btn ${activeSection === 'statistics' ? 'active' : ''}`}
            onClick={() => handleSectionChange('statistics')}
          >
            Statistics
          </button>
          <button
            className={`menu-btn ${activeSection === 'analysis' ? 'active' : ''}`}
            onClick={() => handleSectionChange('analysis')}
          >
            Analysis
          </button>
          <button
            className={`menu-btn ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => handleSectionChange('settings')}
          >
            Settings
          </button>
        </div>

        <hr className="separator" />

        {activeSection === 'chart' && (
          <div className="container2">
            <div className="fs">
              <button className="fs-btn">
                <img src="/image.png" alt="icon" id="icon" />
                FullScreen
              </button>
            </div>
            <button className="compare-btn">Compare</button>
            <div className="period">
              <button
                className={`period-btn ${selectedTimeframe === '1d' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('1d')}
              >
                1D
              </button>
              <button
                className={`period-btn ${selectedTimeframe === '3d' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('3d')}
              >
                3D
              </button>
              <button
                className={`period-btn ${selectedTimeframe === '1w' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('1w')}
              >
                1W
              </button>
              <button
                className={`period-btn ${selectedTimeframe === '1m' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('1m')}
              >
                1M
              </button>
              <button
                className={`period-btn ${selectedTimeframe === '3m' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('3m')}
              >
                3M
              </button>
              <button
                className={`period-btn ${selectedTimeframe === '6m' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('6m')}
              >
                6M
              </button>
            </div>
          </div>
        )}

        {activeSection === 'chart' && (
          <div className="chart-container">
            <Line data={graphData} />
          </div>
        )}

        {activeSection === 'summary' && <div className="summary-container">Summary Content...</div>}
      </div>
    </div>
  );
}

export default App;
