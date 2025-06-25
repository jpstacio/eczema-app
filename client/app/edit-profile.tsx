import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '@/constants/api';

export default function EditProfileScreen() {
  const router = useRouter();

  const [skinType, setSkinType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [conditions, setConditions] = useState('');
  const [loading, setLoading] = useState(true);

  // Load existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = await SecureStore.getItemAsync('userId');
        const token = await SecureStore.getItemAsync('userToken');
        if (!userId || !token) throw new Error('Missing user credentials');

        const response = await axios.get(`${API_URL}/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data;
        setSkinType(data.skinType || '');
        setAllergies(data.allergies || '');
        setDob(data.dob || '');
        setGender(data.gender || '');
        setConditions(data.conditions || '');
      } catch (error) {
        console.error('Error loading profile:', error);
        Alert.alert('Error', 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
      const token = await SecureStore.getItemAsync('userToken');
      if (!userId || !token) throw new Error('Missing user credentials');

      const profileData = { skinType, allergies, dob, gender, conditions };

      await axios.post(`${API_URL}/profile/${userId}`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Profile updated successfully!');
      router.replace('/home');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Edit Your Profile</Text>

      <Text style={styles.label}>Skin Type</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={skinType} onValueChange={setSkinType}>
          <Picker.Item label="Select skin type..." value="" />
          <Picker.Item label="Oily" value="oily" />
          <Picker.Item label="Dry" value="dry" />
          <Picker.Item label="Combination" value="combination" />
          <Picker.Item label="Sensitive" value="sensitive" />
          <Picker.Item label="Normal" value="normal" />
        </Picker>
      </View>

      <Text style={styles.label}>Allergies</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., pollen, nuts"
        value={allergies}
        onChangeText={setAllergies}
      />

      <Text style={styles.label}>Date of Birth</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={dob}
        onChangeText={setDob}
      />

      <Text style={styles.label}>Gender/Sex</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={gender} onValueChange={setGender}>
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Non-binary" value="non-binary" />
          <Picker.Item label="Prefer not to say" value="prefer-not-to-say" />
        </Picker>
      </View>

      <Text style={styles.label}>Skin Conditions</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="e.g., eczema, psoriasis"
        value={conditions}
        onChangeText={setConditions}
        multiline
      />

      <Button title="Update Profile" onPress={handleUpdateProfile} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderRadius: 8,
  },
});
