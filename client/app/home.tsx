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
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const today = new Date().toISOString().split('T')[0];

export default function HomeScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [todaysDietLog, setTodaysDietLog] = useState<DietLog | null | undefined>(null);
  const [pastDietLogs, setPastDietLogs] = useState<DietLog[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const userId = await SecureStore.getItemAsync('userId');
          const token = await SecureStore.getItemAsync('userToken');
          if (!userId || !token) throw new Error('Missing auth info');

          const [profileRes, productRes, dietRes] = await Promise.all([
            axios.get(`${API_URL}/profile/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/product`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/diet-log`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          setProfile(profileRes.data);
          setProducts(productRes.data);
          setDietLogs(dietRes.data);

            const todays: DietLog | undefined = dietRes.data.find((log: DietLog) => log.date === today);
            const past: DietLog[] = dietRes.data.filter((log: DietLog) => log.date !== today);
          setTodaysDietLog(todays);
          setPastDietLogs(past);
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

  interface Product {
    id: string;
    name: string;
    type: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    notes?: string;
  }

  interface DietLog {
    id: string;
    date: string;
    meals?: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
    };
    snacks?: string;
    waterIntake?: number;
  }

  const handleDeleteProduct = async (productId: string): Promise<void> => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.delete(`${API_URL}/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev: Product[]) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  interface DeleteDietLogParams {
    logId: string;
  }

  const handleDeleteDietLog = async (logId: DeleteDietLogParams['logId']): Promise<void> => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.delete(`${API_URL}/diet-log/${logId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDietLogs((prev: DietLog[]) => prev.filter((l: DietLog) => l.id !== logId));
    } catch (error) {
      console.error('Error deleting diet log:', error);
      Alert.alert('Error', 'Failed to delete diet log');
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

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Products</Text>
        {products.length === 0 ? (
          <Text>No products yet.</Text>
        ) : (
          products.map((item) => (
            <View key={item.id} style={styles.entryBox}>
              <Text style={styles.entryTitle}>{item.name}</Text>
              <Text>Type: {item.type}</Text>
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
        )}
        <View style={{ marginTop: 12 }}>
          <Button title="Add Product" onPress={() => router.push('/products/add-product')} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.rowSpaceBetween}>
          <Text style={styles.sectionTitle}>Todays Food Log</Text>
          {!todaysDietLog && <Button title="Log Diet" onPress={() => router.push('/lifestyle/add-diet-log')} />}
        </View>

        {todaysDietLog ? (
          <View style={styles.entryBox}>
            <Text style={styles.entryTitle}>{formatDate(todaysDietLog.date)}</Text>
            <Text>Breakfast: {todaysDietLog.meals?.breakfast || '—'}</Text>
            <Text>Lunch: {todaysDietLog.meals?.lunch || '—'}</Text>
            <Text>Dinner: {todaysDietLog.meals?.dinner || '—'}</Text>
            <Text>Snacks: {todaysDietLog.snacks || '—'}</Text>
            <Text>Water Intake: {todaysDietLog.waterIntake} mL</Text>
            <View style={styles.rowButtons}>
              <Button title="Edit" onPress={() => router.push(`/lifestyle/edit-diet-log/${todaysDietLog.id}`)} />
              <View style={{ width: 10 }} />
              <Button title="Delete" color="red" onPress={() => handleDeleteDietLog(todaysDietLog.id)} />
            </View>
          </View>
        ) : (
          <Text style={{ marginTop: 8 }}>No log yet for today.</Text>
        )}

        <Text style={styles.sectionTitle}>Past Logs</Text>
        {pastDietLogs.length === 0 ? (
          <Text>No past logs available.</Text>
        ) : (
          pastDietLogs.map((log) => (
            <View key={log.id} style={styles.entryBox}>
              <Text style={styles.entryTitle}>{formatDate(log.date)}</Text>
              <Text>Breakfast: {log.meals?.breakfast || '—'}</Text>
              <Text>Lunch: {log.meals?.lunch || '—'}</Text>
              <Text>Dinner: {log.meals?.dinner || '—'}</Text>
              <Text>Snacks: {log.snacks || '—'}</Text>
              <Text>Water Intake: {log.waterIntake} mL</Text>
              <View style={styles.rowButtons}>
                <Button title="Edit" onPress={() => router.push(`/lifestyle/edit-diet-log/${log.id}`)} />
                <View style={{ width: 10 }} />
                <Button title="Delete" color="red" onPress={() => handleDeleteDietLog(log.id)} />
              </View>
            </View>
          ))
        )}
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
});
