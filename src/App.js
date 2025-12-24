import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault(); // Prevent form submission reload
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://dynaq.azurewebsites.net/api/dynaq_chat?code=jHyIcXcJmfAmF14uhBRevFHepTYr_fn4J6aLIP2edmD5AzFubs4mUA%3D%3D', {
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
    <div className="App">
      <h1>Chatbot Interface</h1>
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
  );
}

export default App;

// // import logo from './logo.svg';
// import React, { useState } from 'react';
// import './App.css';
// import axios from 'axios';

// function App() {
//   const [messages, setMessages] = useState([]);
//   // const [message, setMessage] = useState('');
//   // const [reply, setReply] = useState('');
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSend = async (e) => {
//     if (!input.trim()) return;

//     const userMessage = { text: input, sender: 'user' };
//     setMessages([...messages, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     try {

//       const response = await axios.post('https://dynaq.azurewebsites.net/api/dynaq_chat?code=jHyIcXcJmfAmF14uhBRevFHepTYr_fn4J6aLIP2edmD5AzFubs4mUA%3D%3D', { messages });
//       // setReply(response.data.reply);      
//       // https://dynaq.azurewebsites.net/api/dynaq_chat?code=jHyIcXcJmfAmF14uhBRevFHepTYr_fn4J6aLIP2edmD5AzFubs4mUA%3D%3D

//       // const response = await fetch('https://dynaq.azurewebsites.net/api/dynaq?code=QZA3J8KqSM86PwoXJJEBU5NcMB_QeOKT-NK3cy5ptCi0AzFu7SSnLQ%3D%3D&name=alan', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify({ message: userMessage.text }),
//       // });

//       if (!response.ok) throw new Error('API request failed');

//       const data = await response.json();
//       const botMessage = { text: data.response || 'No response from bot', sender: 'bot' };
//       setMessages((prev) => [...prev, botMessage]);
//     } catch (error) {
//       // setReply('Error: ' + error.message);
//       const errorMessage = { text: 'Error: ' + error.message, sender: 'bot' };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="App">
//       <h1>DynaQ Chat Interface</h1>
//       <div className="chat-window">
//         {messages.map((msg, index) => (
//           <div key={index} className={`message ${msg.sender} fade-in`}>
//             {msg.text}
//           </div>
//         ))}
//         {isLoading && <div className="loading">DynaQ is thinking...</div>}
//       </div>
//       <div className="input-area">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//           placeholder="Type your message..."
//           disabled={isLoading}
//         />
//         <button onClick={handleSend} disabled={isLoading || !input.trim()}>
//           ➤
//         </button>
//       </div>
//     </div>
//   );
// }

// export default App;
