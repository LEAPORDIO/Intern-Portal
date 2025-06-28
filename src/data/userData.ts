export interface UserProgress {
  userId: string;
  username: string;
  password: string;
  assignments: {
    [key: string]: {
      id: string;
      title: string;
      description: string;
      status: 'not_started' | 'in_progress' | 'submitted' | 'completed';
      startedAt?: string;
      submittedAt?: string;
      score?: number;
      feedback?: string;
    };
  };
  submissions: {
    [key: string]: {
      assignmentId: string;
      type: 'file' | 'url';
      content: string;
      submittedAt: string;
    };
  };
  notifications: Array<{
    id: string;
    message: string;
    timestamp: string;
    read: boolean;
    type: 'assignment' | 'submission' | 'feedback' | 'general';
  }>;
  stats: {
    totalAssignments: number;
    completedAssignments: number;
    pendingAssignments: number;
    averageScore: number;
  };
}

export interface LiveUpdate {
  id: string;
  name: string;
  action: string;
  type: 'success' | 'submission' | 'feedback' | 'start' | 'score';
  time: string;
  timestamp: number;
  isUserAction?: boolean;
}

export const initialUserData: { [key: string]: UserProgress } = {
  sarat: {
    userId: 'sarat',
    username: 'sarat',
    password: 'c2FyYXQgZXJyaXB1a3U=',
    assignments: {
      'frontend-challenge': {
        id: 'frontend-challenge',
        title: 'Static Website File Uploader using EC2 and S3',
        description: 'The objective of this project is to build a basic cloud application using only essential AWS services: EC2 and S3.',
        status: 'not_started'
      }
    },
    submissions: {},
    notifications: [
      {
        id: '1',
        message: 'Welcome to Inncircles Intern Portal! Your journey begins here.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'general'
      },
      {
        id: '2',
        message: 'New assignment "Static Website File Uploader using EC2 and S3" has been assigned to you.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        type: 'assignment'
      }
    ],
    stats: {
      totalAssignments: 1,
      completedAssignments: 0,
      pendingAssignments: 1,
      averageScore: 0
    }
  }
};

// Enhanced live updates with more names and dynamic generation
const generateRandomUpdate = (): LiveUpdate => {
  const names = [
    'Priya Sharma', 'Rahul Kumar', 'Ananya Mehta', 'Vikash Patel', 'Sneha Reddy',
    'Arjun Tiwari', 'Kavya Lakshmi', 'Harsh Wadhwa', 'Divya Singh', 'Rohan Gupta',
    'Ishita Jain', 'Karthik Nair', 'Pooja Agarwal', 'Siddharth Roy', 'Meera Iyer',
    'Aarav Malhotra', 'Riya Chopra', 'Nikhil Verma', 'Tanvi Bhatt', 'Akash Sinha',
    'Shreya Pandey', 'Varun Khanna', 'Nisha Bansal', 'Deepak Yadav', 'Kritika Saxena',
    'Manish Joshi', 'Swati Mishra', 'Abhishek Sharma', 'Preeti Kumari', 'Gaurav Singh'
  ];

  const actions = [
    { action: 'completed React E-commerce Project ahead of schedule!', type: 'success' },
    { action: 'received excellent mentor feedback on API design', type: 'feedback' },
    { action: 'started working on Machine Learning Assignment', type: 'start' },
    { action: 'submitted Full-Stack Web Application', type: 'submission' },
    { action: 'achieved 98% in Database Optimization project', type: 'score' },
    { action: 'completed Mobile App Development challenge', type: 'success' },
    { action: 'received client appreciation for UI/UX design', type: 'feedback' },
    { action: 'submitted Cloud Infrastructure project', type: 'submission' },
    { action: 'started working on DevOps Pipeline Assignment', type: 'start' },
    { action: 'achieved 92% in System Design project', type: 'score' },
    { action: 'completed Data Analytics Dashboard', type: 'success' },
    { action: 'received outstanding performance review', type: 'feedback' },
    { action: 'submitted Blockchain Implementation project', type: 'submission' },
    { action: 'started working on AI Chatbot Development', type: 'start' },
    { action: 'achieved 96% in Microservices Architecture', type: 'score' }
  ];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  const randomMinutesAgo = Math.floor(Math.random() * 120) + 1; // 1-120 minutes ago
  const timestamp = Date.now() - (randomMinutesAgo * 60 * 1000);

  const formatTime = (minutesAgo: number): string => {
    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo === 1) return '1h ago';
    return `${hoursAgo}h ago`;
  };

  return {
    id: `update_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    name: randomName,
    action: randomAction.action,
    type: randomAction.type as 'success' | 'submission' | 'feedback' | 'start' | 'score',
    time: formatTime(randomMinutesAgo),
    timestamp,
    isUserAction: false
  };
};

// Simulated database operations
export class UserDataManager {
  private static instance: UserDataManager;
  private userData: { [key: string]: UserProgress };
  private liveUpdates: LiveUpdate[];

  constructor() {
    const savedData = localStorage.getItem('intern_portal_data');
    this.userData = savedData ? JSON.parse(savedData) : { ...initialUserData };
    
    const savedUpdates = localStorage.getItem('live_updates_data');
    this.liveUpdates = savedUpdates ? JSON.parse(savedUpdates) : this.generateInitialUpdates();
  }

  static getInstance(): UserDataManager {
    if (!UserDataManager.instance) {
      UserDataManager.instance = new UserDataManager();
    }
    return UserDataManager.instance;
  }

  private generateInitialUpdates(): LiveUpdate[] {
    const updates: LiveUpdate[] = [];
    for (let i = 0; i < 8; i++) {
      updates.push(generateRandomUpdate());
    }
    return updates.sort((a, b) => b.timestamp - a.timestamp);
  }

  private saveData(): void {
    localStorage.setItem('intern_portal_data', JSON.stringify(this.userData));
    localStorage.setItem('live_updates_data', JSON.stringify(this.liveUpdates));
  }

  private addLiveUpdate(update: LiveUpdate): void {
    this.liveUpdates.unshift(update);
    // Keep only the latest 20 updates
    this.liveUpdates = this.liveUpdates.slice(0, 20);
    this.saveData();
  }

  private formatTimeAgo(timestamp: string): string {
    const now = Date.now();
    const updateTime = new Date(timestamp).getTime();
    const diffInMinutes = Math.floor((now - updateTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const hoursAgo = Math.floor(diffInMinutes / 60);
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo}d ago`;
  }

  authenticateUser(username: string, password: string): UserProgress | null {
    const user = this.userData[username];
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  getUserData(userId: string): UserProgress | null {
    return this.userData[userId] || null;
  }

  updateUserData(userId: string, data: Partial<UserProgress>): void {
    if (this.userData[userId]) {
      this.userData[userId] = { ...this.userData[userId], ...data };
      this.saveData();
    }
  }

  startAssignment(userId: string, assignmentId: string): void {
    if (this.userData[userId] && this.userData[userId].assignments[assignmentId]) {
      const user = this.userData[userId];
      const assignment = user.assignments[assignmentId];
      
      assignment.status = 'in_progress';
      assignment.startedAt = new Date().toISOString();
      
      // Add notification
      this.addNotification(userId, {
        id: Date.now().toString(),
        message: `Started working on "${assignment.title}"`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'assignment'
      });

      // Add live update for user action
      const userUpdate: LiveUpdate = {
        id: `user_start_${Date.now()}`,
        name: user.username.charAt(0).toUpperCase() + user.username.slice(1),
        action: `started working on ${assignment.title}`,
        type: 'start',
        time: 'Just now',
        timestamp: Date.now(),
        isUserAction: true
      };
      this.addLiveUpdate(userUpdate);

      this.saveData();
    }
  }

  submitAssignment(userId: string, assignmentId: string, submission: { type: 'file' | 'url'; content: string }): void {
    if (this.userData[userId] && this.userData[userId].assignments[assignmentId]) {
      const user = this.userData[userId];
      const assignment = user.assignments[assignmentId];
      const submissionId = Date.now().toString();
      
      // Update assignment status
      assignment.status = 'submitted';
      assignment.submittedAt = new Date().toISOString();
      
      // Add submission
      user.submissions[submissionId] = {
        assignmentId,
        type: submission.type,
        content: submission.content,
        submittedAt: new Date().toISOString()
      };

      // Add notification
      this.addNotification(userId, {
        id: Date.now().toString(),
        message: `Successfully submitted "${assignment.title}"`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'submission'
      });

      // Add live update for user submission - THIS IS MANDATORY
      const userSubmissionUpdate: LiveUpdate = {
        id: `user_submit_${Date.now()}`,
        name: user.username.charAt(0).toUpperCase() + user.username.slice(1),
        action: `submitted ${assignment.title}`,
        type: 'submission',
        time: 'Just now',
        timestamp: Date.now(),
        isUserAction: true
      };
      this.addLiveUpdate(userSubmissionUpdate);

      // Update stats
      this.updateStats(userId);
      this.saveData();
    }
  }

  addNotification(userId: string, notification: UserProgress['notifications'][0]): void {
    if (this.userData[userId]) {
      this.userData[userId].notifications.unshift(notification);
      this.saveData();
    }
  }

  markNotificationAsRead(userId: string, notificationId: string): void {
    if (this.userData[userId]) {
      const notification = this.userData[userId].notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        this.saveData();
      }
    }
  }

  private updateStats(userId: string): void {
    if (this.userData[userId]) {
      const assignments = Object.values(this.userData[userId].assignments);
      this.userData[userId].stats = {
        totalAssignments: assignments.length,
        completedAssignments: assignments.filter(a => a.status === 'completed').length,
        pendingAssignments: assignments.filter(a => a.status === 'not_started' || a.status === 'in_progress').length,
        averageScore: assignments.filter(a => a.score).reduce((acc, a) => acc + (a.score || 0), 0) / assignments.filter(a => a.score).length || 0
      };
    }
  }

  // Get live updates with fresh timestamps
  getLiveUpdates(): LiveUpdate[] {
    // Update timestamps for display
    return this.liveUpdates.map(update => ({
      ...update,
      time: this.formatTimeAgo(new Date(update.timestamp).toISOString())
    }));
  }

  // Add random updates periodically
  addRandomUpdate(): void {
    const newUpdate = generateRandomUpdate();
    this.addLiveUpdate(newUpdate);
  }

  // Generate fresh updates (called periodically)
  refreshLiveUpdates(): void {
    // Add 1-3 new random updates
    const numNewUpdates = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numNewUpdates; i++) {
      this.addRandomUpdate();
    }
  }
}

// Generate realistic live updates - now returns from UserDataManager
export const generateLiveUpdates = (): LiveUpdate[] => {
  const userDataManager = UserDataManager.getInstance();
  return userDataManager.getLiveUpdates();
};