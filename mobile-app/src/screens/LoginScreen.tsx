import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput as PaperTextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

interface LoginScreenProps {
  onLogin: (credentials: { email: string; password: string }) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await onLogin({ email, password });
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const quickLogin = (role: string) => {
    switch (role) {
      case 'admin':
        setEmail('admin@example.com');
        setPassword('admin123');
        break;
      case 'employee':
        setEmail('employee@example.com');
        setPassword('employee123');
        break;
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <LinearGradient
        colors={['#2196F3', '#1976D2', '#0D47A1']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Icon name="office-building" size={80} color="#fff" />
              <Text style={styles.title}>FWC HRMS</Text>
              <Text style={styles.subtitle}>Mobile Employee Portal</Text>
            </View>

            <Card style={styles.loginCard}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.loginTitle}>Welcome Back</Text>
                <Text style={styles.loginSubtitle}>Sign in to your account</Text>

                <View style={styles.inputContainer}>
                  <PaperTextInput
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    left={<PaperTextInput.Icon icon="email" />}
                    style={styles.input}
                  />

                  <PaperTextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    mode="outlined"
                    left={<PaperTextInput.Icon icon="lock" />}
                    right={
                      <PaperTextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    style={styles.input}
                  />

                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.loginButton}
                    contentStyle={styles.buttonContent}
                  >
                    Sign In
                  </Button>
                </View>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Quick Access</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.quickAccessContainer}>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => quickLogin('admin')}
                    activeOpacity={0.7}
                  >
                    <Icon name="shield-crown" size={24} color="#2196F3" />
                    <Text style={styles.quickButtonText}>Admin</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => quickLogin('employee')}
                    activeOpacity={0.7}
                  >
                    <Icon name="account" size={24} color="#2196F3" />
                    <Text style={styles.quickButtonText}>Employee</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Secure • Reliable • Accessible Everywhere
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#BBDEFB',
    marginTop: 8,
    textAlign: 'center',
  },
  loginCard: {
    borderRadius: 16,
    elevation: 8,
    backgroundColor: '#fff',
  },
  cardContent: {
    padding: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  loginButton: {
    borderRadius: 8,
    marginTop: 8,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1E1E1',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  quickButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    minWidth: 80,
  },
  quickButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#BBDEFB',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoginScreen;
