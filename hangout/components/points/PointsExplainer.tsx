import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function PointsExplainer() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🌿</Text>
        <Text style={styles.heading}>HP can't be bought.</Text>
        <Text style={styles.body}>
          HP is earned by verified hangouts. You can't buy it. That's the point.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.icon}>🎯</Text>
        <Text style={styles.heading}>Stake to earn more.</Text>
        <Text style={styles.body}>
          Verified hangouts stake 50 HP. Show up, get 75 credited. Don't show, lose your stake.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#101114',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262A31',
    padding: 16,
  },
  icon: {
    fontSize: 22,
    marginBottom: 6,
  },
  heading: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 19,
  },
});
