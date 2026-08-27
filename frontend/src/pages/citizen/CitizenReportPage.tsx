import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Upload,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  RotateCcw,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { LocationPickerMap } from '../../components/citizen/LocationPickerMap';
import { ApiService } from '../../services/api';
import { CitizenReport } from '../../types';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'Pothole',
  'Road Damage',
  'Drainage / Flooding',
  'Bridge / Flyover Damage',
  'Street Infrastructure',
  'Public Facility',
  'Other Infrastructure'
];

export const CitizenReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Form State
  const [category, setCategory] = useState('Pothole');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [latitude, setLatitude] = useState(11.0168);
  const [longitude, setLongitude] = useState(76.9673);
  const [locationName, setLocationName] = useState('Gandhipuram Cross Cut Road, Coimbatore');
  const [zone, setZone] = useState('Central Zone');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');

  useEffect(() => {
    if (user?.name) setUserName(user.name);
    if (user?.email) setUserEmail(user.email);
  }, [user]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<CitizenReport | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please provide a short description of the issue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await ApiService.submitCitizenReport({
        category,
        description,
        photoUrl: photoUrl || undefined,
        latitude,
        longitude,
        locationName,
        zone,
        severity,
        userName,
        userEmail
      });
      setSubmittedReport(result);
    } catch (err) {
      console.error('Failed to submit report', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-canvas pb-16">
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime/20 text-civic-dark border border-lime text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-lime-dark" />
            <span>COMMUNITY INFRASTRUCTURE WATCH</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-slate-900 tracking-tight">
            Report Civic Infrastructure Issue
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-sans">
            Directly report potholes, broken drainage, failed lighting, or road damage to the Coimbatore City Municipal Corporation. Earn CIVICX Civic Points for verified reports.
          </p>
        </div>

        {/* Guest Banner if not signed in */}
        {!isAuthenticated && (
          <div className="p-4 mb-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You are submitting as a <strong>Guest Citizen</strong>. Sign in to tie this report to your profile and claim +100 Civic Points upon validation.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/login?redirect=/citizen/report"
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold font-mono text-xs hover:bg-amber-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login?redirect=/citizen/report"
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 font-bold font-mono text-xs hover:bg-amber-100 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {/* Success Modal / Screen */}
        <AnimatePresence>
          {submittedReport && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 text-center max-w-lg mx-auto"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Report ID: {submittedReport.reportId}
                </span>
                <h2 className="font-display font-black text-2xl text-slate-900">
                  Report Successfully Registered!
                </h2>
                <p className="text-xs text-slate-600">
                  Your report has been ingested into Coimbatore’s municipal decision pipeline. Deterministic validation scored it at <strong className="text-slate-900">{submittedReport.validationScore}/100</strong>.
                </p>
              </div>

              {/* Reward points callout */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 font-mono text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span>Submission Reward:</span>
                  <span className="font-bold text-purple-700">+10 Points</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Potential Validation Reward:</span>
                  <span className="font-bold text-purple-700">+50 Points</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Municipal Resolution Reward:</span>
                  <span className="font-bold text-purple-700">+250 Points</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSubmittedReport(null);
                    setDescription('');
                    setPhotoUrl('');
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold transition-colors"
                >
                  Submit Another
                </button>
                <button
                  onClick={() => navigate('/citizen/my-reports')}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-civic-dark text-lime text-xs font-mono font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Track Status</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Form */}
        {!submittedReport && (
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-8"
          >
            {/* Category Selector */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                Select Infrastructure Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-3 rounded-2xl font-mono text-xs font-bold text-left transition-all border ${
                      category === cat
                        ? 'bg-civic-dark text-white border-civic-dark shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                Issue Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the defect, dimensions, water stagnation, or impact on transit..."
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime font-sans"
              />
            </div>

            {/* Photo Telemetry Upload (Clean Evidence Upload Area) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                  Photo Evidence
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  Optional but recommended
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Upload a photo of the infrastructure issue.
              </p>

              {photoUrl ? (
                /* Actual Citizen-Uploaded Photo Preview */
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="relative h-52 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                    <img
                      src={photoUrl}
                      alt="Uploaded Defect Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 text-white font-mono text-[10px] flex items-center gap-1.5 backdrop-blur-sm">
                      <Camera className="w-3 h-3 text-lime" />
                      <span>Uploaded Photo Evidence</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Image attached</span>
                    </span>
                    <label className="text-civic-dark hover:underline font-bold cursor-pointer">
                      <span>Change photo</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                /* Clean Upload Dropzone */
                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 font-mono">
                      No photographic evidence attached
                    </p>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Clear photos increase validation speed and prioritization accuracy.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-civic-dark hover:bg-zinc-800 text-lime text-xs font-mono font-bold cursor-pointer transition-all shadow-sm">
                    <Upload className="w-4 h-4" />
                    <span>Upload from Device</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            {/* Interactive Location Picker Map */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                  Defect Location & Geocoding <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Click on the Coimbatore map to pinpoint the exact location of the defect.
              </p>

              <LocationPickerMap
                latitude={latitude}
                longitude={longitude}
                locationName={locationName}
                onLocationChange={(lat, lng, locName) => {
                  setLatitude(lat);
                  setLongitude(lng);
                  setLocationName(locName);
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                    Detected Zone
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={zone}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-100 border border-slate-200 text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                    Location Description / Landmark
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime"
                  />
                </div>
              </div>
            </div>

            {/* Severity Rating */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                Estimated Transit Impact & Hazard Severity
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Low', 'Medium', 'High', 'Critical'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                      severity === sev
                        ? sev === 'Critical'
                          ? 'bg-rose-600 text-white border-rose-600 shadow'
                          : sev === 'High'
                          ? 'bg-amber-500 text-white border-amber-500 shadow'
                          : sev === 'Medium'
                          ? 'bg-blue-600 text-white border-blue-600 shadow'
                          : 'bg-emerald-600 text-white border-emerald-600 shadow'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Citizen Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Priya Sundaram"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Your Email Address (For status updates & rewards)
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="e.g. priya.sundaram@gmail.com"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-civic-dark text-lime font-display font-black text-sm tracking-wide hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-elevated disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>INGESTING INTO DECISION ENGINE...</span>
                </>
              ) : (
                <>
                  <span>TRANSMIT COMPLAINT TO COIMBATORE CORPORATION →</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
