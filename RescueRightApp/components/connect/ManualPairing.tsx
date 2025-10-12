import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { theme } from '../../styles/theme';

interface ManualPairingProps {
  onManualPairing?: () => void;
}

export function ManualPairing({ onManualPairing }: ManualPairingProps) {
  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Manual Connect Button */}
      <TouchableOpacity
        onPress={onManualPairing}
        style={styles.button}
        activeOpacity={0.7}
      >
        <Search size={20} strokeWidth={2.5} color={theme.colors.primary} />
        <Text style={styles.buttonText}>Enter Pairing Code Manually</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 361,
    alignSelf: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});