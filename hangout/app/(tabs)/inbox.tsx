import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  MOCK_PENDING_REQUESTS,
  MOCK_SENDER_PROFILES,
  MOCK_CONVERSATIONS,
} from '@/lib/mock-data';
import { RequestCard } from '@/components/hangout/RequestCard';
import type { HangoutRequest, Conversation } from '@/lib/types';

type InboxTab = 'requests' | 'active' | 'chats';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const AVATAR_COLORS = [
  '#4DA3FF', '#00FF85', '#FF6B4A', '#FFD166', '#C77DFF', '#06D6A0',
];
function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function ConversationRow({ conv }: { conv: Conversation }) {
  // Find the other participant (not current user)
  const otherId = conv.participant_ids.find((id) => id !== 'current-user-id') ?? '';
  const profile = MOCK_SENDER_PROFILES[otherId];
  const name = profile?.display_name ?? otherId;
  const initial = name.charAt(0).toUpperCase();
  const bg = avatarColor(name);

  return (
    <TouchableOpacity style={styles.convRow} activeOpacity={0.7}>
      <View style={[styles.convAvatar, { backgroundColor: bg }]}>
        <Text style={styles.convAvatarText}>{initial}</Text>
      </View>
      <View style={styles.convContent}>
        <View style={styles.convTopRow}>
          <Text style={styles.convName}>{name}</Text>
          <Text style={styles.convTime}>
            {conv.last_message_at ? timeAgo(conv.last_message_at) : ''}
          </Text>
        </View>
        <Text style={styles.convPreview} numberOfLines={1}>
          {conv.last_message_body ?? 'No messages yet'}
        </Text>
      </View>
      {conv.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{conv.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function InboxScreen() {
  const [activeTab, setActiveTab] = useState<InboxTab>('requests');
  const [requests, setRequests] = useState(MOCK_PENDING_REQUESTS);

  const handleAccept = (req: HangoutRequest) => {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    // In a real app, navigate to hangout detail
  };

  const handleDecline = (req: HangoutRequest) => {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
  };

  const handleBlock = (_req: HangoutRequest) => {
    setRequests((prev) => prev.filter((r) => r.id !== _req.id));
  };

  const tabs: { id: InboxTab; label: string }[] = [
    { id: 'requests', label: 'Requests' },
    { id: 'active', label: 'Active' },
    { id: 'chats', label: 'Chats' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        {requests.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{requests.length}</Text>
          </View>
        )}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {tab.id === 'requests' && requests.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{requests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Requests tab */}
      {activeTab === 'requests' && (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const sender = MOCK_SENDER_PROFILES[item.sender_id];
            if (!sender) return null;
            return (
              <RequestCard
                request={item}
                senderProfile={sender}
                onAccept={() => handleAccept(item)}
                onDecline={() => handleDecline(item)}
                onBlock={() => handleBlock(item)}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No pending plans.</Text>
              <Text style={styles.emptySubtitle}>
                Drop one on someone nearby — don&apos;t wait for them to text first.
              </Text>
              <Text style={styles.emptyHint}>Drop a plan — not a &apos;wyd&apos;</Text>
            </View>
          }
        />
      )}

      {/* Active tab */}
      {activeTab === 'active' && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🌿</Text>
          <Text style={styles.emptyTitle}>No active hangouts.</Text>
          <Text style={styles.emptySubtitle}>Go touch grass.</Text>
          <Text style={styles.emptyHint}>
            Accept a request or drop a plan to get one going.
          </Text>
        </View>
      )}

      {/* Chats tab */}
      {activeTab === 'chats' && (
        <FlatList
          data={MOCK_CONVERSATIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <ConversationRow conv={item} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>No conversations yet.</Text>
              <Text style={styles.emptySubtitle}>
                Accept or send a hangout request to start chatting.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 10,
  },
  headerTitle: {
    color: '#F4F4F5',
    fontSize: 24,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: '#00FF85',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  countText: {
    color: '#050505',
    fontSize: 12,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 4,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#15171C',
    borderWidth: 1,
    borderColor: '#262A31',
  },
  tabBtnActive: {
    backgroundColor: '#262A31',
    borderColor: '#3A3E47',
  },
  tabText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#F4F4F5',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#00FF85',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: '#050505',
    fontSize: 10,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    color: '#F4F4F5',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#A1A1AA',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyHint: {
    color: '#4DA3FF',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#15171C',
  },
  convAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convAvatarText: {
    color: '#050505',
    fontSize: 18,
    fontWeight: '700',
  },
  convContent: {
    flex: 1,
    gap: 3,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convName: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '600',
  },
  convTime: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  convPreview: {
    color: '#A1A1AA',
    fontSize: 13,
  },
  unreadBadge: {
    backgroundColor: '#00FF85',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  unreadText: {
    color: '#050505',
    fontSize: 12,
    fontWeight: '700',
  },
});
