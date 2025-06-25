import { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { API_URL } from '@/constants/api';

export default function AddProduct() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [frequency, setFrequency] = useState('');
  const router = useRouter();

  const handleSave = async () => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    await axios.post(`${API_URL}/product`, {
      name,
      type,
      frequency,
      startDate: new Date().toISOString().split('T')[0], // Default to today
      endDate: null
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Alert.alert('Saved', 'Product added');
    router.back();
  } catch (e) {
    console.error('Add Product Error:', e);
    Alert.alert('Error', 'Could not save');
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Type</Text>
      <TextInput style={styles.input} value={type} onChangeText={setType} />
      <Text style={styles.label}>Frequency</Text>
      <TextInput style={styles.input} value={frequency} onChangeText={setFrequency} />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  label: { fontWeight: '600', marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8 },
});
