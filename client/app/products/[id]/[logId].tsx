// app/products/[id]/[logId].tsx
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/api';

export default function UsageLogDetailScreen() {
  const { logId } = useLocalSearchParams();
  const [log, setLog] = useState<any>(null);

  useEffect(() => {
    const fetchLog = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      try {
        const res = await axios.get(`${API_URL}/log/${logId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLog(res.data);
      } catch (err) {
        console.error('Failed to fetch usage log:', err);
      }
    };

    fetchLog();
  }, [logId]);

  if (!log) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Usage Log Details</Text>
      <Text>Date Used: {log.dateUsed?.slice(0, 10)}</Text>
      <Text>Notes: {log.notes}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
});
