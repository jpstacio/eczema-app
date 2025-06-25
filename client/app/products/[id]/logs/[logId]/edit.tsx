// app/products/[id]/logs/[logId]/edit.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/api';

export default function EditUsageLog() {
  const { id, logId } = useLocalSearchParams();
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [dateUsed, setDateUsed] = useState('');
  const [sideEffects, setSideEffects] = useState(''); 

  useEffect(() => {
    const fetchLog = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      try {
        const res = await axios.get(`${API_URL}/product/${id}/logs/${logId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(res.data.notes || '');
        setDateUsed(res.data.dateUsed?.slice(0, 10) || '');
        setSideEffects(res.data.sideEffects || ''); 
      } catch (err) {
        console.error('Failed to load log:', err);
      }
    };

    fetchLog();
  }, [logId]);

  const handleUpdate = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    try {
      await axios.put(`${API_URL}/product/${id}/logs/${logId}`, {
        notes,
        dateUsed,
        sideEffects, // ✅ Send to server
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Updated!', 'Usage log updated successfully.');
      router.replace(`/products/${id}`);
    } catch (err) {
      console.error('Failed to update log:', err);
      Alert.alert('Error', 'Could not update the log.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Usage Log</Text>

      <Text>Date Used (YYYY-MM-DD):</Text>
      <TextInput value={dateUsed} onChangeText={setDateUsed} style={styles.input} />

      <Text>Notes:</Text>
      <TextInput value={notes} onChangeText={setNotes} style={styles.input} multiline />

      <Text>Side Effects:</Text>
      <TextInput value={sideEffects} onChangeText={setSideEffects} style={styles.input} multiline />

      <Button title="Update Log" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 6,
  },
});
