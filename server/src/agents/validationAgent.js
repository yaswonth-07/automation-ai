/**
 * Validation Agent: Verifies required output fields and ensures data integrity
 * before proceeding to downstream steps.
 */
export class ValidationAgent {
  constructor() {
    this.name = 'validation';
  }

  async validate(node, output) {
    if (!output) {
      return {
        isValid: false,
        errorType: 'MISSING_FIELDS',
        message: `Node "${node.id}" produced null or empty execution output`,
      };
    }

    // Check for explicit error responses
    if (output.status === 'FAILED' || output.error) {
      return {
        isValid: false,
        errorType: output.errorCode || 'API_FAILURE',
        message: output.error || 'Node execution failed validation check',
      };
    }

    // Specific category checks
    const category = node.data?.category;
    if (category === 'integration' && node.data?.provider === 'gmail') {
      if (node.data?.action === 'send_email' && !output.messageId && !output.status) {
        return {
          isValid: false,
          errorType: 'MISSING_FIELDS',
          message: 'Gmail send action missing confirmation messageId',
        };
      }
    }

    return {
      isValid: true,
      message: `Node "${node.id}" output validated successfully`,
      checkedFields: Object.keys(output),
    };
  }
}

export const validationAgent = new ValidationAgent();
