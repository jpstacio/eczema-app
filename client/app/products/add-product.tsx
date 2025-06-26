import { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { API_URL } from '@/constants/api';
import { productSuggestions } from '@/utils/productSuggestions';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function AddProduct() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<{ name: string; type: string }[]>([]);
  const router = useRouter();

  const handleNameChange = (text: string) => {
    setName(text);
    const matches = productSuggestions.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSuggestions(matches);
  };

  const handleSuggestionSelect = (item: { name: string; type: string }) => {
    setName(item.name);
    setType(item.type);
    setFilteredSuggestions([]);
  };

  const handleSave = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post(
        `${API_URL}/product`,
        {
          name,
          type,
          frequency,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      <TextInput style={styles.input} value={name} onChangeText={handleNameChange} />
      {filteredSuggestions.length > 0 && (
        <FlatList
          data={filteredSuggestions}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSuggestionSelect(item)}>
              <Text style={styles.suggestion}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionBox}
        />
      )}

      <Text style={styles.label}>Type</Text>
      <TextInput style={styles.input} value={type} onChangeText={setType} />

      <Text style={styles.label}>Frequency</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={frequency}
          onValueChange={(value) => setFrequency(value)}
          style={Platform.OS === 'ios' ? undefined : styles.picker}
        >
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Twice a day" value="twice a day" />
          <Picker.Item label="Every other day" value="every other day" />
          <Picker.Item label="Weekly" value="weekly" />
          <Picker.Item label="As needed" value="as needed" />
        </Picker>
      </View>

      <Text style={styles.label}>Start Date</Text>
      <Button title={startDate.toDateString()} onPress={() => setShowStartPicker(true)} />
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>End Date (optional)</Text>
      <Button
        title={endDate ? endDate.toDateString() : 'Set End Date'}
        onPress={() => setShowEndPicker(true)}
      />
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Save" onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  label: { fontWeight: '600', marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  suggestionBox: {
    backgroundColor: '#fff',
    maxHeight: 120,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 10,
  },
  suggestion: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
});
