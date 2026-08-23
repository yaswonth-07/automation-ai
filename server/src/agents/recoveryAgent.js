/**
 * Recovery Agent: Classifies runtime failures into categories
 * (MISSING_FIELDS, API_FAILURE, AUTH_EXPIRED, RATE_LIMIT, TRANSIENT)
 * and determines the self-healing strategy (retry_with_backoff vs. escalate).
 */
export class RecoveryAgent {
  constructor() {
    this.name = 'recovery';
  }

  classifyFailure(error, retryCount = 0, maxRetries = 3) {
    const errorMsg = (error.message || String(error)).toLowerCase();
    const errorCode = error.code || '';

    let failureType = 'API_FAILURE';
    let strategy = 'escalate';
    let backoffMs = 0;
    let reason = '';

    if (errorCode === 'AUTH_EXPIRED' || errorMsg.includes('auth_expired') || errorMsg.includes('token expired') || errorMsg.includes('unauthorized')) {
      failureType = 'AUTH_EXPIRED';
      strategy = 'escalate';
      reason = 'Third-party OAuth token expired or revoked. Operator re-authentication required.';
    } else if (errorCode === 'INTEGRATION_NOT_CONNECTED' || errorMsg.includes('integration_not_connected') || errorMsg.includes('not connected')) {
      failureType = 'INTEGRATION_NOT_CONNECTED';
      strategy = 'escalate';
      reason = 'Integration is not connected. Please connect the service in the Integrations panel.';
    } else if (errorCode === 'RATE_LIMIT' || errorMsg.includes('rate limit') || errorMsg.includes('429')) {
      failureType = 'RATE_LIMIT';
      if (retryCount < maxRetries) {
        strategy = 'retry_with_backoff';
        backoffMs = Math.pow(2, retryCount) * 1500; // Exponential backoff: 1.5s, 3s, 6s
        reason = `Rate limit encountered. Retrying in ${backoffMs / 1000}s with exponential backoff.`;
      } else {
        strategy = 'escalate';
        reason = 'Max rate-limit retries exhausted. Escalating to operator.';
      }
    } else if (errorCode === 'MISSING_FIELDS' || errorMsg.includes('missing') || errorMsg.includes('required')) {
      failureType = 'MISSING_FIELDS';
      strategy = 'escalate';
      reason = 'Required schema parameters missing from step input. Payload validation failed.';
    } else if (errorMsg.includes('timeout') || errorMsg.includes('econnreset') || errorMsg.includes('network') || errorMsg.includes('transient')) {
      failureType = 'TRANSIENT';
      if (retryCount < maxRetries) {
        strategy = 'retry_with_backoff';
        backoffMs = Math.pow(2, retryCount) * 1000;
        reason = `Transient network glitch detected. Retrying step (Attempt ${retryCount + 1}/${maxRetries}).`;
      } else {
        strategy = 'escalate';
        reason = 'Transient error persisted past max retry threshold.';
      }
    } else {
      failureType = 'API_FAILURE';
      strategy = retryCount < 1 ? 'retry_with_backoff' : 'escalate';
      backoffMs = 1000;
      reason = `General execution error: ${error.message || 'Unknown failure'}`;
    }

    return {
      failureType,
      strategy,
      backoffMs,
      reason,
      retryCount,
      classifiedAt: new Date().toISOString(),
    };
  }
}

export const recoveryAgent = new RecoveryAgent();
