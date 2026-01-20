// npm install axios chart.js react-chartjs-2
// console.log("Server is starting up!");
// import { useState } from 'react';
import { useState, useEffect } from 'react';
import DataVisualizer from './DataVisualizer';
import './App.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
 // CSS import works directly in Vite

import axios from 'axios';

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
  // console.error('testing error message to console');
  const [visualization, setVisualization] = useState(null); // Will hold chart data or table JSX
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState(0); // Defaults to first tab
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);  

  // Dynamic Query Data
  const [chartData, setChartData] = useState([]);
  // const [chartData, setChartData] = useState(null);
  

  // const apikey = import.meta.env.VITE_AZURE_FUNCTION_KEY
  const apikey = import.meta.env.VITE_AZURE_FUNCTION_KEY;
  const apiragkey = import.meta.env.VITE_AZURE_FUNCTION_RAG_KEY;

  // New state for RAG upload
  const [pdfFile, setPdfFile] = useState(null);
  const [question, setQuestion] = useState(''); // This declares 'question' – critical fix if missing
  const [uploadStatus, setUploadStatus] = useState('');
  const [ragResponse, setRagResponse] = useState('');

  // State for username in Agentic Chat
  const [username, setUsername] = useState('');

  // Sample data for analytics chart
  const chartSData = {
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

  // Render function for table (dynamic)
  const renderTable = ({ headers, rows }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>{headers.map(header => <th key={header} style={{ border: '1px solid #ddd', padding: '8px' }}>{header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {headers.map(header => <td key={header} style={{ border: '1px solid #ddd', padding: '8px' }}>{row[header]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );  

  const handleSend = async (e) => {
    e.preventDefault(); // Prevent form submission reload
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`https://dynaq.azurewebsites.net/api/dynaq_chat?code=${apikey}`, {
      // const response = await fetch(`http://localhost:7071/api/dynaq_chat`, {
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

  // const handleSend_agentic_ai = async () => {
  //   if (!input.trim()) return;

  //   // Add user message to chat
  //   const newMessages = [...messages, { sender: 'user', text: input }];
  //   setMessages(newMessages);
  //   setInput('');
  //   setIsLoading(true);

  //   try {

  //     const response = await fetch(`http://localhost:7071/api/agentic_ai`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ query: newMessages.text }),
  //     });

  //     // const response = await axios.post(apiEndpoint, { query: input }, {
  //     //   headers: { 'Content-Type': 'application/json' }
  //     // });
  //     const aiResponse = response.data.response || 'No response received';

  //     // Add AI message to chat
  //     setMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
  //   } catch (error) {
  //     console.error('Error:', error);
  //     setMessages([...newMessages, { sender: 'ai', text: 'Error: Could not get response from AI.' }]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  
  const handleSend_agentic_ai = async (e) => {
    e.preventDefault(); // Prevent form submission reload
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // const response = await fetch(`https://dynaq.azurewebsites.net/api/agentic_ai?code=${apikey}`, {
      const response = await fetch(`http://localhost:7071/api/agentic_ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.text, session_id: 'optional', username }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const aiResponse = data.result || 'No response received';
      // const aiResponse = { text: data.reply || 'No response received' };
      // Add AI message to chat
      setMessages((prev) => [...prev, { sender: 'ai', text: aiResponse }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Error: Could not get response from AI.' }]);
    } finally {
      setIsLoading(false);
    }
  };


// fetch('/api/agentic_ai', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ query: 'your query', session_id: 'optional' })
// })
// .then(res => res.json())
// .then(data => {
//   console.log('Agent response:', data.result);  // This contains "Final Answer: [answer]"
//   // Update your UI with data.result
// })
// .catch(err => console.error('Error:', err));


  // Existing useEffect for mobile detection
  useEffect(() => {
    const mobileCheck = /Mobi|Android/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);


    if (mobileCheck && document.documentElement.requestFullscreen) {
      setTimeout(() => {
        document.documentElement.requestFullscreen().catch((err) => console.log('Full-screen request failed:', err));
      }, 1000);
    }
  }, []);

 
  // New handler for PDF upload
  const handlePdfUpload = async () => {
    if (!pdfFile) {
      setUploadStatus('Please select a PDF file.');
      return;
    }


    setUploadStatus('Uploading...');
    const formData = new FormData();
    formData.append('pdf', pdfFile); // File upload
    if (question.trim()) {
      formData.append('question', question); // Append question as a string field
    }

      // const response = await fetch(`https://dynaq.azurewebsites.net/api/dynaq_chat?code=${apikey}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: userMessage.text }),
      // });

// const response = await fetch(`https://dynaq.azurewebsites.net/api/dynaq_chat?code=${apikey}`, {      
    try {
      // const response = await fetch(`http://localhost:7071/api/dynaq_rag_ai`, {
      const response = await fetch(`https://dynaq.azurewebsites.net/api/dynaq_rag_ai?code=${apiragkey}`, {
        method: 'POST',
        body: formData,        
      });

        // method: 'POST',
        // headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ message: formData }),


      if (!response.ok) {
        throw new Error('Upload failed');
      }


      const data = await response.json(); // Assume backend returns JSON with 'response' field
      setRagResponse(data.response || 'RAG processing complete.');
      setUploadStatus('Upload successful!');
      setQuestion(''); // Optional: Clear question after success
    } catch (error) {
      setUploadStatus('Error: ' + error.message);
      setRagResponse('');
    }
  };  

  // Existing toggleFullScreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.log('Full-screen request failed:', err));
    } else {
      document.exitFullscreen();
    }
  };

  // if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Navigation Bar */}
      <div style={{ width: '120px', background: '#f0f0f0', padding: '10px', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
        <h3>Navigation</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><button onClick={() => setSelectedTab(0)} style={{ width: '100%', marginBottom: '5px' }}>Dashboard</button></li>
        <li><button onClick={() => setSelectedTab(1)} style={{ width: '100%', marginBottom: '5px' }}>Chat</button></li>
        <li><button onClick={() => setSelectedTab(2)} style={{ width: '100%', marginBottom: '5px' }}>RAG Upload</button></li>
        <li><button onClick={() => setSelectedTab(3)} style={{ width: '100%', marginBottom: '5px' }}>Agentic Chat</button></li>
        <li><button onClick={() => setSelectedTab(4)} style={{ width: '100%', marginBottom: '5px' }}>FAQ</button></li>
        <li><button onClick={() => setSelectedTab(5)} style={{ width: '100%', marginBottom: '5px' }}>Forum</button></li>
        </ul>
      </div>
      {/* Center Content (Tabs) */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <h1>DynaQ Tools</h1>
        {isMobile && (
          <button onClick={toggleFullScreen} style={{ marginBottom: '10px' }}>
            Toggle Full Screen
          </button>
        )}
        <Tabs selectedIndex={selectedTab} onSelect={(index) => setSelectedTab(index)}>
          <TabList>
            <Tab>Analytics Dashboard</Tab>
            <Tab>Would you like to Chat?</Tab>
            <Tab>Have a Rag Question?</Tab>
            <Tab>Agentic Chat</Tab>
            <Tab>FAQ</Tab>
            <Tab>Forum</Tab>
          </TabList>

          <TabPanel>
            <h1>Dynamic Data Dashboards</h1>
            <div className="App">
              <header className="App-header">
                <h2>Chart Data from SQLite</h2>
              </header>
              <main>
                <DataVisualizer/>
              </main>
            </div>
            <h2>Analytics Dashboard</h2>
            <p>Static chart showing sample user data.</p>
            <Line data={chartSData} options={{ responsive: true }} />
          </TabPanel>

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
            <h2>RAG PDF Upload Example</h2>
            <p>Upload a PDF and optionally provide a question to process with a backend RAG model.</p>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              style={{ margin: '10px 0', display: 'block' }}
            />
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter a question (optional)"
              style={{ margin: '10px 0', width: '100%' }}
            />
            <button onClick={handlePdfUpload}>Upload PDF and Process</button>
            {uploadStatus && <p>{uploadStatus}</p>}
            {ragResponse && (
              <div style={{ marginTop: '10px', border: '1px solid #ccc', padding: '10px' }}>
                <h3>RAG Response:</h3>
                <p>{ragResponse}</p>
              </div>
            )}
          </TabPanel>

          <TabPanel>
            <div className="App">
              <h1>DynaQ Agentic Chat</h1>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username..."
                style={{ marginBottom: '10px', width: '100%', padding: '8px' }}
              />
              <div className="chat-window">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender} fade-in`}>
                    {msg.text}
                  </div>
                ))}
                {isLoading && <div className="loading">Bot is thinking...</div>}
              </div>
              <form onSubmit={handleSend_agentic_ai} className="input-area">
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
            <p>This tab shares static README content.</p>
            <p>Below is an example markdown-rendered as text:</p>
            <pre style={{ background: '#f4f4f4', padding: '5px' }}>
              # Project README
              ## Overview
              <ul>This is a sample project.</ul>
              <ul>## Installation</ul>
              <ul>1. Clone the repo</ul>
              <ul>2. Run `npm install`</ul>
              <ul>3. Start with `npm run dev`</ul>
            </pre>
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
        <button onClick={() => window.print()} style={{ marginLeft: '8px' }}>Print Page</button>
      </div>

      {/* Right Information Status Bar */}
      <div style={{ width: '120px', background: '#f0f0f0', padding: '10px', borderLeft: '1px solid #ccc', overflowY: 'auto', color: 'black' }}>
        <h3>Status</h3>
        <p><strong>User:</strong> {username || 'Not set'}</p>
        <p><strong>Active Tab:</strong> {['Analytics Dashboard', 'Chat', 'RAG Upload', 'Agentic Chat', 'FAQ', 'Forum'][selectedTab]}</p>
        <p><strong>Messages:</strong> {messages.length}</p>
        {/* Add more status info, e.g., notifications, system health */}
      </div>
    </div>
  );  

}


export default App;

