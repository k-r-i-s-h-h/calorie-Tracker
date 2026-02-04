import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell, Scale, Moon, Trash2, Info } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export default function AppSettingsScreen() {
    const router = useRouter();

    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [useMetric, setUseMetric] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'This will delete all your logged meals. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Success', 'Data cleared!');
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>App Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PREFERENCES</Text>

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Bell size={20} color={Colors.light.accent} />
                            <Text style={styles.settingLabel}>Notifications</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: '#E5E5EA', true: Colors.light.accent }}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Scale size={20} color={Colors.light.accent} />
                            <Text style={styles.settingLabel}>Use Metric (kg/cm)</Text>
                        </View>
                        <Switch
                            value={useMetric}
                            onValueChange={setUseMetric}
                            trackColor={{ false: '#E5E5EA', true: Colors.light.accent }}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Moon size={20} color={Colors.light.accent} />
                            <Text style={styles.settingLabel}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: '#E5E5EA', true: Colors.light.accent }}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DATA</Text>

                    <TouchableOpacity style={styles.settingRow} onPress={handleClearData}>
                        <View style={styles.settingLeft}>
                            <Trash2 size={20} color="#FF3B30" />
                            <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>Clear All Data</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ABOUT</Text>

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Info size={20} color={Colors.light.textSecondary} />
                            <Text style={styles.settingLabel}>Version</Text>
                        </View>
                        <Text style={styles.settingValue}>1.0.0</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.light.textSecondary,
        marginLeft: 16,
        marginBottom: 8,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingLabel: {
        fontSize: 16,
        color: Colors.light.text,
    },
    settingValue: {
        fontSize: 16,
        color: Colors.light.textSecondary,
    },
});
