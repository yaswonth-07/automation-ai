/**
 * BaseIntegration defines the interface contract for all third-party integrations
 */
export class BaseIntegration {
  constructor(providerName) {
    if (!providerName) {
      throw new Error('Provider name is required');
    }
    this.providerName = providerName;
  }

  /**
   * Get provider authorization URL
   */
  getAuthUrl(state = '') {
    throw new Error('getAuthUrl must be implemented by subclass');
  }

  /**
   * Exchange OAuth code for tokens
   */
  async handleCallback(code) {
    throw new Error('handleCallback must be implemented by subclass');
  }

  /**
   * Test connection and token health
   */
  async testConnection(credentials) {
    throw new Error('testConnection must be implemented by subclass');
  }

  /**
   * Execute integration action
   */
  async execute(action, params, credentials) {
    throw new Error('execute must be implemented by subclass');
  }
}
