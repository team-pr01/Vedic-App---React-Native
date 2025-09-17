import { Doctor, AyurvedaVideo } from '../types';

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Acharya Ramesh Sharma',
    speciality: 'Ayurvedic Medicine & Panchakarma',
    experience: '15 years',
    rating: 4.9,
    price: '1500',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    nextAvailable: 'Today, 3:00 PM',
    category: 'Common Cold',
    languages: ['English', 'Hindi', 'Bengali'],
    education: 'BAMS, MD (Ayurveda)'
  },
  {
    id: 2,
    name: 'Dr. Priya Agarwal',
    speciality: 'Ayurvedic Skin & Beauty Therapy',
    experience: '12 years',
    rating: 4.8,
    price: '1200',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    nextAvailable: 'Tomorrow, 10:00 AM',
    category: 'Skin Problems',
    languages: ['English', 'Hindi'],
    education: 'BAMS, Diploma in Ayurvedic Cosmetology'
  },
  {
    id: 3,
    name: 'Dr. Vishnu Das',
    speciality: 'Ayurvedic Digestive Health',
    experience: '20 years',
    rating: 4.9,
    price: '2000',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    nextAvailable: 'Today, 6:00 PM',
    category: 'Digestion',
    languages: ['English', 'Hindi', 'Bengali', 'Sanskrit'],
    education: 'BAMS, MD (Kayachikitsa)'
  },
  {
    id: 4,
    name: 'Dr. Sita Devi',
    speciality: 'Ayurvedic Joint & Bone Care',
    experience: '18 years',
    rating: 4.7,
    price: '1800',
    image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
    nextAvailable: 'Tomorrow, 2:00 PM',
    category: 'Joint Pain',
    languages: ['English', 'Hindi', 'Bengali'],
    education: 'BAMS, Specialization in Panchakarma'
  },
  {
    id: 5,
    name: 'Dr. Ananda Krishnan',
    speciality: 'Ayurvedic Fever & Respiratory Care',
    experience: '25 years',
    rating: 4.9,
    price: '2500',
    image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400',
    nextAvailable: 'Today, 8:00 PM',
    category: 'Fever',
    languages: ['English', 'Hindi', 'Tamil', 'Sanskrit'],
    education: 'BAMS, MD (Swasthavritta)'
  },
  {
    id: 6,
    name: 'Dr. Meera Patel',
    speciality: 'Ayurvedic Cough & Cold Treatment',
    experience: '14 years',
    rating: 4.6,
    price: '1300',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    nextAvailable: 'Tomorrow, 11:00 AM',
    category: 'Cough',
    languages: ['English', 'Hindi', 'Gujarati'],
    education: 'BAMS, Diploma in Ayurvedic Medicine'
  }
];

export const MOCK_AYURVEDA_VIDEOS: AyurvedaVideo[] = [
  {
    id: 1,
    title: 'Natural Remedies for Common Cold - Ayurvedic Approach',
    duration: '12:30',
    thumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    expert: 'Dr. Ramesh Sharma',
    diseaseCategory: 'Common Cold',
    views: '45K'
  },
  {
    id: 2,
    title: 'Ayurvedic Cough Syrup Recipe at Home',
    duration: '8:45',
    thumbnail: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=400',
    expert: 'Dr. Priya Agarwal',
    diseaseCategory: 'Cough',
    views: '32K'
  },
  {
    id: 3,
    title: 'Fever Management with Ayurvedic Herbs',
    duration: '15:20',
    thumbnail: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400',
    expert: 'Dr. Ananda Krishnan',
    diseaseCategory: 'Fever',
    views: '28K'
  },
  {
    id: 4,
    title: 'Digestive Health: Ayurvedic Diet and Lifestyle',
    duration: '18:15',
    thumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    expert: 'Dr. Vishnu Das',
    diseaseCategory: 'Digestion',
    views: '67K'
  },
  {
    id: 5,
    title: 'Ayurvedic Skincare: Natural Beauty Secrets',
    duration: '14:30',
    thumbnail: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400',
    expert: 'Dr. Priya Agarwal',
    diseaseCategory: 'Skin Problems',
    views: '89K'
  },
  {
    id: 6,
    title: 'Joint Pain Relief with Ayurvedic Massage',
    duration: '11:45',
    thumbnail: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400',
    expert: 'Dr. Sita Devi',
    diseaseCategory: 'Joint Pain',
    views: '54K'
  }
];