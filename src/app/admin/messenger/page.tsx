'use client'

import React, { useState } from 'react';
import { Search, Send } from 'lucide-react';
import Image from 'next/image';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: string;
  initials?: string;
  backgroundColor?: string;
}

interface Message {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
}

const Messenger = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');

  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Shihas',
      avatar: '/api/placeholder/32/32',
      status: 'Almost completed',
      initials: 'S',
      backgroundColor: 'bg-orange-500'
    },
    {
      id: '2',
      name: 'Ravi',
      avatar: '/api/placeholder/32/32',
      status: 'Almost completed',
      initials: 'R',
      backgroundColor: 'bg-gray-600'
    },
    {
      id: '3',
      name: 'Rosy',
      avatar: '/api/placeholder/32/32',
      status: 'Almost completed',
      initials: 'R',
      backgroundColor: 'bg-purple-500'
    },
    {
      id: '4',
      name: 'Anirudh',
      avatar: '/api/placeholder/32/32',
      status: 'Almost completed',
      initials: 'A',
      backgroundColor: 'bg-teal-600'
    },
    {
      id: '5',
      name: 'Company Employee and M...',
      avatar: '',
      status: 'one more pending',
      initials: 'G',
      backgroundColor: 'bg-gray-400'
    }
  ];

  const rosyMessages: Message[] = [
    { id: '1', text: 'New idea here', time: '10:24 AM', isOwn: false },
    { id: '2', text: 'What?', time: '10:24 AM', isOwn: false },
    { id: '3', text: 'Implement that to main page', time: '10:24 AM', isOwn: true },
    { id: '4', text: 'How?', time: '10:24 AM', isOwn: true },
    { id: '5', text: 'Clarify it', time: '10:24 AM', isOwn: false },
    { id: '6', text: 'I will explain', time: '10:24 AM', isOwn: false }
  ];

  React.useEffect(() => {
    // Set Rosy as selected by default to match the image
    const rosy = contacts.find(c => c.name === 'Rosy');
    if (rosy) {
      setSelectedContact(rosy);
    }
  }, []);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Handle sending message
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[100%] bg-white">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Messenger</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                selectedContact?.id === contact.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="relative">
                {contact.avatar ? (
                  <Image
                    src={'/avatar.png'}
                    alt={'profile image'}
                    width={12}
                    height={12}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full ${contact.backgroundColor} flex items-center justify-center text-white font-semibold`}>
                    {contact.initials}
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{contact.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">{contact.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center">
              <div className="relative">
                {selectedContact.avatar ? (
                  <Image
                    src={'/avatar.png'}
                    alt={'profile image'}
                                        width={12}
                    height={12}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full ${selectedContact.backgroundColor} flex items-center justify-center text-white font-semibold text-sm`}>
                    {selectedContact.initials}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <h2 className="font-semibold text-gray-900">{selectedContact.name}</h2>
                <p className="text-sm text-gray-500">(TRW0779-0023)</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedContact.name === 'Rosy' && rosyMessages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-xs lg:max-w-md">
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.isOwn
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message..."
                  className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default Messenger;