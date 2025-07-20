import { createClient } from '@blinkdotnew/sdk';

export const blink = createClient({
  projectId: 'vestamod-plus-mobile-app-aaburrl1',
  authRequired: true
});

// Helper functions for data formatting
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(Math.abs(price)) + ' تومان';
};

export const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('fa-IR').format(d);
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// User profile helpers
export const getUserProfile = async (userId: string) => {
  const profiles = await blink.db.userProfiles.list({
    where: { userId },
    limit: 1
  });
  return profiles[0] || null;
};

export const createUserProfile = async (userId: string, data: any) => {
  const referralCode = `VEST${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  return await blink.db.userProfiles.create({
    id: generateId(),
    userId,
    referralCode,
    ...data
  });
};

// Activity helpers
export const getActivityIcon = (type: string) => {
  switch (type) {
    case 'hiking': return '🏔️';
    case 'running': return '🏃';
    case 'cycling': return '🚴';
    case 'swimming': return '🏊';
    default: return '🏃';
  }
};

export const getActivityColor = (type: string) => {
  switch (type) {
    case 'hiking': return '#10B981';
    case 'running': return '#EF4444';
    case 'cycling': return '#3B82F6';
    case 'swimming': return '#06B6D4';
    default: return '#6B7280';
  }
};

// Challenge helpers
export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'hard': return '#EF4444';
    default: return '#6B7280';
  }
};

export const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'آسان';
    case 'medium': return 'متوسط';
    case 'hard': return 'سخت';
    default: return 'نامشخص';
  }
};