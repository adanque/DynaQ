import { useState } from 'react';
import './App.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css'; // CSS import works directly in Vite
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
// const apikeyv="jHyIcXcJmfAmF14uhBRevFHepTYr_fn4J6aLIP2edmD5AzFubs4mUA%3D%3D"
// console.log(import.meta.env.VITE_AZURE_FUNCTION_KEY);

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const apikey = import.meta.env.VITE_AZURE_FUNCTION_KEY
  const apikey = import.meta.env.VITE_AZURE_FUNCTION_KEY;

  // Sample data for analytics chart
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'User Visits',
        data: [65, 59, 80, 81, 56],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
      },
    ],
  };


  // State for chat bot example
  // const [chatMessages, setChatMessages] = useState([]);
  // const [input, setInput] = useState('');


  // const handleSend = () => {
  //   if (input.trim()) {
  //     setChatMessages([...chatMessages, { text: input, sender: 'user' }]);
  //     // Simulate bot response (replace with real API call)
  //     setChatMessages((prev) => [...prev, { text: 'Bot reply: ' + input, sender: 'bot' }]);
  //     setInput('');
  //   }
  // };
  const handleSend = async (e) => {
    e.preventDefault(); // Prevent form submission reload
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {

      const response = await fetch(`https://dynaq.azurewebsites.net/api/dynaq_chat?code=${apikey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const botMessage = { text: data.reply || 'No response from bot', sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { text: 'Error: ' + error.message, sender: 'bot' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>DynaQ Tools</h1>
      <Tabs>
        <TabList>
          <Tab>Have a Question?</Tab>
          <Tab>FAQ</Tab>
          <Tab>Analytics Dashboard</Tab>
          <Tab>Forum</Tab>
        </TabList>


        <TabPanel>
          <div className="App">
            <h1>DynaQ Chat</h1>
            <div className="chat-window">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender} fade-in`}>
                  {msg.text}
                </div>
              ))}
              {isLoading && <div className="loading">Bot is thinking...</div>}
            </div>
            <form onSubmit={handleSend} className="input-area">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !input.trim()}>
                ➤
              </button>
            </form>
          </div>
        </TabPanel>


        <TabPanel>
          <h2>Readme Materials</h2>
          <p>This tab shares static README content. Below is an example markdown-rendered as text:</p>
          <pre style={{ background: '#f4f4f4', padding: '10px' }}>
            # Project README
            ## Overview
            This is a sample project.
            ## Installation
            1. Clone the repo
            2. Run `npm install`
            3. Start with `npm run dev`
          </pre>
        </TabPanel>


        <TabPanel>
          <h2>Analytics Dashboard</h2>
          <p>Static chart showing sample user data.</p>
          <Line data={chartData} options={{ responsive: true }} />
        </TabPanel>


        <TabPanel>
          <h2>Forum</h2>
          <p>Static forum posts example (add dynamic features with a backend if needed).</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <strong>Post 1:</strong> How do I get started? <br />
              <em>Reply: Check the README tab.</em>
            </li>
            <li>
              <strong>Post 2:</strong> Feature request: Add more charts. <br />
              <em>Reply: Noted, thanks!</em>
            </li>
          </ul>
        </TabPanel>
      </Tabs>
    </div>
  );
}


export default App;


// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
