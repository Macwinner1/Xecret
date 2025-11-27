import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { messagingAPI } from '../api/client';

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadConversations();

    // Check if opening specific conversation
    const username = searchParams.get('user');
    if (username) {
      openConversation(username);
    }
  }, [isAuthenticated, searchParams]);

  const loadConversations = async () => {
    try {
      const response = await messagingAPI.getConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (username) => {
    try {
      setSelectedUser(username);
      const response = await messagingAPI.getConversation(username);
      setMessages(response.data.messages);
      
      // Reload conversations to update unread count
      loadConversations();
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedUser) return;

    try {
      await messagingAPI.sendMessage(selectedUser, messageText);
      setMessageText('');
      
      // Reload conversation
      openConversation(selectedUser);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Conversations</h2>
            {conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.other_user_id}
                    onClick={() => openConversation(conv.other_username)}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-700 ${
                      selectedUser === conv.other_username ? 'bg-gray-700' : 'bg-gray-750'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium">@{conv.other_username}</p>
                      {conv.unread_count > 0 && (
                        <span className="bg-blue-600 text-xs px-2 py-1 rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {conv.last_message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.last_message_time).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No conversations yet</p>
            )}
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 bg-gray-800 rounded-lg flex flex-col" style={{ height: '600px' }}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700">
                  <h2 className="text-xl font-bold">@{selectedUser}</h2>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.message_id}
                      className={`flex ${msg.from_user_id === user?.user_id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.from_user_id === user?.user_id
                            ? 'bg-blue-600'
                            : 'bg-gray-700'
                        }`}
                      >
                        <p>{msg.message_text}</p>
                        <p className="text-xs text-gray-300 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-gray-700 rounded-lg text-white"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
