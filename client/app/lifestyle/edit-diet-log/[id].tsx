import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '@/constants/api';

export default function EditDietLog() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [date, setDate] = useState('');
  const [meals, setMeals] = useState({ breakfast: '', lunch: '', dinner: '' });
  const [snacks, setSnacks] = useState('');
  const [waterIntake, setWaterIntake] = useState('');

  useEffect(() => {
    const fetchLog = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      try {
        const res = await axios.get(`${API_URL}/diet-log`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const log = res.data.find((entry: any) => entry.id.toString() === id);
        if (log) {
          setDate(log.date);
          setMeals(log.meals || { breakfast: '', lunch: '', dinner: '' });
          setSnacks(log.snacks || '');
          setWaterIntake(log.waterIntake?.toString() || '');
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load diet log');
      }
    };

    fetchLog();
  }, [id]);

  const handleUpdate = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    try {
      await axios.put(
        `${API_URL}/diet-log/${id}`,
        {
          date,
          meals,
          snacks,
          waterIntake: parseInt(waterIntake),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Success', 'Diet log updated');
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update log');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Diet Log</Text>

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput value={date} onChangeText={setDate} style={styles.input} />

      <Text style={styles.label}>Breakfast</Text>
      <TextInput
        value={meals.breakfast}
        onChangeText={(text) => setMeals({ ...meals, breakfast: text })}
        style={styles.input}
      />

      <Text style={styles.label}>Lunch</Text>
      <TextInput
        value={meals.lunch}
        onChangeText={(text) => setMeals({ ...meals, lunch: text })}
        style={styles.input}
      />

      <Text style={styles.label}>Dinner</Text>
      <TextInput
        value={meals.dinner}
        onChangeText={(text) => setMeals({ ...meals, dinner: text })}
        style={styles.input}
      />

      <Text style={styles.label}>Snacks</Text>
      <TextInput value={snacks} onChangeText={setSnacks} style={styles.input} />

      <Text style={styles.label}>Water Intake (ml)</Text>
      <TextInput
        value={waterIntake}
        onChangeText={setWaterIntake}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Update Log" onPress={handleUpdate} />
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
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    marginTop: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
});
