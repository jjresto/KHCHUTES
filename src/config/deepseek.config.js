/**
 * DeepSeek V3 Configuration
 * 
 * Configuration settings for the DeepSeek V3 integration.
 * Set environment variables in your .env file.
 */

export const deepSeekConfig = {
  // API Configuration
  apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
  apiKey: process.env.DEEPSEEK_API_KEY,
  
  // Model Configuration
  model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  
  // Request Parameters
  temperature: parseFloat(process.env.DEEPSEEK_TEMPERATURE || '0.3'),
  maxTokens: parseInt(process.env.DEEPSEEK_MAX_TOKENS || '2000'),
  
  // Feature Flags
  enableMultimodal: process.env.DEEPSEEK_ENABLE_MULTIMODAL === 'true',
  enableInternetContext: process.env.DEEPSEEK_ENABLE_INTERNET === 'true',
  
  // Timeout and Retry Configuration
  requestTimeout: parseInt(process.env.DEEPSEEK_TIMEOUT || '30000'), // 30 seconds
  maxRetries: parseInt(process.env.DEEPSEEK_MAX_RETRIES || '2'),
  
  // Diagnostic-Specific Settings
  diagnostics: {
    minConfidenceScore: 30, // Minimum acceptable confidence score
    requireProfessionalVerification: [
      'brakes',
      'steering',
      'airbags',
      'suspension',
      'transmission'
    ],
    severityLevels: {
      immediate: {
        label: 'Immediate Attention Required',
        priority: 1,
        color: 'red'
      },
      soon: {
        label: 'Attention Needed Soon',
        priority: 2,
        color: 'orange'
      },
      routine: {
        label: 'Routine Maintenance',
        priority: 3,
        color: 'blue'
      },
      monitor: {
        label: 'Monitor Condition',
        priority: 4,
        color: 'green'
      }
    }
  }
};

export default deepSeekConfig;
