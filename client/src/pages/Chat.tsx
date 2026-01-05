import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';

// Connect to backend
const socket: Socket = io('http://localhost:5000');

interface Message {
  room: string;
  author: string;
  message: string;
  time: string;
}

const Chat: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Anonymous';
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(socket.connected); // <--- NEW STATUS STATE

  useEffect(() => {
    // 1. Connection Listeners
    const onConnect = () => {
      console.log("✅ Socket Connected!");
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log("❌ Socket Disconnected");
      setIsConnected(false);
    };

    // 2. Message Listeners
    const handleReceiveMessage = (data: Message) => {
      setMessageList((list) => [...list, data]);
    };

    // --- NEW: Handle Loading History ---
    const handleLoadHistory = (history: Message[]) => {
      console.log("📜 History loaded:", history.length);
      setMessageList(history);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('load_messages', handleLoadHistory); // <--- Listen for history

    // Join Room
    if (id) {
      socket.emit('join_room', id);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('load_messages', handleLoadHistory);
    };
  }, [id]);

  const sendMessage = async () => {
    if (currentMessage !== '' && id) {
      const messageData: Message = {
        room: id,
        author: username,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      await socket.emit('send_message', messageData);
      // Note: We wait for the server to send it back to us via 'receive_message'
      // This ensures we only see messages that were actually delivered.
      setCurrentMessage('');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="bg-[#800000] p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="hover:bg-white/20 p-1 rounded">
             <i className="fas fa-arrow-left"></i>
          </button>
          <span className="font-bold">Live Chat</span>
        </div>
        
        {/* CONNECTION STATUS INDICATOR */}
        <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500 animate-pulse'}`}></div>
          <span className="text-xs font-medium">{isConnected ? 'Online' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
        {messageList.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
              <i className="fas fa-comments text-3xl opacity-20"></i>
              <p className="text-sm">No messages yet.</p>
           </div>
        ) : (
          messageList.map((msg, index) => {
            const isMe = msg.author === username;
            return (
              <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                  isMe 
                    ? 'bg-[#800000] text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  <p>{msg.message}</p>
                </div>
                <div className="text-[10px] text-gray-400 mt-1 flex gap-1">
                  <span className="font-bold">{msg.author}</span>
                  <span>•</span>
                  <span>{msg.time}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={currentMessage}
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyPress={(event) => event.key === 'Enter' && sendMessage()}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          disabled={!isConnected}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-[#800000] text-sm disabled:bg-gray-100"
        />
        <button 
          onClick={sendMessage}
          disabled={!isConnected}
          className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors shadow-sm text-white ${isConnected ? 'bg-[#800000] hover:bg-[#600000]' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          <i className="fas fa-paper-plane text-xs"></i>
        </button>
      </div>
    </div>
  );
};

export default Chat;