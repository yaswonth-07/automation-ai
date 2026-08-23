import { integrationService } from '../services/integrationService.js';
import { ENV } from '../config/env.js';

export class IntegrationController {
  async getIntegrations(req, res, next) {
    try {
      const integrations = await integrationService.getUserIntegrations(req.user.id);
      res.status(200).json({ success: true, data: integrations });
    } catch (err) {
      next(err);
    }
  }

  async getHealthStatus(req, res, next) {
    try {
      const health = await integrationService.getHealthStatus(req.user.id);
      res.status(200).json({ success: true, data: health });
    } catch (err) {
      next(err);
    }
  }

  async startOAuth(req, res, next) {
    try {
      const { provider } = req.params;
      const authUrl = await integrationService.getAuthUrl(provider, req.user?.id || req.query.userId);
      res.redirect(authUrl);
    } catch (err) {
      res.redirect(`${ENV.CLIENT_URL}/integrations?error=${encodeURIComponent(err.message)}`);
    }
  }

  async handleCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { code, state, error } = req.query;

      if (error) {
        return res.redirect(`${ENV.CLIENT_URL}/integrations?error=${encodeURIComponent(error)}`);
      }

      await integrationService.handleOAuthCallback(provider, code, state);
      res.redirect(`${ENV.CLIENT_URL}/integrations?connected=${provider}`);
    } catch (err) {
      res.redirect(`${ENV.CLIENT_URL}/integrations?error=${encodeURIComponent(err.message)}`);
    }
  }

  async handleOAuthError(req, res, next) {
    const errorMsg = req.query.message || 'OAuth authorization failed';
    res.status(400).json({ success: false, error: errorMsg, code: 'OAUTH_FAILED' });
  }

  async saveCredentials(req, res, next) {
    try {
      const { provider, credentials } = req.body;
      const result = await integrationService.saveManualCredentials(req.user.id, provider, credentials);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async disconnect(req, res, next) {
    try {
      const { provider } = req.params;
      const result = await integrationService.disconnect(req.user.id, provider);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}

export const integrationController = new IntegrationController();
