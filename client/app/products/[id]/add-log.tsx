import { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '@/constants/api';

export default function AddLogScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [notes, setNotes] = useState('');

  const handleAddLog = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    try {
      await axios.post(`${API_URL}/product/${id}/log`, {
        notes,
        dateUsed: new Date(), // or allow user to pick date
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Log added');
      router.back();
    } catch (err) {
      console.error('Error adding log:', err);
      Alert.alert('Error', 'Could not add log');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Notes</Text>
      <TextInput
        multiline
        numberOfLines={4}
        value={notes}
        onChangeText={setNotes}
        style={styles.input}
      />
      <Button title="Add Log" onPress={handleAddLog} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { marginBottom: 8, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 16,
    borderRadius: 8,
    textAlignVertical: 'top',
  },
});
