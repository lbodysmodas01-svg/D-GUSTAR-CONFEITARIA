import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

export async function getUserRole(uid: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return 'user';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'user';
  }
}

export interface AppSettings {
  logoUrl: string;
  appName: string;
  appSubtitle: string;
  appDescription: string;
  colorPalette: string;
}

const defaultSettings: AppSettings = {
  logoUrl: 'https://instagram.fbsb8-2.fna.fbcdn.net/v/t51.82787-19/670890316_18463978237098931_1939052380474147205_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMxIn0&_nc_ht=instagram.fbsb8-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2gGSQIlauX8HC4IONqw2QlhR75_ruB9XeY9RjMfQWF956GXRsSdl4RlTtIvH-qMwZlESKXIu8Ptd9-Zh0VjwCQT4&_nc_ohc=fJOjnzz8Gq4Q7kNvwERdeH5&_nc_gid=OeJ8Kj6BVrbG0JNwZRyWbQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Af3JzXFx1kzZeCM1sD-iZqfaNjSWnubzw8rbhZEsd3k7nA&oe=69E70A05&_nc_sid=7a9f4b',
  appName: "D'GUSTAR",
  appSubtitle: "CONFEITARIA",
  appDescription: "Bolos, Salgados & Doces artesanais feitos com carinho para seus momentos especiais.",
  colorPalette: "pink",
};

// Hook Customizado para acessar as configurações de forma global
export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'brand'));
        if (snap.exists() && snap.data()) {
          setSettings({ ...defaultSettings, ...snap.data() });
        }
      } catch (err) {
        console.error("Error fetching settings", err);
      }
    };
    fetchSettings();
  }, []);

  return settings;
}

// Manter a função antiga pra não quebrar onde já usam
export function useAppLogo() {
  const settings = useAppSettings();
  return settings.logoUrl;
}

