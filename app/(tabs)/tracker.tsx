import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  Pause, 
  Square, 
  MapPin, 
  Clock, 
  Zap, 
  TrendingUp,
  Camera,
  Heart,
  Mountain,
  Waves,
  Bike,
  Activity
} from 'lucide-react-native';
import { blink, formatDate, generateId, getActivityIcon, getActivityColor } from '../../lib/blink';

const { width } = Dimensions.get('window');

// Mock data
const activityTypes = [
  { id: 'hiking', name: 'کوهنوردی', icon: Mountain, color: '#10B981' },
  { id: 'running', name: 'دویدن', icon: Activity, color: '#EF4444' },
  { id: 'cycling', name: 'دوچرخه‌سواری', icon: Bike, color: '#3B82F6' },
  { id: 'swimming', name: 'شنا', icon: Waves, color: '#06B6D4' },
];

const recentActivities = [
  {
    id: 1,
    type: 'hiking',
    title: 'کوهنوردی در دماوند',
    distance: 12.5,
    duration: '3:45:20',
    elevation: 850,
    calories: 1250,
    date: '1403/10/15',
    gear: ['کوله پشتی کوهنوردی', 'کفش کوهنوردی'],
    likes: 23,
    comments: 5,
  },
  {
    id: 2,
    type: 'running',
    title: 'دویدن صبحگاهی',
    distance: 8.2,
    duration: '0:42:15',
    elevation: 45,
    calories: 520,
    date: '1403/10/14',
    gear: ['کفش دویدن نایک', 'ساعت ورزشی'],
    likes: 15,
    comments: 2,
  },
  {
    id: 3,
    type: 'cycling',
    title: 'دوچرخه‌سواری در پارک',
    distance: 25.8,
    duration: '1:15:30',
    elevation: 120,
    calories: 680,
    date: '1403/10/12',
    gear: ['دوچرخه کوهستان', 'کلاه ایمنی'],
    likes: 31,
    comments: 8,
  },
];

const weeklyStats = {
  totalDistance: 46.5,
  totalDuration: '5:43:05',
  totalCalories: 2450,
  activeDays: 5,
};

export default function TrackerScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState({
    distance: 0,
    duration: '00:00:00',
    calories: 0,
    pace: '0:00',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    totalDistance: 0,
    totalDuration: '00:00:00',
    totalCalories: 0,
    activeDays: 0,
  });
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionInterval, setSessionInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadTrackerData(state.user.id);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    return () => {
      if (sessionInterval) {
        clearInterval(sessionInterval);
      }
    };
  }, [sessionInterval]);

  const loadTrackerData = async (userId: string) => {
    try {
      setLoading(true);
      
      // Load recent activities
      const userActivities = await blink.db.activities.list({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        limit: 20
      });
      setActivities(userActivities);

      // Calculate weekly stats
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyActivities = userActivities.filter(activity => 
        new Date(activity.createdAt) >= oneWeekAgo
      );

      const totalDistance = weeklyActivities.reduce((sum, activity) => sum + (activity.distance || 0), 0);
      const totalCalories = weeklyActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0);
      const activeDays = new Set(weeklyActivities.map(activity => 
        new Date(activity.createdAt).toDateString()
      )).size;

      // Calculate total duration
      const totalMinutes = weeklyActivities.reduce((sum, activity) => {
        if (activity.duration) {
          const [hours, minutes, seconds] = activity.duration.split(':').map(Number);
          return sum + (hours * 60) + minutes + (seconds / 60);
        }
        return sum;
      }, 0);

      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      const totalDuration = `${hours}:${minutes.toString().padStart(2, '0')}:00`;

      setWeeklyStats({
        totalDistance,
        totalDuration,
        totalCalories,
        activeDays,
      });

    } catch (error) {
      console.error('Error loading tracker data:', error);
      Alert.alert('خطا', 'خطا در بارگذاری اطلاعات ردیاب');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await loadTrackerData(user.id);
      setRefreshing(false);
    }
  };

  const startTracking = (activityType: string) => {
    setSelectedActivity(activityType);
    setIsTracking(true);
    setIsPaused(false);
    setSessionStartTime(new Date());
    
    // Start session timer
    const interval = setInterval(() => {
      if (sessionStartTime && !isPaused) {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        
        setCurrentSession(prev => ({
          ...prev,
          duration: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
          distance: prev.distance + 0.01, // Simulate distance tracking
          calories: Math.floor(elapsed * 0.2), // Simulate calorie calculation
        }));
      }
    }, 1000);
    
    setSessionInterval(interval);
    Alert.alert('شروع ردیابی', `ردیابی ${activityTypes.find(a => a.id === activityType)?.name} شروع شد.`);
  };

  const pauseTracking = () => {
    setIsPaused(!isPaused);
  };

  const stopTracking = () => {
    Alert.alert(
      'پایان فعالیت',
      'آیا می‌خواهید فعالیت را ذخیره کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        { 
          text: 'ذخیره', 
          onPress: saveActivity
        },
      ]
    );
  };

  const saveActivity = async () => {
    if (!user || !selectedActivity || !sessionStartTime) return;

    try {
      const activityName = activityTypes.find(a => a.id === selectedActivity)?.name || selectedActivity;
      
      await blink.db.activities.create({
        id: generateId(),
        userId: user.id,
        type: selectedActivity,
        title: `${activityName} ${formatDate(new Date())}`,
        description: `فعالیت ${activityName} ثبت شده توسط ردیاب`,
        distance: currentSession.distance,
        duration: currentSession.duration,
        elevation: Math.floor(Math.random() * 200), // Simulate elevation
        calories: currentSession.calories,
        pace: currentSession.pace,
        routeData: JSON.stringify([]), // Empty route for now
        gearUsed: JSON.stringify([]), // Empty gear for now
        photos: JSON.stringify([]), // Empty photos for now
        isPublic: 1,
        likesCount: 0,
        commentsCount: 0
      });

      // Update user XP and coins
      const xpGained = Math.floor(currentSession.distance * 10);
      const coinsGained = Math.floor(currentSession.distance * 2);
      
      // Reset tracking state
      setIsTracking(false);
      setIsPaused(false);
      setSelectedActivity(null);
      setSessionStartTime(null);
      setCurrentSession({
        distance: 0,
        duration: '00:00:00',
        calories: 0,
        pace: '0:00',
      });
      
      if (sessionInterval) {
        clearInterval(sessionInterval);
        setSessionInterval(null);
      }

      Alert.alert('ذخیره شد!', `فعالیت شما ذخیره شد.\n+${xpGained} XP, +${coinsGained} سکه`);
      loadTrackerData(user.id);
      
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert('خطا', 'خطا در ذخیره فعالیت');
    }
  };

  const toggleActivityLike = async (activityId: string) => {
    if (!user) return;

    try {
      // Check if already liked
      const existingLikes = await blink.db.activityLikes.list({
        where: { activityId, userId: user.id },
        limit: 1
      });

      if (existingLikes.length > 0) {
        // Unlike
        await blink.db.activityLikes.delete(existingLikes[0].id);
        
        // Update activity likes count
        const activity = activities.find(a => a.id === activityId);
        if (activity) {
          await blink.db.activities.update(activityId, {
            likesCount: Math.max(0, activity.likesCount - 1)
          });
        }
      } else {
        // Like
        await blink.db.activityLikes.create({
          id: generateId(),
          activityId,
          userId: user.id
        });
        
        // Update activity likes count
        const activity = activities.find(a => a.id === activityId);
        if (activity) {
          await blink.db.activities.update(activityId, {
            likesCount: activity.likesCount + 1
          });
        }
      }

      // Refresh activities
      loadTrackerData(user.id);
      
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    const activity = activityTypes.find(a => a.id === type);
    return activity ? activity.icon : Activity;
  };

  const getActivityColor = (type: string) => {
    const activity = activityTypes.find(a => a.id === type);
    return activity ? activity.color : '#6B7280';
  };

  const renderTrackingInterface = () => (
    <View style={styles.trackingContainer}>
      <LinearGradient 
        colors={[getActivityColor(selectedActivity!), getActivityColor(selectedActivity!) + '80']} 
        style={styles.trackingCard}
      >
        <View style={styles.trackingHeader}>
          <Text style={styles.trackingTitle}>
            {activityTypes.find(a => a.id === selectedActivity)?.name}
          </Text>
          <View style={[styles.trackingStatus, { backgroundColor: isPaused ? '#F59E0B' : '#10B981' }]}>
            <Text style={styles.trackingStatusText}>
              {isPaused ? 'متوقف' : 'در حال ردیابی'}
            </Text>
          </View>
        </View>

        <View style={styles.trackingStats}>
          <View style={styles.trackingStat}>
            <Text style={styles.trackingStatValue}>{currentSession.distance.toFixed(1)}</Text>
            <Text style={styles.trackingStatLabel}>کیلومتر</Text>
          </View>
          <View style={styles.trackingStat}>
            <Text style={styles.trackingStatValue}>{currentSession.duration}</Text>
            <Text style={styles.trackingStatLabel}>زمان</Text>
          </View>
          <View style={styles.trackingStat}>
            <Text style={styles.trackingStatValue}>{currentSession.calories}</Text>
            <Text style={styles.trackingStatLabel}>کالری</Text>
          </View>
        </View>

        <View style={styles.trackingControls}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.stopButton]} 
            onPress={stopTracking}
          >
            <Square color="#FFFFFF" size={24} fill="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlButton, styles.pauseButton]} 
            onPress={pauseTracking}
          >
            {isPaused ? (
              <Play color="#FFFFFF" size={24} fill="#FFFFFF" />
            ) : (
              <Pause color="#FFFFFF" size={24} fill="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderActivitySelector = () => (
    <View style={styles.activitySelector}>
      <Text style={styles.sectionTitle}>نوع فعالیت را انتخاب کنید</Text>
      <View style={styles.activityGrid}>
        {activityTypes.map((activity) => {
          const IconComponent = activity.icon;
          return (
            <TouchableOpacity
              key={activity.id}
              style={[styles.activityCard, { borderColor: activity.color }]}
              onPress={() => startTracking(activity.id)}
            >
              <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
                <IconComponent color="#FFFFFF" size={32} />
              </View>
              <Text style={styles.activityName}>{activity.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ردیاب ورزشی</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>در حال بارگذاری...</Text>
          </View>
        ) : (
          <>
            {/* Weekly Stats */}
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>آمار هفته</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MapPin color="#E53E3E" size={24} />
                  <Text style={styles.statValue}>{weeklyStats.totalDistance.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>کیلومتر</Text>
                </View>
                <View style={styles.statCard}>
                  <Clock color="#3B82F6" size={24} />
                  <Text style={styles.statValue}>{weeklyStats.totalDuration}</Text>
                  <Text style={styles.statLabel}>زمان</Text>
                </View>
                <View style={styles.statCard}>
                  <Zap color="#F59E0B" size={24} />
                  <Text style={styles.statValue}>{weeklyStats.totalCalories}</Text>
                  <Text style={styles.statLabel}>کالری</Text>
                </View>
                <View style={styles.statCard}>
                  <TrendingUp color="#10B981" size={24} />
                  <Text style={styles.statValue}>{weeklyStats.activeDays}</Text>
                  <Text style={styles.statLabel}>روز فعال</Text>
                </View>
              </View>
            </View>

        {/* Tracking Interface or Activity Selector */}
        {isTracking ? renderTrackingInterface() : renderActivitySelector()}

        {/* Recent Activities */}
        <View style={styles.recentActivities}>
          <Text style={styles.sectionTitle}>فعالیت‌های اخیر</Text>
          {activities.length === 0 ? (
            <View style={styles.emptyState}>
              <Activity color="#9CA3AF" size={48} />
              <Text style={styles.emptyStateText}>هنوز فعالیتی ثبت نکرده‌اید</Text>
              <Text style={styles.emptyStateSubtext}>اولین فعالیت خود را شروع کنید</Text>
            </View>
          ) : (
            activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              const color = getActivityColor(activity.type);
              
              return (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityItemHeader}>
                    <View style={styles.activityItemInfo}>
                      <View style={[styles.activityItemIcon, { backgroundColor: color }]}>
                        <IconComponent color="#FFFFFF" size={20} />
                      </View>
                      <View style={styles.activityItemDetails}>
                        <Text style={styles.activityItemTitle}>{activity.title}</Text>
                        <Text style={styles.activityItemDate}>{formatDate(activity.createdAt)}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.cameraButton}>
                      <Camera color="#6B7280" size={20} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.activityItemStats}>
                    <View style={styles.activityItemStat}>
                      <Text style={styles.activityItemStatValue}>{activity.distance?.toFixed(1) || '0'}</Text>
                      <Text style={styles.activityItemStatLabel}>کیلومتر</Text>
                    </View>
                    <View style={styles.activityItemStat}>
                      <Text style={styles.activityItemStatValue}>{activity.duration || '00:00:00'}</Text>
                      <Text style={styles.activityItemStatLabel}>زمان</Text>
                    </View>
                    <View style={styles.activityItemStat}>
                      <Text style={styles.activityItemStatValue}>{activity.elevation || 0}</Text>
                      <Text style={styles.activityItemStatLabel}>ارتفاع (متر)</Text>
                    </View>
                    <View style={styles.activityItemStat}>
                      <Text style={styles.activityItemStatValue}>{activity.calories || 0}</Text>
                      <Text style={styles.activityItemStatLabel}>کالری</Text>
                    </View>
                  </View>

                  {/* Gear Used */}
                  {activity.gearUsed && JSON.parse(activity.gearUsed).length > 0 && (
                    <View style={styles.gearContainer}>
                      <Text style={styles.gearTitle}>تجهیزات استفاده شده:</Text>
                      <View style={styles.gearList}>
                        {JSON.parse(activity.gearUsed).map((item: string, index: number) => (
                          <Text key={index} style={styles.gearItem}>• {item}</Text>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Social Stats */}
                  <View style={styles.socialStats}>
                    <TouchableOpacity 
                      style={styles.socialStat}
                      onPress={() => toggleActivityLike(activity.id)}
                    >
                      <Heart color="#EF4444" size={16} />
                      <Text style={styles.socialStatText}>{activity.likesCount || 0}</Text>
                    </TouchableOpacity>
                    <View style={styles.socialStat}>
                      <Text style={styles.socialStatText}>{activity.commentsCount || 0} نظر</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right',
  },
  statsContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 48) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  activitySelector: {
    padding: 16,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: (width - 48) / 2,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityIcon: {
    borderRadius: 30,
    padding: 16,
    marginBottom: 12,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  trackingContainer: {
    padding: 16,
  },
  trackingCard: {
    borderRadius: 20,
    padding: 24,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  trackingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trackingStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trackingStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trackingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  trackingStat: {
    alignItems: 'center',
  },
  trackingStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trackingStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  trackingControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    borderRadius: 30,
    padding: 16,
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  pauseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  recentActivities: {
    padding: 16,
  },
  activityItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityItemIcon: {
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  activityItemDetails: {
    flex: 1,
  },
  activityItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  activityItemDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
  },
  cameraButton: {
    padding: 8,
  },
  activityItemStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  activityItemStat: {
    alignItems: 'center',
  },
  activityItemStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  activityItemStatLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  gearContainer: {
    marginBottom: 12,
  },
  gearTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right',
  },
  gearList: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  gearItem: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'right',
  },
  socialStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
  },
  socialStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialStatText: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});