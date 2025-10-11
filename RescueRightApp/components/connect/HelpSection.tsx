import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HelpCircle } from 'lucide-react-native';
import { theme } from '../../styles/theme';

interface HelpSectionProps {
  onTroubleshooting?: () => void;
}

export function HelpSection({ onTroubleshooting }: HelpSectionProps) {
  return (
    <View style={styles.container}>
      <HelpCircle size={16} color="#9CA3AF" />
      <Text style={styles.helpText}>Can't find your vest?</Text>
      <TouchableOpacity onPress={onTroubleshooting} className="active:scale-95">
        <Text style={styles.linkText}>Troubleshooting Guide</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
  },
  helpText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
});