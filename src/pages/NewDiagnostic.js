import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import DeepSeek V3 integration
import { deepSeekV3 } from "@/services/deepseekV3";

import StepIndicator from "../components/diagnostic/StepIndicator";
import VehicleSelection from "../components/diagnostic/VehicleSelection";
import SymptomInput from "../components/diagnostic/SymptomInput";
import DiagnosisResults from "../components/diagnostic/DiagnosisResults";

const STEPS = [
  { id: 1, name: "Select Vehicle", description: "Choose the vehicle to diagnose" },
  { id: 2, name: "Describe Symptoms", description: "Tell us what's wrong" },
  { id: 3, name: "AI Analysis", description: "Get diagnostic results" }
];

export default function NewDiagnostic() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [diagnosticData, setDiagnosticData] = useState({
    vehicle_id: "",
    symptoms: "",
    symptom_images: [],
    audio_notes: [],
    trouble_codes: []
  });
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list("-created_date"),
    initialData: [],
  });

  const createDiagnosticMutation = useMutation({
    mutationFn: (data) => base44.entities.Diagnostic.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostics'] });
      navigate(createPageUrl("History"));
    },
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setAnalysisError(null);
    } else {
      navigate(createPageUrl("Dashboard"));
    }
  };

  const handleVehicleSelect = (vehicleId) => {
    setDiagnosticData(prev => ({ ...prev, vehicle_id: vehicleId }));
    handleNext();
  };

  /**
   * Main AI Analysis Function using DeepSeek V3
   * This is the critical integration point for DeepSeek V3
   */
  const handleSymptomSubmit = async (symptomData) => {
    setDiagnosticData(prev => ({ ...prev, ...symptomData }));
    setIsAnalyzing(true);
    setAnalysisError(null);
    handleNext();

    try {
      // Get vehicle information
      const vehicle = vehicles.find(v => v.id === diagnosticData.vehicle_id);
      if (!vehicle) {
        throw new Error("Vehicle not found");
      }

      const vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.engine_type ? ` with ${vehicle.engine_type}` : ''}`;
      
      console.log('Starting DeepSeek V3 diagnostic analysis...', {
        vehicleInfo,
        symptomsLength: symptomData.symptoms.length,
        troubleCodesCount: symptomData.trouble_codes.length,
        imagesCount: symptomData.symptom_images.length
      });

      // Call DeepSeek V3 for AI-powered diagnosis
      const result = await deepSeekV3.analyzeDiagnostic({
        vehicleInfo,
        mileage: vehicle.mileage,
        symptoms: symptomData.symptoms,
        troubleCodes: symptomData.trouble_codes,
        imageUrls: symptomData.symptom_images,
        audioUrls: symptomData.audio_notes
      });

      console.log('DeepSeek V3 analysis completed successfully', {
        severity: result.severity,
        confidence: result.confidence_score,
        componentsCount: result.affected_components?.length || 0
      });

      setDiagnosisResult(result);

    } catch (error) {
      console.error("DeepSeek V3 analysis error:", error);
      
      setAnalysisError(error.message);
      
      // Provide fallback diagnostic result
      setDiagnosisResult({
        diagnosis: `Unable to complete AI analysis due to an error: ${error.message}\n\nBased on the provided information:\n- Vehicle: ${vehicles.find(v => v.id === diagnosticData.vehicle_id)?.make} ${vehicles.find(v => v.id === diagnosticData.vehicle_id)?.model}\n- Symptoms: ${symptomData.symptoms}\n- Trouble Codes: ${symptomData.trouble_codes.join(', ') || 'None'}\n\nPlease consult a professional mechanic for accurate diagnosis.`,
        severity: "soon",
        confidence_score: 0,
        estimated_cost_min: 0,
        estimated_cost_max: 0,
        affected_components: [],
        recommendations: [
          {
            action: "Consult Professional Mechanic",
            priority: "high",
            diy_possible: false,
            description: "Due to the AI analysis error, we recommend having a certified mechanic diagnose this issue to ensure accurate identification and safe repair."
          }
        ]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveDiagnosis = async () => {
    await createDiagnosticMutation.mutateAsync({
      ...diagnosticData,
      ...diagnosisResult,
      status: "diagnosed"
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0E14] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">New Diagnostic</h1>
            <p className="text-gray-400">AI-powered vehicle diagnostics powered by DeepSeek V3</p>
          </div>
        </div>

        {analysisError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">
              <strong>Analysis Error:</strong> {analysisError}
            </p>
            <p className="text-red-300 text-xs mt-1">
              A fallback diagnosis has been generated. Please verify with a professional.
            </p>
          </div>
        )}

        <StepIndicator steps={STEPS} currentStep={currentStep} />

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <VehicleSelection
                vehicles={vehicles}
                selectedVehicleId={diagnosticData.vehicle_id}
                onSelect={handleVehicleSelect}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SymptomInput
                onSubmit={handleSymptomSubmit}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DiagnosisResults
                result={diagnosisResult}
                isAnalyzing={isAnalyzing}
                onSave={handleSaveDiagnosis}
                isSaving={createDiagnosticMutation.isPending}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
