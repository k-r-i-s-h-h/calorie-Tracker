import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, useDerivedValue, runOnJS, useAnimatedProps, interpolateColor } from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { ChevronRight, Plus } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Suggestion {
    name: string;
    calories: number;
}

export interface CalorieTrackerCardProps {
    title: string;
    subtitle: string;
    currentCalories: number;
    goalCalories: number;
    suggestions: Suggestion[];
    onRecord?: () => void;
    onQuickAdd?: (item: Suggestion) => void;
    style?: any;
}

const AnimatedText = ({ value }: { value: Animated.SharedValue<number> }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useDerivedValue(() => {
        runOnJS(setDisplayValue)(Math.round(value.value));
    });

    return <Text style={styles.calsValue}>{displayValue}</Text>;
}

export function CalorieTrackerCard({
    title,
    subtitle,
    currentCalories,
    goalCalories,
    suggestions,
    onRecord,
    onQuickAdd,
    style,
}: CalorieTrackerCardProps) {
    const progress = Math.min(currentCalories / goalCalories, 1);

    // Animation Values
    const animatedCalories = useSharedValue(0);
    const animatedProgress = useSharedValue(0);
    const buttonScale = useSharedValue(1);

    const radius = 72; // Reduced size
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    useEffect(() => {
        animatedCalories.value = withSpring(currentCalories, { damping: 20, stiffness: 90 });
        animatedProgress.value = withTiming(progress, { duration: 1500 });
    }, [currentCalories, progress]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - animatedProgress.value * circumference;
        return {
            strokeDashoffset,
        };
    });

    const handlePressIn = () => {
        buttonScale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        buttonScale.value = withSpring(1);
    };

    const handleRecord = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onRecord?.();
    };

    const handleQuickAdd = (item: Suggestion) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onQuickAdd?.(item);
    };

    const buttonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }]
    }));

    return (
        <View style={[styles.card, style]}>
            <View style={styles.mainContent}>
                {/* Circular Progress */}
                <View style={styles.ringContainer}>
                    <Svg height={radius * 2} width={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
                        <G rotation="-90" origin={`${radius}, ${radius}`}>
                            <Circle
                                cx={radius}
                                cy={radius}
                                r={normalizedRadius}
                                fill="transparent"
                                stroke={Colors.light.border}
                                strokeWidth={stroke}
                            />
                            <AnimatedCircle
                                cx={radius}
                                cy={radius}
                                r={normalizedRadius}
                                fill="transparent"
                                stroke={Colors.light.primary}
                                strokeWidth={stroke}
                                strokeDasharray={circumference}
                                animatedProps={animatedProps}
                                strokeLinecap="round"
                            />
                        </G>
                    </Svg>
                    <View style={styles.ringInner}>
                        <AnimatedText value={animatedCalories} />
                        <Text style={styles.calsLabel}>Kcal Left</Text>
                    </View>
                </View>

                {/* Info Side */}
                <View style={styles.infoContainer}>
                    <View>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>Consumed Today</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statVal}>{goalCalories}</Text>
                            <Text style={styles.statLabel}>Goal</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statVal}>{goalCalories - currentCalories}</Text>
                            <Text style={styles.statLabel}>Left</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Suggestions Divider */}
            <View style={styles.divider} />

            {/* Suggestions */}
            <Text style={styles.sectionTitle}>Quick Eat</Text>
            <View style={styles.list}>
                {suggestions.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.listItem}
                        onPress={() => handleQuickAdd(item)}
                    >
                        <View style={styles.dot} />
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemCals}>{item.calories}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Action Button */}
            <Animated.View style={buttonStyle}>
                <TouchableOpacity
                    onPress={handleRecord}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={styles.button}
                    activeOpacity={0.8}
                >
                    <Plus size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.buttonText}>Record Meal</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 10,
        width: '100%',
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 24,
    },
    ringContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringInner: {
        position: 'absolute',
        alignItems: 'center',
    },
    calsValue: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.light.text,
        letterSpacing: -1,
    },
    calsLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.textSecondary,
        textTransform: 'uppercase',
        marginTop: 4,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 8,
        height: 144,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.light.text,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingRight: 4,
    },
    stat: {
        gap: 2,
    },
    statVal: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.light.text,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.light.border,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.light.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    list: {
        gap: 14,
        marginBottom: 24,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.light.primary,
    },
    itemName: {
        fontSize: 14,
        color: Colors.light.text,
        flex: 1,
        fontWeight: '500',
    },
    itemCals: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.textSecondary,
    },
    button: {
        backgroundColor: Colors.light.text,
        paddingVertical: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        width: '100%',
        shadowColor: Colors.light.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
