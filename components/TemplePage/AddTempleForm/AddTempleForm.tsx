import { useThemeColors } from '@/hooks/useThemeColors';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { useAddTempleMutation } from '@/redux/features/Temple/templeApi';
import { useSelector } from 'react-redux';
import { useCurrentUser } from '@/redux/features/Auth/authSlice';

type TFormValues = {
  name: string;
  mainDeity: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  establishedYear: number;
  visitingHours: string;
  phone: string;
  email: string;
  website?: string;
  imageUrl: string;
  videoUrl?: string;
  mediaGallery?: string[];
};

const AddTempleForm = ({
  setShowRegistrationModal,
}: {
  setShowRegistrationModal: (show: boolean) => void;
}) => {
  const colors = useThemeColors();
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<TFormValues>({});

  const onKeyPress = () => {
    if (mediaGalleryInput.trim()) {
      setMediaGallery((prev) => [...prev, mediaGalleryInput.trim()]);
      setMediaGalleryInput('');
    }
  };

  const [addTemple, { isLoading }] = useAddTempleMutation();
  const [mediaGallery, setMediaGallery] = useState<string[]>([]);
  const [mediaGalleryInput, setMediaGalleryInput] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets?.[0]?.uri;
      if (uri) {
        setMediaGallery((prev) => [...prev, uri]);
      }
    }
  };

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setValue('imageUrl', result.assets[0].uri); // save picked image URI in form
    }
  };

  const removeImage = (uri: string) => {
    setMediaGallery((prev) => prev.filter((item) => item !== uri));
  };

  const user = useSelector(useCurrentUser) as any;

  const onSubmit = async (data: TFormValues) => {
    try {
      const formData = new FormData();

      const imageUri = watch('imageUrl') || data.imageUrl;
      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';

        formData.append('file', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }
      // Append all string fields
      formData.append('name', data.name);
      formData.append('mainDeity', data.mainDeity);
      formData.append('description', data.description);
      formData.append('address', data.address);
      formData.append('city', data.city);
      formData.append('state', data.state);
      formData.append('country', data.country);
      formData.append('establishedYear', String(data.establishedYear)); // convert number to string
      formData.append('visitingHours', data.visitingHours);

      // Contact info (now flat)
      formData.append('phone', data.phone);
      formData.append('email', data.email);
      formData.append('website', data.website || '');

      // Creator ID
      formData.append('createdBy', user?._id);

      const response = await addTemple(formData).unwrap();

      if (response?.success) {
        Alert.alert('Temple added successfully. Temple will be listed if Admin approves.' );
        reset();
        setMediaGallery([]);
        setShowRegistrationModal(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Something went wrong while adding the temple.');
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View
        style={[
          styles.modal,
          { backgroundColor: colors.card, shadowColor: colors.cardShadow },
        ]}
      >
        <View
          style={[styles.modalHeader, { borderBottomColor: colors.border }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Register New Place
          </Text>
          <TouchableOpacity onPress={() => setShowRegistrationModal(false)}>
            <X size={24} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Input label="Name" name="name" setValue={setValue} watch={watch} />
          <Input
            label="Main Deity"
            name="mainDeity"
            setValue={setValue}
            watch={watch}
          />
          <Input
            label="Description"
            name="description"
            multiline
            setValue={setValue}
            watch={watch}
          />
          <Input
            label="Address"
            name="address"
            setValue={setValue}
            watch={watch}
          />
          <Input label="City" name="city" setValue={setValue} watch={watch} />
          <Input label="State" name="state" setValue={setValue} watch={watch} />
          <Input
            label="Country"
            name="country"
            setValue={setValue}
            watch={watch}
          />
          <Input
            label="Established Year"
            name="establishedYear"
            keyboardType="numeric"
            setValue={setValue}
            watch={watch}
          />
          <Input
            label="Visiting Hours"
            name="visitingHours"
            setValue={setValue}
            watch={watch}
          />
          <Input
            label="Phone"
            name="phone"
            setValue={setValue}
            watch={watch}
          />
          <Input
            label="Email"
            name="email"
            setValue={setValue}
            watch={watch}
          />
          <Input
            label="Website"
            name="website"
            setValue={setValue}
            watch={watch}
          />
          <View style={{ marginBottom: 16, position: 'relative' }}>
            <Text style={styles.label}>Pick Cover Image</Text>
            <Button title="Pick Image from Gallery" onPress={pickCoverImage} />

            {watch('imageUrl') && (
              <Image
                source={{ uri: watch('imageUrl') }}
                style={{
                  width: 200,
                  height: 200,
                  marginTop: 10,
                  borderRadius: 8,
                }}
              />
            )}

            {watch('imageUrl') && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setValue('imageUrl', '')}
              >
                <Text style={[styles.removeText, { color: '#FF0000' }]}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          <Input
            label="Video URL (optional)"
            name="videoUrl"
            setValue={setValue}
            watch={watch}
          />

          <View style={styles.buttonContainer}>
            <Button title={isLoading?"Submitting...":"Submit"} onPress={handleSubmit(onSubmit)} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default AddTempleForm;

const Input = ({
  label,
  name,
  watch,
  setValue,
  multiline = false,
  keyboardType = 'default',
}: {
  label: string;
  name: any;
  watch: any;
  setValue: any;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
}) => {
  const value = watch(name);
  const colors=useThemeColors()
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label,{color:colors.text}]}>{label}</Text>
      <TextInput
        value={value}
        multiline={multiline}
        keyboardType={keyboardType}
        onChangeText={(text) => setValue(name, text)}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  galleryContainer: {
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 35,
  },

  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  gallery: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    position: 'relative',
  },
  remove: {
    position: 'absolute',
    top: 0,
    right: 8,
  },
  removeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  removeButton: {
    position: 'absolute',
    top: 70,
    right: 140,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
