import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HelpCircle } from 'lucide-react-native';
import { theme } from '../../styles/theme';

interface PairingNavigationProps {
  onBack?: () => void;
  onHelp?: () => void;
}

export function PairingNavigation({ onBack, onHelp }: PairingNavigationProps) {
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

        {/* Help Button */}
        <TouchableOpacity
          onPress={onHelp}
          style={styles.helpButton}
          activeOpacity={0.7}
        >
          <HelpCircle size={24} strokeWidth={1.5} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
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