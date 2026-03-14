import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { hapticLight } from '@/lib/haptics';
import { colors } from '@/theme/colors';

interface StarRatingProps {
  rating: number;
  onChange: (rating: number) => void;
  size?: number;
}

export function StarRating({ rating, onChange, size = 28 }: StarRatingProps) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => {
            hapticLight();
            onChange(star);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Star
            size={size}
            color={star <= rating ? colors.amber : colors.stone}
            fill={star <= rating ? colors.amber : 'transparent'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
  },
});
