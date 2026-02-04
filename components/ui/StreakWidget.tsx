import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Flame } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export function StreakWidget({ days = 12 }: { days?: number }) {
    return (
        <View style={styles.container}>
            <Flame size={20} color={Colors.light.secondary} fill={Colors.light.secondary} />
            <Text style={styles.text}>{days}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF7ED', // Orange tint
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFEDD5',
    },
    text: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.secondary,
    },
});
