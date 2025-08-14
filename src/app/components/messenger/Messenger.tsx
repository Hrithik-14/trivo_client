/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import api from '@/app/api/axios';
import React, { useState, useEffect, useRef, FC, ChangeEvent  } from 'react';
import { io, Socket } from 'socket.io-client';
import { Search, Plus, Users, Send, MessageCircle, ArrowLeft, Camera } from 'lucide-react';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import Image from 'next/image';
import toast from 'react-hot-toast';

function getDateLabel(dateString: string) {
  const date = new Date(dateString);

  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    const diff = differenceInDays(new Date(), date);
    if (diff < 7) {
      return format(date, 'EEEE');
    } else {
      return format(date, 'dd MMM yyyy');
    }
  }
}

interface Contact {
  _id: string;
  name: string;
  email: string;
  createdBy: string;
  employeeCode: string;
}

interface Message {
  _id: string;
  content: string;
  createdAt: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    profileImage: string;
  };
  groupId?: string;
  readBy: string[];
}

interface Group {
  _id: string;
  name: string;
  members: Contact[];
  createdBy: Contact;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  groupImage: string;
  lastMessageId: { content: string; id: string; } | null;
  content: string;
  unreadCount?: number | undefined;
}

interface MessengerProps {
  role: "admin" | "manager" | "employee";
}

const Messenger: FC<MessengerProps> = ({ role }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [groupList, setGroupList] = useState(false);
  let lastDateLabel: string | null = null;
  const [activeArea, setActiveArea] = useState('list');
  const [groupImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setCurrentUserId(payload.id);
      } catch (error) {
        console.error("Failed to parse token", error);
      }
    }
  }, []);

  const calculateUnreadCount = (groupId: string, groupMessages: Message[]): number => {
    return groupMessages.filter(message => 
      message.groupId === groupId && 
      message.senderId._id !== currentUserId && 
      !message.readBy.includes(currentUserId)
    ).length;
  };

  const loadUnreadCounts = async () => {
    if (!token || !currentUserId) return;
    
    try {
      const updatedGroups = await Promise.all(
        groups.map(async (group) => {
          try {
            const res = await api.get(`/group/${group._id}/messages`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const unreadCount = calculateUnreadCount(group._id, res.data);
            return { ...group, unreadCount };
          } catch (error) {
            console.error(`Failed to load messages for group ${group._id}`, error);
            return { ...group, unreadCount: 0 };
          }
        })
      );
      setGroups(updatedGroups);
    } catch (error) {
      console.error("Failed to load unread counts", error);
    }
  };

  useEffect(() => {
    if (!token) return;

    const newSocket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      withCredentials: true,
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on("newMessage", (msg: Message) => {
      if (selectedGroup && msg.groupId === selectedGroup._id) {
        setMessages(prev => [...prev, msg]);
      }
      
      setGroups(prev => prev.map(group => {
        if (group._id === msg.groupId) {
          const newUnreadCount = msg.senderId._id !== currentUserId ? 
            (group.unreadCount || 0) + 1 : group.unreadCount;
          
          return { 
            ...group, 
            updatedAt: new Date().toISOString(),
            unreadCount: selectedGroup?._id === group._id ? 0 : newUnreadCount
          };
        }
        return group;
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, selectedGroup, currentUserId]);

  useEffect(() => {
    if (token) {
      loadContacts();
      loadGroups();
    }
  }, [token]);

  useEffect(() => {
    if (groups.length > 0 && currentUserId) {
      loadUnreadCounts();
    }
  }, [groups.length, currentUserId]);

  const loadContacts = async () => {
    try {
      const res = await api.get('/group/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setContacts(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const loadGroups = async () => {
    try {
      const res = await api.get('/group/my', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setGroups(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Failed to load groups", err);
    }
  };

  const loadGroupMessages = async (groupId: string) => {
    try {
      const res = await api.get(`/group/${groupId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const toggleMember = (contact: Contact) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m._id === contact._id);
      if (exists) {
        return prev.filter(m => m._id !== contact._id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const url = URL.createObjectURL(file);
      setProfileImagePreview(url);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedMembers.length < 2) {
      alert("Please provide a group name and select at least 2 members");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("members", JSON.stringify(selectedMembers.map(m => m._id)));
      if (groupImage) {
        formData.append("groupImage", groupImage);
      }

      const res = await api.post('/group/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newGroup = { ...res.data, unreadCount: 0 };
      setGroups(prev => [...prev, newGroup]);
      setSelectedGroup(newGroup);

      socket?.emit("joinGroup", newGroup._id);

      setShowGroupModal(false);
      setGroupName("");
      setSelectedMembers([]);
      setProfileImage(null);
    } catch (err) {
      console.error("Failed to create group", err);
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = async (group: Group) => {
    setSelectedGroup(group);
    setActiveArea('chat');

    await loadGroupMessages(group._id);

    await api.put(`/isRead/group/${group._id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setGroups(prev => prev.map(g => 
      g._id === group._id ? { ...g, unreadCount: 0 } : g
    ));

    setMessages(prev =>
      prev.map(m => {
        const readByAsStrings = (m.readBy || []).map(id => String(id));
        if (String(m.groupId) === String(group._id) && !readByAsStrings.includes(currentUserId) && String(m.senderId._id) !== currentUserId) {
          return { ...m, readBy: [...readByAsStrings, currentUserId] };
        }
        return m;
      })
    );

    socket?.emit("joinGroup", group._id);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedGroup || !token) return;

    try {
      const res = await api.post(
        `/group/${selectedGroup._id}/messages`,
        { content: messageText, senderId: currentUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newMessage = res.data;
      setMessages(prev => [...prev, newMessage]);
      
      socket?.emit("sendMessage", {
        groupId: selectedGroup._id,
        content: messageText
      });

      setMessageText("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(contact =>
    (
    contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(contactSearchQuery.toLowerCase())
) &&
        contact._id !== currentUserId
  );

  return (
    <div className="w-full h-full bg-white rounded-lg flex flex-col">
      {activeArea === 'list' && (
        <div className="w-full h-full overflow-y-auto scrollbar-thin bg-white rounded-md flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-end mb-4">
              {role === 'admin' &&
              <button 
                onClick={() => setShowGroupModal(true)}
                className=" h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center gap-5 px-4 justify-center text-white transition-colors"
              >
                <Plus size={15} />
                <p>Create Group</p>
              </button>}
            </div>
            
            <div className="relative ">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={13} />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1">
            {filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No groups yet</h3>
                <p className="text-sm text-gray-500">Create your first group!</p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div
                  key={group._id}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors`}
                  onClick={() => handleSelectGroup(group)}
                >
                  <div className="flex items-center justify-between">
                    <div className='flex gap-2 items-center'>
                      <div className="relative">
                        {group.groupImage ? (
                          <div className='w-[30px] h-[30px] relative'>
                            <Image src={group.groupImage} alt='Group profile' fill className='rounded-full object-cover object-center' />
                          </div>
                        ) : (
                          <div className='w-[30px] h-[30px] bg-[#f1f1f1] flex items-center justify-center font-semibold rounded-full text-md'>
                            {group.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        {(group.unreadCount ?? 0) > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                            {group.unreadCount! > 99 ? '99+' : group.unreadCount}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-semibold text-gray-900 `}>
                          {group.name}
                        </h3>
                        <h4 className={`text-sm ${group.unreadCount && group.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {group.lastMessageId?.content}
                        </h4>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 flex flex-col items-end">
                      <div>{formatGroupDate(group.updatedAt)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeArea === 'chat' && (
        <div className="flex-1 flex flex-col h-full  overflow-y-auto scrollbar-thin">
          {selectedGroup ? (
            <div className='bg-white rounded-lg overflow-y-auto  h-[500px] flex flex-col'>
              <div className="bg-white px-4 py-2 border-b border-gray-200 flex items-center justify-between ">
                <div className='flex items-center gap-2'>
                  <button onClick={() => setActiveArea('list')}>
                    <ArrowLeft size={15} />
                  </button>
                  {selectedGroup.groupImage ? (
                    <div className='w-[30px] h-[30px] relative'>
                      <Image src={selectedGroup.groupImage} alt='Group profile' fill className='rounded-full object-cover object-center' />
                    </div>
                  ) : (
                    <div className='w-[30px] h-[30px] bg-[#f1f1f1] flex items-center justify-center font-semibold rounded-full text-md'>
                      {selectedGroup.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedGroup.name}</h3>
                    <p className="text-sm text-gray-500">{selectedGroup.members.length + 1} members</p>
                  </div>
                </div>
                <div className='flex items-center'>
                  <button onClick={() => setGroupList(prev => !prev)} className='w-fit '>
                    <Users size={18} />
                  </button>
                  {groupList && <ul className='bg-white border border-[#ddd] absolute top-25 right-0 w-40 max-h-50 overflow-y-auto scrollbar-thin'>
                    <li className='border-b p-2 border-[#ddd] text-xs'>{selectedGroup.createdBy.name}</li>
                    {selectedGroup.members.map(m => (
                      <li key={m._id} className='border-b p-2 border-[#ddd] text-xs'>
                        <p>{m.name} {m.employeeCode}</p>
                      </li>
                    ))}
                  </ul>}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin space-y-4">
                {messages.map((message) => {
                  const dateLabel = getDateLabel(message.createdAt);
                  const showLabel = dateLabel !== lastDateLabel;
                  lastDateLabel = dateLabel;
                  return (
                    <div
                      key={message._id}
                      className={`flex flex-col ${message.senderId._id === currentUserId ? 'items-end' : 'items-start'}`}
                    >
                      {showLabel && (
                        <div className="text-center w-full text-xs text-gray-500 mb-2">
                          {dateLabel}
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        {message.senderId._id !== currentUserId && (
                          <div className='w-[30px] h-[30px] relative'>
                            <Image src={message.senderId.profileImage || '/avatar.png'} alt='' fill className='rounded-full object-cover object-center' />
                          </div>
                        )}
                        <div className={`max-w-50 px-3 py-2 rounded-lg break-words leading-none ${message.senderId._id === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                          <div className={`text-xs font-semibold mb-1 ${message.senderId._id === currentUserId ? 'hidden': 'block'}`}>{message.senderId.name}</div>
                          <div className='text-sm'>{message.content}</div>
                          <div className={`text-[8px] mt-1 text-end ${
                            message.senderId._id === currentUserId ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="bg-white p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <MessageCircle className="text-gray-400" size={48} />
                </div>
                <h2 className="text-xl font-medium text-gray-600 mb-8">
                  Select a group to start messaging
                </h2>
                <button
                  onClick={() => setShowGroupModal(true)}
                  className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-colors shadow-sm hover:shadow-md"
                >
                  Create your first group
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showGroupModal && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-full overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
            <div className="mb-4">
                  <label className="block mb-1 font-medium">Group Profile Image</label>
                  <input
                    type="file"
                    id="profileImageInput"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <label
                    htmlFor="profileImageInput"
                    className="cursor-pointer w-24 h-24 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center overflow-hidden relative hover:border-blue-500 transition"
                  >
                    {profileImagePreview ? (
                      <Image
                        src={profileImagePreview}
                        alt="Group Profile Preview"
                        fill
                        sizes="96px"
                        style={{ objectFit: "cover", borderRadius: "9999px" }}
                      />
                    ) : (
                      <Camera className="text-gray-400 text-3xl" />
                    )}
                  </label>
                </div>

            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="text"
              value={contactSearchQuery}
              onChange={(e) => setContactSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md mb-4">
              {filteredContacts.map((contact) => (
                <label
                  key={contact._id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b"
                >
                  <input
                    key={contact._id}
                    type="checkbox"
                    checked={selectedMembers.some(m => m._id === contact._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleMember(contact);
                    }}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-gray-500">{contact.employeeCode}</div>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setGroupName("");
                  setSelectedMembers([]);
                  setContactSearchQuery("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createGroup}
                disabled={loading || groupName.trim().length === 0 || selectedMembers.length < 2}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messenger;

const formatGroupDate = (dateString: any) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
};