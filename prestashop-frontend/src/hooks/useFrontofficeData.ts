import { useContext } from 'react';
import {
  FrontofficeDataContext,
} from '@/contexts/FrontofficeDataContext';

export const useFrontofficeData = () => {
  const context = useContext(FrontofficeDataContext);
  if (context === undefined) {
    throw new Error(
      'useFrontofficeData must be used within a FrontofficeDataProvider',
    );
  }
  return context;
};