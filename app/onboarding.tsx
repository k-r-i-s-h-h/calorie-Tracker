import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Check } from 'lucide-react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { MobileWrapper } from '@/components/MobileWrapper';
import { useUser } from '@/context/UserDataContext';

const { width } = Dimensions.get('window');

const STEPS = ['Welcome', 'Basics', 'Stats', 'Goals'];

export default function OnboardingScreen() {
    const router = useRouter();
    const { updateUserData, completeOnboarding } = useUser();
    const [step, setStep] = useState(0);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');

    // Stats State
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

    const [height, setHeight] = useState(''); // cm
    const [heightFt, setHeightFt] = useState('');
    const [heightIn, setHeightIn] = useState('');

    const [weight, setWeight] = useState(''); // kg or lbs depending on toggle

    const [goalCalories, setGoalCalories] = useState('2000');
    const [proteinSplit, setProteinSplit] = useState('30');
    const [carbsSplit, setCarbsSplit] = useState('40');
    const [fatsSplit, setFatsSplit] = useState('30');

    // Calculate Calories when entering Goal Step
    const calculateRecommendedCalories = () => {
        // Normalize to Metric for calculation (Mifflin-St Jeor)
        let weightKg = parseFloat(weight);
        if (weightUnit === 'lbs') {
            weightKg = weightKg * 0.453592;
        }

        let heightCm = parseFloat(height);
        if (heightUnit === 'ft') {
            heightCm = (parseFloat(heightFt) * 30.48) + (parseFloat(heightIn || '0') * 2.54);
        }

        const ageNum = parseFloat(age);
        if (!weightKg || !heightCm || !ageNum) return;

        // BMR Calculation
        let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageNum);
        if (gender === 'Male') bmr += 5;
        else if (gender === 'Female') bmr -= 161;

        // TDEE (assuming Sedentary/Lightly Active for MVP default -> 1.25)
        const tdee = Math.round(bmr * 1.375); // Moderate activity as a nicer baseline
        setGoalCalories(tdee.toString());
    };

    const nextStep = () => {
        if (step === 2) {
            calculateRecommendedCalories();
        }

        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            finishOnboarding();
        }
    };

    const finishOnboarding = () => {
        // Normalize height/weight for storage if needed, or store units. 
        // For simplicity, let's store standardized strings but maybe we should allow the app to be unit-aware later.
        // Current Context expects simple strings. I'll store the values as entered but I should probably store units too.
        // Since I can't easily change the Context interface right now without touching other files, 
        // I will store normalized Metric values for consistency in the backend/logic, 
        // but that might confuse the user if they see converted values.
        // Let's store normalized Metric (KG/CM) because the Profile Screen handles conversion for display.

        let finalWeight = weight;
        if (weightUnit === 'lbs') {
            finalWeight = (parseFloat(weight) * 0.453592).toFixed(1);
        }

        let finalHeight = height;
        if (heightUnit === 'ft') {
            finalHeight = ((parseFloat(heightFt) * 30.48) + (parseFloat(heightIn || '0') * 2.54)).toFixed(1);
        }

        updateUserData({
            name,
            age,
            height: finalHeight,
            weight: finalWeight,
            gender,
            goalCalories,
            macroSplit: {
                protein: proteinSplit,
                carbs: carbsSplit,
                fats: fatsSplit
            }
        });
        completeOnboarding();
        router.replace('/(tabs)');
    };

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <View style={styles.stepContainer}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.emoji}>✨</Text>
                        </View>
                        <Text style={styles.title}>Welcome to your AI Health Journey</Text>
                        <Text style={styles.subtitle}>Let's personalize your experience to help you reach your goals optimally.</Text>
                    </View>
                );
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Tell us about yourself</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>What should we call you?</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Your Name"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#C7C7CC"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>How old are you?</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Age"
                                value={age}
                                onChangeText={setAge}
                                keyboardType="number-pad"
                                placeholderTextColor="#C7C7CC"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Gender</Text>
                            <View style={styles.genderRow}>
                                {['Male', 'Female', 'Other'].map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                                        onPress={() => setGender(g as any)}
                                    >
                                        <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                );
            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Your Body Stats</Text>

                        {/* Height Input */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Height</Text>
                                <View style={styles.toggle}>
                                    <TouchableOpacity onPress={() => setHeightUnit('cm')} style={[styles.toggleBtn, heightUnit === 'cm' && styles.toggleBtnActive]}>
                                        <Text style={[styles.toggleText, heightUnit === 'cm' && styles.toggleTextActive]}>CM</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setHeightUnit('ft')} style={[styles.toggleBtn, heightUnit === 'ft' && styles.toggleBtnActive]}>
                                        <Text style={[styles.toggleText, heightUnit === 'ft' && styles.toggleTextActive]}>FT</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {heightUnit === 'cm' ? (
                                <TextInput
                                    style={styles.input}
                                    placeholder="175"
                                    value={height}
                                    onChangeText={setHeight}
                                    keyboardType="number-pad"
                                    placeholderTextColor="#C7C7CC"
                                />
                            ) : (
                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="5"
                                        value={heightFt}
                                        onChangeText={setHeightFt}
                                        keyboardType="number-pad"
                                        placeholderTextColor="#C7C7CC"
                                    />
                                    <Text style={styles.unitLabel}>ft</Text>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="9"
                                        value={heightIn}
                                        onChangeText={setHeightIn}
                                        keyboardType="number-pad"
                                        placeholderTextColor="#C7C7CC"
                                    />
                                    <Text style={styles.unitLabel}>in</Text>
                                </View>
                            )}
                        </View>

                        {/* Weight Input */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Weight</Text>
                                <View style={styles.toggle}>
                                    <TouchableOpacity onPress={() => setWeightUnit('kg')} style={[styles.toggleBtn, weightUnit === 'kg' && styles.toggleBtnActive]}>
                                        <Text style={[styles.toggleText, weightUnit === 'kg' && styles.toggleTextActive]}>KG</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setWeightUnit('lbs')} style={[styles.toggleBtn, weightUnit === 'lbs' && styles.toggleBtnActive]}>
                                        <Text style={[styles.toggleText, weightUnit === 'lbs' && styles.toggleTextActive]}>LBS</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder={weightUnit === 'kg' ? "70" : "150"}
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="number-pad"
                                placeholderTextColor="#C7C7CC"
                            />
                        </View>
                    </View>
                );
            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Your Personalized Plan</Text>
                        <Text style={styles.explainerText}>Based on your stats, we've calculated a daily goal to maintain/improve your health.</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Daily Calorie Goal</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="2000"
                                value={goalCalories}
                                onChangeText={setGoalCalories}
                                keyboardType="number-pad"
                                placeholderTextColor="#C7C7CC"
                            />
                        </View>

                        <Text style={[styles.label, { marginTop: 20, marginBottom: 10 }]}>
                            Macro Split (%) <Text style={{ color: (parseInt(proteinSplit || '0') + parseInt(carbsSplit || '0') + parseInt(fatsSplit || '0')) === 100 ? Colors.light.primary : 'red' }}>
                                (Total: {parseInt(proteinSplit || '0') + parseInt(carbsSplit || '0') + parseInt(fatsSplit || '0')}%)
                            </Text>
                        </Text>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.subLabel}>Protein</Text>
                                <TextInput
                                    style={styles.input}
                                    value={proteinSplit}
                                    onChangeText={setProteinSplit}
                                    keyboardType="number-pad"
                                />
                                <Text style={styles.gramText}>
                                    {Math.round((parseInt(goalCalories || '0') * (parseInt(proteinSplit || '0') / 100)) / 4)}g
                                </Text>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.subLabel}>Carbs</Text>
                                <TextInput
                                    style={styles.input}
                                    value={carbsSplit}
                                    onChangeText={setCarbsSplit}
                                    keyboardType="number-pad"
                                />
                                <Text style={styles.gramText}>
                                    {Math.round((parseInt(goalCalories || '0') * (parseInt(carbsSplit || '0') / 100)) / 4)}g
                                </Text>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.subLabel}>Fats</Text>
                                <TextInput
                                    style={styles.input}
                                    value={fatsSplit}
                                    onChangeText={setFatsSplit}
                                    keyboardType="number-pad"
                                />
                                <Text style={styles.gramText}>
                                    {Math.round((parseInt(goalCalories || '0') * (parseInt(fatsSplit || '0') / 100)) / 9)}g
                                </Text>
                            </View>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <MobileWrapper>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Progress Bar */}
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View
                        key={step}
                        entering={FadeInRight}
                        exiting={FadeOutLeft}
                        style={styles.content}
                    >
                        {renderStepContent()}
                    </Animated.View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, { opacity: (step > 0 && !name && step === 1) ? 0.5 : 1 }]}
                        onPress={nextStep}
                        disabled={step === 1 && !name}
                    >
                        <Text style={styles.buttonText}>{step === STEPS.length - 1 ? 'Get Started' : 'Continue'}</Text>
                        {step < STEPS.length - 1 && <ChevronRight size={20} color="#FFF" />}
                        {step === STEPS.length - 1 && <Check size={20} color="#FFF" />}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </MobileWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#F2F2F7',
        width: '100%',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.light.primary,
        borderRadius: 3,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    stepContainer: {
        gap: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.light.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    emoji: {
        fontSize: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.light.text,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 20,
    },
    inputGroup: {
        gap: 12,
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
    },
    subLabel: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginBottom: 4,
    },
    input: {
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: Colors.light.text,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    genderRow: {
        flexDirection: 'row',
        gap: 10,
    },
    genderBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        alignItems: 'center',
    },
    genderBtnActive: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    genderText: {
        color: Colors.light.text,
        fontWeight: '600',
    },
    genderTextActive: {
        color: '#FFFFFF',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggle: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        padding: 2,
    },
    toggleBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    toggleBtnActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.textSecondary,
    },
    toggleTextActive: {
        color: Colors.light.text,
    },
    unitLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.textSecondary,
        alignSelf: 'center',
    },
    explainerText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 20,
        lineHeight: 20,
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    button: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 18,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    gramText: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        marginTop: 4,
        fontWeight: '600',
    },
});
