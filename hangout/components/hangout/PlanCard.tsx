import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { HangoutRequest, Profile } from '@/lib/types';
import { ACTIVITY_CONFIG } from '@/lib/constants';

interface PlanCardProps {
  request: HangoutRequest;
  senderProfile?: Profile;
}

function formatProposedTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today at ${timeStr}`;
  if (isTomorrow) return `Tomorrow at ${timeStr}`;
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + ` at ${timeStr}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `~${h} hr` : `~${h}h ${m}m`;
}

export function PlanCard({ request, senderProfile }: PlanCardProps) {
  const actConfig = ACTIVITY_CONFIG[request.activity as keyof typeof ACTIVITY_CONFIG];
  const icon = actConfig?.icon ?? '●';
  const actLabel = actConfig?.label ?? request.activity;
  const isVerified = request.mode === 'verified';

  return (
    <View style={styles.card}>
      {/* Activity header */}
      <View style={styles.activityRow}>
        <Text style={styles.activityIcon}>{icon}</Text>
        <Text style={styles.activityLabel}>{actLabel}</Text>
        <View style={[styles.modeBadge, isVerified && styles.modeBadgeVerified]}>
          <Text style={[styles.modeText, isVerified && styles.modeTextVerified]}>
            {isVerified ? 'Verified — 50 HP stake' : 'Casual'}
          </Text>
        </View>
      </View>

      {/* Time + duration */}
      <View style={styles.metaRow}>
        <Text style={styles.metaIcon}>🕐</Text>
        <Text style={styles.metaText}>{formatProposedTime(request.proposed_time)}</Text>
        <Text style={styles.metaSep}>·</Text>
        <Text style={styles.metaText}>{formatDuration(request.estimated_duration_minutes)}</Text>
      </View>

      {/* Location */}
      {(request.place_name || request.general_location) && (
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText}>
            {[request.place_name, request.general_location].filter(Boolean).join(' · ')}
          </Text>
        </View>
      )}

      {/* Note */}
      {request.note ? (
        <View style={styles.noteContainer}>
          <Text style={styles.note}>"{request.note}"</Text>
        </View>
      ) : null}

      {/* Safety label */}
      <View style={styles.safetyRow}>
        <Text style={styles.safetyIcon}>🛡️</Text>
        <Text style={styles.safetyText}>Public place recommended</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#15171C',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityIcon: {
    fontSize: 20,
  },
  activityLabel: {
    color: '#F4F4F5',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  modeBadge: {
    backgroundColor: '#1A1D24',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  modeBadgeVerified: {
    backgroundColor: 'rgba(0, 255, 133, 0.08)',
    borderColor: 'rgba(0, 255, 133, 0.3)',
  },
  modeText: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '600',
  },
  modeTextVerified: {
    color: '#00FF85',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaIcon: {
    fontSize: 13,
  },
  metaText: {
    color: '#A1A1AA',
    fontSize: 13,
  },
  metaSep: {
    color: '#262A31',
    fontSize: 13,
  },
  noteContainer: {
    backgroundColor: '#101114',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#4DA3FF',
  },
  note: {
    color: '#F4F4F5',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  safetyIcon: {
    fontSize: 11,
  },
  safetyText: {
    color: '#A1A1AA',
    fontSize: 11,
  },
});
