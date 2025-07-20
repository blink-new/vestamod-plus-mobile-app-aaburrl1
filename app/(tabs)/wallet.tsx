import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Wallet, 
  Gift, 
  TrendingUp, 
  Copy, 
  Share2, 
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  DollarSign
} from 'lucide-react-native';
import { blink, formatPrice, formatDate, generateId, getUserProfile, createUserProfile } from '../../lib/blink';

// Mock data
const walletData = {
  balance: 2450000,
  totalEarnings: 8750000,
  referralCode: 'VEST2024',
  referralCount: 23,
  pendingWithdrawal: 500000,
  commissionRate: 10,
};

const transactions = [
  {
    id: 1,
    type: 'commission',
    amount: 250000,
    description: 'کمیسیون خرید کوله پشتی',
    referredUser: 'علی احمدی',
    date: '1403/10/15',
    status: 'completed',
  },
  {
    id: 2,
    type: 'withdrawal',
    amount: -1000000,
    description: 'برداشت به حساب بانکی',
    bankAccount: '6037-****-****-1234',
    date: '1403/10/12',
    status: 'completed',
  },
  {
    id: 3,
    type: 'commission',
    amount: 180000,
    description: 'کمیسیون خرید کفش دویدن',
    referredUser: 'مریم کریمی',
    date: '1403/10/10',
    status: 'completed',
  },
  {
    id: 4,
    type: 'commission',
    amount: 85000,
    description: 'کمیسیون خرید عینک شنا',
    referredUser: 'حسن رضایی',
    date: '1403/10/08',
    status: 'pending',
  },
];

const referredUsers = [
  { id: 1, name: 'علی احمدی', totalPurchases: 2500000, joinDate: '1403/09/20', status: 'active' },
  { id: 2, name: 'مریم کریمی', totalPurchases: 1800000, joinDate: '1403/09/15', status: 'active' },
  { id: 3, name: 'حسن رضایی', totalPurchases: 850000, joinDate: '1403/10/01', status: 'active' },
  { id: 4, name: 'فاطمه نوری', totalPurchases: 3200000, joinDate: '1403/08/25', status: 'active' },
];

export default function WalletScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'referrals'>('overview');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadWalletData(state.user.id);
      }
    });
    return unsubscribe;
  }, []);

  const loadWalletData = async (userId: string) => {
    try {
      setLoading(true);
      
      // Get or create user profile
      let profile = await getUserProfile(userId);
      if (!profile) {
        profile = await createUserProfile(userId, {
          displayName: user?.email?.split('@')[0] || 'کاربر',
          email: user?.email
        });
      }
      setUserProfile(profile);

      // Load transactions
      const userTransactions = await blink.db.walletTransactions.list({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        limit: 50
      });
      setTransactions(userTransactions);

      // Load referrals
      const userReferrals = await blink.db.referrals.list({
        where: { referrerUserId: userId },
        orderBy: { createdAt: 'desc' }
      });
      setReferrals(userReferrals);

    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert('خطا', 'خطا در بارگذاری اطلاعات کیف پول');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await loadWalletData(user.id);
      setRefreshing(false);
    }
  };

  const calculateBalance = () => {
    return transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateTotalEarnings = () => {
    return transactions
      .filter(t => t.type === 'commission' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getPendingWithdrawal = () => {
    return Math.abs(transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0));
  };

  const copyReferralCode = () => {
    if (userProfile?.referralCode) {
      Alert.alert('کپی شد!', `کد معرف ${userProfile.referralCode} کپی شد.`);
    }
  };

  const shareReferralCode = () => {
    if (userProfile?.referralCode) {
      Alert.alert('اشتراک‌گذاری', `کد معرف شما: ${userProfile.referralCode}\nبا استفاده از این کد 10% تخفیف بگیرید!`);
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || !bankAccount) {
      Alert.alert('خطا', 'لطفاً مبلغ و شماره حساب را وارد کنید.');
      return;
    }

    const amount = parseInt(withdrawalAmount);
    const balance = calculateBalance();

    if (amount > balance) {
      Alert.alert('خطا', 'موجودی کافی نیست.');
      return;
    }

    if (amount < 100000) {
      Alert.alert('خطا', 'حداقل مبلغ برداشت 100,000 تومان است.');
      return;
    }

    try {
      await blink.db.walletTransactions.create({
        id: generateId(),
        userId: user.id,
        type: 'withdrawal',
        amount: -amount,
        description: 'درخواست برداشت به حساب بانکی',
        status: 'pending',
        bankAccount: bankAccount
      });

      Alert.alert('موفق!', 'درخواست برداشت شما ثبت شد و در حال بررسی است.');
      setWithdrawalAmount('');
      setBankAccount('');
      loadWalletData(user.id);
    } catch (error) {
      Alert.alert('خطا', 'خطا در ثبت درخواست برداشت');
    }
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Balance Card */}
      <LinearGradient colors={['#E53E3E', '#FF6B6B']} style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Wallet color="#FFFFFF" size={24} />
          <Text style={styles.balanceTitle}>موجودی کیف پول</Text>
        </View>
        <Text style={styles.balanceAmount}>{formatPrice(calculateBalance())}</Text>
        <View style={styles.balanceStats}>
          <View style={styles.balanceStat}>
            <Text style={styles.balanceStatValue}>{formatPrice(calculateTotalEarnings())}</Text>
            <Text style={styles.balanceStatLabel}>کل درآمد</Text>
          </View>
          <View style={styles.balanceStat}>
            <Text style={styles.balanceStatValue}>{referrals.length}</Text>
            <Text style={styles.balanceStatLabel}>تعداد معرفی</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Referral Code Card */}
      <View style={styles.referralCard}>
        <View style={styles.referralHeader}>
          <Gift color="#E53E3E" size={24} />
          <Text style={styles.referralTitle}>کد معرف شما</Text>
        </View>
        <View style={styles.referralCodeContainer}>
          <Text style={styles.referralCode}>{userProfile?.referralCode || 'در حال بارگذاری...'}</Text>
          <View style={styles.referralActions}>
            <TouchableOpacity style={styles.referralButton} onPress={copyReferralCode}>
              <Copy color="#E53E3E" size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.referralButton} onPress={shareReferralCode}>
              <Share2 color="#E53E3E" size={18} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.referralDescription}>
          دوستان شما با این کد 10% تخفیف می‌گیرند و شما 10% کمیسیون دریافت می‌کنید.
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <ArrowDownLeft color="#10B981" size={24} />
          <Text style={styles.quickActionText}>برداشت</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <TrendingUp color="#8B5CF6" size={24} />
          <Text style={styles.quickActionText}>گزارش درآمد</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Users color="#F59E0B" size={24} />
          <Text style={styles.quickActionText}>معرفی‌های من</Text>
        </TouchableOpacity>
      </View>

      {/* Withdrawal Form */}
      <View style={styles.withdrawalCard}>
        <Text style={styles.withdrawalTitle}>درخواست برداشت</Text>
        <TextInput
          style={styles.withdrawalInput}
          placeholder="مبلغ برداشت (تومان)"
          value={withdrawalAmount}
          onChangeText={setWithdrawalAmount}
          keyboardType="numeric"
          textAlign="right"
        />
        <TextInput
          style={styles.withdrawalInput}
          placeholder="شماره حساب شبا"
          value={bankAccount}
          onChangeText={setBankAccount}
          textAlign="right"
        />
        <TouchableOpacity style={styles.withdrawalButton} onPress={handleWithdrawal}>
          <Text style={styles.withdrawalButtonText}>ثبت درخواست</Text>
        </TouchableOpacity>
        {getPendingWithdrawal() > 0 && (
          <Text style={styles.pendingText}>
            برداشت در انتظار: {formatPrice(getPendingWithdrawal())}
          </Text>
        )}
      </View>
    </View>
  );

  const renderTransactions = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>تاریخچه تراکنش‌ها</Text>
      {transactions.map((transaction) => (
        <View key={transaction.id} style={styles.transactionItem}>
          <View style={styles.transactionIcon}>
            {transaction.type === 'commission' ? (
              <ArrowUpRight color="#10B981" size={20} />
            ) : (
              <ArrowDownLeft color="#EF4444" size={20} />
            )}
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionDescription}>{transaction.description}</Text>
            {transaction.relatedUserId && (
              <Text style={styles.transactionUser}>معرفی: کاربر {transaction.relatedUserId.slice(-6)}</Text>
            )}
            {transaction.bankAccount && (
              <Text style={styles.transactionUser}>حساب: {transaction.bankAccount}</Text>
            )}
            <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
          </View>
          <View style={styles.transactionAmount}>
            <Text style={[
              styles.transactionAmountText,
              { color: transaction.amount > 0 ? '#10B981' : '#EF4444' }
            ]}>
              {transaction.amount > 0 ? '+' : ''}{formatPrice(transaction.amount)}
            </Text>
            <View style={[
              styles.transactionStatus,
              { backgroundColor: transaction.status === 'completed' ? '#10B981' : '#F59E0B' }
            ]}>
              <Text style={styles.transactionStatusText}>
                {transaction.status === 'completed' ? 'تکمیل' : 'در انتظار'}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderReferrals = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>کاربران معرفی شده</Text>
      {referrals.length === 0 ? (
        <View style={styles.emptyState}>
          <Users color="#9CA3AF" size={48} />
          <Text style={styles.emptyStateText}>هنوز کسی را معرفی نکرده‌اید</Text>
          <Text style={styles.emptyStateSubtext}>کد معرف خود را با دوستان به اشتراک بگذارید</Text>
        </View>
      ) : (
        referrals.map((referral) => (
          <View key={referral.id} style={styles.referralUserItem}>
            <View style={styles.referralUserInfo}>
              <Text style={styles.referralUserName}>کاربر {referral.referredUserId.slice(-6)}</Text>
              <Text style={styles.referralUserDate}>عضویت: {formatDate(referral.createdAt)}</Text>
              <Text style={styles.referralUserPurchases}>
                کل خریدها: {formatPrice(referral.totalPurchases)}
              </Text>
            </View>
            <View style={styles.referralUserStatus}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: referral.status === 'active' ? '#10B981' : '#9CA3AF' }
              ]}>
                <Text style={styles.statusBadgeText}>
                  {referral.status === 'active' ? 'فعال' : 'غیرفعال'}
                </Text>
              </View>
              <Text style={styles.referralUserCommission}>
                کمیسیون: {formatPrice(referral.totalCommission)}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>کیف پول</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.tabButtonTextActive]}>
            کلی
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'transactions' && styles.tabButtonActive]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'transactions' && styles.tabButtonTextActive]}>
            تراکنش‌ها
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'referrals' && styles.tabButtonActive]}
          onPress={() => setActiveTab('referrals')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'referrals' && styles.tabButtonTextActive]}>
            معرفی‌ها
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
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'transactions' && renderTransactions()}
            {activeTab === 'referrals' && renderReferrals()}
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
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
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
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceStat: {
    alignItems: 'center',
  },
  balanceStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  balanceStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  referralCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  referralCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E53E3E',
  },
  referralActions: {
    flexDirection: 'row',
    gap: 8,
  },
  referralButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  referralDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  quickAction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  withdrawalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  withdrawalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right',
  },
  withdrawalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  withdrawalButton: {
    backgroundColor: '#E53E3E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  withdrawalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pendingText: {
    fontSize: 14,
    color: '#F59E0B',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right',
  },
  transactionItem: {
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
  transactionIcon: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
  },
  transactionUser: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  referralUserItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  referralUserInfo: {
    flex: 1,
  },
  referralUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  referralUserDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  referralUserPurchases: {
    fontSize: 12,
    color: '#374151',
    marginTop: 2,
    textAlign: 'right',
  },
  referralUserStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  referralUserCommission: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E53E3E',
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