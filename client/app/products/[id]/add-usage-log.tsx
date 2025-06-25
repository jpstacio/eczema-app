// app/products/[id]/add-usage-log.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/api';

export default function AddUsageLog() {
  const { id } = useLocalSearchParams();
  const [notes, setNotes] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post(`${API_URL}/product/${id}/log`, { notes }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Log added');
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Could not add log');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Usage Notes</Text>
      <TextInput
        style={styles.input}
        value={notes}
        onChangeText={setNotes}
        placeholder="Describe how it was used"
      />
      <Button title="Submit Log" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  label: { fontWeight: 'bold', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16,
  },
});
