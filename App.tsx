import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';

type SecurityTopic = {
  id: string;
  title: string;
  android: string;
  ios: string;
  risk: 'Niski' | 'Srednji' | 'Visoki';
};

const topics: SecurityTopic[] = [
  {
    id: 'permissions',
    title: 'Dozvole aplikacija',
    android:
      'Android je fleksibilniji; korisnik može dati dozvole tijekom korištenja ili ih kasnije uskratiti.',
    ios: 'iOS prikazuje prompte u moment potrebe; jednom odbijene, korisnik mora ići u Postavke.',
    risk: 'Srednji',
  },
  {
    id: 'storage',
    title: 'Pohrana podataka',
    android:
      'App ima pristup vanjskoj pohrani; potrebna je validacija i zaštita od pristupa drugih app-a.',
    ios: 'ICloud backup i lokalna pohrana su enkriptirani; pristup je stroži.',
    risk: 'Visoki',
  },
  {
    id: 'auth',
    title: 'Autentifikacija',
    android: 'Biometrijska autentifikacija je dostupna ali se koristi različitim API-jima.',
    ios: 'Face ID i Touch ID su ugrađeni i konzistentni; Keychain enkriptira kredencijale.',
    risk: 'Srednji',
  },
];

const quizItems = [
  {
    question: 'Koja platforma ima stroži pristup dozvolama?',
    options: ['Android', 'iOS', 'Obje podjednako'],
    answer: 1,
    explanation:
      'iOS prikazuje prompte centralizirano, a odbijene dozvole zahtijevaju ručnu promjenu u Postavkama.',
  },
  {
    question: 'Gdje se na iOS-u čuvaju lozinke?',
    options: ['SharedPreferences', 'Keychain', 'UserDefaults'],
    answer: 1,
    explanation: 'iOS Keychain je bezbedan prostor za osjetljive podatke, enkriptiran i zaštićen.',
  },
];

export default function App() {
  const scrollRef = useRef<ScrollView | null>(null);
  const { width } = useWindowDimensions();
  const [positions, setPositions] = useState<{ [key: string]: number }>({});
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();

  useEffect(() => {
    if (!cameraPermission?.granted) requestCameraPermission();
    if (!microphonePermission?.granted) requestMicrophonePermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSectionLayout = (key: string) => (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    setPositions((p) => ({ ...p, [key]: y }));
  };

  const scrollTo = (key: string) => {
    const y = positions[key] ?? 0;
    scrollRef.current?.scrollTo({ y, animated: true });
    setActiveTab(key);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Niski':
        return '#5DE1B9';
      case 'Srednji':
        return '#FFB36A';
      case 'Visoki':
        return '#FF6B6B';
      default:
        return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sigurnost Mobilnih Aplikacija</Text>
        <Text style={styles.subtitle}>Android vs iOS</Text>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => scrollTo('overview')}
        >
          <Text
            style={[styles.tabText, activeTab === 'overview' && styles.tabActiveText]}
          >
            Pregled
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'topics' && styles.tabActive]}
          onPress={() => scrollTo('topics')}
        >
          <Text
            style={[styles.tabText, activeTab === 'topics' && styles.tabActiveText]}
          >
            Teme
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'quiz' && styles.tabActive]}
          onPress={() => scrollTo('quiz')}
        >
          <Text
            style={[styles.tabText, activeTab === 'quiz' && styles.tabActiveText]}
          >
            Kviz
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const entries = Object.entries(positions);
          if (entries.length === 0) return;
          let nearest = entries[0][0];
          let minDiff = Math.abs(y - entries[0][1]);
          for (let i = 1; i < entries.length; i++) {
            const diff = Math.abs(y - entries[i][1]);
            if (diff < minDiff) {
              minDiff = diff;
              nearest = entries[i][0];
            }
          }
          setActiveTab(nearest);
        }}
        scrollEventThrottle={16}
      >
        <View onLayout={onSectionLayout('overview')} style={styles.section}>
          <Text style={styles.sectionTitle}>Pregled</Text>
          <Text style={styles.description}>
            Otkrij razlike u pristupima sigurnosti između Android-a i iOS-a. Testiraj
            dozvole za kameru i mikrofon.
          </Text>

          <View style={styles.permissionCard}>
            <Text style={styles.permissionLabel}>📷 Kamera</Text>
            <Text
              style={[
                styles.permissionStatus,
                cameraPermission?.granted
                  ? styles.permissionGranted
                  : styles.permissionDenied,
              ]}
            >
              {cameraPermission?.granted ? '✓ Dopušteno' : '✗ Odbijeno'}
            </Text>
          </View>

          <View style={styles.permissionCard}>
            <Text style={styles.permissionLabel}>🎤 Mikrofon</Text>
            <Text
              style={[
                styles.permissionStatus,
                microphonePermission?.granted
                  ? styles.permissionGranted
                  : styles.permissionDenied,
              ]}
            >
              {microphonePermission?.granted ? '✓ Dopušteno' : '✗ Odbijeno'}
            </Text>
          </View>

          <Pressable
            style={styles.button}
            onPress={() => {
              requestCameraPermission();
              requestMicrophonePermission();
            }}
          >
            <Text style={styles.buttonText}>🔐 Traži dozvole</Text>
          </Pressable>
        </View>

        <View onLayout={onSectionLayout('topics')} style={styles.section}>
          <Text style={styles.sectionTitle}>Sigurnosne teme</Text>
          {topics.map((topic) => (
            <View key={topic.id} style={styles.topicCard}>
              <View style={styles.topicHeader}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <View
                  style={[
                    styles.riskBadge,
                    { backgroundColor: getRiskColor(topic.risk) },
                  ]}
                >
                  <Text style={styles.riskText}>{topic.risk}</Text>
                </View>
              </View>
              <View style={styles.platformRow}>
                <View style={styles.platformBlock}>
                  <Text style={styles.platformLabel}>🤖 Android</Text>
                  <Text style={styles.platformText}>{topic.android}</Text>
                </View>
                <View style={styles.platformBlock}>
                  <Text style={styles.platformLabel}>🍎 iOS</Text>
                  <Text style={styles.platformText}>{topic.ios}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View onLayout={onSectionLayout('quiz')} style={styles.section}>
          <Text style={styles.sectionTitle}>Kviz</Text>
          {quizItems.map((item, idx) => (
            <View key={idx} style={styles.quizCard}>
              <Text style={styles.quizQuestion}>{item.question}</Text>
              <View style={styles.optionsContainer}>
                {item.options.map((option, optIdx) => (
                  <Pressable
                    key={optIdx}
                    style={[
                      styles.quizOption,
                      quizAnswers[idx] === optIdx && styles.quizOptionSelected,
                    ]}
                    onPress={() =>
                      setQuizAnswers((a) => ({ ...a, [idx]: optIdx }))
                    }
                  >
                    <Text
                      style={[
                        styles.quizOptionText,
                        quizAnswers[idx] === optIdx && styles.quizOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {quizAnswers[idx] !== undefined && (
                <View
                  style={[
                    styles.explanation,
                    quizAnswers[idx] === item.answer
                      ? styles.explanationCorrect
                      : styles.explanationWrong,
                  ]}
                >
                  <Text
                    style={[
                      styles.explanationText,
                      quizAnswers[idx] === item.answer
                        ? { color: '#5DE1B9' }
                        : { color: '#FF6B6B' },
                    ]}
                  >
                    {quizAnswers[idx] === item.answer ? '✓ Točno!' : '✗ Pogrešno'}
                  </Text>
                  <Text style={styles.explanationDetail}>{item.explanation}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1419' },
  header: {
    backgroundColor: '#1A1E27',
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#AAA' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1A1E27',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2E37',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#007AFF' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#AAA' },
  tabActiveText: { color: '#007AFF', fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 12 },
  description: {
    fontSize: 14,
    color: '#BBB',
    marginBottom: 16,
    lineHeight: 20,
  },
  permissionCard: {
    backgroundColor: '#1A1E27',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionLabel: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  permissionStatus: { fontSize: 12, fontWeight: '700' },
  permissionGranted: { color: '#5DE1B9' },
  permissionDenied: { color: '#FF6B6B' },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  topicCard: {
    backgroundColor: '#1A1E27',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  riskText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  platformRow: { flexDirection: 'row', gap: 8 },
  platformBlock: { flex: 1, backgroundColor: '#252A33', padding: 10, borderRadius: 6 },
  platformLabel: { fontSize: 13, fontWeight: '700', color: '#FFF', marginBottom: 6 },
  platformText: { fontSize: 12, color: '#CCC', lineHeight: 18 },
  quizCard: {
    backgroundColor: '#1A1E27',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  quizQuestion: { fontSize: 15, fontWeight: '700', color: '#FFF', marginBottom: 12 },
  optionsContainer: { gap: 8, marginBottom: 12 },
  quizOption: {
    backgroundColor: '#252A33',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2A2E37',
  },
  quizOptionSelected: { backgroundColor: '#007AFF', borderColor: '#0056CC' },
  quizOptionText: { color: '#AAA', fontWeight: '600', fontSize: 13 },
  quizOptionTextSelected: { color: '#FFF' },
  explanation: { padding: 10, borderRadius: 6, marginTop: 8 },
  explanationCorrect: {
    backgroundColor: '#1A3A2A',
    borderLeftWidth: 3,
    borderLeftColor: '#5DE1B9',
  },
  explanationWrong: {
    backgroundColor: '#3A1A1A',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  explanationText: { fontWeight: '700', fontSize: 13, marginBottom: 4 },
  explanationDetail: { fontSize: 12, color: '#CCC', lineHeight: 18 },
});
