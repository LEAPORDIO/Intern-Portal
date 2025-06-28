import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Upload, 
  Bell, 
  Award, 
  Target,
  Clock,
  CheckCircle,
  Star,
  Briefcase,
  DollarSign,
  Activity,
  LogOut,
  X,
  Play,
  Send,
  Download,
  RefreshCw,
  Wifi,
  WifiOff,
  Menu
} from 'lucide-react';
import { UserProgress, generateLiveUpdates, LiveUpdate } from '../data/userData';
import { HybridUserDataManager } from '../data/hybridUserDataManager';
import NotificationPanel from './NotificationPanel';

interface InternPortalProps {
  user: UserProgress;
  onLogout: () => void;
  onRefreshData: () => void;
  connectionStatus: 'online' | 'offline';
}

const InternPortal: React.FC<InternPortalProps> = ({ 
  user, 
  onLogout, 
  onRefreshData,
  connectionStatus 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [userData, setUserData] = useState<UserProgress>(user);
  const [showNotifications, setShowNotifications] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const userDataManager = HybridUserDataManager.getInstance();

  const motivationalQuotes = [
    "Excellence is not a destination; it's a continuous journey that never ends. - Brian Tracy",
    "Success is where preparation and opportunity meet. - Bobby Unser",
    "The future depends on what you do today. - Mahatma Gandhi",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs"
  ];

  const [currentQuote, setCurrentQuote] = useState(0);
  const [stats, setStats] = useState({
    totalInterns: 0,
    activeProjects: 0,
    revenueGenerated: 0,
    completionRate: 0
  });

  useEffect(() => {
    setUserData(user);
  }, [user]);

  useEffect(() => {
    // Load initial live updates
    setLiveUpdates(generateLiveUpdates());

    // Animate stats on load
    const animateStats = () => {
      const targets = { totalInterns: 847, activeProjects: 23, revenueGenerated: 2847000, completionRate: 94 };
      const duration = 2000;
      const steps = 50;
      const stepDuration = duration / steps;

      let step = 0;
      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setStats({
          totalInterns: Math.floor(targets.totalInterns * progress),
          activeProjects: Math.floor(targets.activeProjects * progress),
          revenueGenerated: Math.floor(targets.revenueGenerated * progress),
          completionRate: Math.floor(targets.completionRate * progress)
        });

        if (step >= steps) clearInterval(interval);
      }, stepDuration);
    };

    animateStats();

    // Rotate motivational quotes
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);

    // Update live updates periodically with fresh data
    const liveUpdatesInterval = setInterval(() => {
      userDataManager.refreshLiveUpdates();
      setLiveUpdates(generateLiveUpdates());
    }, 45000); // Update every 45 seconds

    // Refresh timestamps every 30 seconds
    const timestampInterval = setInterval(() => {
      setLiveUpdates(generateLiveUpdates());
    }, 30000);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(liveUpdatesInterval);
      clearInterval(timestampInterval);
    };
  }, []);

  const downloadAssignmentPDF = () => {
    const assignment = userData.assignments['frontend-challenge'];
    const pdfContent = `
INNCIRCLES INTERN PORTAL
========================

Assignment: ${assignment.title}

DESCRIPTION:
${assignment.description}

REQUIREMENTS:
• Set up an EC2 instance to host a static website
• Create an S3 bucket for file storage
• Implement file upload functionality
• Ensure proper security configurations
• Document the deployment process

DELIVERABLES:
• Complete AWS infrastructure setup
• Working file upload application
• Source code with documentation
• Deployment guide and screenshots

DEADLINE: July 3, 2025

Technical Stack:
• AWS EC2 (for hosting)
• AWS S3 (for file storage)
• HTML/CSS/JavaScript (frontend)
• Basic server setup knowledge

SUBMISSION GUIDELINES:
• Ensure your code is well-commented and follows best practices
• Include a README.md with setup instructions
• Test your application thoroughly before submission
• ZIP files should contain the complete project structure

EVALUATION CRITERIA:
• Code quality and organization (25%)
• Functionality and user experience (30%)
• AWS best practices implementation (25%)
• Documentation and presentation (20%)

Contact: intern-support@inncircles.com for any queries

Good luck with your assignment!
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AWS_File_Uploader_Assignment.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleStartAssignment = async (assignmentId: string) => {
    try {
      // Download the assignment PDF first
      downloadAssignmentPDF();
      
      // Then update the assignment status
      await userDataManager.startAssignment(userData.userId, assignmentId);
      
      // Refresh user data
      await onRefreshData();
      
      // Immediately refresh live updates to show user's action
      setLiveUpdates(generateLiveUpdates());
    } catch (error) {
      console.error('Failed to start assignment:', error);
    }
  };

  const handleSubmitAssignment = async () => {
    if (selectedFile || submissionUrl) {
      try {
        const submission = {
          type: selectedFile ? 'file' as const : 'url' as const,
          content: selectedFile ? selectedFile.name : submissionUrl
        };
        
        await userDataManager.submitAssignment(userData.userId, 'frontend-challenge', submission);
        
        // Refresh user data
        await onRefreshData();

        // Immediately refresh live updates to show user's submission
        setLiveUpdates(generateLiveUpdates());

        setSubmissionComplete(true);
        setSelectedFile(null);
        setSubmissionUrl('');
        
        setTimeout(() => setSubmissionComplete(false), 4000);
      } catch (error) {
        console.error('Failed to submit assignment:', error);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await userDataManager.recheckBackend();
      await onRefreshData();
      
      // Sync with backend if available
      if (userDataManager.isUsingBackend()) {
        await userDataManager.syncWithBackend(userData.userId);
        await onRefreshData();
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const ConfettiAnimation = () => {
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          >
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
              ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-red-500'][Math.floor(Math.random() * 6)]
            }`} />
          </div>
        ))}
      </div>
    );
  };

  const Dashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome back, {userData.username.charAt(0).toUpperCase() + userData.username.slice(1)}!</h2>
        <p className="opacity-90 text-sm sm:text-base">Shape your future with innovative projects and real-world experience</p>
      </div>

      {/* Connection Status Card */}
      <div className={`rounded-xl p-3 sm:p-4 border ${
        connectionStatus === 'online' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center space-x-3">
          {connectionStatus === 'online' ? (
            <Wifi className="text-green-600 flex-shrink-0" size={18} />
          ) : (
            <WifiOff className="text-yellow-600 flex-shrink-0" size={18} />
          )}
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm sm:text-base ${
              connectionStatus === 'online' ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {connectionStatus === 'online' ? 'Connected to Server' : 'Offline Mode'}
            </p>
            <p className={`text-xs sm:text-sm ${
              connectionStatus === 'online' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {connectionStatus === 'online' 
                ? 'Your progress is being synced in real-time' 
                : 'Working locally - will sync when connection is restored'
              }
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 flex-shrink-0"
          >
            <RefreshCw className={`${isRefreshing ? 'animate-spin' : ''}`} size={14} />
          </button>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
        <div className="flex items-start space-x-3">
          <Star className="text-yellow-500 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-gray-700 italic transition-all duration-500 text-sm sm:text-base leading-relaxed">
            "{motivationalQuotes[currentQuote]}"
          </p>
        </div>
      </div>

      {/* User Progress Summary */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Your Progress</h3>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{userData.stats.totalAssignments}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Assignments</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{userData.stats.completedAssignments}</div>
            <div className="text-xs sm:text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{userData.stats.pendingAssignments}</div>
            <div className="text-xs sm:text-sm text-gray-600">Pending</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Interns</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.totalInterns}</p>
            </div>
            <Users className="text-purple-500" size={24} />
          </div>
          <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-green-600">
            <TrendingUp size={14} className="mr-1" />
            <span>+12% this month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Active Projects</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
            </div>
            <Briefcase className="text-blue-500" size={24} />
          </div>
          <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-green-600">
            <Activity size={14} className="mr-1" />
            <span>8 new this week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Revenue Generated</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">₹{stats.revenueGenerated.toLocaleString()}</p>
            </div>
            <DollarSign className="text-green-500" size={24} />
          </div>
          <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-green-600">
            <TrendingUp size={14} className="mr-1" />
            <span>+25% vs last quarter</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Completion Rate</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.completionRate}%</p>
            </div>
            <Target className="text-orange-500" size={24} />
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Updates */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
          <Activity className="mr-2 text-blue-500" size={18} />
          Live Updates
        </h3>
        <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
          {liveUpdates.slice(0, 8).map((update, index) => (
            <div key={update.id} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all duration-300 ${
              update.type === 'success' ? 'bg-green-50 border-l-4 border-green-400' :
              update.type === 'submission' ? 'bg-blue-50 border-l-4 border-blue-400' :
              update.type === 'feedback' ? 'bg-purple-50 border-l-4 border-purple-400' :
              update.type === 'start' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
              update.type === 'score' ? 'bg-orange-50 border-l-4 border-orange-400' : 'bg-gray-50'
            } ${update.isUserAction ? 'ring-2 ring-purple-200 bg-purple-50' : ''}`}>
              <span className="text-xs sm:text-sm flex-1 min-w-0">
                {update.type === 'success' && '🎉 '}
                {update.type === 'submission' && '📤 '}
                {update.type === 'feedback' && '⭐ '}
                {update.type === 'start' && '🚀 '}
                {update.type === 'score' && '🏆 '}
                <span className={`font-medium ${update.isUserAction ? 'text-purple-800' : ''}`}>
                  {update.name}
                </span> {update.action}
                {update.isUserAction && <span className="ml-1 sm:ml-2 text-xs bg-purple-200 text-purple-800 px-1 sm:px-2 py-1 rounded-full">You</span>}
              </span>
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{update.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Results Announcement */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">🎯 Hiring Results</h3>
            <p className="opacity-90 text-sm sm:text-base">Final selection results will be announced on July 3rd, 2025</p>
          </div>
          <Calendar size={32} className="opacity-80 hidden sm:block" />
        </div>
      </div>
    </div>
  );

  const Assignments = () => {
    const assignment = userData.assignments['frontend-challenge'];
    
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Assignment</h2>
          <div className="flex space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs sm:text-sm ${
              assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
              assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
              assignment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {assignment.status === 'not_started' ? 'Not Started' :
               assignment.status === 'in_progress' ? 'In Progress' :
               assignment.status === 'submitted' ? 'Submitted' : 'Completed'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                assignment.status === 'completed' ? 'bg-green-100' :
                assignment.status === 'submitted' ? 'bg-blue-100' :
                assignment.status === 'in_progress' ? 'bg-yellow-100' :
                'bg-purple-100'
              }`}>
                {assignment.status === 'completed' || assignment.status === 'submitted' ? (
                  <CheckCircle className={`${
                    assignment.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                  }`} size={18} />
                ) : assignment.status === 'in_progress' ? (
                  <Clock className="text-yellow-600" size={18} />
                ) : (
                  <FileText className="text-purple-600" size={18} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{assignment.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">AWS EC2 & S3</p>
              </div>
            </div>
            {/* Download Button - Always Available */}
            <button 
              onClick={downloadAssignmentPDF}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 text-xs sm:text-sm self-start"
              title="Download Assignment Details"
            >
              <Download size={14} />
              <span>Download</span>
            </button>
          </div>
          
          <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">{assignment.description}</p>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                <Clock size={14} className="mr-1" />
                <span>Due: July 3, 2025</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                <Award size={14} className="mr-1" />
                <span>High Priority</span>
              </div>
              {assignment.startedAt && (
                <div className="flex items-center text-xs sm:text-sm text-blue-600">
                  <Play size={14} className="mr-1" />
                  <span>Started: {new Date(assignment.startedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {assignment.status === 'not_started' && (
                <button 
                  onClick={() => handleStartAssignment(assignment.id)}
                  className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 text-xs sm:text-sm"
                >
                  <Play size={14} />
                  <span>Start & Download</span>
                </button>
              )}
              
              {(assignment.status === 'in_progress' || assignment.status === 'not_started') && (
                <button 
                  onClick={() => setActiveTab('submissions')}
                  className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-xs sm:text-sm"
                >
                  <Send size={14} />
                  <span>Submit</span>
                </button>
              )}
              
              {assignment.status === 'submitted' && (
                <div className="px-3 sm:px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-xs sm:text-sm">
                  ✓ Submitted on {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString() : 'Unknown'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Submissions = () => {
    const assignment = userData.assignments['frontend-challenge'];
    
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Submit Assignment</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <button 
              onClick={downloadAssignmentPDF}
              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-2 text-xs sm:text-sm"
            >
              <Download size={14} />
              <span>Download Assignment</span>
            </button>
            <div className="text-xs sm:text-sm text-gray-600">
              Results announced: <span className="font-semibold text-purple-600">July 3rd, 2025</span>
            </div>
          </div>
        </div>

        {assignment.status === 'submitted' ? (
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
            <div className="text-center py-6 sm:py-8">
              <CheckCircle className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Assignment Already Submitted!</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                You submitted this assignment on {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString() : 'Unknown'}
              </p>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <p className="text-blue-800 text-xs sm:text-sm">
                  Results will be announced on <span className="font-semibold">July 3rd, 2025</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-4">{assignment.title}</h3>
            
            <div className="space-y-4 sm:space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Project Files (ZIP only)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-purple-400 transition-colors">
                  <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                  <div className="flex text-xs sm:text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".zip"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">ZIP files up to 50MB</p>
                  {selectedFile && (
                    <div className="mt-2 text-xs sm:text-sm text-green-600">
                      ✓ {selectedFile.name} selected
                    </div>
                  )}
                </div>
              </div>

              {/* URL Alternative */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submit via URL (GitHub, Portfolio, etc.)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                />
              </div>

              {/* Submission Guidelines */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Submission Guidelines</h4>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                  <li>• Ensure your code is well-commented and follows best practices</li>
                  <li>• Include a README.md with setup instructions</li>
                  <li>• Test your application thoroughly before submission</li>
                  <li>• ZIP files should contain the complete project structure</li>
                </ul>
              </div>

              <button
                onClick={handleSubmitAssignment}
                disabled={(!selectedFile && !submissionUrl) || assignment.status === 'submitted'}
                className="w-full py-2.5 sm:py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
              >
                Submit Assignment
              </button>
            </div>
          </div>
        )}

        {submissionComplete && (
          <>
            <ConfettiAnimation />
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center max-w-sm sm:max-w-md mx-4 transform animate-pulse">
                <div className="text-4xl sm:text-6xl mb-4 animate-bounce">🎉</div>
                <h3 className="text-lg sm:text-2xl font-bold text-green-600 mb-2">Submission Successful!</h3>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">
                  Your assignment has been submitted successfully. Our team will review it shortly.
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Results will be announced on <span className="font-semibold">July 3rd, 2025</span>
                </p>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg"></div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Inncircles</h1>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Intern Portal</span>
              {connectionStatus === 'offline' && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Offline</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-600 hover:text-purple-600 cursor-pointer transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`${isRefreshing ? 'animate-spin' : ''}`} size={18} />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="text-gray-600 hover:text-purple-600 cursor-pointer transition-colors"
                >
                  <Bell size={18} />
                </button>
                {userData.notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                    {userData.notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-red-600 cursor-pointer transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
              
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                {userData.username.charAt(0).toUpperCase()}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden text-gray-600 hover:text-purple-600 cursor-pointer transition-colors"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`bg-white shadow-sm ${mobileMenuOpen ? 'block' : 'hidden'} sm:block`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'submissions', label: 'Submissions', icon: Upload }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 py-3 sm:py-4 px-2 border-b-2 transition-colors text-sm sm:text-base ${
                  activeTab === id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'assignments' && <Assignments />}
        {activeTab === 'submissions' && <Submissions />}
      </main>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={userData.notifications}
        onMarkAsRead={(notificationId) => {
          userDataManager.markNotificationAsRead(userData.userId, notificationId);
          onRefreshData();
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-xs sm:text-sm text-center sm:text-left">
              © 2025 Inncircles. Empowering the next generation of innovators.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <span className="text-center">Need help? Contact: intern-support@inncircles.com</span>
              <span className={`px-2 py-1 rounded text-xs ${
                connectionStatus === 'online' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {connectionStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InternPortal;
