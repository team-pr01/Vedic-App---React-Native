import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import DoctorCard from './DoctorCard';

const DoctorList = ({
  data,
  isLoading,
  isFetching,
  colors,
  onBookPress,
}: any) => {
  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.text }]}>
        Available Experts
      </Text>

      {isLoading || isFetching ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : data?.data?.length > 0 ? (
        <View style={styles.doctorsContainer}>
          {data.data.map((doctor: any) => (
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              colors={colors}
              onBook={onBookPress}
            />
          ))}
        </View>
      ) : (
        <Text>No experts found </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  doctorsContainer: {
    gap: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});

export default DoctorList;
