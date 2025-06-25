// app/post-login.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '@/constants/api';

export default function PostLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const userId = await SecureStore.getItemAsync('userId');
        if (!userId) throw new Error('User ID not found');

        const response = await axios.get(`${API_URL}/profile/${userId}`);

        if (response.status === 200) {
          router.replace('/home');
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Profile not found — redirect to setup
          router.replace('/profile-setup');
        } else {
          console.error('Error checking profile:', err);
        }
      }
    };

    checkProfile();
  }, []);

  return null;
}
