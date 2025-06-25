import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/api';

type UsageLog = {
  id: number;
  dateUsed: string;
  notes: string;
};

export default function UsageLogsScreen() {
  const { id } = useLocalSearchParams();
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      try {
        const res = await axios.get(`${API_URL}/product/${id}/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usage Logs</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.date}>Date: {item.dateUsed}</Text>
            <Text>Notes: {item.notes}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No logs found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  item: {
    backgroundColor: '#eee',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  date: { fontWeight: 'bold' },
});
