import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/constants/api';
import { useRouter } from 'expo-router';

export default function AddWellbeingLog() {
  const router = useRouter();

  const [moodOpen, setMoodOpen] = useState(false);
  const [mood, setMood] = useState('');
  const [moodItems, setMoodItems] = useState([
    { label: '😊 Happy', value: 'Happy' },
    { label: '😐 Neutral', value: 'Neutral' },
    { label: '😔 Sad', value: 'Sad' },
    { label: '😠 Angry', value: 'Angry' },
    { label: '😰 Anxious', value: 'Anxious' },
    { label: '😴 Tired', value: 'Tired' },
  ]);

  const [stressLevel, setStressLevel] = useState(5);
  const [sleepDuration, setSleepDuration] = useState('');

  const getStressLevelLabel = (value: number): string => {
  if (value <= 3) return 'Low';
  if (value <= 6) return 'Moderate';
  return 'High';
};

  const handleSubmit = async () => {
    if (!mood || !sleepDuration) {
      Alert.alert('Validation Error', 'Please fill out all fields.');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post(
        `${API_URL}/wellbeing-log`,
        {
          mood,
          stressLevel: getStressLevelLabel(stressLevel),
          sleepDuration: parseFloat(sleepDuration),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Success', 'Well-being log submitted!');
      router.replace('/');
    } catch (error) {
      console.error('Error submitting log:', error);
      Alert.alert('Error', 'Failed to submit log.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Log Mood & Sleep</Text>

      <Text style={styles.label}>Mood</Text>
      <DropDownPicker
        open={moodOpen}
        value={mood}
        items={moodItems}
        setOpen={setMoodOpen}
        setValue={setMood}
        setItems={setMoodItems}
        placeholder="Select your mood"
        style={styles.dropdown}
        zIndex={3000}
      />

      <Text style={styles.label}>Stress Level: {stressLevel}</Text>
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={stressLevel}
        onValueChange={setStressLevel}
        minimumTrackTintColor="#4b5563"
        maximumTrackTintColor="#d1d5db"
      />

      <Text style={styles.label}>Sleep Duration (hours)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 7.5"
        keyboardType="numeric"
        value={sleepDuration}
        onChangeText={setSleepDuration}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Submit" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1f2937',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdown: {
    marginBottom: 8,
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
});
