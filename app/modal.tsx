import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';

interface SecurityRecommendation {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

export default function ModalScreen() {
  const recommendations: SecurityRecommendation[] = [
    {
      icon: 'shield-checkmark',
      title: 'Usa Mayúsculas y Minúsculas',
      description: 'Combinar letras mayúsculas (A-Z) y minúsculas (a-z) aumenta exponencialmente las posibilidades, haciendo que tu contraseña sea mucho más difícil de descifrar.',
      color: '#4CAF50',
    },
    {
      icon: 'calculator',
      title: 'Incluye Números',
      description: 'Los números (0-9) añaden complejidad a tu contraseña. Una mezcla de letras y números crea patrones impredecibles para los atacantes.',
      color: '#2196F3',
    },
    {
      icon: 'at',
      title: 'Añade Símbolos Especiales',
      description: 'Los símbolos como !@#$%^&*() hacen que tu contraseña sea prácticamente imposible de adivinar y resisten mejor los ataques de fuerza bruta.',
      color: '#FF9800',
    },
    {
      icon: 'resize',
      title: 'Mínimo 12 Caracteres',
      description: 'La longitud es crucial. Una contraseña de 12+ caracteres con variedad de tipos puede tardar millones de años en ser crackeada.',
      color: '#9C27B0',
    },
    {
      icon: 'refresh',
      title: 'Contraseñas Únicas',
      description: 'Nunca reutilices contraseñas entre diferentes sitios web o aplicaciones. Cada cuenta debe tener su propia contraseña única.',
      color: '#607D8B',
    },
    {
      icon: 'eye-off',
      title: 'Mantén la Privacidad',
      description: 'Nunca compartas tus contraseñas, evita escribirlas en lugares visibles y usa gestores de contraseñas confiables.',
      color: '#F44336',
    },
    {
      icon: 'phone-portrait',
      title: 'Activa 2FA',
      description: 'La autenticación de dos factores añade una capa extra de seguridad. Aunque alguien obtenga tu contraseña, necesitará acceso a tu dispositivo.',
      color: '#00BCD4',
    },
    {
      icon: 'time',
      title: 'Actualízalas Regularmente',
      description: 'Cambia tus contraseñas importantes cada 3-6 meses, especialmente para cuentas financieras y de trabajo.',
      color: '#795548',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Ionicons name="information-circle" size={50} color="#007AFF" />
        <Text style={styles.title}>¿Por qué usar contraseñas seguras?</Text>
        <Text style={styles.subtitle}>
          Protege tus cuentas siguiendo estas recomendaciones de seguridad
        </Text>
      </View>

      <View style={styles.recommendationsContainer}>
        {recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Ionicons 
                name={recommendation.icon} 
                size={24} 
                color={recommendation.color} 
              />
              <Text style={styles.recommendationTitle}>
                {recommendation.title}
              </Text>
            </View>
            <Text style={styles.recommendationDescription}>
              {recommendation.description}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.statisticsSection}>
        <Text style={styles.statisticsTitle}>💡 Datos Importantes:</Text>
        
        <View style={styles.statisticCard}>
          <Text style={styles.statisticText}>
            <Text style={styles.statisticNumber}>81%</Text> de las violaciones de datos son causadas por contraseñas débiles o robadas.
          </Text>
        </View>

        <View style={styles.statisticCard}>
          <Text style={styles.statisticText}>
            Una contraseña de <Text style={styles.statisticNumber}>8 caracteres</Text> puede ser crackeada en minutos, mientras que una de <Text style={styles.statisticNumber}>12 caracteres</Text> puede tardar millones de años.
          </Text>
        </View>

        <View style={styles.statisticCard}>
          <Text style={styles.statisticText}>
            <Text style={styles.statisticNumber}>23.2 millones</Text> de personas usan "123456" como contraseña. ¡No seas una de ellas!
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        <Text style={styles.footerText}>
          Usa nuestro generador para crear contraseñas que cumplan con todos estos criterios de seguridad
        </Text>
      </View>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  recommendationsContainer: {
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  recommendationDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginLeft: 36,
  },
  statisticsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statisticsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  statisticCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statisticText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    textAlign: 'center',
  },
  statisticNumber: {
    fontWeight: 'bold',
    color: '#007AFF',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  footerText: {
    flex: 1,
    fontSize: 15,
    color: '#2e7d32',
    marginLeft: 12,
    lineHeight: 20,
    fontWeight: '500',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
