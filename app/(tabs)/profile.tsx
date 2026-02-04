import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, ChevronRight, Target, Award } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Sparkline } from '@/components/ui/Sparkline';

import { useUser } from '@/context/UserDataContext';

export default function ProfileScreen() {
    const { userData } = useUser();
    const router = useRouter();
    const [units, setUnits] = useState<'kg' | 'lbs'>('kg');

    const weightDisplay = units === 'kg'
        ? userData.weight || '-'
        : Math.round((parseInt(userData.weight || '0') * 2.20462)).toString();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <User size={40} color={Colors.light.primary} />
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.name}>{userData.name || 'User'}</Text>
                        <Text style={styles.email}>{userData.email || 'no email set'}</Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <Card style={styles.statCard}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                            <View>
                                <Text style={styles.statValue}>{weightDisplay}</Text>
                                <Text style={styles.statLabel}>{units === 'kg' ? 'kg' : 'lbs'}</Text>
                            </View>
                            <Sparkline data={[74.5, 74.2, 74.0, 73.8, 74.1, 73.9, 74.0]} width={60} height={30} color={Colors.light.primary} />
                        </View>
                    </Card>
                </View>

                {/* Settings Sections */}
                <Section title="Goals">
                    <SettingItem icon={Target} label="Daily Calories" value={userData.goalCalories} />
                    <SettingItem icon={Award} label="Macro Split" value={`${userData.macroSplit.protein}/${userData.macroSplit.carbs}/${userData.macroSplit.fats}`} />
                </Section>

                <Section title="Account">
                    <SettingItem icon={Settings} label="App Settings" onPress={() => router.push('/appSettings')} />
                    <SettingItem icon={User} label="Edit Profile" onPress={() => router.push('/editProfile')} />
                </Section>

            </ScrollView>
        </SafeAreaView>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Card style={styles.sectionCard}>
                {children}
            </Card>
        </View>
    );
}

function SettingItem({ icon: Icon, label, value, onPress }: { icon: any, label: string, value?: string, onPress?: () => void }) {
    return (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingLeft}>
                <View style={styles.iconBox}>
                    <Icon size={20} color={Colors.light.text} />
                </View>
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            <View style={styles.settingRight}>
                {value && <Text style={styles.settingValue}>{value}</Text>}
                <ChevronRight size={20} color={Colors.light.textSecondary} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    unitToggle: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    unitText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.light.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    email: {
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
    },
    statCard: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.primary,
    },
    statLabel: {
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.textSecondary,
        marginBottom: 10,
        marginLeft: 5,
        textTransform: 'uppercase',
    },
    sectionCard: {
        padding: 0,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        color: Colors.light.text,
        fontWeight: '500',
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    settingValue: {
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
});
