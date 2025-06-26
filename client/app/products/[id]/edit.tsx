import { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/api';
import { Picker } from '@react-native-picker/picker';

export default function EditProduct() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [stopDate, setStopDate] = useState('');

  const typeOptions = ['Cream', 'Ointment', 'Oral Medication', 'Cleanser', 'Other'];
  const frequencyOptions = ['Once Daily', 'Twice Daily', 'As Needed', 'Weekly', 'Other'];

  useEffect(() => {
    const fetchProduct = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      try {
        const res = await axios.get(`${API_URL}/product/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const product = res.data;
        setName(product.name);
        setType(product.type);
        setFrequency(product.frequency);
        setStartDate(product.startDate || '');
        setStopDate(product.stopDate || '');
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch product');
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    try {
      await axios.put(`${API_URL}/product/${id}`, {
        name,
        type,
        frequency,
        startDate: startDate || null,
        stopDate: stopDate || null,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Success', 'Product updated');
      router.push(`/products/${id}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update product');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Product</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Type</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={type} onValueChange={setType}>
          {typeOptions.map((option) => (
            <Picker.Item label={option} value={option} key={option} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Frequency</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={frequency} onValueChange={setFrequency}>
          {frequencyOptions.map((option) => (
            <Picker.Item label={option} value={option} key={option} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
      <TextInput value={startDate} onChangeText={setStartDate} style={styles.input} />

      <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
      <TextInput value={stopDate} onChangeText={setStopDate} style={styles.input} />

      <Button title="Update Product" onPress={handleUpdate} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
});
