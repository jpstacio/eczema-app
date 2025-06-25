import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/api';

export default function UsageLogDetailScreen() {
  const { id: productId, logId } = useLocalSearchParams();
  const [log, setLog] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLog = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      try {
        const res = await axios.get(`${API_URL}/product/${productId}/logs/${logId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLog(res.data);
      } catch (err) {
        console.error('Failed to fetch usage log:', err);
      }
    };

    fetchLog();
  }, [productId, logId]);

  if (!log) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Usage Log Details</Text>
      <Text>Date Used: {log.dateUsed?.slice(0, 10)}</Text>
      <Text>Notes: {log.notes || 'No notes provided.'}</Text>
      <Text>Side Effects: {log.sideEffects || 'None reported.'}</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Back to Product" onPress={() => router.back()} />
        <Button title="Edit Log" onPress={() => router.push(`/products/${productId}/logs/${logId}/edit`)} />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
});
