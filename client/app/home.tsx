import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Button,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import { useRouter } from 'expo-router';
import { formatDate, formatFrequency } from '@/utils/formatting';
import { useFocusEffect } from '@react-navigation/native';

// --------------- Type definitions ---------------

type Product = {
  id: number;
  name: string;
  type: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  notes?: string;
};

type DietLog = {
  id: number;
  date: string;
  meals: { breakfast?: string; lunch?: string; dinner?: string };
  snacks?: string;
  waterIntake?: number;
};

type WellBeingLog = {
  id: number;
  date: string;
  mood: string;
  stressLevel: string;
  sleepHours: number;
};

// ------------------------------------------------

export default function HomeScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [wellbeingLogs, setWellbeingLogs] = useState<WellBeingLog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ---------- Fetch data when screen is focused ----------
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const userId = await SecureStore.getItemAsync('userId');
          const token = await SecureStore.getItemAsync('userToken');
          if (!userId || !token) throw new Error('Missing auth info');

          const [profileRes, productRes, dietRes, wellbeingRes] = await Promise.all([
            axios.get(`${API_URL}/profile/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/product`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/diet-log`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/wellbeing-log`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          setProfile(profileRes.data);
          setProducts(productRes.data);
          setDietLogs(dietRes.data);
          setWellbeingLogs(wellbeingRes.data);
        } catch (err) {
          console.error('Error loading data:', err);
          Alert.alert('Error', 'Failed to load profile or logs.');
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [])
  );

  // ---------- Handlers ----------

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

  const handleDeleteDietLog = async (logId: number) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.delete(`${API_URL}/diet-log/${logId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDietLogs((prev) => prev.filter((l) => l.id !== logId));
    } catch (error) {
      console.error('Error deleting diet log:', error);
      Alert.alert('Error', 'Failed to delete diet log');
    }
  };

  // ---------- Derived data ----------

  const categorizedProducts = products.reduce((acc: Record<string, Product[]>, product) => {
    if (!acc[product.type]) acc[product.type] = [];
    acc[product.type].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // ---------- Loading & empty states ----------

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

  // ---------- UI Sections (Header component for FlatList) ----------

  const Header = () => (
    <View>
      <Text style={styles.title}>Welcome to your dashboard!</Text>

      {/* ---- Profile ---- */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Profile</Text>
        <Text><Text style={styles.label}>Skin Type:</Text> {profile.skinType}</Text>
        <Text><Text style={styles.label}>Allergies:</Text> {profile.allergies || 'None'}</Text>
        <Text><Text style={styles.label}>Date of Birth:</Text> {formatDate(profile.dob)}</Text>
        <Text><Text style={styles.label}>Gender/Sex:</Text> {profile.gender}</Text>
        <Text><Text style={styles.label}>Skin Conditions:</Text> {profile.conditions || 'None'}</Text>
        <View style={{ marginTop: 12 }}>
          <Button title="Edit Profile" onPress={() => router.push('/edit-profile')} />
        </View>
      </View>

      {/* ---- Products ---- */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Products</Text>
        <View style={styles.categoryButtonRow}>
          {Object.keys(categorizedProducts).map((category) => (
            <Button
              key={category}
              title={category}
              color={selectedCategory === category ? '#2a9d8f' : '#ccc'}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </View>
        {selectedCategory ? (
          categorizedProducts[selectedCategory].map((item) => (
            <View key={item.id} style={styles.entryBox}>
              <Text style={styles.entryTitle}>{item.name}</Text>
              <Text>Frequency: {formatFrequency(item.frequency)}</Text>
              <Text>Start: {formatDate(item.startDate)}</Text>
              <Text>Stop: {item.endDate ? formatDate(item.endDate) : 'Ongoing'}</Text>
              {item.notes && <Text>Notes: {item.notes}</Text>}
              <View style={styles.rowButtons}>
                <Button title="Edit" onPress={() => router.push(`/products/${item.id}/edit`)} />
                <View style={{ width: 10 }} />
                <Button title="Delete" color="red" onPress={() => handleDeleteProduct(item.id)} />
              </View>
            </View>
          ))
        ) : (
          <Text style={{ marginTop: 8 }}>Select a category to view your products.</Text>
        )}
        <View style={{ marginTop: 12 }}>
          <Button title="Add Product" onPress={() => router.push('/products/add-product')} />
        </View>
      </View>

      {/* ---- Diet Logs ---- */}
      <View style={styles.card}>
        <View style={styles.rowSpaceBetween}>
          <Text style={styles.sectionTitle}>Food Tracker</Text>
          <Button title="Track Diet" onPress={() => router.push('/lifestyle/add-diet-log')} />
        </View>
        {dietLogs.length === 0 ? (
          <Text style={{ marginTop: 10 }}>No diet logs yet.</Text>
        ) : (
          dietLogs.map((log) => (
            <View key={log.id} style={styles.entryBox}>
              <Text style={styles.entryTitle}>{formatDate(log.date)}</Text>
              {log.meals.breakfast && <Text>Breakfast: {log.meals.breakfast}</Text>}
              {log.meals.lunch && <Text>Lunch: {log.meals.lunch}</Text>}
              {log.meals.dinner && <Text>Dinner: {log.meals.dinner}</Text>}
              {log.snacks && <Text>Snacks: {log.snacks}</Text>}
              {log.waterIntake != null && <Text>Water Intake: {log.waterIntake} mL</Text>}
              <View style={styles.rowButtons}>
                <Button title="Edit" onPress={() => router.push(`/lifestyle/edit-diet-log/${log.id}`)} />
                <View style={{ width: 10 }} />
                <Button title="Delete" color="red" onPress={() => handleDeleteDietLog(log.id)} />
              </View>
            </View>
          ))
        )}
      </View>

      {/* ---- Well‑being Logs ---- */}
      <View style={styles.card}>
        <View style={styles.rowSpaceBetween}>
          <Text style={styles.sectionTitle}>Well-being Tracker</Text>
          <Button title="Add" onPress={() => router.push('/lifestyle/add-wellbeing-log')} />
        </View>
        {wellbeingLogs.length === 0 ? (
          <Text style={{ marginTop: 10 }}>No well-being logs yet.</Text>
        ) : (
          wellbeingLogs.map((log) => (
            <View key={log.id} style={styles.entryBox}>
              <Text style={styles.entryTitle}>{formatDate(log.date)}</Text>
              <Text>Mood: {log.mood}</Text>
              <Text>Stress: {log.stressLevel}</Text>
              <Text>Sleep: {log.sleepHours}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );

// ---------- FlatList renders nothing – all UI is in the header ----------

  return (
    <FlatList
      data={[]} // empty data – we only use header
      keyExtractor={() => 'header'}
      renderItem={null}
      ListHeaderComponent={<Header />}
      contentContainerStyle={styles.container}
    />
  );
}

// --------------- Styles ---------------

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
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  entryBox: {
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rowButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
});
