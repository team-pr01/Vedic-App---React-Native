import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { X, Flag, Pyramid } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { useReportMantraMutation } from '@/redux/features/Book/bookApi';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseId: string;
  vedaTitle: string;
  originalText: string;
  translation: string;
  bookId:string
  languageCode:string
}

interface ReportFormData {
  reason: string;
  feedback: string;
}

const REPORT_REASONS = [
  'Incorrect translation',
  'Inappropriate content',
  'Technical error',
  'Missing information',
  'Other',
];

export default function ReportModal({
  isOpen,
  onClose,
  verseId,
  vedaTitle,
  originalText,
  translation,
  bookId,
  languageCode
}: ReportModalProps) {
  const [reportMantra, { isLoading }] = useReportMantraMutation();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReportFormData>({
    defaultValues: { reason: '', feedback: '' },
  });

  const selectedReason = watch('reason');

  const onSubmit = async (data: ReportFormData) => {
    try {
      const payload={
        bookId: bookId || '',
        textId: verseId,
        originalText: originalText,
        translation: translation,
        reason: data.reason,
        feedback: data.feedback.trim(),
        languageCode:languageCode
      }
      console.log(payload)
      const res=await reportMantra(payload).unwrap();
      
      reset();
      console.log(res)
      onClose();
    } catch (error) {
      console.error('Report submission failed:', error);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Flag size={20} color="#EF4444" />
              <Text style={styles.title}>Report Issue</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#718096" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>What's the issue?</Text>

            <Controller
              control={control}
              name="reason"
              rules={{ required: 'Please select a reason.' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.reasonsList}>
                  {REPORT_REASONS.map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      style={[
                        styles.reasonItem,
                        value === reason && styles.reasonItemSelected,
                      ]}
                      onPress={() => onChange(reason)}
                    >
                      <View
                        style={[
                          styles.radioButton,
                          value === reason && styles.radioButtonSelected,
                        ]}
                      />
                      <Text
                        style={[
                          styles.reasonText,
                          value === reason && styles.reasonTextSelected,
                        ]}
                      >
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            {errors.reason && (
              <Text style={styles.errorText}>{errors.reason.message}</Text>
            )}

            <Text style={styles.sectionTitle}>Additional feedback</Text>
            <Controller
              control={control}
              name="feedback"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Please provide more details..."
                  value={value}
                  onChangeText={onChange}
                  multiline
                  textAlignVertical="top"
                />
              )}
            />

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={!selectedReason.trim() || isLoading}
                style={[
                  styles.submitButton,
                  (!selectedReason.trim() || isLoading) &&
                    styles.submitButtonDisabled,
                ]}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Submitting...' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  verseInfo: {
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  verseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  vedaText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  reasonsList: {
    marginBottom: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reasonItemSelected: {
    backgroundColor: '#FEF5E7',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: '#FF6F00',
    backgroundColor: '#FF6F00',
  },
  reasonText: {
    fontSize: 14,
    color: '#4A5568',
  },
  reasonTextSelected: {
    color: '#FF6F00',
    fontWeight: '500',
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2D3748',
    marginBottom: 20,
    minHeight: 80,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#FEB2B2',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});