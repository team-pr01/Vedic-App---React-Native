import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Clock, Star } from 'lucide-react-native';

interface DoctorCardProps {
  doctor: any;
  colors: any;
  onBook: (doctor: any) => void;
}

const DoctorCard = ({ doctor, colors, onBook }: DoctorCardProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.cardShadow },
      ]}
      activeOpacity={0.8}
    >
      <Image source={{ uri: doctor.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{doctor.name}</Text>
        <Text style={[styles.specialty, { color: colors.primary }]}>
          {doctor.specialty}
        </Text>
        <Text style={[styles.experience, { color: colors.secondaryText }]}>
          {doctor.experience} experience
        </Text>

        <View style={styles.meta}>
          <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent:"center", gap: 10 }}>
            <View style={styles.availabilityContainer}>
              <Clock size={14} color={colors.success} />
              <Text style={[styles.availabilityText, { color: colors.success }]}>
                {doctor.availableTime}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Star size={16} color={colors.warning} fill={colors.warning} />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {doctor.rating}
              </Text>
            </View>
          </View>

          <Text style={[styles.price, { color: colors.success }]}>
            ৳{doctor.fees}
          </Text>
        </View>

        {/* <View style={styles.chip}>
          {doctor.availabilityType?.slice(0, 3).map((type: string) => (
            <View
              key={type}
              style={[styles.chip, { backgroundColor: colors.background }]}
            >
              <Text
                style={[styles.chipText, { color: colors.secondaryText }]}
              >
                {type}b hg
              </Text>
            </View>
          ))}
        </View> */}

        <TouchableOpacity
          onPress={() => onBook(doctor)}
          style={[
            styles.bookButton,
            { backgroundColor: colors.primary },
          ]}
        >
          <Text style={{ color: 'white' }}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    gap: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#DD6B20',
    marginBottom: 4,
  },
  experience: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  consultationTypes: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  bookButton: {
    backgroundColor: '#DD6B20',
    width: 150,
    paddingVertical: 7,
    borderRadius: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  
  }
});

export default DoctorCard;
