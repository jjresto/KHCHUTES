/**
 * DeepSeek V3 Integration Service
 * 
 * This service handles all interactions with the DeepSeek V3 API for automotive diagnostics.
 * It processes vehicle symptoms, OBD-II codes, and multimodal inputs to generate comprehensive diagnoses.
 */

const DEEPSEEK_API_ENDPOINT = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

class DeepSeekV3Service {
  constructor() {
    if (!DEEPSEEK_API_KEY) {
      console.warn('DeepSeek API key not configured. Set DEEPSEEK_API_KEY environment variable.');
    }
  }

  /**
   * Analyzes vehicle symptoms and generates diagnostic report
   * @param {Object} params - Diagnostic parameters
   * @param {string} params.vehicleInfo - Vehicle identification string (year, make, model, engine)
   * @param {number} params.mileage - Current vehicle mileage
   * @param {string} params.symptoms - User-described symptoms
   * @param {Array<string>} params.troubleCodes - OBD-II diagnostic trouble codes
   * @param {Array<string>} params.imageUrls - URLs to symptom images
   * @param {Array<string>} params.audioUrls - URLs to audio recordings
   * @returns {Promise<Object>} Diagnostic analysis result
   */
  async analyzeDiagnostic({ 
    vehicleInfo, 
    mileage, 
    symptoms, 
    troubleCodes = [], 
    imageUrls = [], 
    audioUrls = [] 
  }) {
    try {
      const prompt = this._buildDiagnosticPrompt({
        vehicleInfo,
        mileage,
        symptoms,
        troubleCodes
      });

      const messages = [
        {
          role: 'system',
          content: this._getSystemPrompt()
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      // If DeepSeek V3 supports multimodal input, include images
      if (imageUrls.length > 0) {
        messages[1].content = this._addMultimodalContent(prompt, imageUrls);
      }

      const response = await this._callDeepSeekAPI(messages);
      
      return this._parseResponse(response);
    } catch (error) {
      console.error('DeepSeek V3 Analysis Error:', error);
      throw new Error(`Failed to analyze diagnostic: ${error.message}`);
    }
  }

  /**
   * Builds the diagnostic prompt for DeepSeek V3
   * @private
   */
  _buildDiagnosticPrompt({ vehicleInfo, mileage, symptoms, troubleCodes }) {
    let prompt = `You are an expert automotive diagnostic AI with deep knowledge of vehicle systems, common failure modes, and repair procedures.

**Vehicle Information:**
- Vehicle: ${vehicleInfo}
- Mileage: ${mileage || 'Unknown'} miles

**Reported Symptoms:**
${symptoms}
`;

    if (troubleCodes.length > 0) {
      prompt += `\n**OBD-II Diagnostic Trouble Codes:**
${troubleCodes.join(', ')}
`;
    }

    prompt += `\n**Required Analysis:**

Please provide a comprehensive diagnostic analysis with the following structure:

1. **Diagnosis**: A detailed explanation of the most likely cause(s) of the issue, including:
   - Primary suspected component failures
   - How the symptoms correlate with the trouble codes (if any)
   - Underlying mechanical or electrical issues
   - Any related systems that may be affected

2. **Severity Assessment**: Categorize as one of:
   - "immediate" - Safety critical, requires immediate attention
   - "soon" - Should be addressed within days/weeks
   - "routine" - Can wait until next scheduled maintenance
   - "monitor" - Watch for changes, not urgent

3. **Affected Components**: List all vehicle components that are likely involved

4. **Repair Recommendations**: Provide step-by-step recommendations including:
   - Diagnostic verification steps
   - Repair procedures in priority order
   - Whether each step is DIY-possible or requires professional service
   - Priority level (high, medium, low)

5. **Cost Estimation**: Provide realistic minimum and maximum repair cost estimates in USD
   - Consider parts and labor
   - Account for diagnostic fees
   - Note regional variations

6. **Confidence Score**: Rate your diagnostic confidence from 0-100 based on:
   - Symptom clarity and detail
   - Availability of trouble codes
   - Common failure patterns for this vehicle

**Important Guidelines:**
- Always recommend professional verification for safety-critical systems (brakes, steering, airbags)
- Be thorough but concise
- Consider the vehicle's age and mileage in your analysis
- Flag any symptoms that could indicate multiple issues
- Provide practical, actionable recommendations

Please respond ONLY with valid JSON matching this exact schema:
{
  "diagnosis": "string - detailed diagnosis explanation",
  "severity": "string - one of: immediate, soon, routine, monitor",
  "confidence_score": "number - 0-100",
  "estimated_cost_min": "number - minimum cost in USD",
  "estimated_cost_max": "number - maximum cost in USD",
  "affected_components": ["array of component names"],
  "recommendations": [
    {
      "action": "string - what to do",
      "priority": "string - high, medium, or low",
      "diy_possible": "boolean - can this be done DIY",
      "description": "string - detailed description"
    }
  ]
}`;

    return prompt;
  }

  /**
   * Returns the system prompt for DeepSeek V3
   * @private
   */
  _getSystemPrompt() {
    return `You are an expert automotive diagnostic AI system with comprehensive knowledge of:
- Vehicle mechanical and electrical systems
- OBD-II diagnostic trouble codes and their meanings
- Common failure modes and repair procedures
- Safety-critical systems and when to recommend professional service
- Cost estimation for parts and labor

You provide accurate, detailed diagnostics while always prioritizing safety. You communicate clearly and provide actionable recommendations. You always respond with valid JSON formatted according to the provided schema.`;
  }

  /**
   * Adds multimodal content (images) to the prompt if DeepSeek V3 supports it
   * @private
   */
  _addMultimodalContent(textPrompt, imageUrls) {
    // DeepSeek V3 multimodal format (adjust based on actual API spec)
    // This is a placeholder - update based on DeepSeek V3's actual multimodal API
    return [
      {
        type: 'text',
        text: textPrompt
      },
      ...imageUrls.map(url => ({
        type: 'image_url',
        image_url: { url }
      }))
    ];
  }

  /**
   * Calls the DeepSeek V3 API
   * @private
   */
  async _callDeepSeekAPI(messages) {
    const requestBody = {
      model: 'deepseek-chat', // Use the appropriate DeepSeek V3 model identifier
      messages: messages,
      temperature: 0.3, // Lower temperature for more consistent diagnostic output
      max_tokens: 2000,
      response_format: { type: 'json_object' } // Request JSON response
    };

    const response = await fetch(DEEPSEEK_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Parses and validates the DeepSeek V3 response
   * @private
   */
  _parseResponse(apiResponse) {
    try {
      // Extract the content from DeepSeek's response format
      const content = apiResponse.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in API response');
      }

      // Parse JSON response
      const diagnosis = JSON.parse(content);

      // Validate required fields
      const requiredFields = ['diagnosis', 'severity', 'confidence_score', 'estimated_cost_min', 'estimated_cost_max'];
      for (const field of requiredFields) {
        if (!(field in diagnosis)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate severity value
      const validSeverities = ['immediate', 'soon', 'routine', 'monitor'];
      if (!validSeverities.includes(diagnosis.severity)) {
        console.warn(`Invalid severity "${diagnosis.severity}", defaulting to "routine"`);
        diagnosis.severity = 'routine';
      }

      // Ensure arrays exist
      diagnosis.affected_components = diagnosis.affected_components || [];
      diagnosis.recommendations = diagnosis.recommendations || [];

      // Validate confidence score range
      diagnosis.confidence_score = Math.max(0, Math.min(100, diagnosis.confidence_score));

      return diagnosis;
    } catch (error) {
      console.error('Failed to parse DeepSeek response:', error);
      throw new Error(`Invalid response format: ${error.message}`);
    }
  }

  /**
   * Interprets a specific OBD-II trouble code using DeepSeek V3
   * @param {string} code - The OBD-II code (e.g., "P0420")
   * @param {string} vehicleInfo - Vehicle identification
   * @returns {Promise<Object>} Code interpretation
   */
  async interpretTroubleCode(code, vehicleInfo) {
    const messages = [
      {
        role: 'system',
        content: this._getSystemPrompt()
      },
      {
        role: 'user',
        content: `Provide detailed information about OBD-II trouble code ${code} for a ${vehicleInfo}. Include common causes, symptoms, and repair procedures specific to this vehicle type. Respond with valid JSON.`
      }
    ];

    try {
      const response = await this._callDeepSeekAPI(messages);
      return this._parseResponse(response);
    } catch (error) {
      console.error('Failed to interpret trouble code:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const deepSeekV3 = new DeepSeekV3Service();
export default DeepSeekV3Service;
