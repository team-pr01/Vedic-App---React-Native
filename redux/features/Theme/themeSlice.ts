// src/redux/features/Theme/themeSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

type ThemeType = 'light' | 'dark';

interface ThemeState {
  theme: ThemeType;
}

// For the very first app launch, we can try to respect the device's theme.
// On subsequent launches, redux-persist will load the user's saved choice.
const deviceTheme = Appearance.getColorScheme() || 'light';

const initialState: ThemeState = {
  theme: deviceTheme,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;