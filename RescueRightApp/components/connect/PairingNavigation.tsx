import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HelpCircle, ArrowRight } from 'lucide-react-native';
import { theme } from '../../styles/theme';

interface PairingNavigationProps {
  onBack?: () => void;
  onHelp?: () => void;
  showBypass?: boolean;
  onBypass?: () => void;
}

export function PairingNavigation({ onBack, onHelp, showBypass, onBypass }: PairingNavigationProps) {
  const shouldShowBypass = showBypass && __DEV__;

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        {/* Empty center for clean layout */}
        <View />

        {/* Help or Bypass Button */}
        {shouldShowBypass ? (
          <TouchableOpacity
            onPress={onBypass}
            style={styles.helpButton}
            activeOpacity={0.7}
          >
            <ArrowRight size={24} strokeWidth={1.5} color={theme.colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onHelp}
            style={styles.helpButton}
            activeOpacity={0.7}
          >
            <HelpCircle size={24} strokeWidth={1.5} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    paddingTop: 59, // Approximation for safe area
    height: 103,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 44,
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: 17,
  },
  helpButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
