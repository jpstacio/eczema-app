import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import { useRouter } from 'expo-router';
import { formatDate, formatFrequency } from '@/utils/formatting';

type Product = {
  id: number;
  name: string;
  type: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
};

export default function HomeScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProfileAndProducts = async () => {
      try {
        const userId = await SecureStore.getItemAsync('userId');
        const token = await SecureStore.getItemAsync('userToken');
        if (!userId || !token) throw new Error('Missing auth info');

        const [profileRes, productRes] = await Promise.all([
          axios.get(`${API_URL}/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/product`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProfile(profileRes.data);
        setProducts(productRes.data);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndProducts();
  }, []);

  const handleDeleteProduct = async (productId: number) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.delete(`${API_URL}/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text>No profile data found.</Text>
        <Button title="Set Up Profile" onPress={() => router.push('/profile-setup')} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to your dashboard!</Text>

      <Text style={styles.sectionTitle}>Your Profile</Text>
      <Text><Text style={styles.label}>Skin Type:</Text> {profile.skinType}</Text>
      <Text><Text style={styles.label}>Allergies:</Text> {profile.allergies || 'None'}</Text>
      <Text><Text style={styles.label}>Date of Birth:</Text> {formatDate(profile.dob)}</Text>
      <Text><Text style={styles.label}>Gender/Sex:</Text> {profile.gender}</Text>
      <Text><Text style={styles.label}>Skin Conditions:</Text> {profile.conditions || 'None'}</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Edit Profile" onPress={() => router.push('/edit-profile')} />
      </View>

      <Text style={styles.sectionTitle}>Your Products</Text>
      {products.length === 0 ? (
        <Text>No products yet.</Text>
      ) : (
        products.map((item) => (
          <View key={item.id} style={styles.productItem}>
            <Text style={styles.productTitle}>{item.name}</Text>
            <Text>Type: {item.type}</Text>
            <Text>Frequency: {formatFrequency(item.frequency)}</Text>
            <Text>Start: {formatDate(item.startDate)}</Text>
            <Text>Stop: {item.endDate ? formatDate(item.endDate) : 'Ongoing'}</Text>
            {item.notes && <Text>Notes: {item.notes}</Text>}

            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <Button title="Edit" onPress={() => router.push(`/products/${item.id}/edit`)} />
              <View style={{ width: 10 }} />
              <Button
                title="Delete"
                color="red"
                onPress={() => handleDeleteProduct(item.id)}
              />
            </View>
          </View>
        ))
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Add Product" onPress={() => router.push('/products/add-product')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#f3f3f3',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  label: {
    fontWeight: '600',
  },
  productItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
