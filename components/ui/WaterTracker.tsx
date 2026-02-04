import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Droplet } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Card } from '@/components/ui/Card';

export function WaterTracker() {
    const [glasses, setGlasses] = useState(3);
    const target = 8;

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Water Tracker</Text>
                <Text style={styles.count}>{glasses}/{target} glasses</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.glassesContainer}>
                {Array.from({ length: target }).map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setGlasses(index + 1)}
                        style={[
                            styles.glass,
                            index < glasses && styles.glassFilled
                        ]}
                    >
                        <Droplet
                            size={16}
                            color={index < glasses ? '#FFF' : Colors.light.secondary}
                            fill={index < glasses ? '#FFF' : 'none'}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 20,
        borderRadius: 20, // More rounded like iOS widgets
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.text,
    },
    count: {
        fontSize: 14,
        color: Colors.light.primary,
        fontWeight: '600',
    },
    glassesContainer: {
        gap: 12,
    },
    glass: {
        width: 36,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    glassFilled: {
        backgroundColor: '#60A5FA', // Water Blue
        borderColor: '#60A5FA',
        shadowColor: '#60A5FA',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
