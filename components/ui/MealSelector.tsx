import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import Colors from '@/constants/Colors';
import { BlurView } from 'expo-blur'; // varied based on usage, but simple View with opacity works too

interface MealSelectorProps {
    visible: boolean;
    onSelect: (type: string) => void;
    onClose: () => void;
}

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function MealSelector({ visible, onSelect, onClose }: MealSelectorProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.content}>
                            <Text style={styles.title}>Select Meal</Text>
                            <Text style={styles.subtitle}>Where should we log this?</Text>

                            <View style={styles.grid}>
                                {MEALS.map((meal) => (
                                    <TouchableOpacity
                                        key={meal}
                                        style={styles.option}
                                        onPress={() => onSelect(meal)}
                                    >
                                        <Text style={styles.optionText}>{meal}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        backgroundColor: Colors.light.surface,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.light.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 24,
    },
    grid: {
        width: '100%',
        gap: 12,
        marginBottom: 20,
    },
    option: {
        backgroundColor: Colors.light.background,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F2F2F7',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.text,
    },
    cancelButton: {
        padding: 12,
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.textSecondary,
    },
});
