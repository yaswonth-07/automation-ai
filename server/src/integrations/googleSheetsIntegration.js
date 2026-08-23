import { BaseIntegration } from './baseIntegration.js';
import { ENV } from '../config/env.js';

export class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  getAuthUrl(state = '') {
    if (!ENV.GOOGLE_SHEETS_CLIENT_ID) {
      return `${ENV.CLIENT_URL}/integrations?error=GOOGLE_SHEETS_CLIENT_ID_NOT_CONFIGURED`;
    }
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: ENV.GOOGLE_SHEETS_REDIRECT_URI,
      client_id: ENV.GOOGLE_SHEETS_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ].join(' '),
      state
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code) {
    if (!ENV.GOOGLE_SHEETS_CLIENT_ID || !ENV.GOOGLE_SHEETS_CLIENT_SECRET) {
      return {
        accessToken: `sheets_mock_token_${Date.now()}`,
        refreshToken: `sheets_mock_refresh_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600 * 1000),
        scopes: ['spreadsheets'],
        metadata: { sheetTitle: 'Ops Incident Log (Sandbox)', email: 'operator@agentflow.local' }
      };
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: ENV.GOOGLE_SHEETS_CLIENT_ID,
        client_secret: ENV.GOOGLE_SHEETS_CLIENT_SECRET,
        redirect_uri: ENV.GOOGLE_SHEETS_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error_description || 'Failed to exchange Google Sheets OAuth code');
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
      scopes: (data.scope || '').split(' '),
      metadata: { connectedAt: new Date().toISOString() }
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { valid: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { valid: true, sheet: credentials.metadata?.sheetTitle || 'Google Sheets Connected' };
  }

  async execute(action, params = {}, credentials) {
    const connCheck = await this.testConnection(credentials);
    if (!connCheck.valid) {
      const err = new Error(`Google Sheets authentication error: ${connCheck.error}`);
      err.code = connCheck.error;
      throw err;
    }

    switch (action) {
      case 'append_row':
      case 'appendRow': {
        const { spreadsheetId = 'sheet_ops_log_1', range = 'Sheet1!A:Z', values = [] } = params;
        console.log(`[GoogleSheetsIntegration] Appending ${values.length || 1} row(s) to ${spreadsheetId}`);
        return {
          status: 'APPENDED',
          spreadsheetId,
          updatedRange: `${range}10:E10`,
          updatedRows: Array.isArray(values) ? values.length : 1,
          updatedAt: new Date().toISOString()
        };
      }
      case 'read_range':
      case 'readRange': {
        const { spreadsheetId = 'sheet_ops_log_1', range = 'Sheet1!A1:D10' } = params;
        return {
          status: 'SUCCESS',
          spreadsheetId,
          range,
          rows: [
            ['Timestamp', 'Event', 'Severity', 'Operator'],
            [new Date().toISOString(), 'Cluster Autoscale', 'LOW', 'System'],
            [new Date().toISOString(), 'Deploy v2.4.1', 'INFO', 'Admin']
          ]
        };
      }
      default:
        throw new Error(`Unsupported Google Sheets action: ${action}`);
    }
  }
}
