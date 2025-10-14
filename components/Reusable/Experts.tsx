import { Clock, Star } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

const Experts = ({ data, title,isLoading }: { data: any, title: string,isLoading:boolean }) => {
  return (
    <View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title} Experts</Text>
        {data?.length > 0 ? (
          <View style={styles.expertsContainer}>
            {data?.map((expert: any) => (
              <TouchableOpacity
                key={expert._id}
                style={styles.doctorCard}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: expert.imageUrl }}
                  style={styles.doctorImage}
                />
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{expert.name}</Text>
                  <Text style={styles.doctorSpeciality}>
                    {expert.specialty}
                  </Text>
                  <Text style={styles.doctorExperience}>
                    {expert.experience} experience
                  </Text>

                  <View style={styles.doctorMeta}>
                    <View style={styles.ratingContainer}>
                      <Star size={16} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingText}>{expert.rating}</Text>
                    </View>
                    <Text style={styles.doctorPrice}>৳{expert.fees}</Text>
                  </View>

                  <View style={styles.availabilityContainer}>
                    <Clock size={14} color="#10B981" />
                    <Text style={styles.availabilityText}>
                      {expert.availableTime}
                    </Text>
                  </View>

                  <View style={styles.consultationTypes}>
                    {expert.availabilityType.slice(0, 3).map((type: string) => (
                      <View key={type} style={styles.typeChip}>
                        <Text style={styles.typeChipText}>{type}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            No {title} experts found for your search.
          </Text>
        )}
      </View>

      <View style={styles.bottomSpacing} />
    </View>
  );
};

export default Experts;
const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  expertsContainer: {
    gap: 12,
  },
  doctorCard: {
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
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  doctorSpeciality: {
    fontSize: 14,
    color: '#DD6B20',
    marginBottom: 4,
  },
  doctorExperience: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
  },
  doctorMeta: {
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
  doctorPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  bottomSpacing: {
    height: 20,
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
  typeChip: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeChipText: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyText: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 14,
    paddingVertical: 20,
  },
});
