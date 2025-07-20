import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Settings, 
  ShoppingBag, 
  Bell, 
  Shield, 
  Globe, 
  LogOut,
  Crown,
  Star,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Edit,
  ChevronRight,
  Award,
  TrendingUp
} from 'lucide-react-native';

// Mock user data
const userData = {
  name: 'علی احمدی',
  email: 'ali.ahmadi@example.com',
  phone: '09123456789',
  joinDate: '1403/05/15',
  isAmbassador: true,
  level: 12,
  totalOrders: 15,
  totalSpent: 12500000,
  favoriteActivity: 'کوهنوردی',
  location: 'تهران، ایران',
  avatar: '👤',
};

const orderHistory = [
  {
    id: 1,
    orderNumber: 'VES-2024-001',
    date: '1403/10/15',
    total: 2500000,
    status: 'تحویل شده',
    items: 3,
  },
  {
    id: 2,
    orderNumber: 'VES-2024-002',
    date: '1403/10/10',
    total: 1800000,
    status: 'در حال ارسال',
    items: 2,
  },
  {
    id: 3,
    orderNumber: 'VES-2024-003',
    date: '1403/10/05',
    total: 850000,
    status: 'تحویل شده',
    items: 1,
  },
];

const achievements = [
  { id: 1, title: 'خریدار VIP', description: 'بیش از 10 میلیون تومان خرید', icon: '💎' },
  { id: 2, title: 'معرف طلایی', description: '20 نفر معرفی کرده', icon: '👑' },
  { id: 3, title: 'ورزشکار فعال', description: '100 فعالیت ثبت شده', icon: '🏃' },
];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'تحویل شده': return '#10B981';
      case 'در حال ارسال': return '#F59E0B';
      case 'لغو شده': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'خروج از حساب',
      'آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟',
      [
        { text: 'لغو', style: 'cancel' },
        { text: 'خروج', style: 'destructive', onPress: () => Alert.alert('خروج', 'شما از حساب خود خارج شدید.') },
      ]
    );
  };

  const renderProfile = () => (
    <View style={styles.tabContent}>
      {/* User Info Card */}
      <LinearGradient colors={['#E53E3E', '#FF6B6B']} style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{userData.avatar}</Text>
            {userData.isAmbassador && (
              <View style={styles.ambassadorBadge}>
                <Crown color="#F59E0B" size={16} />
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Edit color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.userEmail}>{userData.email}</Text>
        
        {userData.isAmbassador && (
          <View style={styles.ambassadorTag}>
            <Crown color="#F59E0B" size={16} />
            <Text style={styles.ambassadorText}>سفیر وستامود</Text>
          </View>
        )}

        <View style={styles.userStats}>
          <View style={styles.userStat}>
            <Text style={styles.userStatValue}>سطح {userData.level}</Text>
            <Text style={styles.userStatLabel}>رتبه</Text>
          </View>
          <View style={styles.userStat}>
            <Text style={styles.userStatValue}>{userData.totalOrders}</Text>
            <Text style={styles.userStatLabel}>سفارش</Text>
          </View>
          <View style={styles.userStat}>
            <Text style={styles.userStatValue}>{(userData.totalSpent / 1000000).toFixed(1)}M</Text>
            <Text style={styles.userStatLabel}>خرید (تومان)</Text>
          </View>
        </View>
      </LinearGradient>

      {/* User Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>اطلاعات شخصی</Text>
        
        <View style={styles.detailItem}>
          <View style={styles.detailIcon}>
            <Phone color="#6B7280" size={20} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>شماره تماس</Text>
            <Text style={styles.detailValue}>{userData.phone}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIcon}>
            <Mail color="#6B7280" size={20} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>ایمیل</Text>
            <Text style={styles.detailValue}>{userData.email}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIcon}>
            <MapPin color="#6B7280" size={20} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>موقعیت</Text>
            <Text style={styles.detailValue}>{userData.location}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIcon}>
            <Calendar color="#6B7280" size={20} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>تاریخ عضویت</Text>
            <Text style={styles.detailValue}>{userData.joinDate}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIcon}>
            <TrendingUp color="#6B7280" size={20} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>فعالیت مورد علاقه</Text>
            <Text style={styles.detailValue}>{userData.favoriteActivity}</Text>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.achievementsCard}>
        <Text style={styles.achievementsTitle}>دستاوردها</Text>
        <View style={styles.achievementsList}>
          {achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
              <Star color="#F59E0B" size={20} fill="#F59E0B" />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderOrders = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>تاریخچه سفارشات</Text>
      {orderHistory.map((order) => (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>سفارش #{order.orderNumber}</Text>
              <Text style={styles.orderDate}>{order.date}</Text>
            </View>
            <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.orderStatusText}>{order.status}</Text>
            </View>
          </View>
          
          <View style={styles.orderDetails}>
            <View style={styles.orderDetail}>
              <Text style={styles.orderDetailLabel}>مبلغ کل:</Text>
              <Text style={styles.orderDetailValue}>{formatPrice(order.total)}</Text>
            </View>
            <View style={styles.orderDetail}>
              <Text style={styles.orderDetailLabel}>تعداد اقلام:</Text>
              <Text style={styles.orderDetailValue}>{order.items} عدد</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.orderViewButton}>
            <Text style={styles.orderViewButtonText}>مشاهده جزئیات</Text>
            <ChevronRight color="#E53E3E" size={16} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderSettings = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>تنظیمات</Text>
      
      {/* Notifications */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>اعلان‌ها</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Bell color="#6B7280" size={20} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>اعلان‌های پوش</Text>
              <Text style={styles.settingDescription}>دریافت اعلان‌های مهم</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E5E7EB', true: '#E53E3E' }}
            thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      {/* Privacy */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>حریم خصوصی</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MapPin color="#6B7280" size={20} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>دسترسی به موقعیت</Text>
              <Text style={styles.settingDescription}>برای ردیابی فعالیت‌ها</Text>
            </View>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: '#E5E7EB', true: '#E53E3E' }}
            thumbColor={locationEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Shield color="#6B7280" size={20} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>حریم خصوصی</Text>
              <Text style={styles.settingDescription}>مدیریت داده‌های شخصی</Text>
            </View>
          </View>
          <ChevronRight color="#9CA3AF" size={20} />
        </TouchableOpacity>
      </View>

      {/* General */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>عمومی</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Globe color="#6B7280" size={20} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>زبان</Text>
              <Text style={styles.settingDescription}>فارسی</Text>
            </View>
          </View>
          <ChevronRight color="#9CA3AF" size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <CreditCard color="#6B7280" size={20} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>روش‌های پرداخت</Text>
              <Text style={styles.settingDescription}>مدیریت کارت‌ها</Text>
            </View>
          </View>
          <ChevronRight color="#9CA3AF" size={20} />
        </TouchableOpacity>
      </View>

      {/* Account */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>حساب کاربری</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <View style={styles.settingInfo}>
            <LogOut color="#EF4444" size={20} />
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: '#EF4444' }]}>خروج از حساب</Text>
              <Text style={styles.settingDescription}>خروج از حساب کاربری</Text>
            </View>
          </View>
          <ChevronRight color="#EF4444" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>پروفایل</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
          onPress={() => setActiveTab('profile')}
        >
          <User color={activeTab === 'profile' ? '#FFFFFF' : '#6B7280'} size={20} />
          <Text style={[styles.tabButtonText, activeTab === 'profile' && styles.tabButtonTextActive]}>
            پروفایل
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'orders' && styles.tabButtonActive]}
          onPress={() => setActiveTab('orders')}
        >
          <ShoppingBag color={activeTab === 'orders' ? '#FFFFFF' : '#6B7280'} size={20} />
          <Text style={[styles.tabButtonText, activeTab === 'orders' && styles.tabButtonTextActive]}>
            سفارشات
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'settings' && styles.tabButtonActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Settings color={activeTab === 'settings' ? '#FFFFFF' : '#6B7280'} size={20} />
          <Text style={[styles.tabButtonText, activeTab === 'settings' && styles.tabButtonTextActive]}>
            تنظیمات
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'settings' && renderSettings()}
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
  userCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    width: 80,
    height: 80,
    textAlign: 'center',
    lineHeight: 80,
  },
  ambassadorBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  ambassadorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
    gap: 6,
  },
  ambassadorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
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
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailIcon: {
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
    textAlign: 'right',
  },
  achievementsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right',
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right',
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
  },
  orderStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  orderDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  orderDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  orderViewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E53E3E',
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'right',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingContent: {
    marginRight: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
  },
});