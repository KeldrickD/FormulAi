"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { User, UserPlus, Users, MessageCircle, PlusCircle, CheckCircle, X, Bot } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isActive: boolean;
  lastActive?: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    isAI: boolean;
  };
}

interface TeamCollaborationProps {
  spreadsheetId?: string;
  currentUserId?: string;
}

export default function TeamCollaboration({ 
  spreadsheetId,
  currentUserId = "user-1"
}: TeamCollaborationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"team" | "chat">("team");
  const [message, setMessage] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "user-1",
      name: "You",
      email: "you@example.com",
      avatar: "https://ui-avatars.com/api/?name=You&background=0D8ABC&color=fff",
      isActive: true
    },
    {
      id: "ai-assistant",
      name: "AI Assistant",
      email: "ai@formulai.com",
      avatar: "https://ui-avatars.com/api/?name=AI&background=6366F1&color=fff",
      isActive: true
    }
  ]);

  // Load initial data
  useEffect(() => {
    if (spreadsheetId) {
      // In a real app, we would fetch team members and chat history
      const mockMessages: Message[] = [
        {
          id: "msg-1",
          content: "I've analyzed the sales data. Q3 shows a 12% increase compared to Q2.",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          sender: {
            id: "ai-assistant",
            name: "AI Assistant",
            isAI: true
          }
        },
        {
          id: "msg-2",
          content: "Can you create a forecast for Q4 based on this trend?",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          sender: {
            id: "user-1",
            name: "You",
            isAI: false
          }
        },
        {
          id: "msg-3",
          content: "Based on the current growth rate and seasonal patterns, I project Q4 sales to increase by 15-18% compared to Q3. I've added a forecast chart to the dashboard.",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          sender: {
            id: "ai-assistant",
            name: "AI Assistant",
            isAI: true
          }
        }
      ];
      
      setMessages(mockMessages);
    }
  }, [spreadsheetId]);

  // Send a message
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      content: message,
      timestamp: new Date().toISOString(),
      sender: {
        id: currentUserId,
        name: "You",
        isAI: false
      }
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg-${Date.now()}-ai`,
        content: getAIResponse(message),
        timestamp: new Date().toISOString(),
        sender: {
          id: "ai-assistant",
          name: "AI Assistant",
          isAI: true
        }
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // Simple AI response generator
  const getAIResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("forecast") || message.includes("predict")) {
      return "I've analyzed the historical data and created a forecast model. Based on the trends, I predict a 15% growth in the next quarter. Would you like me to visualize this data?";
    }
    
    if (message.includes("analyze") || message.includes("analysis")) {
      return "I've performed an analysis of your data. The key insights are: 1) Revenue has increased by 12% YoY, 2) Customer acquisition cost has decreased by 8%, 3) Product A is outperforming expectations. Would you like me to focus on any specific aspect?";
    }
    
    if (message.includes("dashboard") || message.includes("chart") || message.includes("visual")) {
      return "I've created a dashboard with the key metrics you might be interested in. It includes sales trends, revenue breakdown by product, and customer demographics. You can access it from the 'Auto-Dashboard' section.";
    }
    
    return "I've analyzed your request and I'm ready to help. Would you like me to explain any specific aspects of the data or create visualizations to better understand the trends?";
  };

  // Invite a team member
  const handleInviteMember = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Generate a name from the email
    const name = inviteEmail.split('@')[0].split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
    
    // Add new team member
    const newMember: TeamMember = {
      id: `user-${Date.now()}`,
      name,
      email: inviteEmail,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff`,
      isActive: false,
      lastActive: "Just invited"
    };
    
    setTeamMembers(prev => [...prev, newMember]);
    setInviteEmail("");
    toast.success(`Invitation sent to ${inviteEmail}`);
  };

  // Remove a team member
  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    toast.success("Team member removed");
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
      {/* Toggle button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors"
      >
        <Users className="h-6 w-6" />
      </button>
      
      {/* Collaboration panel */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-96 mt-3 border border-gray-200 overflow-hidden">
          <div className="border-b">
            <div className="flex">
              <button
                className={`flex-1 px-4 py-3 font-medium text-sm ${
                  activeTab === "team" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
                }`}
                onClick={() => setActiveTab("team")}
              >
                Team
              </button>
              <button
                className={`flex-1 px-4 py-3 font-medium text-sm ${
                  activeTab === "chat" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
                }`}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
            </div>
          </div>
          
          {/* Team tab content */}
          {activeTab === "team" && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Team Members</h3>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="h-8 w-8 rounded-full"
                        />
                        {member.isActive && (
                          <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white"></div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700 flex items-center">
                          {member.name}
                          {member.id === "ai-assistant" && (
                            <Bot className="ml-1 h-3 w-3 text-indigo-500" />
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.lastActive ? member.lastActive : (member.isActive ? "Active now" : member.email)}
                        </p>
                      </div>
                    </div>
                    {member.id !== currentUserId && member.id !== "ai-assistant" && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Invite new member */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Invite Team Member</h3>
                <div className="flex">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Email address"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleInviteMember}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Chat tab content */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-96">
              {/* Messages area */}
              <div className="flex-grow p-4 space-y-3 overflow-y-auto">
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender.isAI ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-xs p-3 rounded-lg ${
                      msg.sender.isAI 
                        ? "bg-gray-100 text-gray-800" 
                        : "bg-blue-600 text-white"
                    }`}>
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-medium">
                          {msg.sender.name}
                        </span>
                        {msg.sender.isAI && (
                          <Bot className="ml-1 h-3 w-3" />
                        )}
                        <span className="text-xs opacity-70 ml-2">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message input */}
              <div className="p-3 border-t bg-gray-50">
                <div className="flex">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask the AI assistant or type a message"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-2 rounded-r-md"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 