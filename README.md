# Automotive Diagnostic AI System

> AI-powered vehicle diagnostics using **DeepSeek V3**

## 🚗 Overview

The Automotive Diagnostic AI System is a comprehensive platform that leverages DeepSeek V3's advanced AI capabilities to provide professional-grade vehicle diagnostics. The system analyzes symptoms, OBD-II trouble codes, and even images to deliver accurate diagnoses, severity assessments, cost estimates, and step-by-step repair recommendations.

## ✨ Key Features

### AI-Powered Diagnostics
- **DeepSeek V3 Integration**: Advanced AI analysis of vehicle symptoms
- **Multimodal Input**: Text descriptions, images, and OBD-II codes
- **Confidence Scoring**: Transparency in diagnostic accuracy (0-100%)
- **Severity Assessment**: Immediate, Soon, Routine, or Monitor classifications

### Comprehensive Analysis
- **Symptom Interpretation**: Natural language processing of user-described issues
- **OBD-II Integration**: Automatic correlation of diagnostic trouble codes
- **Cost Estimation**: Realistic repair cost ranges (min/max)
- **Component Identification**: Pinpoint affected vehicle systems
- **Repair Recommendations**: Step-by-step guidance with DIY assessments

### User Experience
- **Multi-Vehicle Management**: Track multiple vehicles in your fleet
- **Diagnostic History**: Complete record of all past diagnoses
- **Progress Tracking**: Monitor repairs from diagnosis to resolution
- **Safety Notices**: Automatic flagging of safety-critical issues

## 🏗️ Architecture

```
Frontend (React)
    ↓
DeepSeek V3 Service Layer
    ↓
DeepSeek V3 API
```

### Core Components

- **`src/services/deepseekV3.js`**: Main AI integration service
- **`src/pages/NewDiagnostic.js`**: Diagnostic workflow
- **`src/config/deepseek.config.js`**: Configuration management
- **Entity Definitions**: Vehicle, Diagnostic, TroubleCode schemas

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- DeepSeek API key ([Get one here](https://platform.deepseek.com))
- Modern web browser

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd automotive-diagnostic-ai

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your DEEPSEEK_API_KEY

# Start development server
npm run dev
```

### Configuration

Edit `.env` file:

```env
# Required
DEEPSEEK_API_KEY=your_api_key_here

# Optional
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TEMPERATURE=0.3
DEEPSEEK_MAX_TOKENS=2000
```

## 📖 Usage

### Running a Diagnostic

1. **Add a Vehicle**
   - Navigate to "My Vehicles"
   - Click "Add Vehicle"
   - Enter vehicle details (make, model, year, VIN, etc.)

2. **Start New Diagnostic**
   - Click "New Diagnostic"
   - Select the vehicle to diagnose
   - Describe symptoms in detail
   - Add OBD-II trouble codes if available
   - Upload photos of warning lights or issues (optional)

3. **Review AI Analysis**
   - DeepSeek V3 analyzes your input
   - View comprehensive diagnosis
   - Check severity level and confidence score
   - Review cost estimates
   - Read step-by-step recommendations

4. **Save and Track**
   - Save diagnosis to history
   - Track repair progress
   - Update status as repairs are completed

### Example Diagnostic Flow

```javascript
// User Input
{
  vehicle: "2020 Toyota Camry 2.5L",
  symptoms: "Engine misfiring, rough idle at stoplights",
  troubleCodes: ["P0300", "P0301"],
  images: ["check-engine-light.jpg"]
}

// DeepSeek V3 Analysis
{
  diagnosis: "Multiple cylinder misfire detected, primarily cylinder 1...",
  severity: "soon",
  confidence_score: 87,
  estimated_cost_min: 150,
  estimated_cost_max: 800,
  affected_components: ["Spark Plugs", "Ignition Coils", "Fuel Injectors"],
  recommendations: [
    {
      action: "Inspect spark plugs for wear",
      priority: "high",
      diy_possible: true,
      description: "Remove and examine spark plugs..."
    }
  ]
}
```

## 🔧 DeepSeek V3 Integration

### How It Works

The integration with DeepSeek V3 happens in `src/pages/NewDiagnostic.js`:

```javascript
import { deepSeekV3 } from "@/services/deepseekV3";

const handleSymptomSubmit = async (symptomData) => {
  const result = await deepSeekV3.analyzeDiagnostic({
    vehicleInfo: "2020 Toyota Camry 2.5L",
    mileage: 45000,
    symptoms: symptomData.symptoms,
    troubleCodes: symptomData.trouble_codes,
    imageUrls: symptomData.symptom_images
  });
  
  // result contains diagnosis, severity, costs, recommendations
};
```

### Key Capabilities

1. **Vehicle Identification**: Processes year, make, model, engine type
2. **Symptom Analysis**: Natural language understanding of user descriptions
3. **OBD-II Interpretation**: Cross-references trouble codes with symptoms
4. **Severity Ranking**: Classifies urgency (immediate → monitor)
5. **Cost Estimation**: Provides realistic repair cost ranges
6. **Recommendation Engine**: Generates prioritized action steps
7. **Confidence Scoring**: Rates diagnostic certainty (0-100%)

### Multimodal Support

DeepSeek V3 can analyze images:
- Check engine lights
- Dashboard warning indicators
- Visible damage or leaks
- Component wear

## 📊 Data Entities

### Vehicle
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "vin": "1HGBH41JXMN109186",
  "engine_type": "2.5L 4-cylinder",
  "mileage": 45000,
  "nickname": "My Daily Driver"
}
```

### Diagnostic
```json
{
  "vehicle_id": "abc123",
  "symptoms": "Engine won't start, clicking sound",
  "trouble_codes": ["P0335"],
  "diagnosis": "Crankshaft position sensor failure...",
  "severity": "immediate",
  "confidence_score": 92,
  "estimated_cost_min": 200,
  "estimated_cost_max": 450,
  "status": "diagnosed"
}
```

## 🧪 Testing

### Manual Testing
```bash
npm run dev
# Navigate to http://localhost:5173
# Test diagnostic flow with sample data
```

### Test Scenarios

1. **Simple Diagnosis**: "Check engine light on" + P0420
2. **Complex Multi-System**: Multiple codes, detailed symptoms
3. **Image Analysis**: Upload photos of warning lights
4. **Error Handling**: Test with invalid API key, network errors

## 📚 Documentation

- **[DeepSeek V3 Integration Guide](./DEEPSEEK_V3_INTEGRATION.md)**: Comprehensive integration documentation
- **[Entity Schemas](./src/entities/)**: Data structure definitions
- **[API Configuration](./src/config/deepseek.config.js)**: Settings and parameters

## 🔒 Security

- **API Key Protection**: Never commit `.env` to version control
- **Input Validation**: All user input sanitized before AI processing
- **Rate Limiting**: Prevents API abuse and controls costs
- **Error Handling**: Graceful fallbacks for API failures

## 🚨 Important Safety Notice

**This system provides AI-assisted diagnostic guidance and should NOT replace professional mechanical inspection for:**
- Safety-critical systems (brakes, steering, airbags)
- Complex electrical issues
- Engine internal problems
- Transmission failures

Always verify AI diagnoses with a certified mechanic before performing repairs.

## 🛣️ Roadmap

- [x] DeepSeek V3 integration
- [x] Vehicle management
- [x] Diagnostic history
- [x] Cost estimation
- [ ] VIN decoder integration
- [ ] Audio analysis (engine sounds)
- [ ] Multilingual support
- [ ] Mobile app version
- [ ] Repair shop integrations
- [ ] Parts catalog integration

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: See `DEEPSEEK_V3_INTEGRATION.md`
- **Issues**: [GitHub Issues](link-to-issues)
- **DeepSeek Support**: https://platform.deepseek.com/docs

## 🙏 Acknowledgments

- **DeepSeek** for providing advanced AI capabilities
- **OBD-II Standards** for diagnostic code specifications
- **Automotive Community** for repair knowledge and procedures

---

**Built with ❤️ for automotive enthusiasts and DIY mechanics**
