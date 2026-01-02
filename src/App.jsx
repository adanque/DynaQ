// npm install axios chart.js react-chartjs-2
console.log("Server is starting up!");
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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
          <Tab>FAQ</Tab>
          <Tab>Forum</Tab>
        </TabList>


        <TabPanel>
          <h1>Dynamic Data Dashboards</h1>
            <div className="App">
                  <header className="App-header">
                    <h1>Chart Data from SQLite</h1>
                  </header>
                  <main>
                    <DataVisualizer/>
                  </main>
            </div>          
            {/* <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
              <h1>Dynamic Metrics Dashboard</h1>
              {error && <p style={{ color: 'red' }}>Error: {error}</p>}
              {loading ? (
                <p>Loading data...</p>
              ) : visualization ? (
                visualization.type === 'chart' ? (
                  <Bar
                    data={visualization.data}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'top' }, title: { display: true, text: 'Dynamic Metrics' } },
                    }}
                  />
                ) : (
                  renderTable(visualization)
                )
              ) : (
                <p>No suitable data for visualization.</p>
              )}
            </div>           */}

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
            value={question} // References 'question' state here
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter a question (optional)"
            style={{ margin: '10px 0', width: '100%' }} // New input for question
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
    </div>
  );
}


export default App;

