"use client";

import React, { useState, useEffect } from "react";
import { Slack, BookOpen, Share2, Check, X, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  IntegrationType, 
  ShareTarget, 
  ShareableContent,
  IntegrationConfig,
  getIntegrationStatus,
  initializeIntegration,
  getShareTargets,
  shareContent,
  disconnectIntegration
} from "@/lib/utils/integrations";

interface ShareIntegrationProps {
  content: ShareableContent;
  onClose?: () => void;
}

export function ShareIntegration({ content, onClose }: ShareIntegrationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<IntegrationType>("slack");
  const [slackStatus, setSlackStatus] = useState<IntegrationConfig | null>(null);
  const [notionStatus, setNotionStatus] = useState<IntegrationConfig | null>(null);
  const [teamsStatus, setTeamsStatus] = useState<IntegrationConfig | null>(null);
  const [shareTargets, setShareTargets] = useState<ShareTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<ShareTarget | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shareResult, setShareResult] = useState<{ success: boolean; url?: string } | null>(null);
  
  const [slackTargets, setSlackTargets] = useState<ShareTarget[]>([]);
  const [notionTargets, setNotionTargets] = useState<ShareTarget[]>([]);
  const [teamsTargets, setTeamsTargets] = useState<ShareTarget[]>([]);
  const [selectedSlackTarget, setSelectedSlackTarget] = useState<string>("");
  const [selectedNotionTarget, setSelectedNotionTarget] = useState<string>("");
  const [selectedTeamsTarget, setSelectedTeamsTarget] = useState<string>("");
  
  const [selectedChannel, setSelectedChannel] = useState("");
  const [workspaceUrl, setWorkspaceUrl] = useState("");
  const [notionPageUrl, setNotionPageUrl] = useState("");
  
  const slackChannels = [
    { id: "general", name: "general" },
    { id: "random", name: "random" },
    { id: "data-analysis", name: "data-analysis" },
  ];
  
  // Load integration statuses when opened
  useEffect(() => {
    if (isOpen) {
      setSlackStatus(getIntegrationStatus("slack"));
      setNotionStatus(getIntegrationStatus("notion"));
      setTeamsStatus(getIntegrationStatus("teams"));
      
      // If an integration is connected, fetch targets
      const activeStatus = activeTab === "slack" 
        ? getIntegrationStatus("slack") 
        : activeTab === "notion" 
          ? getIntegrationStatus("notion")
          : getIntegrationStatus("teams");
        
      if (activeStatus?.status === "connected") {
        loadShareTargets(activeTab);
      }
    }
  }, [isOpen, activeTab]);

  // Load share targets for a platform
  const loadShareTargets = async (type: IntegrationType) => {
    setIsLoading(true);
    try {
      const targets = await getShareTargets(type);
      setShareTargets(targets);
      setSelectedTarget(targets.length > 0 ? targets[0] : null);
    } catch (err) {
      console.error("Failed to load share targets:", err);
      toast.error("Failed to load destinations");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Connect to an integration
  const handleConnect = async (type: IntegrationType) => {
    setIsLoading(true);
    try {
      const config = await initializeIntegration(type);
      if (type === "slack") {
        setSlackStatus(config);
      } else if (type === "notion") {
        setNotionStatus(config);
      } else if (type === "teams") {
        setTeamsStatus(config);
      }
      loadShareTargets(type);
    } catch (err) {
      console.error("Failed to connect:", err);
      toast.error(`Failed to connect to ${type === "slack" ? "Slack" : type === "notion" ? "Notion" : "Microsoft Teams"}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Disconnect from an integration
  const handleDisconnect = async (type: IntegrationType) => {
    setIsLoading(true);
    try {
      await disconnectIntegration(type);
      if (type === "slack") {
        setSlackStatus(null);
      } else if (type === "notion") {
        setNotionStatus(null);
      } else if (type === "teams") {
        setTeamsStatus(null);
      }
      setShareTargets([]);
      setSelectedTarget(null);
    } catch (err) {
      console.error("Failed to disconnect:", err);
      toast.error(`Failed to disconnect from ${type === "slack" ? "Slack" : type === "notion" ? "Notion" : "Microsoft Teams"}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Share content to selected target
  const handleShare = async (platform: string) => {
    if (platform === "slack") {
      if (!selectedChannel || !workspaceUrl) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      // Simulate API call to share to Slack
      toast.success(`Shared to Slack channel #${selectedChannel}`);
    } else if (platform === "notion") {
      if (!notionPageUrl) {
        toast.error("Please enter a Notion page URL");
        return;
      }
      
      // Simulate API call to share to Notion
      toast.success("Shared to Notion page");
    }
    
    setIsOpen(false);
  };
  
  // Reset all state when closing
  const handleClose = () => {
    setIsOpen(false);
    setShareResult(null);
    if (onClose) {
      onClose();
    }
  };
  
  // Get the active integration status
  const getActiveIntegrationStatus = () => {
    return activeTab === "slack" ? slackStatus : activeTab === "notion" ? notionStatus : teamsStatus;
  };
  
  // Current integration is connected
  const isConnected = getActiveIntegrationStatus()?.status === "connected";
  
  return (
    <div>
      {/* Dialog Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <polyline points="16 6 12 2 8 6"></polyline>
          <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
        Share
      </button>

      {/* Dialog Content */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Share Analysis</h2>
              <p className="text-sm text-gray-500">
                Share your spreadsheet analysis with your team
              </p>
            </div>
            
            {/* Tabs */}
            <div className="p-4">
              <div className="flex border rounded-md overflow-hidden mb-4">
                <button 
                  className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === "slack" ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700"}`}
                  onClick={() => setActiveTab("slack")}
                >
                  Slack
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    New
                  </span>
                </button>
                <button 
                  className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === "notion" ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700"}`}
                  onClick={() => setActiveTab("notion")}
                >
                  Notion
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    New
                  </span>
                </button>
              </div>
              
              {/* Slack Tab Content */}
              {activeTab === "slack" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="workspace-url" className="block text-sm font-medium text-gray-700">
                      Slack Workspace URL
                    </label>
                    <input 
                      id="workspace-url" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://your-workspace.slack.com" 
                      value={workspaceUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkspaceUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="channel-select" className="block text-sm font-medium text-gray-700">
                      Channel
                    </label>
                    <select
                      id="channel-select"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value)}
                    >
                      <option value="">Select a channel</option>
                      {slackChannels.map((channel) => (
                        <option key={channel.id} value={channel.id}>
                          #{channel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <button 
                    onClick={() => handleShare("slack")} 
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Share to Slack
                  </button>
                </div>
              )}
              
              {/* Notion Tab Content */}
              {activeTab === "notion" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="notion-page" className="block text-sm font-medium text-gray-700">
                      Notion Page URL
                    </label>
                    <input 
                      id="notion-page" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://www.notion.so/page-id" 
                      value={notionPageUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotionPageUrl(e.target.value)}
                    />
                  </div>
                  
                  <hr className="my-4" />
                  
                  <button 
                    onClick={() => handleShare("notion")} 
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Share to Notion
                  </button>
                </div>
              )}
            </div>
            
            {/* Dialog Footer */}
            <div className="flex justify-end p-4 border-t bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 