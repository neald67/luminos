import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CrewPollCardProps {
  question: string;
  options: string[];
  votes: number[];
}

export function CrewPollCard({ question, options, votes: initialVotes }: CrewPollCardProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<number | null>(null);

  const totalVotes = votes.reduce((sum, v) => sum + v, 0);

  function handleVote(idx: number) {
    if (userVote !== null) return;
    const newVotes = [...votes];
    newVotes[idx] += 1;
    setVotes(newVotes);
    setUserVote(idx);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.options}>
        {options.map((option, idx) => {
          const count = votes[idx] ?? 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isVoted = userVote === idx;
          const hasVoted = userVote !== null;

          return (
            <TouchableOpacity
              key={idx}
              style={[styles.option, isVoted && styles.optionVoted]}
              onPress={() => handleVote(idx)}
              disabled={hasVoted}
              activeOpacity={0.8}
            >
              {hasVoted && (
                <View
                  style={[styles.progressBar, { width: `${pct}%` as any }]}
                />
              )}
              <View style={styles.optionContent}>
                <Text style={[styles.optionText, isVoted && { color: '#00FF85' }]}>
                  {option}
                </Text>
                {hasVoted && (
                  <Text style={styles.pctText}>{pct}%</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.totalVotes}>{totalVotes} votes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101114',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262A31',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  question: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  options: {
    gap: 8,
  },
  option: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262A31',
    overflow: 'hidden',
    backgroundColor: '#15171C',
    minHeight: 44,
    justifyContent: 'center',
  },
  optionVoted: {
    borderColor: '#00FF85',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,255,133,0.08)',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionText: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '500',
  },
  pctText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  totalVotes: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 10,
    textAlign: 'right',
  },
});
