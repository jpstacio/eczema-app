// app/home.tsx
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = await SecureStore.getItemAsync('userId');
        const token = await SecureStore.getItemAsync('userToken');
        if (!userId || !token) throw new Error('Missing auth info');

        const response = await axios.get(`${API_URL}/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(response.data);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text>No profile data found.</Text>
        <Button title="Set Up Profile" onPress={() => router.push('/profile-setup')} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to your dashboard!</Text>
      <Text style={styles.sectionTitle}>Your Profile</Text>
      <Text><Text style={styles.label}>Skin Type:</Text> {profile.skinType}</Text>
      <Text><Text style={styles.label}>Allergies:</Text> {profile.allergies || 'None'}</Text>
      <Text><Text style={styles.label}>Date of Birth:</Text> {profile.dob}</Text>
      <Text><Text style={styles.label}>Gender/Sex:</Text> {profile.gender}</Text>
      <Text><Text style={styles.label}>Skin Conditions:</Text> {profile.conditions || 'None'}</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Edit Profile" onPress={() => router.push('/edit-profile')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#f3f3f3',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  label: {
    fontWeight: '600',
  },
});
