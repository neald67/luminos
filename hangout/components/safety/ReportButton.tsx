import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  Modal,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';

interface ReportButtonProps {
  username: string;
  onReport: (category: string) => void;
}

const REPORT_CATEGORIES = [
  { id: 'spam', label: 'Spam or fake profile' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'harassment', label: 'Harassment or bullying' },
  { id: 'safety', label: 'Safety concern' },
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'other', label: 'Other' },
];

export function ReportButton({ username, onReport }: ReportButtonProps) {
  const [showSheet, setShowSheet] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;
    onReport(selected);
    setSubmitted(true);
    setTimeout(() => {
      setShowSheet(false);
      setSelected(null);
      setSubmitted(false);
    }, 1500);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => setShowSheet(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.btnText}>Report</Text>
      </TouchableOpacity>

      <Modal
        visible={showSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSheet(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setShowSheet(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {submitted ? (
            <View style={styles.successContent}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>Report submitted</Text>
              <Text style={styles.successDesc}>
                Thanks for keeping the community safe. We&apos;ll review this report.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.sheetTitle}>Report @{username}</Text>
              <Text style={styles.sheetSubtitle}>What&apos;s going on?</Text>

              <View style={styles.categories}>
                {REPORT_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      selected === cat.id && styles.categoryItemSelected,
                    ]}
                    onPress={() => setSelected(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.categoryLabel,
                      selected === cat.id && styles.categoryLabelSelected,
                    ]}>
                      {cat.label}
                    </Text>
                    {selected === cat.id && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, !selected && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!selected}
                activeOpacity={0.8}
              >
                <Text style={styles.submitText}>Submit report</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 74, 0.25)',
    backgroundColor: 'transparent',
  },
  btnText: {
    color: '#FF6B4A',
    fontSize: 14,
    fontWeight: '500',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#101114',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#262A31',
    padding: 20,
    paddingBottom: 36,
    gap: 14,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262A31',
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheetTitle: {
    color: '#F4F4F5',
    fontSize: 18,
    fontWeight: '700',
  },
  sheetSubtitle: {
    color: '#A1A1AA',
    fontSize: 14,
    marginTop: -8,
  },
  categories: {
    gap: 6,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#15171C',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#262A31',
  },
  categoryItemSelected: {
    borderColor: '#FF6B4A',
    backgroundColor: 'rgba(255, 107, 74, 0.05)',
  },
  categoryLabel: {
    color: '#F4F4F5',
    fontSize: 14,
  },
  categoryLabelSelected: {
    color: '#FF6B4A',
    fontWeight: '500',
  },
  checkmark: {
    color: '#FF6B4A',
    fontSize: 16,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#FF6B4A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#262A31',
  },
  submitText: {
    color: '#F4F4F5',
    fontSize: 15,
    fontWeight: '700',
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  successIcon: {
    fontSize: 36,
    color: '#00FF85',
  },
  successTitle: {
    color: '#F4F4F5',
    fontSize: 18,
    fontWeight: '700',
  },
  successDesc: {
    color: '#A1A1AA',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
