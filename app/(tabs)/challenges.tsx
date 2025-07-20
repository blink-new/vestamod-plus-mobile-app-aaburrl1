import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Trophy, 
  Target, 
  Clock, 
  Users, 
  Star, 
  Gift,
  Medal,
  Crown,
  Zap,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react-native';
import { blink, formatDate, generateId, getDifficultyColor, getDifficultyText } from '../../lib/blink';

const { width } = Dimensions.get('window');

// Mock data
const userStats = {
  level: 12,
  xp: 2450,
  xpToNext: 3000,
  totalCoins: 1250,
  completedChallenges: 23,
  rank: 15,
};

const activeChallenges = [
  {
    id: 1,
    title: 'کوهنورد هفته',
    description: '10 کیلومتر کوهنوردی در این هفته',
    type: 'weekly',
    progress: 6.5,
    target: 10,
    unit: 'کیلومتر',
    reward: { xp: 200, coins: 50 },
    timeLeft: '3 روز',
    difficulty: 'medium',
    participants: 156,
  },
  {
    id: 2,
    title: 'دونده روزانه',
    description: 'هر روز حداقل 5 کیلومتر بدو',
    type: 'daily',
    progress: 5.2,
    target: 5,
    unit: 'کیلومتر',
    reward: { xp: 50, coins: 10 },
    timeLeft: '18 ساعت',
    difficulty: 'easy',
    participants: 324,
  },
  {
    id: 3,
    title: 'چالش ماهانه شنا',
    description: '50 کیلومتر شنا در این ماه',
    type: 'monthly',
    progress: 23.5,
    target: 50,
    unit: 'کیلومتر',
    reward: { xp: 500, coins: 150, discount: '20%' },
    timeLeft: '12 روز',
    difficulty: 'hard',
    participants: 89,
  },
];

const availableChallenges = [
  {
    id: 4,
    title: 'سرعت و شتاب',
    description: 'دویدن با سرعت بالای 12 کیلومتر در ساعت',
    type: 'special',
    target: 12,
    unit: 'کیلومتر/ساعت',
    reward: { xp: 300, coins: 75, badge: 'سریع‌ترین' },
    difficulty: 'hard',
    participants: 45,
    duration: '7 روز',
  },
  {
    id: 5,
    title: 'خریدار فعال',
    description: 'خرید محصولات ورزشی بالای 2 میلیون تومان',
    type: 'shopping',
    target: 2000000,
    unit: 'تومان',
    reward: { xp: 150, coins: 100, discount: '15%' },
    difficulty: 'medium',
    participants: 78,
    duration: '30 روز',
  },
];

const badges = [
  { id: 1, name: 'کوهنورد', icon: '🏔️', earned: true, description: '10 کوهنوردی تکمیل شده' },
  { id: 2, name: 'دونده', icon: '🏃', earned: true, description: '100 کیلومتر دویدن' },
  { id: 3, name: 'شناگر', icon: '🏊', earned: false, description: '50 کیلومتر شنا' },
  { id: 4, name: 'دوچرخه‌سوار', icon: '🚴', earned: true, description: '200 کیلومتر دوچرخه‌سواری' },
  { id: 5, name: 'خریدار VIP', icon: '💎', earned: false, description: '10 میلیون تومان خرید' },
  { id: 6, name: 'معرف طلایی', icon: '👑', earned: true, description: '20 نفر معرفی' },
];

const leaderboard = [
  { rank: 1, name: 'علی احمدی', xp: 5420, badge: '👑' },
  { rank: 2, name: 'مریم کریمی', xp: 4890, badge: '🥈' },
  { rank: 3, name: 'حسن رضایی', xp: 4650, badge: '🥉' },
  { rank: 4, name: 'فاطمه نوری', xp: 4200, badge: '' },
  { rank: 5, name: 'محمد صادقی', xp: 3980, badge: '' },
];

export default function ChallengesScreen() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'badges' | 'leaderboard'>('challenges');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadChallengesData(state.user.id);
      }
    });
    return unsubscribe;
  }, []);

  const loadChallengesData = async (userId: string) => {
    try {
      setLoading(true);
      
      // Get user profile
      const profiles = await blink.db.userProfiles.list({
        where: { userId },
        limit: 1
      });
      setUserProfile(profiles[0] || null);

      // Load all challenges
      const allChallenges = await blink.db.challenges.list({
        where: { isActive: 1 },
        orderBy: { createdAt: 'desc' }
      });

      // Load user's challenge participations
      const userChallengeParticipations = await blink.db.userChallenges.list({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      // Separate active and available challenges
      const userChallengeIds = userChallengeParticipations.map(uc => uc.challengeId);
      const active = allChallenges.filter(c => userChallengeIds.includes(c.id));
      const available = allChallenges.filter(c => !userChallengeIds.includes(c.id));

      // Add progress to active challenges
      const activeWithProgress = active.map(challenge => {
        const participation = userChallengeParticipations.find(uc => uc.challengeId === challenge.id);
        return {
          ...challenge,
          progress: participation?.progress || 0,
          status: participation?.status || 'active'
        };
      });

      setActiveChallenges(activeWithProgress);
      setAvailableChallenges(available);

      // Load badges
      const badges = await blink.db.badges.list({
        orderBy: { createdAt: 'asc' }
      });
      setAllBadges(badges);

      const earnedBadges = await blink.db.userBadges.list({
        where: { userId },
        orderBy: { earnedAt: 'desc' }
      });
      setUserBadges(earnedBadges);

      // Load leaderboard (top users by XP)
      const topUsers = await blink.db.userProfiles.list({
        orderBy: { xp: 'desc' },
        limit: 10
      });
      setLeaderboard(topUsers.map((user, index) => ({
        rank: index + 1,
        name: user.displayName || `کاربر ${user.userId.slice(-6)}`,
        xp: user.xp || 0,
        badge: index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
      })));

    } catch (error) {
      console.error('Error loading challenges data:', error);
      Alert.alert('خطا', 'خطا در بارگذاری اطلاعات چالش‌ها');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await loadChallengesData(user.id);
      setRefreshing(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;

    Alert.alert('پیوستن به چالش', 'آیا می‌خواهید به این چالش بپیوندید؟', [
      { text: 'لغو', style: 'cancel' },
      { 
        text: 'بپیوند', 
        onPress: async () => {
          try {
            await blink.db.userChallenges.create({
              id: generateId(),
              userId: user.id,
              challengeId,
              progress: 0,
              status: 'active'
            });

            // Update challenge participants count
            const challenge = availableChallenges.find(c => c.id === challengeId);
            if (challenge) {
              await blink.db.challenges.update(challengeId, {
                participantsCount: (challenge.participantsCount || 0) + 1
              });
            }

            Alert.alert('موفق!', 'شما به چالش پیوستید.');
            loadChallengesData(user.id);
          } catch (error) {
            Alert.alert('خطا', 'خطا در پیوستن به چالش');
          }
        }
      },
    ]);
  };

  const renderChallenges = () => (
    <View style={styles.tabContent}>
      {/* User Stats */}
      <LinearGradient colors={['#E53E3E', '#FF6B6B']} style={styles.userStatsCard}>
        <View style={styles.userStatsHeader}>
          <View style={styles.levelContainer}>
            <Crown color="#FFFFFF" size={24} />
            <Text style={styles.levelText}>سطح {userProfile?.level || 1}</Text>
          </View>
          <View style={styles.coinsContainer}>
            <Text style={styles.coinsText}>{userProfile?.totalCoins || 0}</Text>
            <Text style={styles.coinsLabel}>سکه</Text>
          </View>
        </View>
        
        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>تجربه: {userProfile?.xp || 0}/{((userProfile?.level || 1) * 1000)}</Text>
          <View style={styles.xpBar}>
            <View style={[styles.xpProgress, { width: `${((userProfile?.xp || 0) / ((userProfile?.level || 1) * 1000)) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.userStatsBottom}>
          <View style={styles.userStat}>
            <Text style={styles.userStatValue}>{activeChallenges.filter(c => c.status === 'completed').length}</Text>
            <Text style={styles.userStatLabel}>چالش تکمیل شده</Text>
          </View>
          <View style={styles.userStat}>
            <Text style={styles.userStatValue}>#{leaderboard.findIndex(u => u.name.includes(userProfile?.userId?.slice(-6) || '')) + 1 || '-'}</Text>
            <Text style={styles.userStatLabel}>رتبه</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Active Challenges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>چالش‌های فعال</Text>
        {activeChallenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={styles.challengeDescription}>{challenge.description}</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
                <Text style={styles.difficultyText}>{getDifficultyText(challenge.difficulty)}</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {challenge.progress}/{challenge.target} {challenge.unit}
                </Text>
                <Text style={styles.timeLeft}>{challenge.timeLeft} باقی مانده</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }
                ]} />
              </View>
            </View>

            <View style={styles.challengeFooter}>
              <View style={styles.rewardContainer}>
                <View style={styles.reward}>
                  <Zap color="#F59E0B" size={16} />
                  <Text style={styles.rewardText}>{challenge.reward.xp} XP</Text>
                </View>
                <View style={styles.reward}>
                  <Text style={styles.coinIcon}>🪙</Text>
                  <Text style={styles.rewardText}>{challenge.reward.coins}</Text>
                </View>
                {challenge.reward.discount && (
                  <View style={styles.reward}>
                    <Gift color="#10B981" size={16} />
                    <Text style={styles.rewardText}>{challenge.reward.discount}</Text>
                  </View>
                )}
              </View>
              <View style={styles.participantsContainer}>
                <Users color="#6B7280" size={16} />
                <Text style={styles.participantsText}>{challenge.participants}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Available Challenges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>چالش‌های موجود</Text>
        {availableChallenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={styles.challengeDescription}>{challenge.description}</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
                <Text style={styles.difficultyText}>{getDifficultyText(challenge.difficulty)}</Text>
              </View>
            </View>

            <View style={styles.challengeDetails}>
              <Text style={styles.challengeTarget}>
                هدف: {challenge.targetValue} {challenge.targetUnit}
              </Text>
              <Text style={styles.challengeDuration}>
                مدت: {challenge.endDate ? `تا ${formatDate(challenge.endDate)}` : 'نامحدود'}
              </Text>
            </View>

            <View style={styles.challengeFooter}>
              <View style={styles.rewardContainer}>
                <View style={styles.reward}>
                  <Zap color="#F59E0B" size={16} />
                  <Text style={styles.rewardText}>{challenge.rewardXp} XP</Text>
                </View>
                <View style={styles.reward}>
                  <Text style={styles.coinIcon}>🪙</Text>
                  <Text style={styles.rewardText}>{challenge.rewardCoins}</Text>
                </View>
                {challenge.rewardBadge && (
                  <View style={styles.reward}>
                    <Medal color="#8B5CF6" size={16} />
                    <Text style={styles.rewardText}>{challenge.rewardBadge}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity 
                style={styles.joinButton}
                onPress={() => joinChallenge(challenge.id)}
              >
                <Text style={styles.joinButtonText}>پیوستن</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderBadges = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>نشان‌های من</Text>
      <View style={styles.badgesGrid}>
        {allBadges.map((badge) => {
          const isEarned = userBadges.some(ub => ub.badgeId === badge.id);
          return (
            <View key={badge.id} style={[
              styles.badgeCard,
              !isEarned && styles.badgeCardLocked
            ]}>
              <Text style={[
                styles.badgeIcon,
                !isEarned && styles.badgeIconLocked
              ]}>
                {isEarned ? badge.icon : '🔒'}
              </Text>
              <Text style={[
                styles.badgeName,
                !isEarned && styles.badgeNameLocked
              ]}>
                {badge.name}
              </Text>
              <Text style={[
                styles.badgeDescription,
                !isEarned && styles.badgeDescriptionLocked
              ]}>
                {badge.description}
              </Text>
              {isEarned && (
                <View style={styles.earnedBadge}>
                  <Star color="#F59E0B" size={16} fill="#F59E0B" />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>جدول امتیازات</Text>
      {leaderboard.map((user) => (
        <View key={user.rank} style={[
          styles.leaderboardItem,
          user.rank <= 3 && styles.leaderboardItemTop
        ]}>
          <View style={styles.leaderboardRank}>
            <Text style={styles.leaderboardRankText}>
              {user.badge || user.rank}
            </Text>
          </View>
          <View style={styles.leaderboardInfo}>
            <Text style={styles.leaderboardName}>{user.name}</Text>
            <Text style={styles.leaderboardXP}>{user.xp} XP</Text>
          </View>
          {user.rank <= 3 && (
            <View style={styles.leaderboardBadge}>
              <Trophy color="#F59E0B" size={20} />
            </View>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>چالش‌ها و جوایز</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'challenges' && styles.tabButtonActive]}
          onPress={() => setActiveTab('challenges')}
        >
          <Target color={activeTab === 'challenges' ? '#FFFFFF' : '#6B7280'} size={20} />
          <Text style={[styles.tabButtonText, activeTab === 'challenges' && styles.tabButtonTextActive]}>
            چالش‌ها
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'badges' && styles.tabButtonActive]}
          onPress={() => setActiveTab('badges')}
        >
          <Award color={activeTab === 'badges' ? '#FFFFFF' : '#6B7280'} size={20} />
          <Text style={[styles.tabButtonText, activeTab === 'badges' && styles.tabButtonTextActive]}>
            نشان‌ها
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'leaderboard' && styles.tabButtonActive]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Trophy color={activeTab === 'leaderboard' ? '#FFFFFF' : '#6B7280'} size={20} />
          <Text style={[styles.tabButtonText, activeTab === 'leaderboard' && styles.tabButtonTextActive]}>
            رتبه‌بندی
          </Text>
        </TouchableOpacity>
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
            {activeTab === 'challenges' && renderChallenges()}
            {activeTab === 'badges' && renderBadges()}
            {activeTab === 'leaderboard' && renderLeaderboard()}
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
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: '#E53E3E',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  userStatsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  userStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  coinsContainer: {
    alignItems: 'center',
  },
  coinsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  coinsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  xpContainer: {
    marginBottom: 16,
  },
  xpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    textAlign: 'center',
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  userStatsBottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userStat: {
    alignItems: 'center',
  },
  userStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right',
  },
  challengeCard: {
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
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeInfo: {
    flex: 1,
    marginRight: 12,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 20,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  timeLeft: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  coinIcon: {
    fontSize: 16,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  challengeDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  challengeTarget: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right',
    marginBottom: 4,
  },
  challengeDuration: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  joinButton: {
    backgroundColor: '#E53E3E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 48) / 2,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: '#9CA3AF',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  badgeDescriptionLocked: {
    color: '#D1D5DB',
  },
  earnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  leaderboardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardItemTop: {
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  leaderboardRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  leaderboardXP: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 2,
  },
  leaderboardBadge: {
    marginLeft: 12,
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
});