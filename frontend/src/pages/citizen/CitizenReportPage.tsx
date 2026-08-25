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
  Image as ImageIcon
} from 'lucide-react';
import { CitizenNavbar } from '../../components/citizen/CitizenNavbar';
import { LocationPickerMap } from '../../components/citizen/LocationPickerMap';
import { ApiService } from '../../services/api';
import { CitizenReport } from '../../types';
import { getAssetImage, handleImageError } from '../../utils/imageFallback';

const CATEGORIES = [
  'Pothole',
  'Road Damage',
  'Drainage / Flooding',
  'Bridge / Flyover Damage',
  'Street Infrastructure',
  'Public Facility',
  'Other Infrastructure'
];

const SAMPLE_PHOTOS = [
  {
    label: 'Pothole Cluster',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Flooded Drain',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Road Fatigue',
    url: 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Flyover Joint',
    url: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=800&q=80'
  }
];

import { useAuth } from '../../context/AuthContext';

export const CitizenReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Form State
  const [category, setCategory] = useState('Pothole');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>(SAMPLE_PHOTOS[0].url);
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
        photoUrl,
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

  const resetForm = () => {
    setSubmittedReport(null);
    setDescription('');
    setCategory('Pothole');
    setPhotoUrl(SAMPLE_PHOTOS[0].url);
  };

  return (
    <div className="min-h-screen bg-[#EDEEF5] text-slate-900 flex flex-col">
      <CitizenNavbar />

      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-mono text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INFRASTRUCTURE INCIDENT INTAKE</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
            Submit a Civic Infrastructure Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Your report provides structured spatial evidence to help municipal engineers detect, prioritize, and repair civic defects.
          </p>
        </div>

        {/* Authentication Requirement Gate for Fresh Visitors */}
        {!isAuthenticated || !user ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl text-slate-900">
                Citizen Sign In Required
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Please sign in or create a verified Citizen account to submit infrastructure observations, track repair progression, and earn civic tokens.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/login?redirect=/citizen/report"
                className="flex-1 py-3 px-4 rounded-2xl bg-civic-dark text-lime font-display font-black text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-subtle"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login?redirect=/citizen/report"
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Create Account</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
        <AnimatePresence>
          {submittedReport && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 mb-8 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider block">
                  Report Submitted ✓
                </span>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900">
                  {submittedReport.reportId}
                </h2>
                <p className="text-xs font-mono text-slate-500 max-w-md mx-auto">
                  “Your report has entered the CIVICX verification pipeline.”
                </p>
              </div>

              {/* Status Timeline */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-lg mx-auto">
                <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submitted</span>
                  </div>
                  <span className="text-slate-300">→</span>
                  <div className="flex items-center gap-1.5 text-purple-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                    <span>Under Review</span>
                  </div>
                  <span className="text-slate-300">→</span>
                  <span className="text-slate-400">Validated</span>
                  <span className="text-slate-300">→</span>
                  <span className="text-slate-400">Action</span>
                  <span className="text-slate-300">→</span>
                  <span className="text-slate-400">Resolved</span>
                </div>
              </div>

              {/* Validation Score & Correlated Asset Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-purple-700 block">
                    CIVICX Validation Score
                  </span>
                  <p className="font-display font-black text-2xl text-purple-900">
                    {submittedReport.validationScore} / 100
                  </p>
                  <span className="text-[10px] font-mono text-purple-700 font-bold block">
                    Status: {submittedReport.validationStatus}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-blue-700 block">
                    Linked Municipal Asset
                  </span>
                  <p className="font-mono font-black text-xl text-blue-900">
                    {submittedReport.nearestAssetId || 'RD-1042'}
                  </p>
                  <span className="text-[10px] font-mono text-blue-700 block">
                    Distance: ~{submittedReport.nearestAssetDistanceM ?? 184}m
                  </span>
                </div>
              </div>

              {/* Rewards Notice */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-lime/20 border border-lime text-civic-dark font-mono text-xs font-bold">
                <span>🪙 +10 CIVICX Points Credited to your wallet</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/citizen/reports"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-civic-dark text-white font-mono text-xs font-bold hover:bg-zinc-800 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span>Track My Reports</span>
                  <ArrowRight className="w-3.5 h-3.5 text-lime" />
                </Link>

                <Link
                  to="/map"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  View on Civic Map
                </Link>

                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-mono font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Submit Another</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Form */}
        {!submittedReport && (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                Issue Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime"
              />
            </div>

            {/* Photo Telemetry Upload */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                Photo Evidence (Optional but recommended)
              </label>

              {/* Sample Preset Photos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_PHOTOS.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => setPhotoUrl(sample.url)}
                    className={`relative h-20 rounded-2xl overflow-hidden border-2 transition-all group ${
                      photoUrl === sample.url ? 'border-lime shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getAssetImage(sample.url, sample.label)}
                      alt={sample.label}
                      onError={(e) => handleImageError(e, sample.label)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                      <span className="text-[10px] font-mono font-bold text-white leading-tight truncate">
                        {sample.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Upload or Custom URL */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold cursor-pointer transition-colors border border-slate-300">
                  <Camera className="w-4 h-4 text-slate-600" />
                  <span>Upload from Device</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <div className="w-full flex-1 relative">
                  <input
                    type="text"
                    placeholder="Or paste photo image URL..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-lime"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Location Picker Map */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                Defect Location <span className="text-rose-500">*</span>
              </label>
              <LocationPickerMap
                latitude={latitude}
                longitude={longitude}
                locationName={locationName}
                onLocationChange={(lat, lng, loc) => {
                  setLatitude(lat);
                  setLongitude(lng);
                  setLocationName(loc);
                }}
              />
            </div>

            {/* Optional Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                  Observed Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Low">Low - Minor aesthetic / small crack</option>
                  <option value="Medium">Medium - Moderate surface distress</option>
                  <option value="High">High - Significant pothole or drainage issue</option>
                  <option value="Critical">Critical - Immediate safety hazard</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                  Municipal Zone
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Central Zone">Central Zone (Gandhipuram / Townhall)</option>
                  <option value="East Zone">East Zone (Peelamedu / Singanallur)</option>
                  <option value="West Zone">West Zone (RS Puram / Vadavalli)</option>
                  <option value="North Zone">North Zone (Saravanampatti / Thudiyalur)</option>
                  <option value="South Zone">South Zone (Kuniyamuthur / Ukkadam)</option>
                </select>
              </div>
            </div>

            {/* Explainability notice */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5 font-sans leading-relaxed">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>CIVICX Verification Policy:</strong> CIVICX will evaluate this report using infrastructure evidence and validation rules. Submissions are screened to prevent duplicate spam and correlate with monitored municipal asset digital twins.
              </span>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-civic-dark hover:bg-zinc-800 text-white font-display font-bold text-sm tracking-wide shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-lime" />
                <span>{isSubmitting ? 'SCREENING & SUBMITTING...' : 'SUBMIT CIVIC REPORT'}</span>
              </button>
            </div>
          </form>
        )}
        </>
        )}
      </div>
    </div>
  );
};
