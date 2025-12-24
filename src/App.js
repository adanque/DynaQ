// import logo from './logo.svg';
import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [messages, setMessages] = useState([]);
  // const [message, setMessage] = useState('');
  // const [reply, setReply] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e) => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {

      const response = await axios.post('https://dynaq.azurewebsites.net/api/dynaq_chat', { messages });
      // setReply(response.data.reply);      


      // const response = await fetch('https://dynaq.azurewebsites.net/api/dynaq?code=QZA3J8KqSM86PwoXJJEBU5NcMB_QeOKT-NK3cy5ptCi0AzFu7SSnLQ%3D%3D&name=alan', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: userMessage.text }),
      // });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const botMessage = { text: data.response || 'No response from bot', sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // setReply('Error: ' + error.message);
      const errorMessage = { text: 'Error: ' + error.message, sender: 'bot' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>DynaQ Chat Interface</h1>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender} fade-in`}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div className="loading">DynaQ is thinking...</div>}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}

export default App;
