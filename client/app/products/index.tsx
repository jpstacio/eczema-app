// app/products/index.tsx
import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Button, ActivityIndicator
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/api';

type Product = {
  id: number;
  name: string;
  type: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
};

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${API_URL}/product`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Products</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push(`/products/${item.id}`)}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text>Type: {item.type}</Text>
            <Text>Frequency: {item.frequency}</Text>
            <Text>Start Date: {item.startDate}</Text>
            <Text>End Date: {item.endDate || 'Ongoing'}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No products yet.</Text>}
      />
      <Button title="Add Product" onPress={() => router.push('/products/add-product')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  type: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
