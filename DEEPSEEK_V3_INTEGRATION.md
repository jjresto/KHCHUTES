# DeepSeek V3 Integration Guide

## Overview

This document provides comprehensive information about the DeepSeek V3 integration in the Automotive Diagnostic AI System. DeepSeek V3 is the core AI engine that powers all diagnostic analysis, symptom interpretation, and repair recommendations.

## Table of Contents

1. [Architecture](#architecture)
2. [Setup and Configuration](#setup-and-configuration)
3. [Integration Points](#integration-points)
4. [API Usage](#api-usage)
5. [Data Flow](#data-flow)
6. [Error Handling](#error-handling)
7. [Multimodal Support](#multimodal-support)
8. [Customization](#customization)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                   User Interface Layer                  │
│  (NewDiagnostic.js, SymptomInput.js, VehicleSelection)  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              DeepSeek V3 Service Layer                  │
│           (src/services/deepseekV3.js)                  │
│                                                         │
│  • analyzeDiagnostic()                                  │
│  • interpretTroubleCode()                               │
│  • _buildDiagnosticPrompt()                             │
│  • _callDeepSeekAPI()                                   │
│  • _parseResponse()                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  DeepSeek V3 API                        │
│         https://api.deepseek.com/v1/...                 │
│                                                         │
│  • Chat Completions                                     │
│  • JSON Response Mode                                   │
│  • Multimodal Input (Images)                            │
└─────────────────────────────────────────────────────────┘
```

### Key Files

- **`src/services/deepseekV3.js`**: Main integration service
- **`src/pages/NewDiagnostic.js`**: Primary usage point (handleSymptomSubmit function)
- **`src/config/deepseek.config.js`**: Configuration settings
- **`.env`**: Environment variables (API keys, endpoints)

---

## Setup and Configuration

### 1. Environment Variables

Create a `.env` file in the project root:

```bash
# Required
DEEPSEEK_API_KEY=your_actual_api_key_here

# Optional (use defaults if not specified)
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TEMPERATURE=0.3
DEEPSEEK_MAX_TOKENS=2000
DEEPSEEK_ENABLE_MULTIMODAL=true
DEEPSEEK_TIMEOUT=30000
DEEPSEEK_MAX_RETRIES=2
```

### 2. Obtain DeepSeek API Key

1. Sign up at [DeepSeek Platform](https://platform.deepseek.com)
2. Navigate to API Keys section
3. Generate a new API key
4. Copy the key to your `.env` file

### 3. Install Dependencies

```bash
npm install
```

### 4. Verify Integration

```bash
npm run dev
```

Navigate to the New Diagnostic page and test with a sample vehicle symptom.

---

## Integration Points

### Primary Integration: NewDiagnostic.js

The main AI analysis happens in the `handleSymptomSubmit` function:

```javascript
const handleSymptomSubmit = async (symptomData) => {
  setIsAnalyzing(true);
  
  try {
    const vehicle = vehicles.find(v => v.id === diagnosticData.vehicle_id);
    const vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    
    // CRITICAL: Call DeepSeek V3 for diagnosis
    const result = await deepSeekV3.analyzeDiagnostic({
      vehicleInfo,
      mileage: vehicle.mileage,
      symptoms: symptomData.symptoms,
      troubleCodes: symptomData.trouble_codes,
      imageUrls: symptomData.symptom_images,
      audioUrls: symptomData.audio_notes
    });
    
    setDiagnosisResult(result);
  } catch (error) {
    // Handle errors with fallback
    console.error("DeepSeek V3 error:", error);
  } finally {
    setIsAnalyzing(false);
  }
};
```

### Service Layer: deepseekV3.js

The service provides a clean interface:

```javascript
import { deepSeekV3 } from "@/services/deepseekV3";

// Analyze diagnostic
const result = await deepSeekV3.analyzeDiagnostic({
  vehicleInfo: "2020 Toyota Camry 2.5L",
  mileage: 45000,
  symptoms: "Engine misfiring, rough idle",
  troubleCodes: ["P0301", "P0420"],
  imageUrls: ["https://..."],
  audioUrls: []
});
```

---

## API Usage

### analyzeDiagnostic()

Main method for generating vehicle diagnostics.

**Parameters:**

```typescript
{
  vehicleInfo: string;      // e.g., "2020 Toyota Camry 2.5L"
  mileage: number;          // Current odometer reading
  symptoms: string;         // User-described symptoms
  troubleCodes: string[];   // OBD-II codes (e.g., ["P0420", "P0301"])
  imageUrls: string[];      // URLs to symptom images
  audioUrls: string[];      // URLs to audio recordings
}
```

**Returns:**

```typescript
{
  diagnosis: string;                    // Detailed diagnosis
  severity: "immediate" | "soon" | "routine" | "monitor";
  confidence_score: number;             // 0-100
  estimated_cost_min: number;           // USD
  estimated_cost_max: number;           // USD
  affected_components: string[];        // ["Catalytic Converter", "O2 Sensor"]
  recommendations: [
    {
      action: string;
      priority: "high" | "medium" | "low";
      diy_possible: boolean;
      description: string;
    }
  ]
}
```

### interpretTroubleCode()

Interprets a specific OBD-II code.

**Example:**

```javascript
const codeInfo = await deepSeekV3.interpretTroubleCode(
  "P0420", 
  "2020 Toyota Camry"
);
```

---

## Data Flow

### 1. User Input Collection

```
User → VehicleSelection → SymptomInput
  ↓
  {
    vehicle_id: "abc123",
    symptoms: "Engine making loud knocking noise",
    trouble_codes: ["P0300"],
    symptom_images: ["https://..."],
    audio_notes: []
  }
```

### 2. DeepSeek V3 Processing

```javascript
// Construct prompt
const prompt = buildDiagnosticPrompt({
  vehicleInfo: "2020 Toyota Camry 2.5L",
  symptoms: "Engine making loud knocking noise",
  troubleCodes: ["P0300"]
});

// Call API
const response = await fetch(DEEPSEEK_API_ENDPOINT, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  })
});
```

### 3. Response Parsing & Validation

```javascript
const data = await response.json();
const diagnosis = JSON.parse(data.choices[0].message.content);

// Validate required fields
validateDiagnosis(diagnosis);

// Return to UI
return diagnosis;
```

### 4. Display Results

```
DiagnosisResults Component
  ↓
Display diagnosis, severity, cost, recommendations
  ↓
Save to Diagnostic entity
```

---

## Error Handling

### Network Errors

```javascript
try {
  const result = await deepSeekV3.analyzeDiagnostic(...);
} catch (error) {
  if (error.message.includes('API error (401)')) {
    // Invalid API key
  } else if (error.message.includes('API error (429)')) {
    // Rate limit exceeded
  } else if (error.message.includes('timeout')) {
    // Request timeout
  }
  
  // Provide fallback diagnosis
  setDiagnosisResult(getFallbackDiagnosis());
}
```

### Validation Errors

The service automatically validates:
- Required fields (diagnosis, severity, confidence_score, etc.)
- Severity enum values
- Confidence score range (0-100)
- Response format

### Fallback Mechanism

If DeepSeek V3 fails, the system provides a safe fallback:

```javascript
{
  diagnosis: "Unable to complete AI analysis. Please consult a professional.",
  severity: "soon",
  confidence_score: 0,
  recommendations: [
    {
      action: "Consult Professional Mechanic",
      priority: "high",
      diy_possible: false,
      description: "Due to analysis error, professional diagnosis recommended."
    }
  ]
}
```

---

## Multimodal Support

### Image Analysis

DeepSeek V3 can analyze symptom images (check engine lights, leaks, damage):

```javascript
await deepSeekV3.analyzeDiagnostic({
  ...diagnosticData,
  imageUrls: [
    "https://storage.example.com/check-engine-light.jpg",
    "https://storage.example.com/oil-leak.jpg"
  ]
});
```

### Image Upload Flow

1. User selects image in SymptomInput component
2. Image uploaded via `base44.integrations.Core.UploadFile()`
3. File URL added to `symptom_images` array
4. URL passed to DeepSeek V3 in analysis request

### Audio Support (Future)

Placeholder for audio analysis of engine sounds, rattles, etc.

---

## Customization

### Adjust Temperature

Lower temperature = more consistent, higher = more creative:

```javascript
// In deepseek.config.js
temperature: 0.1  // Very consistent
temperature: 0.5  // Balanced
temperature: 0.9  // More varied
```

### Modify Prompt Template

Edit `_buildDiagnosticPrompt()` in `deepseekV3.js`:

```javascript
_buildDiagnosticPrompt({ vehicleInfo, symptoms, troubleCodes }) {
  return `
    You are an expert automotive diagnostic AI...
    
    [Add your custom instructions here]
    
    Vehicle: ${vehicleInfo}
    Symptoms: ${symptoms}
    ...
  `;
}
```

### Add Custom Validation

In `_parseResponse()`:

```javascript
_parseResponse(apiResponse) {
  const diagnosis = JSON.parse(apiResponse.choices[0].message.content);
  
  // Custom validation
  if (diagnosis.estimated_cost_max > 10000) {
    console.warn('High cost estimate - recommend second opinion');
  }
  
  return diagnosis;
}
```

---

## Testing

### Manual Testing

1. Go to New Diagnostic page
2. Select a vehicle
3. Enter symptoms: "Engine won't start, clicking sound when turning key"
4. Add trouble codes: P0300
5. Submit for analysis
6. Verify results display correctly

### Test Cases

```javascript
// Test 1: Simple symptom
await deepSeekV3.analyzeDiagnostic({
  vehicleInfo: "2015 Honda Civic",
  symptoms: "Check engine light on",
  troubleCodes: ["P0420"]
});

// Test 2: Multiple codes
await deepSeekV3.analyzeDiagnostic({
  vehicleInfo: "2018 Ford F-150",
  symptoms: "Rough idle, poor acceleration",
  troubleCodes: ["P0300", "P0301", "P0302"]
});

// Test 3: No codes
await deepSeekV3.analyzeDiagnostic({
  vehicleInfo: "2020 Tesla Model 3",
  symptoms: "Battery draining quickly",
  troubleCodes: []
});
```

---

## Troubleshooting

### "API key not configured" Warning

**Solution:** Set `DEEPSEEK_API_KEY` in `.env` file

### "DeepSeek API error (401)"

**Solution:** Verify API key is correct and active

### "DeepSeek API error (429)"

**Solution:** Rate limit exceeded. Wait and retry, or upgrade API plan

### "Invalid response format"

**Solution:** DeepSeek V3 may not be returning JSON. Check:
- `response_format: { type: 'json_object' }` is set
- Prompt instructs to respond with valid JSON

### Empty or Generic Diagnosis

**Solution:** 
- Provide more detailed symptoms
- Include OBD-II trouble codes
- Upload relevant images
- Increase `max_tokens` in config

### Timeout Errors

**Solution:**
- Increase `DEEPSEEK_TIMEOUT` in `.env`
- Simplify/shorten symptom description
- Check network connectivity

---

## Best Practices

1. **Always Provide Context**: Include vehicle year, make, model, and mileage
2. **Detailed Symptoms**: More detail = better diagnosis
3. **Include Trouble Codes**: OBD-II codes significantly improve accuracy
4. **Use Images**: Upload photos of warning lights, leaks, or damage
5. **Verify Safety-Critical Issues**: Always recommend professional verification for brakes, steering, airbags
6. **Monitor Confidence Scores**: Low confidence (<50%) should trigger professional consultation recommendation
7. **Handle Errors Gracefully**: Always provide fallback guidance
8. **Log for Analysis**: Log all API calls for debugging and improvement

---

## API Limits and Pricing

Consult DeepSeek V3 documentation for:
- Rate limits (requests per minute/hour)
- Token limits (input + output)
- Pricing tiers
- Quota management

**Recommended Settings for Production:**
- Implement request queuing for high traffic
- Cache common trouble code interpretations
- Monitor API usage and costs
- Set up alerts for rate limit approaching

---

## Security Considerations

1. **Never Expose API Key**: Keep in `.env`, never commit to git
2. **Validate User Input**: Sanitize symptoms and codes before sending to API
3. **Rate Limiting**: Implement user-level rate limiting to prevent abuse
4. **Cost Controls**: Set maximum tokens per request
5. **Data Privacy**: Don't send PII unless necessary

---

## Future Enhancements

- [ ] Implement audio analysis for engine sounds
- [ ] Add VIN decoding for automatic vehicle identification
- [ ] Cache common diagnostics to reduce API calls
- [ ] Implement streaming responses for real-time updates
- [ ] Add multilingual support
- [ ] Integrate with parts catalogs for pricing
- [ ] Implement diagnostic history learning
- [ ] Add repair shop integrations

---

## Support and Resources

- **DeepSeek Documentation**: https://platform.deepseek.com/docs
- **API Reference**: https://platform.deepseek.com/api-docs
- **Community Forum**: [Link to your support forum]
- **Issue Tracker**: [Link to GitHub issues]

---

## License

This integration is part of the Automotive Diagnostic AI System.
All rights reserved.
