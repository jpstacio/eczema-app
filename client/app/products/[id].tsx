import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/api';
import { formatDate, formatFrequency } from '@/utils/formatting';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');

      const [productRes, logRes] = await Promise.all([
        axios.get(`${API_URL}/product/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/product/${id}/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProduct(productRes.data);
      setLogs(logRes.data);
    } catch (error) {
      console.error('Failed to load product or logs:', error);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (!product) return <Text>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{product.name}</Text>
      <Text>Type: {product.type}</Text>
      <Text>Frequency: {formatFrequency(product.frequency)}</Text>
      <Text>Start: {formatDate(product.startDate)}</Text>
      <Text>Stop: {product.stopDate ? formatDate(product.stopDate) : 'Ongoing'}</Text>
      <Text>Notes: {product.notes || 'None'}</Text>

      <View style={{ marginVertical: 20 }}>
        <Button title="Add Usage Log" onPress={() => router.push(`/products/${id}/add-usage-log`)} />
      </View>

      <Text style={styles.subheading}>Usage Logs</Text>
      {logs.length === 0 ? (
        <Text>No logs yet.</Text>
      ) : (
        logs.map((log) => (
          <TouchableOpacity
            key={log.id}
            style={styles.logItem}
            onPress={() => router.push(`/products/${id}/logs/${log.id}`)}
          >
            <Text>{formatDate(log.dateUsed)} – {log.notes || 'No notes'}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  subheading: { fontSize: 20, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
  logItem: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 8 },
});
