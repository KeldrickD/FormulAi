/**
 * Supported integration platforms
 */
export type IntegrationType = 'slack' | 'notion' | 'teams';

/**
 * Integration connection status
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'pending';

/**
 * Integration configuration
 */
export interface IntegrationConfig {
  type: IntegrationType;
  status: ConnectionStatus;
  workspaceName?: string;
  lastSynced?: string;
  settings?: Record<string, any>;
}

/**
 * Share target for content
 */
export interface ShareTarget {
  type: IntegrationType;
  destination: string; // Channel ID for Slack, page ID for Notion
  destinationName: string; // Human-readable name (channel name, page title)
}

/**
 * Content that can be shared to integrations
 */
export interface ShareableContent {
  title: string;
  description?: string;
  visualization?: {
    type: 'chart' | 'table' | 'forecast';
    data: any;
    config?: any;
  };
  insights?: string[];
  spreadsheetLink?: string;
  formulaExplanation?: any;
}

/**
 * Mock function to initialize an integration
 * In a real implementation, this would redirect to OAuth flow
 */
export function initializeIntegration(type: IntegrationType): Promise<IntegrationConfig> {
  // This would normally trigger an OAuth flow
  return new Promise((resolve) => {
    setTimeout(() => {
      const config: IntegrationConfig = {
        type,
        status: 'connected',
        workspaceName: type === 'slack' 
          ? 'Acme Corporation' 
          : type === 'notion' 
          ? 'Team Workspace'
          : 'Organization Teams',
        lastSynced: new Date().toISOString()
      };
      
      // Store in local storage for demo purposes
      localStorage.setItem(`integration_${type}`, JSON.stringify(config));
      
      resolve(config);
    }, 1500);
  });
}

/**
 * Get the status of an integration
 */
export function getIntegrationStatus(type: IntegrationType): IntegrationConfig | null {
  if (typeof localStorage === 'undefined') return null;
  
  const stored = localStorage.getItem(`integration_${type}`);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as IntegrationConfig;
  } catch (e) {
    return null;
  }
}

/**
 * Disconnect an integration
 */
export function disconnectIntegration(type: IntegrationType): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem(`integration_${type}`);
      resolve();
    }, 500);
  });
}

/**
 * Get available share targets for a given integration
 */
export function getShareTargets(type: IntegrationType): Promise<ShareTarget[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (type === 'slack') {
        resolve([
          { type: 'slack', destination: 'C01234567', destinationName: '#general' },
          { type: 'slack', destination: 'C07654321', destinationName: '#data-insights' },
          { type: 'slack', destination: 'C09876543', destinationName: '#finance' }
        ]);
      } else if (type === 'notion') {
        resolve([
          { type: 'notion', destination: 'page_123', destinationName: 'Project Dashboard' },
          { type: 'notion', destination: 'page_456', destinationName: 'Quarterly Reports' },
          { type: 'notion', destination: 'page_789', destinationName: 'Financial Analysis' }
        ]);
      } else {
        resolve([
          { type: 'teams', destination: 'team_123', destinationName: 'General' },
          { type: 'teams', destination: 'team_456', destinationName: 'Data Analysis' },
          { type: 'teams', destination: 'team_789', destinationName: 'Finance Department' }
        ]);
      }
    }, 800);
  });
}

/**
 * Share content to a platform
 */
export function shareContent(
  target: ShareTarget,
  content: ShareableContent
): Promise<{ success: boolean; messageId?: string; url?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real implementation, this would post to Slack API or Notion API
      console.log(`Sharing to ${target.type}:${target.destinationName}`, content);
      
      // Simulate successful share with mock response
      if (target.type === 'slack') {
        resolve({
          success: true,
          messageId: `msg_${Date.now()}`,
          url: `https://slack.com/archives/${target.destination}/p${Date.now()}`
        });
      } else if (target.type === 'notion') {
        resolve({
          success: true,
          url: `https://notion.so/${target.destination}#${Date.now()}`
        });
      } else {
        resolve({
          success: true,
          messageId: `msg_${Date.now()}`,
          url: `https://teams.microsoft.com/l/channel/${target.destination}/conversations?${Date.now()}`
        });
      }
    }, 1200);
  });
}

/**
 * Format visualization data for sharing
 */
export function formatVisualizationForSharing(
  visualization: ShareableContent['visualization'],
  platform: IntegrationType
): string {
  if (!visualization) return '';
  
  // In a real implementation, this would convert the visualization to a format 
  // supported by the platform (e.g., Slack blocks, Notion blocks)
  
  if (platform === 'slack') {
    return JSON.stringify({
      blocks: [
        {
          type: "image",
          title: {
            type: "plain_text",
            text: "Chart"
          },
          image_url: "https://example.com/chart.png",
          alt_text: "Chart visualization"
        }
      ]
    });
  } else if (platform === 'notion') {
    return JSON.stringify({
      object: "block",
      type: "image",
      image: {
        type: "external",
        external: {
          url: "https://example.com/chart.png"
        }
      }
    });
  } else {
    return JSON.stringify({
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.3",
      body: [
        {
          type: "Image",
          url: "https://example.com/chart.png",
          altText: "Chart visualization"
        }
      ]
    });
  }
}

/**
 * Format forecast data for sharing
 */
export function formatForecastForSharing(
  forecast: any,
  platform: IntegrationType
): string {
  if (!forecast) return '';
  
  // Basic text formatting for demo purposes
  const trendIcon = forecast.trend === 'increasing' ? '📈' : forecast.trend === 'decreasing' ? '📉' : '➡️';
  const percentChange = forecast.percentChange > 0 ? `+${forecast.percentChange.toFixed(1)}%` : `${forecast.percentChange.toFixed(1)}%`;
  
  return `*${forecast.columnName} Forecast*\n${trendIcon} ${percentChange} (${forecast.confidence.toFixed(0)}% confidence)\n`;
}

/**
 * Format formula explanation for sharing
 */
export function formatFormulaExplanationForSharing(
  explanation: any,
  platform: IntegrationType
): string {
  if (!explanation) return '';
  
  // Format differently based on platform
  if (platform === 'slack') {
    return `*Formula:* \`${explanation.original}\`\n*Explanation:* ${explanation.plainLanguage}`;
  } else {
    return `## Formula: ${explanation.original}\n*${explanation.plainLanguage}*`;
  }
} 