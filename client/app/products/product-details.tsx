// app/products/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/api';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const response = await axios.get(`${API_URL}/product/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProduct(response.data);
      } catch (error) {
        console.error('Failed to load product:', error);
      }
    };

    fetchProduct();
  }, []);

  if (!product) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{product.name}</Text>
      <Text>Type: {product.type}</Text>
      <Text>Frequency: {product.frequency}</Text>
      <Text>Start: {product.startDate}</Text>
      <Text>Stop: {product.stopDate || 'Ongoing'}</Text>
      <Text>Notes: {product.notes || 'None'}</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Log Usage" onPress={() => router.push({ pathname: `/products/log-usage/${id}` } as any)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
