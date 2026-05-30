import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MOCK_CURRENT_USER } from '@/lib/mock-data';

export default function SettingsScreen() {
  const router = useRouter();

  // Profile edit state
  const [displayName, setDisplayName] = useState(MOCK_CURRENT_USER.display_name);
  const [bio, setBio] = useState(MOCK_CURRENT_USER.bio ?? '');
  const [editingProfile, setEditingProfile] = useState(false);

  // Notification toggles
  const [notifRequests, setNotifRequests] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifPoints, setNotifPoints] = useState(true);
  const [notifNearby, setNotifNearby] = useState(false);

  // Privacy toggles
  const [showReliability, setShowReliability] = useState(true);
  const [showInterests, setShowInterests] = useState(true);
  const [allowCrewInvites, setAllowCrewInvites] = useState(true);

  const handleSaveProfile = () => {
    // In a real app, update via Supabase
    setEditingProfile(false);
    Alert.alert('Saved', 'Profile updated.');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign out?',
      'You can always sign back in.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            // In a real app: supabase.auth.signOut(), then navigate to /welcome
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This is permanent. All your data will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Request submitted', 'Account deletion will be processed within 30 days.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      {/* Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.card}>
          {editingProfile ? (
            <View style={styles.editForm}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Display name</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your name"
                  placeholderTextColor="#4B4E57"
                  maxLength={40}
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell people what you're about..."
                  placeholderTextColor="#4B4E57"
                  maxLength={160}
                  multiline
                  numberOfLines={3}
                />
              </View>
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelEditBtn}
                  onPress={() => setEditingProfile(false)}
                >
                  <Text style={styles.cancelEditText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.profileRow}
              onPress={() => setEditingProfile(true)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileUsername}>@{MOCK_CURRENT_USER.username}</Text>
                {bio ? (
                  <Text style={styles.profileBio} numberOfLines={2}>{bio}</Text>
                ) : (
                  <Text style={styles.profileBioEmpty}>No bio yet — tap to add one</Text>
                )}
              </View>
              <Text style={styles.editChevron}>Edit ›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <ToggleRow
            label="Hangout requests"
            description="When someone sends you a plan"
            value={notifRequests}
            onChange={setNotifRequests}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Messages"
            description="New chat messages"
            value={notifMessages}
            onChange={setNotifMessages}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Points & badges"
            description="HP earned, streaks, achievements"
            value={notifPoints}
            onChange={setNotifPoints}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Nearby alerts"
            description="When friends go available near you"
            value={notifNearby}
            onChange={setNotifNearby}
          />
        </View>

        {/* Privacy */}
        <Text style={styles.sectionLabel}>Privacy</Text>
        <View style={styles.card}>
          <ToggleRow
            label="Show reliability score"
            description="Others can see your show-up rate"
            value={showReliability}
            onChange={setShowReliability}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Show interests"
            description="Display your activity preferences on profile"
            value={showInterests}
            onChange={setShowInterests}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Allow crew invites"
            description="Anyone can invite you to a crew"
            value={allowCrewInvites}
            onChange={setAllowCrewInvites}
          />
        </View>

        {/* Safety */}
        <Text style={styles.sectionLabel}>Safety & Help</Text>
        <View style={styles.card}>
          <LinkRow
            icon="🛡️"
            label="Safety guidelines"
            onPress={() => Alert.alert('Safety', 'Meet in public. Trust your gut. Use the bail button.')}
          />
          <View style={styles.divider} />
          <LinkRow
            icon="🚫"
            label="Blocked users"
            onPress={() => Alert.alert('Blocked users', 'No blocked users yet.')}
          />
          <View style={styles.divider} />
          <LinkRow
            icon="❓"
            label="Help & support"
            onPress={() => Alert.alert('Help', 'Email us at support@hangout.app')}
          />
          <View style={styles.divider} />
          <LinkRow
            icon="📋"
            label="Terms of service"
            onPress={() => Alert.alert('Terms', 'hangout.app/terms')}
          />
          <View style={styles.divider} />
          <LinkRow
            icon="🔒"
            label="Privacy policy"
            onPress={() => Alert.alert('Privacy', 'hangout.app/privacy')}
          />
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <LinkRow
            icon="🔑"
            label="Change password"
            onPress={() => Alert.alert('Password', 'A reset link will be sent to your email.')}
          />
          <View style={styles.divider} />
          <LinkRow
            icon="📧"
            label="Change email"
            onPress={() => Alert.alert('Email', 'Contact support to change your email.')}
          />
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        {/* Delete account */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteText}>Delete account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Hangout v0.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#262A31', true: 'rgba(0,255,133,0.4)' }}
        thumbColor={value ? '#00FF85' : '#A1A1AA'}
      />
    </View>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.linkRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.linkIcon}>{icon}</Text>
      <Text style={styles.linkLabel}>{label}</Text>
      <Text style={styles.linkChevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050505',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#15171C',
  },
  backBtn: {
    width: 40,
    padding: 4,
  },
  backIcon: {
    color: '#F4F4F5',
    fontSize: 28,
    fontWeight: '300',
  },
  navTitle: {
    color: '#F4F4F5',
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    paddingTop: 16,
    paddingBottom: 60,
  },
  sectionLabel: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#101114',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262A31',
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: '#15171C',
    marginLeft: 16,
  },
  // Profile edit
  profileRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    color: '#F4F4F5',
    fontSize: 16,
    fontWeight: '600',
  },
  profileUsername: {
    color: '#A1A1AA',
    fontSize: 13,
    marginTop: 2,
  },
  profileBio: {
    color: '#A1A1AA',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 240,
  },
  profileBioEmpty: {
    color: '#4B4E57',
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  editChevron: {
    color: '#4DA3FF',
    fontSize: 13,
    fontWeight: '500',
  },
  editForm: {
    padding: 16,
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: '#15171C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262A31',
    color: '#F4F4F5',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
    paddingTop: 11,
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelEditBtn: {
    flex: 1,
    backgroundColor: '#15171C',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262A31',
  },
  cancelEditText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#00FF85',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#050505',
    fontSize: 14,
    fontWeight: '700',
  },
  // Toggle rows
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '500',
  },
  toggleDesc: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 2,
  },
  // Link rows
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linkIcon: {
    fontSize: 17,
  },
  linkLabel: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  linkChevron: {
    color: '#A1A1AA',
    fontSize: 18,
  },
  // Account actions
  signOutBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#15171C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262A31',
  },
  signOutText: {
    color: '#FF6B4A',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteText: {
    color: '#4B4E57',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  version: {
    color: '#4B4E57',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
  },
});
