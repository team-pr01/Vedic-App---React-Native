import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  useBookConsultationMutation,
  useGetAllConsultancyServicesQuery,
} from '@/redux/features/Consultancy/consultancyApi';
import { TConsultancyService } from '@/types';
import { PullToRefreshWrapper } from '@/components/Reusable/PullToRefreshWrapper/PullToRefreshWrapper';
import { useThemeColors } from '@/hooks/useThemeColors';
import BookingModal from '@/components/ConsultancyPage/BookingModal';
import SuccessModal from '@/components/ConsultancyPage/SuccessModal';
import DoctorList from '@/components/ConsultancyPage/DoctorList';

const triggerHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

export default function Experts({
  defaultCategory = 'consultancyService',
}: {
  defaultCategory?: string;
}) {
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch doctors based on a fixed category
  const {
    data,
    isFetching,
    isLoading,
    refetch: refetchConsultancy,
  } = useGetAllConsultancyServicesQuery({
    category: defaultCategory,
  });

  // Booking logic
  const [
    bookConsultation,
    {
      isLoading: isBooking,
      isSuccess: bookingSuccess,
      isError: bookingIsError,
      error: bookingErrorDetails,
    },
  ] = useBookConsultationMutation();

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] =
    useState<TConsultancyService | null>(null);
  const [consultationIssue, setConsultationIssue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchConsultancy();
    } catch (error) {
      console.error('Error refreshing consultancy data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (bookingSuccess) {
      setShowBookingModal(false);
      setShowSuccessModal(true);
      setConsultationIssue('');
      setError(null);
    }
    if (bookingIsError) {
      const errorMessage =
        (bookingErrorDetails as any)?.data?.message ||
        'Failed to book consultation. Please try again.';
      setError(errorMessage);
      Alert.alert('Booking Error', errorMessage);
    }
  }, [bookingSuccess, bookingIsError, bookingErrorDetails]);

  const handleBookConsultation = async () => {
    triggerHaptic();

    if (!consultationIssue.trim()) {
      setError('Please describe your health concern.');
      return;
    }

    if (!selectedDoctor) {
      setError('No consultant selected. Please select a consultant.');
      return;
    }

    setError(null);

    try {
      const bookingData = {
        consultantId: selectedDoctor._id,
        concern: consultationIssue,
        fees: selectedDoctor.fees,
        category: selectedDoctor.specialty,
      };
      await bookConsultation(bookingData).unwrap();
    } catch (err) {
      console.log('Failed to initiate booking:', err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <ScrollView
          style={{ backgroundColor: colors.background }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={{ flex: 1, backgroundColor: colors.background ,marginBottom:40}}>
            {/* Doctor List */}
            <DoctorList
              data={data}
              isLoading={isLoading}
              isFetching={isFetching}
              colors={colors}
              onBookPress={(doctor) => {
                setSelectedDoctor(doctor);
                setShowBookingModal(true);
              }}
            />

            {/* Booking Modal */}
            <BookingModal
              visible={showBookingModal}
              colors={colors}
              selectedDoctor={selectedDoctor}
              consultationIssue={consultationIssue}
              setConsultationIssue={setConsultationIssue}
              error={error}
              handleBookConsultation={handleBookConsultation}
              setShowBookingModal={setShowBookingModal}
              isBooking={isBooking}
            />

            {/* Success Modal */}
            <SuccessModal
              visible={showSuccessModal}
              selectedDoctor={selectedDoctor}
              colors={colors}
              onDone={() => {
                triggerHaptic();
                setShowSuccessModal(false);
              }}
            />
          </View>
        </ScrollView>
      </PullToRefreshWrapper>
    </SafeAreaView>
  );
}
