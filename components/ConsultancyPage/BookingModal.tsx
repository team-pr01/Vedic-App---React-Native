import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X, ChevronRight, AlertTriangle } from 'lucide-react-native';

const BookingModal = ({
  visible,
  colors,
  selectedDoctor,
  consultationIssue,
  setConsultationIssue,
  error,
  handleBookConsultation,
  setShowBookingModal,
  isBooking,
}: any) => {
  if (!selectedDoctor) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => setShowBookingModal(false)}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              Book Consultation
            </Text>
            <TouchableOpacity onPress={() => setShowBookingModal(false)}>
              <X size={24} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formSection}>
            <Text style={[styles.name, { color: colors.text }]}>
              {selectedDoctor.name}
            </Text>
            <Text style={[styles.specialty, { color: colors.primary }]}>
              {selectedDoctor.specialty}
            </Text>
            <Text style={[styles.price, { color: colors.success }]}>
              ৳{selectedDoctor.fees} per session
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>
              Your Concern *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text,
                },
              ]}
              value={consultationIssue}
              onChangeText={setConsultationIssue}
              placeholder="Describe your health concern..."
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.secondaryText}
            />

            {error && (
              <View
                style={[
                  styles.error,
                  { backgroundColor: `${colors.error}20` },
                ]}
              >
                <AlertTriangle size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleBookConsultation}
              style={[styles.btn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.btnText}>
                {isBooking ? 'Booking...' : 'Book Appointment'}
              </Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
   overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  doctorSummary: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F7FAFC',
    gap: 12,
  },
  doctorSummaryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  doctorSummaryInfo: {
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
 price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  formSection: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2D3748',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    flex: 1,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DD6B20',
    borderRadius: 8,
    paddingVertical: 16,
    marginVertical: 16,
    gap: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingModal;
