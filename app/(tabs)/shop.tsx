import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, ShoppingCart, Heart, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

// Mock data for products
const categories = [
  { id: 1, name: 'همه', icon: '🏪' },
  { id: 2, name: 'کوهنوردی', icon: '🏔️' },
  { id: 3, name: 'شنا', icon: '🏊' },
  { id: 4, name: 'دویدن', icon: '🏃' },
  { id: 5, name: 'لوازم جانبی', icon: '🎒' },
];

const products = [
  {
    id: 1,
    name: 'کوله پشتی کوهنوردی',
    price: 2500000,
    originalPrice: 3000000,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    rating: 4.8,
    reviews: 124,
    tag: 'جدید',
    category: 'کوهنوردی',
    inStock: true,
  },
  {
    id: 2,
    name: 'کفش دویدن نایک',
    price: 4200000,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    rating: 4.9,
    reviews: 89,
    tag: 'پرفروش',
    category: 'دویدن',
    inStock: true,
  },
  {
    id: 3,
    name: 'عینک شنا اسپیدو',
    price: 850000,
    originalPrice: 1000000,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
    rating: 4.6,
    reviews: 67,
    tag: 'وارداتی از دکاتلون',
    category: 'شنا',
    inStock: false,
  },
  {
    id: 4,
    name: 'ساعت ورزشی گارمین',
    price: 8500000,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    rating: 4.7,
    reviews: 156,
    tag: 'جدید',
    category: 'لوازم جانبی',
    inStock: true,
  },
  {
    id: 5,
    name: 'تیشرت ورزشی آدیداس',
    price: 1200000,
    originalPrice: 1500000,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    rating: 4.5,
    reviews: 203,
    tag: 'پرفروش',
    category: 'دویدن',
    inStock: true,
  },
  {
    id: 6,
    name: 'چادر کوهنوردی',
    price: 3800000,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400',
    rating: 4.8,
    reviews: 92,
    tag: 'وارداتی از دکاتلون',
    category: 'کوهنوردی',
    inStock: true,
  },
];

export default function ShopScreen() {
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'جدید':
        return '#10B981';
      case 'پرفروش':
        return '#F59E0B';
      case 'وارداتی از دکاتلون':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 1 || product.category === categories.find(c => c.id === selectedCategory)?.name;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleCart = (productId: number) => {
    setCartItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleWishlist = (productId: number) => {
    setWishlistItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#E53E3E', '#FF6B6B']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>فروشگاه وستامود</Text>
            <TouchableOpacity style={styles.cartButton}>
              <ShoppingCart color="#FFFFFF" size={24} />
              {cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search color="#9CA3AF" size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="جستجو در محصولات..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                textAlign="right"
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Filter color="#E53E3E" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.categoryItemActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>محصولات ({filteredProducts.length})</Text>
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productImageContainer}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <TouchableOpacity
                    style={styles.wishlistButton}
                    onPress={() => toggleWishlist(product.id)}
                  >
                    <Heart
                      color={wishlistItems.includes(product.id) ? "#E53E3E" : "#9CA3AF"}
                      size={18}
                      fill={wishlistItems.includes(product.id) ? "#E53E3E" : "transparent"}
                    />
                  </TouchableOpacity>
                  <View style={[styles.productTag, { backgroundColor: getTagColor(product.tag) }]}>
                    <Text style={styles.productTagText}>{product.tag}</Text>
                  </View>
                </View>
                
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  
                  <View style={styles.ratingContainer}>
                    <Star color="#F59E0B" size={14} fill="#F59E0B" />
                    <Text style={styles.ratingText}>{product.rating}</Text>
                    <Text style={styles.reviewsText}>({product.reviews})</Text>
                  </View>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{formatPrice(product.price)}</Text>
                    {product.originalPrice && (
                      <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.addToCartButton,
                      !product.inStock && styles.addToCartButtonDisabled,
                      cartItems.includes(product.id) && styles.addToCartButtonAdded
                    ]}
                    onPress={() => toggleCart(product.id)}
                    disabled={!product.inStock}
                  >
                    <Text style={[
                      styles.addToCartText,
                      cartItems.includes(product.id) && styles.addToCartTextAdded
                    ]}>
                      {!product.inStock 
                        ? 'ناموجود' 
                        : cartItems.includes(product.id) 
                          ? 'در سبد خرید' 
                          : 'افزودن به سبد'
                      }
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E53E3E',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    paddingVertical: 20,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryItemActive: {
    backgroundColor: '#E53E3E',
    borderColor: '#E53E3E',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  productsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 6,
  },
  productTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'right',
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53E3E',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  addToCartButton: {
    backgroundColor: '#E53E3E',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addToCartButtonAdded: {
    backgroundColor: '#10B981',
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addToCartTextAdded: {
    color: '#FFFFFF',
  },
});