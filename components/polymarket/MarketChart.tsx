import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';

interface Market {
  id: string;
  question: string;
  volume: string;
}

interface MarketChartProps {
  market: Market;
}

interface PriceData {
  timestamp: string;
  price: string;
}

function MarketChart({ market }: MarketChartProps) {
  const [data, setData] = useState<PriceData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const apiKey = process.env.REACT_APP_POLIMARKET_API_KEY;
        const apiSecret = process.env.REACT_APP_POLIMARKET_API_SECRET;
        const apiPassphrase = process.env.REACT_APP_POLIMARKET_API_PASSPHRASE;

        if (!apiKey || !apiSecret || !apiPassphrase) {
          throw new Error('Polymarket API credentials are not fully configured in .env.local');
        }

        const method = 'GET';
        const requestPath = `/v1/markets/${market.id}/prices`;
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
  }, [market.id]);

  const formattedData = data?.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    price: parseFloat(d.price)
  }));

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">{market.question}</h2>
      {loading && <p className="text-lg text-gray-400">Loading chart...</p>}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg">
          <p className="font-bold">Error fetching price data:</p>
          <pre className="text-xs mt-2 whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      {formattedData && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="time" stroke="#A0AEC0" />
            <YAxis stroke="#A0AEC0" domain={[0, 1]} />
            <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} />
            <Legend />
            <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default MarketChart;
