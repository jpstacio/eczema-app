// app/lifestyle/add-wellbeing-log.tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddWellbeingLog() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mood, setMood] = useState('Neutral');
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState('');

  const handleSubmit = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) return Alert.alert('Unauthorized');

    try {
      await axios.post(
        `${API_URL}/wellbeing-log`,
        {
          date: date.toISOString().slice(0, 10),
          mood,
          stressLevel,
          sleepHours: parseFloat(sleepHours),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Success', 'Well-being log saved!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save log');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Track Your Well-being</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Date</Text>
        {Platform.OS === 'android' ? (
          <>
            <Button title={date.toDateString()} onPress={() => setShowDatePicker(true)} />
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
          <DateTimePicker
            value={date}
            mode="date"
            display="inline"
            onChange={(_, selectedDate) => {
              if (selectedDate) setDate(selectedDate);
            }}
            style={styles.iosDatePicker}
          />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Mood</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={mood}
            onValueChange={(value) => setMood(value)}
            style={styles.picker}
          >
            <Picker.Item label="Happy" value="Happy" />
            <Picker.Item label="Neutral" value="Neutral" />
            <Picker.Item label="Sad" value="Sad" />
          </Picker>
        </View>

        <Text style={styles.label}>Stress Level (1-10)</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={stressLevel}
          onValueChange={setStressLevel}
        />
        <Text style={{ textAlign: 'center' }}>{stressLevel}</Text>

        <Text style={styles.label}>Sleep Duration (hours)</Text>
        <TextInput
          placeholder="e.g., 7.5"
          value={sleepHours}
          onChangeText={setSleepHours}
          keyboardType="numeric"
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
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#f4f4f4',
  },
  picker: {
    height: 44,
    width: '100%',
  },
  iosDatePicker: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
});
