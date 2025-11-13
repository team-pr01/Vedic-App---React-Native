import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import DoctorCard from './DoctorCard';
import SkeletonLoader from '../Reusable/SkeletonLoader';

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
        <SkeletonLoader
                direction="column"
                height={130}
                width={'100%'}
                innerSkeleton={
                  <View
                    style={{
                      padding: 15,
                      justifyContent: 'space-between',
                      flex: 1,
                    }}
                  >
                    <View>
                      <View
                        style={{
                          width: '60%',
                          height: 16,
                          backgroundColor: '#e0e0e0',
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                      />
                      <View
                        style={{
                          width: '40%',
                          height: 12,
                          backgroundColor: '#e0e0e0',
                          borderRadius: 6,
                        }}
                      />
                    </View>

                    <View
                      style={{
                        width: '100%',
                        height: 35,
                        backgroundColor: '#d6d6d6',
                        borderRadius: 8,
                        marginTop: 20,
                      }}
                    />
                  </View>
                }
              />
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
