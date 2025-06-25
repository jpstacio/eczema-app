// app/products/log-usage/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '@/constants/api';

export default function LogUsageScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post(`${API_URL}/products/log/${id}`, { notes }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Usage logged!');
      router.back();
    } catch (error) {
      console.error('Log error:', error);
      Alert.alert('Error', 'Failed to log usage.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Log Product Usage</Text>
      <TextInput
        style={styles.input}
        placeholder="Notes, side effects..."
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Button title="Submit Log" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    padding: 12,
  },
});
