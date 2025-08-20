
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import api from '@/app/api/axios';
import React, { useState, useEffect, useRef, FC, ChangeEvent  } from 'react';
import { io, Socket } from 'socket.io-client';
import { Search, Plus, Users, Send, MessageCircle, ArrowLeft, Camera, User } from 'lucide-react';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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
  createdAt: string;
  profileImage?: string;
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
  recieverId?: string;
  readBy: string[];
}

interface DirectMessage {
  _id: string;
  content: string;
  createdAt: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    employeeCode: string;
  };
  recieverId: string;
  readBy?: string[];
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

// New interface for personal chat items in the list
interface PersonalChat {
  _id: string;
  name: string;
  employeeCode: string;
  email: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  type: 'personal';
  profileImage?: string;
}

interface ChatItem {
  _id: string;
  name: string;
  type: 'group' | 'personal';
  lastMessage?: string;
  lastMessageTime: string;
  unreadCount?: number;
  groupImage?: string;
  employeeCode?: string;
  members?: Contact[];
  createdBy?: Contact;
  profileImage?: string;
}

interface MessengerProps {
  role: "admin" | "manager" | "employee";
}

const Messenger: FC<MessengerProps> = ({ role }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [personalChats, setPersonalChats] = useState<PersonalChat[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
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
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [groupList, setGroupList] = useState(false);
  let lastDateLabel: string | null = null;
  const [activeArea, setActiveArea] = useState('list');
  const [chatType, setChatType] = useState<'group' | 'direct'>('group');
  const [activeTab, setActiveTab] = useState<'groups' | 'contacts'>('groups');
  const [groupImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [showContactsTab, setShowContactsTab] = useState(false); // New state for browsing all contacts
  const router = useRouter()
  
  
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

  const calculateDirectUnreadCount = (contactId: string, directMessages: DirectMessage[]): number => {
    return directMessages.filter(message => 
      message.senderId._id === contactId && 
      message.recieverId === currentUserId &&
      (!message.readBy || !message.readBy.includes(currentUserId))
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

  const loadPersonalChats = async () => {
    if (!token || !currentUserId) {
      console.log('Cannot load personal chats - missing token or currentUserId:', { token: !!token, currentUserId });
      return;
    }
    
    try {
      console.log('Loading personal chats with token and userId:', { token: token?.substring(0, 20) + '...', currentUserId });
      
      const res = await api.get('/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Personal chats API response:', res.data);
      
      if (!res.data || res.data.length === 0) {
        console.log('No personal chats found from API');
        setPersonalChats([]);
        return;
      }
      
      // The API now returns all users with conversation data
      const personalChatsData = res.data.map((user: any) => ({
        _id: user._id,
        name: user.name,
        employeeCode: user.employeeCode,
        email: user.email,
        lastMessage: user.lastMessage || 'Start a conversation',
        lastMessageTime: user.lastMessageTime || user.createdAt,
        unreadCount: user.unreadCount || 0,
        type: 'personal' as const,
        profileImage: user.profileImage
      }));
      
      console.log('Processed personal chats:', personalChatsData);
      setPersonalChats(personalChatsData);
    } catch (error: any) {
      console.error("Failed to load personal chats - full error:", error);
      setPersonalChats([]);
    }
  };

  // Helper function to add or update personal chat
  const addOrUpdatePersonalChat = (contact: Contact, message?: string, timestamp?: string) => {
    setPersonalChats(prev => {
      const existingIndex = prev.findIndex(chat => chat._id === contact._id);
      
      if (existingIndex !== -1) {
        // Update existing chat
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: message || updated[existingIndex].lastMessage,
          lastMessageTime: timestamp || updated[existingIndex].lastMessageTime,
        };
        return updated;
      } else {
        // Add new chat
        const newChat: PersonalChat = {
          _id: contact._id,
          name: contact.name,
          employeeCode: contact.employeeCode,
          email: contact.email,
          lastMessage: message || 'Start a conversation',
          lastMessageTime: timestamp || new Date().toISOString(),
          unreadCount: 0,
          type: 'personal',
          profileImage: contact.profileImage
        };
        return [...prev, newChat];
      }
    });
  };

  const getCombinedChats = (): ChatItem[] => {
    const groupChats: ChatItem[] = groups.map(group => ({
      _id: group._id,
      name: group.name,
      type: 'group' as const,
      lastMessage: group.lastMessageId?.content || 'No messages yet',
      lastMessageTime: group.updatedAt || group.createdAt,
      unreadCount: group.unreadCount,
      groupImage: group.groupImage,
      members: group.members,
      createdBy: group.createdBy
    }));

    const personalChatItems: ChatItem[] = personalChats.map(chat => ({
      _id: chat._id,
      name: chat.name,
      type: 'personal' as const,
      lastMessage: chat.lastMessage || 'Start a conversation',
      lastMessageTime: chat.lastMessageTime || new Date().toISOString(),
      unreadCount: chat.unreadCount,
      employeeCode: chat.employeeCode,
      profileImage: chat.profileImage
    }));

    const combined = [...groupChats, ...personalChatItems];
    
    return combined.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  };

  // Get all contacts for browsing (excluding current user and existing chats)
  const getBrowsableContacts = (): Contact[] => {
    const existingChatIds = new Set(personalChats.map(chat => chat._id));
    return contacts.filter(contact => 
      contact._id !== currentUserId && !existingChatIds.has(contact._id)
    );
  };

  useEffect(() => {
    if (!token || !currentUserId) return;

    const newSocket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      withCredentials: true,
      auth: { token }
    });

    setSocket(newSocket);

    // Join user's personal room for direct messages
    newSocket.emit("joinUser", currentUserId);
    
    console.log("Socket connected, joined user room:", currentUserId);

    newSocket.on("connect", () => {
      console.log("Socket connected successfully");
      // Re-join user room on reconnection
      newSocket.emit("joinUser", currentUserId);
    });

    newSocket.on("newMessage", (msg: Message) => {
      console.log("Received group message:", msg);
      
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

    newSocket.on("newDirectMessage", (msg: DirectMessage) => {
      console.log("Received new direct message:", msg);
      console.log("Current user:", currentUserId);
      console.log("Selected contact:", selectedContact?._id);
      
      // Add message to current chat if it's the active one
      if (selectedContact && 
          (msg.senderId._id === selectedContact._id || 
           msg.recieverId === selectedContact._id)) {
        console.log("Adding message to current direct messages");
        setDirectMessages(prev => [...prev, msg]);
      }
      
      // Update personal chats list
      setPersonalChats(prev => {
        const senderId = msg.senderId._id;
        const receiverId = msg.recieverId;
        
        console.log("Processing direct message for personal chats:", {
          senderId,
          receiverId,
          currentUserId,
          messageContent: msg.content
        });
        
        // Determine which contact this message is about
        const otherUserId = senderId === currentUserId ? receiverId : senderId;
        
        // Check if this chat already exists
        const existingChatIndex = prev.findIndex(chat => chat._id === otherUserId);
        
        if (existingChatIndex !== -1) {
          console.log("Updating existing personal chat");
          // Update existing chat
          const updatedChats = [...prev];
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            lastMessage: msg.content,
            lastMessageTime: msg.createdAt,
            unreadCount: msg.senderId._id !== currentUserId ? 
              (updatedChats[existingChatIndex].unreadCount || 0) + 1 : 
              updatedChats[existingChatIndex].unreadCount
          };
          return updatedChats;
        } else {
          console.log("Creating new personal chat");
          // Create new chat if it doesn't exist and the message is not from current user
          if (senderId !== currentUserId) {
            // Find the sender in contacts to get their full info
            const senderContact = contacts.find(c => c._id === senderId);
            console.log("Sender contact found:", senderContact);
            
            if (senderContact) {
              const newPersonalChat: PersonalChat = {
                _id: senderId,
                name: senderContact.name,
                employeeCode: senderContact.employeeCode,
                email: senderContact.email,
                lastMessage: msg.content,
                lastMessageTime: msg.createdAt,
                unreadCount: 1,
                type: 'personal',
                profileImage: senderContact.profileImage
              };
              console.log("Adding new personal chat:", newPersonalChat);
              return [...prev, newPersonalChat];
            } else {
              console.log("Sender not found in contacts, creating basic contact");
              const newPersonalChat: PersonalChat = {
                _id: senderId,
                name: msg.senderId.name,
                employeeCode: msg.senderId.employeeCode,
                email: msg.senderId.email,
                lastMessage: msg.content,
                lastMessageTime: msg.createdAt,
                unreadCount: 1,
                type: 'personal',
                profileImage: undefined
              };
              return [...prev, newPersonalChat];
            }
          }
          return prev;
        }
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      console.log("Cleaning up socket connection");
      newSocket.disconnect();
    };
  }, [token, currentUserId, contacts]);

  useEffect(() => {
    if (token) {
      loadContacts();
      loadGroups();
    }
  }, [token]);

  useEffect(() => {
    if (token && currentUserId && contacts.length > 0) {
      loadPersonalChats();
    }
  }, [token, currentUserId, contacts.length]);

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
      console.log('Contacts loaded:', res.data);
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
      console.log('Groups loaded:', res.data);
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

  const loadDirectMessages = async (contactId: string) => {
    try {
      const res = await api.get(`/chat/${contactId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDirectMessages(res.data);
    } catch (err) {
      console.error("Failed to load direct messages", err);
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
      toast.error("Please provide a group name and select at least 2 members");
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
      setProfileImagePreview(null);
      setActiveTab('groups');
    } catch (err) {
      console.error("Failed to create group", err);
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = async (group: Group) => {
    setSelectedGroup(group);
    setSelectedContact(null);
    setChatType('group');
    setActiveArea('chat');

    await loadGroupMessages(group._id);

    // Mark group messages as read
    try {
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
    } catch (error) {
      console.error("Failed to mark group messages as read", error);
    }

    socket?.emit("joinGroup", group._id);
  };

  const handleSelectContact = async (contact: Contact) => {
    if (contact._id === currentUserId) {
      toast.error("You cannot message yourself");
      return;
    }

    console.log("Selecting contact:", contact);
    
    setSelectedContact(contact);
    setSelectedGroup(null);
    setChatType('direct');
    setActiveArea('chat');

    await loadDirectMessages(contact._id);

    // Mark direct messages as read
    try {
      await api.put(`/isRead/personal/${contact._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update personal chats unread count
      setPersonalChats(prev => prev.map(chat => 
        chat._id === contact._id ? { ...chat, unreadCount: 0 } : chat
      ));

      // Update direct messages read status
      setDirectMessages(prev =>
        prev.map(m => {
          const readByAsStrings = (m.readBy || []).map(id => String(id));
          if (m.senderId._id === contact._id && !readByAsStrings.includes(currentUserId)) {
            return { ...m, readBy: [...readByAsStrings, currentUserId] };
          }
          return m;
        })
      );
    } catch (error) {
      console.error("Failed to mark direct messages as read", error);
    }

    console.log("Joining direct chat room for:", contact._id);
    socket?.emit("joinDirectChat", { 
      userId: currentUserId, 
      contactId: contact._id 
    });

    addOrUpdatePersonalChat(contact);
    setShowContactsTab(false);
  };

  const handleSelectChatItem = async (chatItem: ChatItem) => {
    console.log('Selecting chat item:', chatItem);
    
    if (chatItem.type === 'group') {
      const group = groups.find(g => g._id === chatItem._id);
      if (group) {
        await handleSelectGroup(group);
      }
    } else {
      let contact = contacts.find(c => c._id === chatItem._id);
      
      if (!contact) {
        contact = {
          _id: chatItem._id,
          name: chatItem.name,
          email: '', 
          employeeCode: chatItem.employeeCode || '',
          createdBy: '',
          createdAt: new Date().toISOString(),
          profileImage: chatItem.profileImage
        };
      }
      
      await handleSelectContact(contact);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !token) return;

    try {
      if (chatType === 'group' && selectedGroup) {
        const res = await api.post(
          `/group/${selectedGroup._id}/messages`,
          { content: messageText, senderId: currentUserId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const newMessage = res.data;
        setMessages(prev => [...prev, newMessage]);
        
        console.log("Sending group message via socket");
        socket?.emit("sendMessage", {
          groupId: selectedGroup._id,
          content: messageText
        });
      } else if (chatType === 'direct' && selectedContact) {
        console.log("Sending direct message to:", selectedContact._id);
        
        const res = await api.post(
          `/chat/${selectedContact._id}/messages`,
          { senderId: currentUserId, content: messageText },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const newMessage = res.data;
        console.log("Direct message sent, response:", newMessage);
        
        setDirectMessages(prev => [...prev, newMessage]);
        
        console.log("Emitting sendDirectMessage via socket");
        socket?.emit("sendDirectMessage", {
          recieverId: selectedContact._id,
          senderId: currentUserId,
          content: messageText,
          createdAt: new Date().toISOString()
        });

        addOrUpdatePersonalChat(selectedContact, messageText, new Date().toISOString());
      }

      setMessageText("");
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("Failed to send message");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, directMessages]);

  const combinedChats = getCombinedChats();
  const filteredChats = combinedChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.employeeCode && chat.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredModalContacts = contacts.filter(contact =>
    (
      contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      contact.employeeCode.toLowerCase().includes(contactSearchQuery.toLowerCase())
    ) &&
    contact._id !== currentUserId
  );

  const browsableContacts = getBrowsableContacts();
  const filteredBrowsableContacts = browsableContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-white rounded-lg flex flex-col">
      {activeArea === 'list' && (
        <div className="w-full h-full overflow-y-auto scrollbar-thin bg-white rounded-md flex flex-col">
          <div className="p-4 border-b border-gray-200">
              {role === 'admin' && (
                <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={() => setShowGroupModal(true)}
                      className="h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center gap-2 px-4 justify-center text-white transition-colors"
                    >
                      <Plus size={15} />
                      <p>Create Group</p>
                    </button>
                  <button 
                    onClick={() => setShowContactsTab(!showContactsTab)}
                    className={`h-8 rounded-full flex items-center gap-2 px-4 justify-center transition-colors ${
                      showContactsTab 
                      ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                      >
                    <Users size={15} />
                    <p>{showContactsTab ? 'Back to Chats' : 'Browse Contacts'}</p>
                  </button>
                </div>
              )}
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={13} />
              <input
                type="text"
                placeholder={showContactsTab ? "Search contacts..." : "Search chats..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1">
            {showContactsTab ? (
              filteredBrowsableContacts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No contacts found to start new conversations</p>
                </div>
              ) : (
                filteredBrowsableContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSelectContact(contact)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {contact.profileImage ? (
                          <div className="w-[35px] h-[35px] relative">
                            <Image
                              src={contact.profileImage}
                              alt={`${contact.name} profile`}
                              fill
                              className="rounded-full object-cover object-center"
                            />
                          </div>
                        ) : (
                          <div className="w-[35px] h-[35px] bg-[#f1f1f1] flex items-center justify-center font-semibold rounded-full text-md">
                            {contact.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          {contact.name}
                          <User size={12} className="text-gray-500" />
                        </h3>
                        <p className="text-sm text-gray-500">{contact.employeeCode}</p>
                        <p className="text-xs text-gray-400">{contact.email}</p>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              filteredChats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No chats found</p>
                  <p className="text-xs mt-2">
                    Groups: {groups.length}, Personal: {personalChats.length}
                  </p>
                </div>
              ) : (
                filteredChats.map((chatItem) => (
                  <div
                    key={`${chatItem.type}-${chatItem._id}`}
                    className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSelectChatItem(chatItem)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 items-center">
                        <div className="relative">
                          {chatItem.type === 'group' ? (
                            chatItem.groupImage ? (
                              <div className="w-[30px] h-[30px] relative">
                                <Image
                                  src={chatItem.groupImage}
                                  alt="Group profile"
                                  fill
                                  className="rounded-full object-cover object-center"
                                />
                              </div>
                            ) : (
                              <div className="w-[30px] h-[30px] bg-[#f1f1f1] flex items-center justify-center font-semibold rounded-full text-md">
                                {chatItem.name.slice(0, 1).toUpperCase()}
                              </div>
                            )
                          ) : (
                            chatItem.profileImage ? (
                              <div className="w-[30px] h-[30px] relative">
                                <Image
                                  src={chatItem.profileImage}
                                  alt="User profile"
                                  fill
                                  className="rounded-full object-cover object-center"
                                />
                              </div>
                            ) : (
                              <div className="w-[30px] h-[30px] bg-[#f1f1f1] flex items-center justify-center font-semibold rounded-full text-md">
                                {chatItem.name.slice(0, 1).toUpperCase()}
                              </div>
                            )
                          )}
                          {(chatItem.unreadCount ?? 0) > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                              {chatItem.unreadCount! > 99 ? '99+' : chatItem.unreadCount}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {chatItem.name}
                            {chatItem.type === 'group' && <Users size={12} className="text-gray-500" />}
                            {chatItem.type === 'personal' && <User size={12} className="text-gray-500" />}
                          </h3>
                          <h4
                            className={`text-sm ${
                              chatItem.unreadCount && chatItem.unreadCount > 0
                                ? 'text-gray-900 font-medium'
                                : 'text-gray-500'
                            }`}
                          >
                            {chatItem.lastMessage ||
                              (chatItem.type === 'personal'
                                ? 'Start a conversation'
                                : 'No messages yet')}
                          </h4>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 flex flex-col items-end">
                        <div>{formatGroupDate(chatItem.lastMessageTime)}</div>
                        {chatItem.type === 'group' && chatItem.members && (
                          <div className="text-xs text-gray-400 mt-1">
                            {chatItem.members.length + 1} members
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}

      {activeArea === 'chat' && (
        <div className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-thin">
          {(selectedGroup || selectedContact) ? (
            <div className='bg-white rounded-lg overflow-y-auto h-[500px] flex flex-col'>
              <div className="bg-white px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                <div className='flex items-center gap-2'>
                  <button onClick={() => setActiveArea('list')}>
                    <ArrowLeft size={15} />
                  </button>
                  
                  {chatType === 'group' && selectedGroup ? (
                    <>
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
                    </>
                  ) : selectedContact ? (
                    <>
                      {selectedContact.profileImage ? (
                        <div className='w-[30px] h-[30px] relative'>
                          <Image src={selectedContact.profileImage} alt='Contact profile' fill className='rounded-full object-cover object-center' />
                        </div>
                      ) : (
                        <div className='w-[30px] h-[30px] bg-[#f1f1f1] flex items-center justify-center font-semibold rounded-full text-md'>
                          {selectedContact.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedContact.name}</h3>
                        <p className="text-sm text-gray-500">{selectedContact.employeeCode}</p>
                      </div>
                    </>
                  ) : null}
                </div>
                
                {chatType === 'group' && selectedGroup && (
                  <div className='flex items-center'>
                    <button onClick={() => setGroupList(prev => !prev)} className='w-fit relative'>
                      <Users size={18} />
                    </button>
                    {groupList && 
                      <ul className='bg-white border border-[#ddd] absolute top-25 right-0 w-40 max-h-50 overflow-y-auto scrollbar-thin z-10 shadow-lg'>
                        <li className='border-b p-2 border-[#ddd] text-xs font-semibold bg-gray-50' onClick={() => handleSelectContact(selectedGroup.createdBy)}>{selectedGroup.createdBy.name}</li>
                        {selectedGroup.members
                          .filter(m => m._id !== currentUserId)
                          .map(m => (
                            <li key={m._id} className='border-b p-2 border-[#ddd] text-xs hover:bg-gray-50 cursor-pointer' 
                                onClick={() => handleSelectContact(m)}>
                              <p>{m.name} {m.employeeCode}</p>
                            </li>
                          ))}
                      </ul>
                    }
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin space-y-4">
                {chatType === 'group' ? (
                  messages.map((message) => {
                    const dateLabel = getDateLabel(message.createdAt);
                    const showLabel = dateLabel !== lastDateLabel;
                    lastDateLabel = dateLabel;
                    return (
                      <div
                        key={message._id}
                        className={`flex flex-col  ${message.senderId._id === currentUserId ? 'items-end' : 'items-start'}`}
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
                          <div className={`min-w-25 max-w-50 px-3 py-2 rounded-lg break-words leading-none ${message.senderId._id === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
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
                  })
                ) : (
                  directMessages.map((message) => {
                    const dateLabel = getDateLabel(message.createdAt);
                    const showLabel = dateLabel !== lastDateLabel;
                    lastDateLabel = dateLabel;
                    const isCurrentUser = message.senderId._id === currentUserId;
                    return (
                      <div
                        key={message._id}
                        className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                      >
                        {showLabel && (
                          <div className="text-center w-full text-xs text-gray-500 mb-2">
                            {dateLabel}
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          {!isCurrentUser && (
                            <div className='w-[30px] h-[30px] relative'>
                              {selectedContact?.profileImage ? (
                                <Image src={selectedContact.profileImage} alt='' fill className='rounded-full object-cover object-center' />
                              ) : (
                                <div className='w-[30px] h-[30px] bg-[#f1f1f1] flex items-center justify-center font-semibold rounded-full text-sm'>
                                  {selectedContact?.name.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                            </div>
                          )}
                          <div className={`min-w-25 max-w-50 px-3 py-2 rounded-lg break-words leading-none ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                            <div className='text-sm'>{message.content}</div>
                            <div className={`text-[8px] mt-1 text-end ${
                              isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
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
                  Select a group or contact to start messaging
                </h2>
                {role === 'admin' && (
                  <button
                    onClick={() => setShowGroupModal(true)}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-colors shadow-sm hover:shadow-md"
                  >
                    Create your first group
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              {filteredModalContacts.map((contact) => (
                <label
                  key={contact._id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.some(m => m._id === contact._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleMember(contact);
                    }}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    {contact.profileImage ? (
                      <div className="w-8 h-8 relative">
                        <Image
                          src={contact.profileImage}
                          alt={`${contact.name} profile`}
                          fill
                          className="rounded-full object-cover object-center"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-[#f1f1f1] flex items-center justify-center font-semibold rounded-full text-sm">
                        {contact.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.employeeCode}</div>
                    </div>
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
                  setProfileImage(null);
                  setProfileImagePreview(null);
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