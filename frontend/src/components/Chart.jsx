import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush
} from 'recharts';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

const socket = io('http://localhost:5000'); // Adjust if using proxy

export default function Chart() {
  const [chartData, setChartData] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const chartRef = useRef(null);

  // Socket connection
  useEffect(() => {
    socket.on('chartUpdate', (newData) => {
      if (!isPaused) {
        setChartData((prev) => {
          const updated = [...prev, newData[newData.length - 1]];
          if (updated.length > 10) updated.shift();
          return updated;
        });
      }
    });

    socket.on('activeUsers', (count) => setActiveUsers(count));

    return () => {
      socket.off('chartUpdate');
      socket.off('activeUsers');
    };
  }, [isPaused]);

  const exportChart = () => {
    toPng(chartRef.current).then((dataUrl) => {
      download(dataUrl, 'realtime-chart.png');
    });
  };

  return (
    <div className="p-6 flex flex-col items-center gap-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white">📈 Real-Time Stock-Like Chart</h1>
      <p className="text-white">Active Users: <span className="font-semibold">{activeUsers}</span></p>

      <div ref={chartRef} className="w-full max-w-4xl h-[400px] bg-gray-800 p-4 rounded-lg shadow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="timestamp" stroke="#ccc" allowDataOverflow={false} />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: '#f97316', stroke: '#fff', strokeWidth: 1.5 }}
              isAnimationActive={true}
              animationDuration={500}
            />
            <Brush dataKey="timestamp" height={20} stroke="#f97316" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`px-4 py-2 rounded-md font-semibold ${isPaused ? 'bg-green-500' : 'bg-red-500'} text-white`}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={exportChart}
          className="px-4 py-2 rounded-md bg-blue-500 text-white font-semibold"
        >
          Export Chart PNG
        </button>
      </div>
    </div>
  );
}
