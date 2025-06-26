// app/lifestyle/add-diet-log.tsx

import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddDietLog() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [mealType, setMealType] = useState('breakfast');
  const [mealDescription, setMealDescription] = useState('');
  const [snacks, setSnacks] = useState('');
  const [waterIntake, setWaterIntake] = useState('');

  const handleSubmit = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) return Alert.alert('Unauthorized');

    try {
      const res = await axios.post(`${API_URL}/diet-log`, {
        date: date.toISOString().slice(0, 10),
        meals: { [mealType]: mealDescription },
        snacks,
        waterIntake: parseInt(waterIntake),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Diet log added!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add diet log');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add Diet Log</Text>

      <Text style={styles.label}>Date</Text>
    <Button title={date.toDateString()} onPress={() => setShowDatePicker(true)} />
    {showDatePicker && (
      <DateTimePicker
        value={date}
        mode="date"
        display="default"
        onChange={(_: unknown, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
        }}
      />
    )}

      <Picker
        selectedValue={mealType}
        onValueChange={(itemValue) => setMealType(itemValue)}
        style={{ marginVertical: 8 }}
      >
        <Picker.Item label="Breakfast" value="breakfast" />
        <Picker.Item label="Lunch" value="lunch" />
        <Picker.Item label="Dinner" value="dinner" />
      </Picker>

      <Text style={styles.label}>Meal Description</Text>
      <TextInput value={mealDescription} onChangeText={setMealDescription} style={styles.input} />

      <Text style={styles.label}>Snacks</Text>
      <TextInput value={snacks} onChangeText={setSnacks} style={styles.input} />

      <Text style={styles.label}>Water Intake (ml)</Text>
      <TextInput
        value={waterIntake}
        onChangeText={setWaterIntake}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontWeight: '600', marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
});
