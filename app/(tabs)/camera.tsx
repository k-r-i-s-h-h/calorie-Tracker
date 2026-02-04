import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { api } from '@/services/api';
import { MealSelector } from '@/components/ui/MealSelector';

const DEMO_USER_ID = "e03e7240-f6c6-417a-bc2b-c0ea7793724c";

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [isSelectorVisible, setIsSelectorVisible] = useState(false);
    const [debugStatus, setDebugStatus] = useState(`Platform: ${Platform.OS}`);
    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        console.log("CameraScreen Mounted - Platform:", Platform.OS);
        setDebugStatus(`Ready - Platform: ${Platform.OS}`);
    }, []);

    if (!permission) {
        return <View style={styles.container}><Text style={{ color: 'white' }}>Loading...</Text></View>;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, styles.overlay]}>
                <Text style={styles.headerText}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        setDebugStatus("🔴 1. Button Pressed!");
        console.log("Button pressed - attempting to take picture");

        if (!cameraRef.current) {
            setDebugStatus("❌ Camera ref is NULL");
            console.error("Camera ref is null");
            Alert.alert("Error", "Camera not ready");
            return;
        }

        setDebugStatus("✅ 2. Camera Ref Found");

        try {
            setAnalyzing(true);
            setDebugStatus("📸 3. Taking picture...");

            const photo = await cameraRef.current.takePictureAsync({
                base64: true,
                quality: 0.5,
            });

            setDebugStatus("✅ 4. Photo captured!");
            console.log("Photo captured:", photo ? "Success" : "Failed");

            if (!photo?.base64) {
                throw new Error("No base64 data in photo");
            }

            setDebugStatus("🤖 5. Analyzing (max 15s)...");

            // Timeout wrapper
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout: Backend took >15s. May be unresponsive or slow.")), 15000)
            );

            const aiData = await Promise.race([
                api.analyzeImage(photo.base64),
                timeoutPromise
            ]) as any;

            setDebugStatus("✅ 6. AI Success!");
            setAnalyzing(false);
            setScanned(true);

            setResult({
                uri: photo.uri,
                food: aiData.food_name,
                calories: aiData.calories,
                macros: {
                    p: aiData.protein,
                    c: aiData.carbs,
                    f: aiData.fats
                }
            });

        } catch (e: any) {
            console.error("Take Picture Error:", e);
            setAnalyzing(false);

            // Show detailed error in debug text
            let errorMsg = "Unknown error";
            if (e.response) {
                // Backend returned an error
                errorMsg = `Server Error: ${e.response.status} - ${e.response.data?.detail || e.response.statusText}`;
            } else if (e.request) {
                // Request was made but no response
                errorMsg = "No response from server. Is backend running?";
            } else if (e.message) {
                errorMsg = e.message;
            }

            setDebugStatus(`❌ ${errorMsg}`);
            Alert.alert("Error", errorMsg);
        }
    };

    const resetScan = () => {
        setScanned(false);
        setResult(null);
        setIsSelectorVisible(false);
        setDebugStatus(`Ready - Platform: ${Platform.OS}`);
    };

    const onConfirmResult = () => {
        setIsSelectorVisible(true);
    };

    const handleMealSelect = async (mealType: string) => {
        if (!result) return;

        try {
            const date = new Date().toISOString().split('T')[0];
            await api.logFood({
                user_id: DEMO_USER_ID,
                date: date,
                meal_type: mealType,
                food_name: result.food,
                calories: result.calories,
                protein: result.macros.p,
                carbs: result.macros.c,
                fats: result.macros.f
            });

            Alert.alert("Saved!", `Logged ${result.food} to ${mealType}`);
            resetScan();
        } catch (e) {
            Alert.alert("Error", "Failed to save food");
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={{ flex: 1 }}
                facing="back"
                mode="picture"
                ref={(r) => {
                    if (r && !cameraRef.current) {
                        console.log("✅ Camera Ref Attached");
                        cameraRef.current = r;
                    }
                }}
            >
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>Snap a photo of your meal</Text>
                        <Text style={styles.subHeaderText}>AI will estimate calories & macros</Text>
                    </View>
                </SafeAreaView>
            </CameraView>

            <View style={styles.bottomControls}>
                {/* CRITICAL: Debug status - VISIBLE red text */}
                <View style={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 10,
                    borderRadius: 10,
                    marginBottom: 15,
                    minWidth: 250,
                    alignItems: 'center'
                }}>
                    <Text style={{
                        color: '#FF3B30',
                        fontSize: 16,
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        {debugStatus}
                    </Text>
                </View>

                {analyzing ? (
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                ) : (
                    <View style={{ alignItems: 'center', gap: 15 }}>
                        <TouchableOpacity
                            onPress={takePicture}
                            style={styles.captureButton}
                            activeOpacity={0.7}
                        >
                            <View style={styles.captureInner} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={takePicture}
                            style={{
                                padding: 10,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: 8
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                                Tap here if button fails
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <Modal visible={scanned} animationType="slide" transparent onRequestClose={resetScan}>
                <View style={styles.modalContainer}>
                    <Card style={styles.resultCard}>
                        {result?.uri && (
                            <Image source={{ uri: result.uri }} style={styles.resultImage} />
                        )}

                        <View style={styles.resultContent}>
                            <Text style={styles.foodName}>{result?.food}</Text>
                            <Text style={styles.calorieCount}>
                                {result?.calories} <Text style={styles.unit}>kcal</Text>
                            </Text>

                            <View style={styles.macrosRow}>
                                <MacroItem label="Protein" value={`${result?.macros?.p}g`} color={Colors.light.accent} />
                                <MacroItem label="Carbs" value={`${result?.macros?.c}g`} color={Colors.light.secondary} />
                                <MacroItem label="Fat" value={`${result?.macros?.f}g`} color={Colors.light.primary} />
                            </View>

                            <View style={styles.actions}>
                                <TouchableOpacity onPress={resetScan} style={styles.actionButton}>
                                    <X color={Colors.light.text} size={24} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onConfirmResult} style={[styles.actionButton, styles.confirmButton]}>
                                    <Check color="#FFF" size={24} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Card>
                </View>
            </Modal>

            <MealSelector
                visible={isSelectorVisible}
                onSelect={handleMealSelect}
                onClose={() => setIsSelectorVisible(false)}
            />
        </View>
    );
}

function MacroItem({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color }]}>{value}</Text>
            <Text style={styles.macroLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: 40,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    headerText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowRadius: 10,
    },
    subHeaderText: {
        color: '#DDD',
        fontSize: 14,
        marginTop: 4,
    },
    permissionButton: {
        padding: 10,
        backgroundColor: Colors.light.primary,
        borderRadius: 5,
    },
    permissionButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    bottomControls: {
        height: 200,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    captureInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFF',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    resultCard: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        minHeight: 500,
    },
    resultImage: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        marginBottom: 20,
    },
    resultContent: {
        gap: 10,
    },
    foodName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    calorieCount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.light.primary,
    },
    unit: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        fontWeight: 'normal',
    },
    macrosRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: Colors.light.background,
        padding: 16,
        borderRadius: 16,
        marginTop: 10,
    },
    macroItem: {
        alignItems: 'center',
        gap: 4,
    },
    macroValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    macroLabel: {
        fontSize: 12,
        color: Colors.light.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    actionButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: Colors.light.primary,
        flex: 1,
        marginLeft: 20,
    },
});
