import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface HostEvent {
  id: string;
  title: string;
  category: string;
  startTime: string; // ISO string
  generalLocation: string;
  distanceMiles?: number;
  rsvpCount: number;
  isPaid: boolean;
  safetyNotes?: string;
  isPublicPlace: boolean;
  description?: string;
  endTime?: string;
}

interface HostEventCardProps {
  event: HostEvent;
  onRSVP: () => void;
  isRSVPd: boolean;
}

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function HostEventCard({ event, onRSVP, isRSVPd }: HostEventCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
        {event.isPublicPlace && (
          <View style={styles.publicBadge}>
            <Text style={styles.publicBadgeText}>Public place</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{event.title}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{formatEventTime(event.startTime)}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{event.generalLocation}</Text>
        {event.distanceMiles !== undefined && (
          <Text style={styles.distance}>· {event.distanceMiles.toFixed(1)} mi</Text>
        )}
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.bottomLeft}>
          <Text style={styles.rsvpCount}>{event.rsvpCount} going</Text>
          <Text style={styles.priceLine}>
            {event.isPaid ? 'Paid at venue' : 'Free'}
          </Text>
          {event.safetyNotes ? (
            <Text style={styles.safetyPreview} numberOfLines={1}>
              {event.safetyNotes}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.rsvpBtn, isRSVPd && styles.rsvpBtnDone]}
          onPress={onRSVP}
          activeOpacity={0.85}
        >
          <Text style={styles.rsvpBtnText}>{isRSVPd ? 'RSVPd ✓' : 'RSVP'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101114',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262A31',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: 'rgba(77,163,255,0.12)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  categoryText: {
    color: '#4DA3FF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  publicBadge: {
    backgroundColor: 'rgba(0,255,133,0.10)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  publicBadgeText: {
    color: '#00FF85',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: '#F4F4F5',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  metaText: {
    color: '#A1A1AA',
    fontSize: 13,
  },
  distance: {
    color: '#A1A1AA',
    fontSize: 13,
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  bottomLeft: {
    flex: 1,
    marginRight: 12,
  },
  rsvpCount: {
    color: '#F4F4F5',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  priceLine: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  safetyPreview: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 3,
    fontStyle: 'italic',
  },
  rsvpBtn: {
    backgroundColor: '#00FF85',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  rsvpBtnDone: {
    backgroundColor: 'rgba(0,255,133,0.15)',
    borderWidth: 1,
    borderColor: '#00FF85',
  },
  rsvpBtnText: {
    color: '#050505',
    fontSize: 14,
    fontWeight: '700',
  },
});
