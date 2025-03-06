import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { View, Text, StyleSheet, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Button } from 'react-native';
import { toggleFavorite } from "../redux/productSlice";

export default function ProductDetails() {
  const dispatch = useDispatch();
  const product = useSelector((state: RootState) => state.product.selectedProduct);
  const favorites = useSelector((state: RootState) => state.product.favorites);
  const isFavorite = product ? favorites.includes(product.id) : false;

  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState("");
  const [images, setImages] = useState(product?.images || []);

  const handleToggleFavorite = () => {
    if (product) {
      dispatch(toggleFavorite(product.id));
    }
  };

  // Skeleton
  const ProductDetailsSkeleton = () => {
    return (
      <View style={styles.container}>
        <View style={styles.productDetails}>
          <View style={[styles.imageContainer, styles.skeletonImage]} />
          
          <View style={[styles.skeletonTitle, styles.skeletonBase]} />
          
          <View style={[styles.skeletonDescription, styles.skeletonBase]} />
          <View style={[styles.skeletonDescription, styles.skeletonBase, {width: '80%'}]} />
          <View style={[styles.skeletonDescription, styles.skeletonBase, {width: '60%'}]} />
          
          <View style={[styles.skeletonStock, styles.skeletonBase]} />
          
          <View style={[styles.skeletonPrice, styles.skeletonBase]} />
          
          <View style={styles.skeletonButton} />
        </View>
      </View>
    );
  };
  
  function carousel() {
    if (images.length > 0) {
      // Here I check if the image URI is valid before setting it
      const imageUri = images[0];
      if (imageUri && imageUri.trim() !== "") {
        setImage(imageUri);
        setImages(images.slice(1));
      } else {
        // If image URI is invalid, skip to next
        setImages(images.slice(1));
      }
    }
  }

  function reloadImages() {
    if (!product || !product.images) return;
    
    const validImages = product.images.filter(img => img && img.trim() !== "");
    setImages(validImages);
    
    // Set loading to false if there are no valid images. This is for the skeleton.
    if (validImages.length === 0) {
      setLoading(false);
    }
  }

  useEffect(() => {
    // IF Product has only one image, no need for carousel.
    if (product && product.images && product.images.length === 1) {
      const singleImage = product.images[0];
      // Check if the single image is valid
      if (singleImage && singleImage.trim() !== "") {
        setImage(singleImage);
      }
      setLoading(false);
      return;
    }

    // If images array is empty, reload images
    if (images.length === 0 && product && product.images) {
      reloadImages();
      return;
    }

    // Start carousel for multiple images
    const interval = setInterval(carousel, 1500);
    
    // Set loading to false after a delay
    const timer = setTimeout(() => setLoading(false), 1500);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [product, images.length]);

  // Show skeleton if:
  // 1. Product doesn't exist
  // 2. Still loading and no images available
  // 3. Image source is null or empty
  const shouldShowSkeleton = !product || 
                             (loading && images.length === 0) || 
                             (!image && product?.images?.length > 0);

  if (shouldShowSkeleton) {
    return <ProductDetailsSkeleton />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.productDetails}>
        {product.images && product.images.length > 0 ? (
          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.productImage} />
            ) : (
              <View style={[styles.imageContainer, styles.skeletonImage]} />
            )}
          </View>
        ) : (
          <View style={[styles.imageContainer, styles.skeletonImage]} />
        )}

        <Text style={styles.productTitle}>{product.title}</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
        <Text style={styles.stock}>Stock: {product.stock}</Text>
        <Text style={styles.productPrice}>Price: ${product.price}</Text>
        <Button
          title={isFavorite ? "Remove from Favourites" : "Add to Favourites"}
          onPress={handleToggleFavorite}
          color={isFavorite ? "red" : "blue"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stock: {
    fontWeight: 'bold',
    fontSize: 22,
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {

  },
  image: {
    borderRadius: 10,
    height: 300,
  },
  // image: {
  //   width: '100%',
  //   height: 300,
  //   resizeMode: 'cover',
  // },
  container: {
    flex: 1, // Takes full height
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  productDetails: {
    padding: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '90%', // Better for responsiveness
    maxWidth: 400, // Ensuring it doesn't get too wide
    backgroundColor: '#fff',
    textAlign: 'center', // This won't work for Text components, use inside <Text>
  },
  productTitle: {
    fontSize: 32,
    color: '#333',
    marginBottom: 20,
  },
  productDescription: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  productPrice: {
    fontSize: 24,
    color: '#000',
    marginBottom: 30,
  },
  noProduct: {
    textAlign: 'center',
    color: '#999',
    fontSize: 18,
  },
   skeletonBase: {
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonImage: {
    backgroundColor: '#E1E9EE',
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
  skeletonTitle: {
    height: 32,
    width: '80%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  skeletonDescription: {
    height: 18,
    width: '100%',
    marginBottom: 10,
  },
  skeletonStock: {
    height: 22,
    width: '40%',
    marginBottom: 10,
  },
  skeletonPrice: {
    height: 24,
    width: '60%',
    marginBottom: 30,
  },
  skeletonButton: {
    height: 40,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    width: '100%',
  },
});

// export default ProductDetails;
