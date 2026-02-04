import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Colors from '@/constants/Colors';

export function MobileWrapper({ children }: { children: React.ReactNode }) {
    if (Platform.OS !== 'web') {
        return <>{children}</>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.phoneFrame}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E5E5E5', // Desktop background
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
    },
    phoneFrame: {
        width: 375, // iPhone standard width
        height: 812, // iPhone standard height
        maxHeight: '90%',
        backgroundColor: Colors.light.background,
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 8,
        borderColor: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
});
