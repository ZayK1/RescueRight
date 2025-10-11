import { View, Text } from 'react-native';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { theme } from '../styles/theme';

export default function AnalyticsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <Text style={theme.typography.h1}>Session Analytics</Text>
      <Text style={theme.typography.body}>Performance metrics will go here</Text>

      {/* Dev Bypass Button */}
      <DevBypassButton nextScreen="index" />
    </View>
  );
}
