import React, { useEffect, useState, useCallback } from 'react';
import {View,Text,FlatList,StyleSheet,Image,ActivityIndicator,TextInput,Dimensions,RefreshControl,SafeAreaView, TouchableOpacity,} from 'react-native';
import axios from 'axios'; 
import { useSelector, useDispatch } from "react-redux";
import { selectProduct, toggleFavorite } from "../redux/productSlice";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Interface for product
interface Product {
  id: number;
  thumbnail: string;
  title: string;
  stock: number;
  price: number;
}

// Interface for API
interface ApiResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

// Skeleton loader component for loading state
const ProductSkeleton = () => {
  return (
    <View style={[styles.item, styles.skeletonItem]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonText} />
    </View>
  );
};

// Grid-style skeleton loader displaying multiple skeleton items
const SkeletonLoader = () => {
  // Create an array of 15 items (5 rows x 3 columns)
  return (
    <View style={styles.skeletonContainer}>
      {Array(15).fill(0).map((_, index) => (
        <ProductSkeleton key={`skeleton-${index}`} />
      ))}
    </View>
  );
};

type NavigationProp = NativeStackNavigationProp<any>;

export default function ProductsList({ navigation }: { navigation: NavigationProp }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hasMore, setHasMore] = useState<boolean>(true);
  const dispatch = useDispatch();
  const favorites = useSelector((state: { product: { favorites: number[] } }) => state.product.favorites);

  const handleSelectProduct = (product: Product) => {
  // Here Isave product in Redux
    dispatch(selectProduct(product));
    navigation.navigate('Details');
  };

  // Function to fetch products from API
  const fetchProducts = useCallback(async (pageNumber: number, isInitial = false) => {
    if ((!hasMore && !isInitial) || (loading && !isInitial && !refreshing)) return;

    isInitial ? setInitialLoading(true) : setLoading(true);

    try {
      // Simulate network delay for better skeleton view demonstration. This I will remove if it was productoin.
      await new Promise(resolve => setTimeout(resolve, 800));

      // Use Axios to fetch data
      const response = await axios.get<ApiResponse>(
        `https://dummyjson.com/products?limit=12&skip=${(pageNumber - 1) * 12}`
      );
      /*
        If pageNumber = 1, then skip = (1 - 1) * 12 = 0 (fetch first 12 products).
        If pageNumber = 2, then skip = (2 - 1) * 12 = 12 (fetch next 12 products).
        If pageNumber = 3, then skip = 24, and so on.
      */
      const data = response.data;

      // Check if we've reached the end of available products.
      if (data.products.length === 0) {
        // No more products available
        setHasMore(false);
      } else {
        //setProducts(prevProducts => isInitial || refreshing ? data.products : [...prevProducts, ...data.products]);
        setProducts(prevProducts => {
          if (isInitial || refreshing) {
            return data.products;
          } else {
            // Create a Set of existing IDs for quick lookup
            const existingIds = new Set(prevProducts.map(p => p.id));
            // Only add new products that don't already exist
            const newProducts = data.products.filter(product => !existingIds.has(product.id));
            return [...prevProducts, ...newProducts];
          }
        });

        // Only update filtered products if no search query is active
        if (!searchQuery) {
          //setFilteredProducts(prevProducts => isInitial || refreshing ? data.products : [...prevProducts, ...data.products]);
          setFilteredProducts(prevProducts => {
            if (isInitial || refreshing) {
              return data.products;
            } else {
              const existingIds = new Set(prevProducts.map(p => p.id));
              const newProducts = data.products.filter(product => !existingIds.has(product.id));
              return [...prevProducts, ...newProducts];
            }
          });
        } else {
          // If search is active, filter the new combined data
          // Apply search filtering
          const allProducts = isInitial || refreshing ? data.products : [...products, ...data.products];
          const filtered = allProducts.filter(product =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setFilteredProducts(filtered);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(true);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [products, searchQuery, hasMore, loading, refreshing]);

  // Initial data load
  useEffect(() => {
    fetchProducts(1, true);
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [fetchProducts]);

  // Load more data when scrolling reaches the bottom with the page increases.
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [loading, hasMore, refreshing, page, fetchProducts]);

  // Handle search filtering
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query) {
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [products]);

  // Render a single product item
  const renderItem = useCallback(({ item }: { item: Product }) => {
    // Check if this product is in favorites
    const isFavorite = favorites.includes(item.id);
    
    return (
      <TouchableOpacity onPress={() => handleSelectProduct(item)}>
        <View style={[styles.item, isFavorite ? styles.favoriteItem : null]}>
          {isFavorite && (
            <View style={styles.favoriteIndicator}>
              <Text>Favourite</Text>
            </View>
          )}
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.price}>${item.price}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [favorites]);
// Render footer loading indicator
  const renderFooter = useCallback(() => {
    if (!loading || initialLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#0066cc" />
        <Text style={styles.footerText}>Loading more products...</Text>
      </View>
    );
  }, [loading, initialLoading]);

  // Render empty state message
  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery ? "No products match your search" : "No products available"}
      </Text>
    </View>
  ), [searchQuery]);

  // If data is still loading initially, show a skeleton loader
  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={handleSearch}
            editable={false} // Disable search input while loading
          />
          {/* Show loading skeletons. Don't put this on the right of component because it causes the <Text> Error! */}
          <SkeletonLoader /> 
        </View>
      </SafeAreaView>
    );
  }

  // If there's an error fetching data, show an error message
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>
            Error loading products. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render the main product list when data is loaded and no error
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search input for filtering products */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {/* Display product list using FlatList */}
        {/* <TouchableOpacity onPress={() => handleSelectProduct(renderItem)}> */}
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            // numColumns={1}
            renderItem={renderItem} // Function to render each product item
            onEndReached={handleLoadMore} // Load more products when reaching end
            onEndReachedThreshold={0.2} // Trigger loading when 20% from end
            ListFooterComponent={renderFooter} // Show loading indicator at bottom
            ListEmptyComponent={renderEmpty} // Show message if no products found
            refreshControl={
              <RefreshControl
                refreshing={refreshing} // Show refresh indicator when pulling. A function that gets called when the user pulls down to refresh.
                onRefresh={handleRefresh}  // Reload data on refresh
                colors={['#0066cc']}
                tintColor="#0066cc"
                title="Pull to refresh..."
                titleColor="#666666"
              />
            }
            contentContainerStyle={filteredProducts.length === 0 ? styles.emptyList : null} // Center empty state
          />
        {/* </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
};

// Calculate item width based on screen size
const windowWidth = Dimensions.get('window').width;
const containerWidth = windowWidth * 0.9; // 90% of screen width for container
const itemWidth = (containerWidth - 40);
// const itemWidth = (containerWidth - 40) / 3; // 3 columns with spacing. This is for when I had 3 collumns next to each other.

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    width: containerWidth,
    alignSelf: 'center',
    paddingVertical: 10,
  },
  searchBar: {
    height: 36,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  // columnWrapper: {
  //   justifyContent: 'space-between',
  // },
  item: {
    width: itemWidth,
    marginBottom: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
    width: '100%',
  },
  price: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '600',
  },
  thumbnail: {
    width: itemWidth - 150,
    height: itemWidth - 150,
    borderRadius: 3,
    backgroundColor: '#f0f0f0',
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  footerText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonItem: {
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
  },
  skeletonImage: {
    width: itemWidth - 150,
    height: itemWidth - 150,
    borderRadius: 3,
    backgroundColor: '#e6e6e6',
  },
  skeletonTitle: {
    height: 12,
    width: '80%',
    borderRadius: 3,
    backgroundColor: '#e6e6e6',
    marginTop: 4,
    marginBottom: 2,
  },
  skeletonText: {
    height: 10,
    width: '50%',
    borderRadius: 3,
    backgroundColor: '#e6e6e6',
    marginBottom: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    padding: 5,
  },
  favoriteItem: {
    borderColor: 'green', 
    borderWidth: 2,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
  }
});

// export default ProductsList;



