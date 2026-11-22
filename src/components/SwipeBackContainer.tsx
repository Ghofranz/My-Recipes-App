/**
 * SwipeBackContainer.tsx
 * Conteneur activant le geste natif iOS de retour par balayage
 * depuis le bord gauche de l'écran vers la droite.
 *
 * Caractéristiques :
 * - Détecte uniquement les gestes initiés sur le bord gauche (EDGE_WIDTH <= 35px)
 *   pour laisser le défilement vertical et horizontal du contenu fonctionner librement.
 * - Coulissement fluide de l'écran avec ombre portée et voile d'arrière-plan simulant iOS.
 * - Prise en charge d'un intercepteur `beforeBack` pour confirmer l'abandon (ex. formulaire non enregistré).
 */

import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

const EDGE_WIDTH = 35; // Zone active du bord gauche (standard iOS)
const VELOCITY_THRESHOLD = 0.45; // Vitesse minimale pour valider un balayage rapide

interface SwipeBackContainerProps {
  children: React.ReactNode;
  onBack: () => void;
  /**
   * Fonction facultative appelée avant le retour.
   * Doit retourner false pour interrompre le retour (ex: affichage d'une alerte de confirmation).
   */
  beforeBack?: () => boolean;
  enabled?: boolean;
}

export function SwipeBackContainer({
  children,
  onBack,
  beforeBack,
  enabled = true,
}: SwipeBackContainerProps) {
  const { width: screenWidth } = useWindowDimensions();

  const translateX = useRef(new Animated.Value(0)).current;

  // Références stables pour éviter les fermetures obsolètes dans PanResponder
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  const beforeBackRef = useRef(beforeBack);
  beforeBackRef.current = beforeBack;

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const screenWidthRef = useRef(screenWidth);
  screenWidthRef.current = screenWidth;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (!enabledRef.current) return false;

        // Le contact initial DOIT se trouver sur le bord gauche (x0 <= EDGE_WIDTH)
        const startX = gestureState.x0;
        if (startX > EDGE_WIDTH) {
          return false;
        }

        // Le geste doit être un déplacement horizontal vers la droite suffisant
        // et prédominant par rapport au déplacement vertical (pour ne pas bloquer le scroll)
        const isHorizontalRightSwipe =
          gestureState.dx > 10 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.4;

        return isHorizontalRightSwipe;
      },
      onPanResponderGrant: () => {
        // Début du geste
      },
      onPanResponderMove: (evt, gestureState) => {
        // Empêche de glisser vers la gauche (valeurs négatives)
        if (gestureState.dx >= 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const width = screenWidthRef.current;
        const threshold = width * 0.35; // 35 % de l'écran pour valider

        const shouldDismiss =
          gestureState.dx > threshold ||
          (gestureState.dx > 40 && gestureState.vx > VELOCITY_THRESHOLD);

        if (shouldDismiss) {
          // Si une fonction d'interception est fournie et refuse le retour (ex: dialogue d'abandon)
          if (beforeBackRef.current && !beforeBackRef.current()) {
            Animated.spring(translateX, {
              toValue: 0,
              bounciness: 0,
              useNativeDriver: true,
            }).start();
            return;
          }

          // Animation de sortie vers la droite
          Animated.timing(translateX, {
            toValue: width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onBackRef.current();
          });
        } else {
          // Annulation : retour à la position initiale
          Animated.spring(translateX, {
            toValue: 0,
            bounciness: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          bounciness: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Voile assombri simulant la profondeur iOS */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.scrim,
          {
            opacity: translateX.interpolate({
              inputRange: [0, screenWidth],
              outputRange: [0.25, 0],
              extrapolate: 'clamp',
            }),
          },
        ]}
      />

      {/* Contenu animé */}
      <Animated.View
        style={[
          styles.animatedContent,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
  },
  animatedContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
});
