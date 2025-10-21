# DeepSeek V3 Integration - Quick Reference Card

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure API key
cp .env.example .env
# Edit .env and add: DEEPSEEK_API_KEY=your_key_here

# 3. Start development
npm run dev
```

---

## 💻 Code Examples

### Basic Diagnostic Analysis

```javascript
import { deepSeekV3 } from "@/services/deepseekV3";

const result = await deepSeekV3.analyzeDiagnostic({
  vehicleInfo: "2020 Toyota Camry 2.5L",
  mileage: 45000,
  symptoms: "Engine misfiring, rough idle at stoplights",
  troubleCodes: ["P0300", "P0301"],
  imageUrls: [],
  audioUrls: []
});

console.log(result);
// {
//   diagnosis: "Multiple cylinder misfire detected...",
//   severity: "soon",
//   confidence_score: 87,
//   estimated_cost_min: 200,
//   estimated_cost_max: 800,
//   affected_components: ["Spark Plugs", "Ignition Coils"],
//   recommendations: [...]
// }
```

### With Image Analysis

```javascript
const result = await deepSeekV3.analyzeDiagnostic({
  vehicleInfo: "2018 Honda Accord",
  symptoms: "Check engine light on",
  troubleCodes: ["P0420"],
  imageUrls: [
    "https://storage.example.com/check-engine-light.jpg",
    "https://storage.example.com/dashboard.jpg"
  ]
});
```

### Error Handling

```javascript
try {
  const result = await deepSeekV3.analyzeDiagnostic({...});
  setDiagnosisResult(result);
} catch (error) {
  console.error("DeepSeek error:", error.message);
  // Provide fallback
  setDiagnosisResult({
    diagnosis: "Unable to complete analysis. Please consult a professional.",
    severity: "soon",
    confidence_score: 0
  });
}
```

---

## 📋 Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `vehicleInfo` | string | ✅ Yes | "Year Make Model" (e.g., "2020 Toyota Camry") |
| `mileage` | number | ⚪ No | Current odometer reading |
| `symptoms` | string | ✅ Yes | User-described symptoms |
| `troubleCodes` | string[] | ⚪ No | OBD-II codes (e.g., ["P0420"]) |
| `imageUrls` | string[] | ⚪ No | URLs to symptom images |
| `audioUrls` | string[] | ⚪ No | URLs to audio recordings |

---

## 📤 Response Format

```typescript
{
  diagnosis: string;                    // Detailed explanation
  severity: "immediate" | "soon" | "routine" | "monitor";
  confidence_score: number;             // 0-100
  estimated_cost_min: number;           // USD
  estimated_cost_max: number;           // USD
  affected_components: string[];        // ["Component 1", "Component 2"]
  recommendations: [
    {
      action: string;                   // What to do
      priority: "high" | "medium" | "low";
      diy_possible: boolean;            // Can user do this themselves?
      description: string;              // How to do it
    }
  ]
}
```

---

## 🎯 Severity Levels

| Severity | Meaning | Example |
|----------|---------|---------|
| `immediate` | Safety critical, stop driving | Brake failure, airbag light |
| `soon` | Address within days/weeks | Oil leak, coolant leak |
| `routine` | Next scheduled maintenance | Worn wipers, air filter |
| `monitor` | Watch for changes | Minor sensor glitch |

---

## ⚙️ Configuration

### Environment Variables

```bash
# Required
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx

# Optional
DEEPSEEK_TEMPERATURE=0.3              # Lower = more consistent
DEEPSEEK_MAX_TOKENS=2000              # Response length limit
DEEPSEEK_TIMEOUT=30000                # 30 seconds
```

### In Code

```javascript
// src/config/deepseek.config.js
export const deepSeekConfig = {
  temperature: 0.3,        // Adjust for creativity vs consistency
  maxTokens: 2000,         // Longer responses = more tokens
  requestTimeout: 30000,   // Network timeout
  maxRetries: 2            // Retry failed requests
};
```

---

## 🔍 Common Trouble Codes

| Code | Description | Severity |
|------|-------------|----------|
| P0420 | Catalyst System Efficiency Below Threshold | Moderate |
| P0300 | Random/Multiple Cylinder Misfire | Critical |
| P0171 | System Too Lean (Bank 1) | Moderate |
| P0455 | EVAP System Large Leak | Minor |
| P0128 | Coolant Thermostat Issue | Minor |

---

## 🐛 Troubleshooting

### "API key not configured"
```bash
# Solution: Set in .env
DEEPSEEK_API_KEY=your_key_here
```

### "DeepSeek API error (401)"
```bash
# Invalid API key - verify it's correct
echo $DEEPSEEK_API_KEY
```

### "Request timeout"
```bash
# Increase timeout in .env
DEEPSEEK_TIMEOUT=60000  # 60 seconds
```

### Low confidence scores
```javascript
// Provide more detail in symptoms
symptoms: "Engine making knocking noise when accelerating uphill, worse when cold, started 3 days ago"
// vs
symptoms: "Strange noise"
```

---

## 📊 Best Practices

### ✅ DO

- Provide detailed symptom descriptions
- Include OBD-II codes when available
- Upload clear photos of warning lights
- Include vehicle mileage
- Handle errors gracefully
- Log API responses for debugging

### ❌ DON'T

- Commit `.env` to version control
- Expose API keys in client code
- Ignore error handling
- Skip validation of responses
- Use vague symptom descriptions
- Exceed rate limits

---

## 🧪 Testing Commands

```bash
# Run in browser console or test file

// Test basic diagnosis
const result = await deepSeekV3.analyzeDiagnostic({
  vehicleInfo: "2020 Honda Civic",
  symptoms: "Check engine light on",
  troubleCodes: ["P0420"]
});
console.log(result);

// Test error handling (use invalid key)
try {
  await deepSeekV3.analyzeDiagnostic({...});
} catch (error) {
  console.log("Error caught:", error.message);
}
```

---

## 📱 Integration Points

### Primary Usage

```javascript
// src/pages/NewDiagnostic.js (line 78)
const handleSymptomSubmit = async (symptomData) => {
  const result = await deepSeekV3.analyzeDiagnostic({
    vehicleInfo,
    mileage: vehicle.mileage,
    symptoms: symptomData.symptoms,
    troubleCodes: symptomData.trouble_codes,
    imageUrls: symptomData.symptom_images
  });
  setDiagnosisResult(result);
};
```

### Service Methods

```javascript
// Main diagnostic analysis
deepSeekV3.analyzeDiagnostic(params)

// Interpret specific OBD-II code
deepSeekV3.interpretTroubleCode(code, vehicleInfo)
```

---

## 🔗 File Locations

| Purpose | File Path |
|---------|-----------|
| Main Service | `src/services/deepseekV3.js` |
| Configuration | `src/config/deepseek.config.js` |
| Usage Example | `src/pages/NewDiagnostic.js` |
| Environment | `.env` |
| Documentation | `DEEPSEEK_V3_INTEGRATION.md` |

---

## 🆘 Quick Help

```javascript
// Check if API key is configured
console.log(process.env.DEEPSEEK_API_KEY ? 'Configured' : 'Not configured');

// Test basic API call
import { deepSeekV3 } from "@/services/deepseekV3";
const test = await deepSeekV3.analyzeDiagnostic({
  vehicleInfo: "2020 Toyota Camry",
  symptoms: "Test symptom",
  troubleCodes: []
});
console.log(test);

// View configuration
import { deepSeekConfig } from "@/config/deepseek.config";
console.log(deepSeekConfig);
```

---

## 📚 Full Documentation

- **Comprehensive Guide:** `DEEPSEEK_V3_INTEGRATION.md`
- **Migration Guide:** `MIGRATION_GUIDE.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Project README:** `README.md`

---

**For detailed information, see the full documentation files.**
