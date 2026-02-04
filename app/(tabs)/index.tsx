import React, { useCallback, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, ImageBackground, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { CalorieTrackerCard } from '@/components/ui/CalorieTrackerCard';
import { WaterTracker } from '@/components/ui/WaterTracker';
import { StreakWidget } from '@/components/ui/StreakWidget';

import { useUser } from '@/context/UserDataContext';
import { api } from '@/services/api';
import { useFocusEffect, useRouter } from 'expo-router';

// TEPMORARY DEMO ID
const DEMO_USER_ID = "e03e7240-f6c6-417a-bc2b-c0ea7793724c";

export default function DashboardScreen() {
  const router = useRouter();
  const { userData } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    calories: 0,
    macros: { p: 0, c: 0, f: 0 },
    meals: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
  });
  const [mealList, setMealList] = useState<Record<string, string[]>>({
    breakfast: [], lunch: [], dinner: [], snack: []
  });
  const [streak, setStreak] = useState(0);

  const tdee = parseInt(userData.goalCalories) || 2000;

  // Calculate targets based on weight (Standard Fitness Formula)
  const weightKg = parseFloat(userData.weight) || 70;

  // Protein: 2g per kg (approx 0.9g per lb)
  const proteinTarget = Math.round(weightKg * 2);

  // Fats: 1g per kg
  const fatsTarget = Math.round(weightKg * 1);

  // Carbs: Remaining calories
  const proteinCals = proteinTarget * 4;
  const fatsCals = fatsTarget * 9;
  const remainingCals = tdee - (proteinCals + fatsCals);
  const carbsTarget = Math.max(0, Math.round(remainingCals / 4));

  const fetchDailyData = async () => {
    try {
      const date = new Date().toISOString().split('T')[0];
      console.log(`FETCHING DATA FOR: ${date} USER: ${DEMO_USER_ID}`);

      const data = await api.getDayView(DEMO_USER_ID, date);
      console.log("RECEIVED DATA:", JSON.stringify(data));

      let p = 0, c = 0, f = 0;
      let mealCals: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
      let mealItems: Record<string, string[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };

      data.meals.forEach((meal: any) => {
        // Macros
        p += meal.protein || 0;
        c += meal.carbs || 0;
        f += meal.fats || 0;

        // Meal Grouping
        const type = meal.meal_type.toLowerCase();
        if (mealCals[type] !== undefined) {
          mealCals[type] += meal.calories;
          mealItems[type].push(meal.food_name);
        }
      });

      console.log("PROCESSED MEALS:", mealItems);

      setStats({
        calories: data.total_calories,
        macros: { p: Math.round(p), c: Math.round(c), f: Math.round(f) },
        meals: mealCals as any
      });
      setMealList(mealItems);

      // Fetch streak
      try {
        const streakDays = await api.getStreak(DEMO_USER_ID);
        setStreak(streakDays);
      } catch (err) {
        console.log('Streak fetch failed:', err);
        setStreak(0);
      }

    } catch (e) {
      console.error("Dashboard Fetch Error:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDailyData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDailyData();
    setRefreshing(false);
  };

  // Handle Quick Eat button press
  const handleQuickEat = async (item: { name: string; calories: number }) => {
    console.log('⚡ Quick Eat tapped:', item.name);
    try {
      const date = new Date().toISOString().split('T')[0];

      console.log('Logging food...', { user_id: DEMO_USER_ID, date, food: item.name });

      await api.logFood({
        user_id: DEMO_USER_ID,
        date,
        meal_type: 'Snack',
        food_name: item.name,
        calories: item.calories,
        protein: 0,
        carbs: 0,
        fats: 0,
      });

      console.log('✅ Food logged, refreshing...');
      // Refresh data
      await fetchDailyData();
    } catch (error) {
      console.error('❌ Quick eat error:', error);
    }
  };

  const suggestions = [
    { name: "One bowl of salad and salmon", calories: 285 },
    { name: "Oven Baked Chicken breast", calories: 482 },
  ];

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=2532&auto=format&fit=crop' }}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.1 }}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >

          {/* Rich Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.dateRow}>
                <TouchableOpacity>
                  <ChevronLeft size={20} color={Colors.light.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.date}>TODAY, FEB 3</Text>
                <TouchableOpacity>
                  <ChevronRight size={20} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.greeting}>Hello, {userData.name || 'Friend'}</Text>
            </View>
            <StreakWidget days={streak} />
          </View>

          {/* Hero Section - New Card */}
          <View style={styles.heroSection}>
            <CalorieTrackerCard
              title="Daily Calories"
              subtitle="Consumed Today"
              currentCalories={stats.calories}
              goalCalories={tdee}
              suggestions={suggestions}
              onRecord={() => router.push('/(tabs)/log')}
              onQuickAdd={handleQuickEat}
            />
          </View>

          {/* Macro Breakdown */}
          <View style={styles.macrosContainer}>
            <MacroProgressBar label="Protein" current={stats.macros.p} target={proteinTarget} color={Colors.light.accent} />
            <MacroProgressBar label="Carbs" current={stats.macros.c} target={carbsTarget} color={Colors.light.secondary} />
            <MacroProgressBar label="Fats" current={stats.macros.f} target={fatsTarget} color={Colors.light.primary} />
          </View>

          {/* Water Tracker */}
          <WaterTracker />

          {/* Rich Meal Sections */}
          <Text style={styles.sectionTitle}>Meals</Text>

          <View style={styles.mealSection}>
            {/* Breakfast */}
            <MealCard
              type="Breakfast"
              calories={stats.meals.breakfast}
              items={mealList.breakfast}
              onAdd={() => router.push({ pathname: '/(tabs)/log', params: { mealType: 'Breakfast' } })}
            />

            {/* Lunch */}
            <MealCard
              type="Lunch"
              calories={stats.meals.lunch}
              items={mealList.lunch}
              onAdd={() => router.push({ pathname: '/(tabs)/log', params: { mealType: 'Lunch' } })}
            />

            {/* Dinner */}
            <MealCard
              type="Dinner"
              calories={stats.meals.dinner}
              items={mealList.dinner}
              onAdd={() => router.push({ pathname: '/(tabs)/log', params: { mealType: 'Dinner' } })}
            />

            {/* Snacks */}
            <MealCard
              type="Snack"
              calories={stats.meals.snack}
              items={mealList.snack}
              onAdd={() => router.push({ pathname: '/(tabs)/log', params: { mealType: 'Snack' } })}
            />
          </View>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// Helper Component for Meal Card
function MealCard({ type, calories, items, onAdd }: { type: string, calories: number, items: string[], onAdd: () => void }) {
  return (
    <Card style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealType}>{type}</Text>
        <Text style={styles.mealCals}>{calories > 0 ? `${calories} kcal` : '-'}</Text>
      </View>
      <Text style={styles.mealSummary}>
        {items.length > 0 ? items.join(', ') : 'Not logged yet'}
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonText}>{items.length > 0 ? '+ Add More' : '+ Add Food'}</Text>
      </TouchableOpacity>
    </Card>
  );
}

function MacroProgressBar({ label, current, target, color }: { label: string, current: number, target: number, color: string }) {
  const progress = Math.min((current / target) * 100, 100);
  return (
    <View style={styles.macroContainer}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{current}/{target}g</Text>
      </View>
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function Tag({ label, color }: { label: string, color: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color + '15' }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  macrosContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  macroContainer: {
    flex: 1,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 15,
  },
  mealSection: {
    gap: 12,
  },
  mealCard: {
    padding: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  mealCals: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  mealSummary: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
});
