import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MemoryMatchCard = ({ card, onPress }) => {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: card.flipped || card.matched ? 180 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [card.flipped, card.matched]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontInterpolate }] }]}>
          <Text style={styles.cardText}>❓</Text>
        </Animated.View>
        <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
          <Text style={styles.cardText}>{card.value}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: { width: 70, height: 70, margin: 10 },
  card: { width: 70, height: 70, borderRadius: 10, justifyContent: "center", alignItems: "center", position: "absolute", backfaceVisibility: "hidden" },
  cardFront: { backgroundColor: "#a29bfe" },
  cardBack: { backgroundColor: "#fdcb6e" },
  cardText: { fontSize: 30 },
});

export default MemoryMatchCard;