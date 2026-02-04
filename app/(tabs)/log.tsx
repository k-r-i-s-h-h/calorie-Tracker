import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Utensils, Flame, Check, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SuccessToast } from '@/components/ui/Toast';
import { api } from '@/services/api';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';

const FAVORITES = [
  { id: '1', name: 'Black Coffee', cals: '5' },
  { id: '2', name: 'Banana', cals: '105' },
  { id: '3', name: 'Oatmeal', cals: '150' },
  { id: '4', name: 'Protein Shake', cals: '180' },
];

import { MealSelector } from '@/components/ui/MealSelector';

// ... imports

export default function LogScreen() {
  const params = useLocalSearchParams();
  const activeMealType = params.mealType as string | undefined;

  const [log, setLog] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Selector State
  const [isSelectorVisible, setIsSelectorVisible] = useState(false);
  const [pendingItem, setPendingItem] = useState<any | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);

  // TEMPORARY DEMO ID
  const DEMO_USER_ID = "e03e7240-f6c6-417a-bc2b-c0ea7793724c";

  const fetchLog = async () => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const data = await api.getDayView(DEMO_USER_ID, date);

      const formattedLog = data.meals.map((meal: any) => ({
        id: meal.id,
        name: meal.food_name,
        cals: meal.calories.toString(),
        time: new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setLog(formattedLog.reverse()); // Newest first
    } catch (e) {
      console.error("Fetch Log Error:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLog();
    }, [])
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    Keyboard.dismiss();

    try {
      const data = await api.searchFood(searchQuery);
      setSearchResult(data);
    } catch (e) {
      setToast("Could not find food info. Ensure backend is running.");
    } finally {
      setIsSearching(false);
    }
  };
  const saveToDb = async (item: any, meal: string) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const res = await api.logFood({
        user_id: DEMO_USER_ID,
        date: date,
        meal_type: meal,
        food_name: item.name,
        calories: item.cals,
        protein: item.macros?.p || 0,
        carbs: item.macros?.c || 0,
        fats: item.macros?.f || 0
      });

      const newItem = {
        id: res.id,
        name: item.name,
        cals: item.cals.toString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setLog(prev => [newItem, ...prev]);
      setToast(`${item.name} saved to ${meal}!`);
    } catch (e) {
      console.error(e);
      setToast("Error saving food.");
    }
  };

  const handleMealSelect = async (type: string) => {
    setIsSelectorVisible(false);
    if (pendingItem) {
      await saveToDb(pendingItem, type);
      setPendingItem(null);
    }
  };

  const initiateAdd = (item: any) => {
    if (activeMealType) {
      // If we already know the meal (e.g. clicked Breakfast on Dash), just save
      saveToDb(item, activeMealType);
    } else {
      // Otherwise, ask!
      setPendingItem(item);
      setIsSelectorVisible(true);
    }
  };

  const addSearchResult = async () => {
    if (!searchResult) return;

    const item = {
      name: searchResult.food_name,
      cals: searchResult.calories,
      macros: { p: searchResult.protein, c: searchResult.carbs, f: searchResult.fats }
    };

    initiateAdd(item);
    setSearchResult(null);
    setSearchQuery('');
  };

  const quickAdd = async (item: any) => {
    // Quick add items often don't have macros in the simplified list props yet
    const fullItem = {
      name: item.name,
      cals: parseInt(item.cals),
      macros: { p: 0, c: 0, f: 0 }
    };
    initiateAdd(fullItem);
  };

  const deleteItem = async (id: string) => {
    try {
      // Optimistic delete
      setLog(prev => prev.filter(item => item.id !== id));
      await api.deleteFood(id);
    } catch (e) {
      console.error("Delete Error:", e);
      setToast("Failed to delete item");
      fetchLog(); // Revert
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {toast && <SuccessToast message={toast} onHide={() => setToast(null)} />}
      <View style={styles.padding}>
        <Text style={styles.headerTitle}>Food Log</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.light.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Describe your meal (e.g. 2 eggs & toast)"
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {isSearching && <ActivityIndicator size="small" color={Colors.light.primary} />}
        </View>

        {/* Search Result Card */}
        {searchResult && (
          <View style={styles.resultContainer}>
            <Card style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View>
                  <Text style={styles.resultName}>{searchResult.food_name}</Text>
                  <Text style={styles.resultServing}>{searchResult.serving_size || 'Estimated Serving'}</Text>
                </View>
                <View style={styles.resultBadge}>
                  <Flame size={14} color="#FFF" fill="#FFF" />
                  <Text style={styles.resultBadgeText}>{searchResult.calories}</Text>
                </View>
              </View>

              <View style={styles.macrosRow}>
                <Text style={styles.macroText}>Protein: {searchResult.protein}g</Text>
                <Text style={styles.macroText}>Carbs: {searchResult.carbs}g</Text>
                <Text style={styles.macroText}>Fats: {searchResult.fats}g</Text>
              </View>

              <TouchableOpacity style={styles.addButton} onPress={addSearchResult}>
                <Text style={styles.addButtonText}>Add to Log</Text>
                <Check size={18} color="#FFF" />
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* Favorites Quick Add (Only show if not searching/result) */}
        {!searchResult && (
          <View style={styles.favoritesContainer}>
            <Text style={styles.sectionTitle}>Favorites / Recent</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favList}>
              {FAVORITES.map(item => (
                <TouchableOpacity key={item.id} onPress={() => quickAdd(item)}>
                  <Card style={styles.favCard}>
                    <Plus size={16} color={Colors.light.primary} />
                    <Text style={styles.favName}>{item.name}</Text>
                    <Text style={styles.favCals}>{item.cals}</Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Today</Text>

        {log.length === 0 ? (
          <EmptyState
            icon={Utensils}
            title="No meals logged yet"
            message="Start your day by logging your breakfast or a quick snack!"
          />
        ) : (
          log.map((item, index) => (
            <LogItem
              key={index}
              name={item.name}
              calories={item.cals}
              time={item.time}
              onDelete={() => deleteItem(item.id)}
            />
          ))
        )}
      </ScrollView>
      <MealSelector
        visible={isSelectorVisible}
        onSelect={handleMealSelect}
        onClose={() => setIsSelectorVisible(false)}
      />
    </SafeAreaView>
  );
}

function LogItem({ name, calories, time, onDelete }: { name: string, calories: string, time: string, onDelete: () => void }) {
  return (
    <Card style={styles.logItem}>
      <View style={styles.logItemLeft}>
        <View>
          <Text style={styles.itemName}>{name}</Text>
          <Text style={styles.itemTime}>{time}</Text>
        </View>
      </View>

      <View style={styles.logItemRight}>
        <Text style={styles.itemCals}>{calories} kcal</Text>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Trash2 size={18} color={Colors.light.textSecondary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  padding: {
    padding: 20,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  activeMealBadge: {
    backgroundColor: Colors.light.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  activeMealText: {
    color: Colors.light.primary,
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  resultContainer: {
    marginBottom: 20,
  },
  resultCard: {
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.primary,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  resultServing: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  macroText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.text,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  favoritesContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  favList: {
    gap: 10,
    paddingRight: 20,
  },
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
  },
  favName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  favCals: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 10,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  logItemLeft: {
    flex: 1,
  },
  logItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  itemCals: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  deleteButton: {
    padding: 4,
  }
});
