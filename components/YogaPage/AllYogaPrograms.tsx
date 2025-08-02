import { LEVELS } from '@/app/pages/yoga';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYoga } from '@/types';
import { Clock } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import NoData from '../Reusable/NoData/NoData';
import { getYouTubeVideoId } from '@/utils/getYouTubeVideoId';

const AllYogaPrograms = ({ data }: { data: TYoga[] }) => {
  const [playingCardIndex, setPlayingCardIndex] = useState<number | null>(null);
  const getLevelColor = (level: string) => {
    const levelData = LEVELS.find((l) => l.id === level?.toLowerCase());
    return levelData ? levelData.color : '#718096';
  };

  const colors = useThemeColors();
  return (
    <View style={styles.programsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Featured Programs
        </Text>
        <Text style={[styles.resultsCount, { color: colors.secondaryText }]}>
          {data?.length} program
          {data?.length !== 1 ? 's' : ''}
        </Text>
      </View>
      {data?.length > 0 ? (
        <View style={styles.programsGrid}>
          {data?.map((program: TYoga, index: number) => (
            <View
              key={program._id || index}
              style={[
                styles.programCard,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.cardShadow,
                },
              ]}
            >
              {/* --- Video Player Section --- */}
              <View style={styles.programImageContainer}>
                <YoutubePlayer
                  height={200}
                  play={playingCardIndex === index}
                  videoId={getYouTubeVideoId(program?.videoUrl) || ''}
                  onChangeState={(state: any) => {
                    if (state === 'ended') setPlayingCardIndex(null);
                  }}
                />
              </View>

              {/* --- Content Section --- */}
              <View style={styles.programContent}>
                <View style={styles.programHeader}>
                  <Text style={[styles.programTitle, { color: colors.text }]}>
                    {program.name}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.programDescription,
                    { color: colors.secondaryText },
                  ]}
                  numberOfLines={2}
                >
                  {program.description}
                </Text>

                <View style={styles.metaItem}>
                  <Clock size={14} color={colors.secondaryText} />
                  <Text
                    style={[styles.metaText, { color: colors.secondaryText }]}
                  >
                    {program.duration}
                  </Text>
                </View>

                <View style={styles.programFooter}>
                  <View style={styles.instructorInfo}>
                    {/* Add instructor info if API provides it */}
                  </View>
                  <View
                    style={[
                      styles.levelBadge,
                      {
                        backgroundColor: getLevelColor(program.difficulty),
                      },
                    ]}
                  >
                    <Text style={styles.levelBadgeText}>
                      {program.difficulty?.charAt(0).toUpperCase() +
                        program.difficulty?.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <NoData message="No programs found" />
      )}
    </View>
  );
};

export default AllYogaPrograms;

const styles = StyleSheet.create({
  programsContainer: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultsCount: {
    fontSize: 14,
  },
  programsGrid: {
    gap: 16,
  },
  programCard: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
  },
  programImageContainer: {
    position: 'relative',
    height: 180,
  },
  programContent: {
    padding: 16,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginTop: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  programDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryText: {
    fontSize: 12,
  },
  levelBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
