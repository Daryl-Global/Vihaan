import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CryptoJS from 'crypto-js';

const SECRET_KEY = "your-secret-key"; // Use a strong key

const encrypt = (data) => {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  return encrypted;
};

const decrypt = (data) => {
  try {
    const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;  // Handle failed decryption
  }
};

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,  // initial state
      setUser: (userData) => {
          const encryptedUserData = encrypt(userData); // Encrypt data here
          set({ user: encryptedUserData }); // Set encrypted data to state
      },
      // getUser: () => {
      //   const encryptedUserData = get().user;
      //   if (encryptedUserData) {
      //     return decrypt(encryptedUserData  ); // Decrypt user data when accessed
      //   }
      //   return null;
      // },
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage",
      getStorage: () => localStorage,

      // serialize: (state) => {
      //   const encrypted = encrypt(state);
      //   console.log('Serializing:', state, '=>', encrypted);
      //   return encrypted;
      // },
      deserialize: (str) => {
        const decrypted = decrypt(str);
        console.log('Deserializing:', str, '=>', decrypted);
        return decrypted;
      },
    }
  )
);

// Function to get decrypted user
export const getUser = () => {
  const { user } = useUserStore.getState(); // Access the store's state
  return user ? decrypt(user) : null; // Decrypt user data when accessed
};

