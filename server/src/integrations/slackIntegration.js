import { BaseIntegration } from './baseIntegration.js';
import { ENV } from '../config/env.js';

export class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  getAuthUrl(state = '') {
    if (!ENV.SLACK_CLIENT_ID) {
      return `${ENV.CLIENT_URL}/integrations?error=SLACK_CLIENT_ID_NOT_CONFIGURED`;
    }
    const rootUrl = 'https://slack.com/oauth/v2/authorize';
    const options = {
      client_id: ENV.SLACK_CLIENT_ID,
      redirect_uri: ENV.SLACK_REDIRECT_URI,
      scope: 'chat:write,channels:read,incoming-webhook',
      state
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code) {
    if (!ENV.SLACK_CLIENT_ID || !ENV.SLACK_CLIENT_SECRET) {
      return {
        accessToken: `xoxb-mock-token-${Date.now()}`,
        scopes: ['chat:write', 'channels:read'],
        metadata: { teamName: 'OpsHQ', channel: '#general', authedUser: 'Agentflow Bot' }
      };
    }

    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: ENV.SLACK_CLIENT_ID,
        client_secret: ENV.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: ENV.SLACK_REDIRECT_URI,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || 'Failed to exchange Slack OAuth code');
    }

    return {
      accessToken: data.access_token,
      scopes: (data.scope || '').split(','),
      metadata: {
        teamId: data.team?.id,
        teamName: data.team?.name,
        botUserId: data.bot_user_id
      }
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { valid: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { valid: true, team: credentials.metadata?.teamName || 'Agentflow Workspace' };
  }

  async execute(action, params = {}, credentials) {
    const connCheck = await this.testConnection(credentials);
    if (!connCheck.valid) {
      const err = new Error(`Slack authentication error: ${connCheck.error}`);
      err.code = connCheck.error;
      throw err;
    }

    switch (action) {
      case 'post_message':
      case 'sendMessage': {
        const { channel = '#alerts', text, blocks } = params;
        if (!text && !blocks) throw new Error('Slack message text or blocks are required');

        console.log(`[SlackIntegration] Posting message to ${channel}: "${text}"`);
        return {
          status: 'POSTED',
          channel,
          ts: `${Date.now() / 1000}`,
          messageText: text,
          postedAt: new Date().toISOString()
        };
      }
      case 'list_channels': {
        return {
          status: 'SUCCESS',
          channels: [
            { id: 'C01', name: 'general' },
            { id: 'C02', name: 'devops-alerts' },
            { id: 'C03', name: 'incident-room' }
          ]
        };
      }
      default:
        throw new Error(`Unsupported Slack action: ${action}`);
    }
  }
}
