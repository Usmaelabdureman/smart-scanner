import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import {
    Image,
    type ImageSourcePropType,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
    useColorScheme,
} from 'react-native';
import { colors } from '../constants/colors';

interface SocialLink {
  icon: keyof typeof Ionicons.glyphMap;
  url: string;
}

interface DeveloperCardProps {
  name: string;
  role: string;
  avatarText?: string;
  avatarImage?: ImageSourcePropType;
  socials?: SocialLink[];
}

export function DeveloperCard({ name, role, avatarText = 'DEV', avatarImage, socials = [] }: DeveloperCardProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const handleLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.containerWrapper}>
      <BlurView
        intensity={60}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.container,
          {
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.4)',
            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)',
          },
        ]}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.accent, overflow: 'hidden' }]}>
            {avatarImage ? (
              <Image source={avatarImage} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={styles.avatarText}>{avatarText}</Text>
            )}
          </View>
          <View>
            <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
            <Text style={[styles.role, { color: theme.mutedText }]}>{role}</Text>
          </View>
        </View>

        {socials.length > 0 && (
          <View style={styles.socialsRow}>
            {socials.map((social, index) => (
              <Pressable
                key={index}
                onPress={() => handleLink(social.url)}
                style={({ pressed }) => [
                  styles.socialButton,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' },
                  pressed && { opacity: 0.7 },
                ]}>
                <Ionicons name={social.icon} size={20} color={theme.text} />
              </Pressable>
            ))}
          </View>
        )}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    marginTop: 'auto',
    borderRadius: 16,
    overflow: 'hidden',
  },
  container: {
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  role: {
    fontSize: 13,
  },
  socialsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
