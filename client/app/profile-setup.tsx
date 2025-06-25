// app/profile-setup.tsx
import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '@/constants/api';

export default function ProfileSetupScreen() {
  const router = useRouter();

  const [skinType, setSkinType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [conditions, setConditions] = useState('');

  const handleSaveProfile = async () => {
  if (!skinType) {
    Alert.alert('Validation Error', 'Please select a skin type.');
    return;
  }

  const profileData = { skinType, allergies, dob, gender, conditions };

  try {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) throw new Error('Auth token not found');

    let userId = await SecureStore.getItemAsync('userId');
    if (!userId) {
      const decoded: any = jwtDecode(token);
      userId = String(decoded.userId);
      await SecureStore.setItemAsync('userId', userId);
    }

    // ✅ Save to backend
    await axios.post(`${API_URL}/profile/${userId}`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // ✅ Save locally too (optional but good UX)
    await SecureStore.setItemAsync(`userProfile-${userId}`, JSON.stringify(profileData));

    console.log('Saved profile for user:', userId);
    console.log('Profile data:', profileData);

    Alert.alert('Success', 'Profile saved!');
    router.replace('/home');
  } catch (error) {
    console.error('Profile save error:', error);
    Alert.alert('Error', 'Failed to save profile.');
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Set Up Your Profile</Text>

      {/* Skin Type */}
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

      {/* Allergies */}
      <Text style={styles.label}>Allergies (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., nuts, fragrance"
        value={allergies}
        onChangeText={setAllergies}
      />

      {/* DOB */}
      <Text style={styles.label}>Date of Birth</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={dob}
        onChangeText={setDob}
      />

      {/* Gender / Sex */}
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

      {/* Skin Conditions */}
      <Text style={styles.label}>Known Skin Conditions</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="e.g., eczema, psoriasis"
        value={conditions}
        onChangeText={setConditions}
        multiline
      />

      <Button title="Save Profile" onPress={handleSaveProfile} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
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
