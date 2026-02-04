import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Colors from '@/constants/Colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
    radius?: number;
    stroke?: number;
    progress: number; // 0 to 1
    target: number;
    current: number;
}

export function ProgressRing({ radius = 100, stroke = 15, progress, target, current }: ProgressRingProps) {
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withTiming(progress, { duration: 1000 });
    }, [progress]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - animatedProgress.value * circumference;
        return {
            strokeDashoffset,
        };
    });

    return (
        <View style={styles.container}>
            <Svg height={radius * 2} width={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
                <G rotation="-90" origin={`${radius}, ${radius}`}>
                    {/* Background Circle */}
                    <Circle
                        cx={radius}
                        cy={radius}
                        r={normalizedRadius}
                        fill="transparent"
                        stroke={Colors.light.border}
                        strokeWidth={stroke}
                    />
                    {/* Progress Circle */}
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
            <View style={styles.innerContent}>
                <Text style={styles.value}>{current}</Text>
                <Text style={styles.label}>
                    Calories Left
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerContent: {
        position: 'absolute',
        alignItems: 'center',
    },
    value: {
        fontSize: 40,
        fontWeight: '800',
        color: Colors.light.text,
    },
    label: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginTop: 4,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});
