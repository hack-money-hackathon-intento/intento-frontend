import { useState, useEffect } from 'react';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';
import { WalletConnection } from './WalletConnection';
import MarketChart from './MarketChart';

interface Market {
  id: string;
  question: string;
  volume: string;
}

function App() {
  const [data, setData] = useState<Market[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const apiKey = process.env.REACT_APP_POLIMARKET_API_KEY;
        const apiSecret = process.env.REACT_APP_POLIMARKET_API_SECRET;
        const apiPassphrase = process.env.REACT_APP_POLIMARKET_API_PASSPHRASE;

        if (!apiKey || !apiSecret || !apiPassphrase) {
          throw new Error('Polymarket API credentials are not fully configured in .env.local');
        }

        const method = 'GET';
        const requestPath = '/v1/markets';
        const polymarketApiUrl = `https://api.polymarket.com${requestPath}`;
        const timestamp = Math.floor(Date.now() / 1000).toString();
        
        const messageToSign = timestamp + method + requestPath;

        const signature = HmacSHA256(messageToSign, apiSecret);
        const signatureB64 = Base64.stringify(signature);

        const response = await fetch(polymarketApiUrl, {
          method: method,
          headers: {
            'PMP-API-KEY': apiKey,
            'PMP-API-SIGN': signatureB64,
            'PMP-API-TIMESTAMP': timestamp,
            'PMP-API-PASSPHRASE': apiPassphrase,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleMarketClick = (market: Market) => {
    setSelectedMarket(market);
  };

  const handleBackClick = () => {
    setSelectedMarket(null);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <header className="container mx-auto p-4 md:p-8 flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold">Polymarket Trading Dashboard</h1>
        <WalletConnection />
      </header>
      <main className="container mx-auto p-4 md:p-8">
        {loading && <p className="text-lg text-gray-400">Loading statistics...</p>}
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg">
            <p className="font-bold">Error fetching data:</p>
            <pre className="text-xs mt-2 whitespace-pre-wrap">{error}</pre>
            <p className="text-sm mt-4">
              This could be due to the VPN, incorrect API keys, or a change in the Polymarket API. 
              Please also check the browser's developer console (F12) for more details.
            </p>
          </div>
        )}

        {selectedMarket ? (
          <div>
            <button onClick={handleBackClick} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mb-4">
              &larr; Back to Markets
            </button>
            <MarketChart market={selectedMarket} />
          </div>
        ) : (
          data && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.length > 0 ? data.map((market) => (
                <div key={market.id} className="bg-gray-800 rounded-lg shadow-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => handleMarketClick(market)}>
                  <h2 className="text-lg font-bold mb-2">{market.question}</h2>
                  <p className="text-sm text-gray-400 mb-2">Volume: {market.volume}</p>
                </div>
              )) : <p>No market data returned. The API call was successful but returned an empty list.</p>}
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default App;
