// import { useState } from 'react';
import { useState, useEffect } from 'react';
import './App.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
 // CSS import works directly in Vite
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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const apikey = import.meta.env.VITE_AZURE_FUNCTION_KEY
  const apikey = import.meta.env.VITE_AZURE_FUNCTION_KEY;

  // New state for RAG upload
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [ragResponse, setRagResponse] = useState('');

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
    formData.append('pdf', pdfFile); // 'pdf' is the key expected by your backend


    try {
      const response = await fetch(`https://dynaq.azurewebsites.net/api/dynaq_rag_chat?code=${apikey}`, {
        method: 'POST',
        body: formData,
      });


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


  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>DynaQ Tools</h1>
      <Tabs>
        <TabList>
          <Tab>Have a Question?</Tab>
          <Tab>Have a Rag Question?</Tab>
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
          <div className="RagApp">
            <h1>DynaQ Chat using RAG</h1>
            <p>Upload a PDF and optionally provide a question to process with a backend RAG model.</p>            
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
                disabled={isLoading}
              />
              {/* <button type="submit" disabled={isLoading || !input.trim()}>
                ➤
              </button> */}
              <button onClick={handlePdfUpload}>Upload PDF and Process</button>
              {uploadStatus && <p>{uploadStatus}</p>}
              {ragResponse && (
                <div style={{ marginTop: '10px', border: '1px solid #ccc', padding: '10px' }}>
                  <h3>RAG Response:</h3>
                  <p>{ragResponse}</p>
                </div>
              )}
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

