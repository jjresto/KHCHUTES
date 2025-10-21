import React, { useState } from 'react';
import { deepSeekV3 } from './services/deepseekV3';
import './App.css';

function App() {
  const [testStatus, setTestStatus] = useState('ready');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runDiagnosticTest = async () => {
    setTestStatus('running');
    setError(null);
    setResult(null);

    try {
      console.log('🚀 Testing DeepSeek V3 integration...');
      
      const testResult = await deepSeekV3.analyzeDiagnostic({
        vehicleInfo: "2020 Toyota Camry 2.5L 4-cylinder",
        mileage: 45000,
        symptoms: "Engine is making a loud knocking noise when accelerating, especially going uphill. The check engine light came on yesterday. The noise seems to get worse when the engine is cold.",
        troubleCodes: ["P0300", "P0301"],
        imageUrls: [],
        audioUrls: []
      });

      console.log('✅ DeepSeek V3 Response:', testResult);
      setResult(testResult);
      setTestStatus('success');
    } catch (err) {
      console.error('❌ DeepSeek V3 Error:', err);
      setError(err.message);
      setTestStatus('error');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9L12 3L5 9V21H19V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <h1>AutoDiag AI</h1>
              <p>Powered by DeepSeek V3</p>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="test-section">
          <h2>🧪 DeepSeek V3 Integration Test</h2>
          <p className="subtitle">
            Test the AI diagnostic engine with a sample vehicle issue
          </p>

          <div className="test-card">
            <h3>Test Scenario</h3>
            <div className="test-details">
              <div className="detail-row">
                <span className="label">Vehicle:</span>
                <span className="value">2020 Toyota Camry 2.5L</span>
              </div>
              <div className="detail-row">
                <span className="label">Mileage:</span>
                <span className="value">45,000 miles</span>
              </div>
              <div className="detail-row">
                <span className="label">Symptoms:</span>
                <span className="value">Engine knocking noise when accelerating, worse when cold, check engine light on</span>
              </div>
              <div className="detail-row">
                <span className="label">OBD-II Codes:</span>
                <span className="value">P0300 (Random Misfire), P0301 (Cylinder 1 Misfire)</span>
              </div>
            </div>

            <button 
              onClick={runDiagnosticTest}
              disabled={testStatus === 'running'}
              className={`test-button ${testStatus}`}
            >
              {testStatus === 'running' ? (
                <>
                  <span className="spinner"></span>
                  Analyzing with DeepSeek V3...
                </>
              ) : testStatus === 'success' ? (
                '✅ Test Successful - Run Again?'
              ) : testStatus === 'error' ? (
                '❌ Error - Try Again'
              ) : (
                '🚀 Run Diagnostic Test'
              )}
            </button>
          </div>

          {error && (
            <div className="error-box">
              <h4>❌ Error</h4>
              <p>{error}</p>
              <details>
                <summary>Troubleshooting</summary>
                <ul>
                  <li>Verify your API key is correct in .env file</li>
                  <li>Check that DEEPSEEK_API_KEY is set</li>
                  <li>Ensure you have internet connectivity</li>
                  <li>Check DeepSeek API status at status.deepseek.com</li>
                </ul>
              </details>
            </div>
          )}

          {result && (
            <div className="result-box">
              <h3>✅ DeepSeek V3 Analysis Results</h3>
              
              <div className="result-section">
                <h4>🔍 Diagnosis</h4>
                <p className="diagnosis-text">{result.diagnosis}</p>
              </div>

              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">Severity</span>
                  <span className={`badge severity-${result.severity}`}>
                    {result.severity}
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Confidence</span>
                  <span className="badge confidence">
                    {result.confidence_score}%
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Estimated Cost</span>
                  <span className="badge cost">
                    ${result.estimated_cost_min} - ${result.estimated_cost_max}
                  </span>
                </div>
              </div>

              {result.affected_components && result.affected_components.length > 0 && (
                <div className="result-section">
                  <h4>🔧 Affected Components</h4>
                  <div className="tags">
                    {result.affected_components.map((component, idx) => (
                      <span key={idx} className="tag">{component}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="result-section">
                  <h4>📋 Recommendations</h4>
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="recommendation">
                      <div className="rec-header">
                        <strong>{rec.action}</strong>
                        <span className={`badge priority-${rec.priority}`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p>{rec.description}</p>
                      {rec.diy_possible && (
                        <span className="diy-badge">✅ DIY Possible</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="info-section">
          <h3>📚 Next Steps</h3>
          <ul>
            <li>✅ DeepSeek V3 integration is working!</li>
            <li>📖 See <code>README.md</code> for full documentation</li>
            <li>🚀 Check <code>src/pages/NewDiagnostic.js</code> for integration code</li>
            <li>📝 Review <code>QUICK_REFERENCE.md</code> for code examples</li>
          </ul>
        </div>
      </main>

      <footer className="app-footer">
        <p>🚗 Automotive Diagnostic AI • Powered by DeepSeek V3 • Built with React</p>
      </footer>
    </div>
  );
}

export default App;
