// src/hooks/useThemeColors.ts

import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { lightColors, darkColors } from '../styles/theme'; // Import colors from their new location

export const useThemeColors = () => {
  // Get the current theme from the Redux store
  const theme = useSelector((state: RootState) => state.theme.theme);
  
  // Return the correct color object based on the theme
  return theme === 'dark' ? darkColors : lightColors;
};