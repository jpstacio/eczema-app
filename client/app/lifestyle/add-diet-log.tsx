import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
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
      await axios.post(
        `${API_URL}/diet-log`,
        {
          date: date.toISOString().slice(0, 10),
          meals: { [mealType]: mealDescription },
          snacks,
          waterIntake: parseInt(waterIntake),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Success', 'Diet log added!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add diet log');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Track Your Meals</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Date</Text>
        {Platform.OS === 'android' ? (
          <>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.input}
            >
              <Text>{date.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="calendar"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
          </>
        ) : (
          <View style={styles.iosDatePickerWrapper}>
            <DateTimePicker
              value={date}
              mode="date"
              display="inline"
              onChange={(_, selectedDate) => {
                if (selectedDate) setDate(selectedDate);
              }}
              style={styles.iosDatePicker}
            />
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Meal Type</Text>
        <Picker selectedValue={mealType}
        onValueChange={(value) => setMealType(value)}
    >
        <Picker.Item label="Breakfast" value="breakfast" />
        <Picker.Item label="Lunch" value="lunch" />
        <Picker.Item label="Dinner" value="dinner" />
      </Picker>

        <Text style={styles.label}>Meal Description</Text>
        <TextInput
          placeholder="What did you eat?"
          value={mealDescription}
          onChangeText={setMealDescription}
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Snacks</Text>
        <TextInput
          placeholder="Optional"
          value={snacks}
          onChangeText={setSnacks}
          style={styles.input}
        />

        <Text style={styles.label}>Water Intake (mL)</Text>
        <TextInput
          placeholder="e.g., 500"
          keyboardType="numeric"
          value={waterIntake}
          onChangeText={setWaterIntake}
          style={styles.input}
        />
      </View>

      <Button title="Submit Log" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#f9fcff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f4f4f4',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: '#000',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#f4f4f4',
    height: 44,
    justifyContent: 'center',
  },
  picker: {
    height: 44,
    color: '#000',
  },
  iosDatePickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  iosDatePicker: {
    backgroundColor: '#fff',
  },
});
