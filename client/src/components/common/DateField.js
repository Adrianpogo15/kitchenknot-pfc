import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../../styles/theme";
import { formatDateToEuropean } from "../../utils/date";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function parseValue(value) {
  const today = new Date();
  const date = value ? new Date(value) : today;
  const safeDate = Number.isNaN(date.getTime()) ? today : date;

  return {
    year: safeDate.getFullYear(),
    month: safeDate.getMonth(),
    day: safeDate.getDate()
  };
}

function buildIsoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function DateField({ label, value, onChange, placeholder = "Selecciona una fecha" }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const initialParts = parseValue(value);
  const currentYear = new Date().getFullYear();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState("year");
  const [selectedYear, setSelectedYear] = useState(initialParts.year);
  const [selectedMonth, setSelectedMonth] = useState(initialParts.month);
  const [selectedDay, setSelectedDay] = useState(initialParts.day);

  const years = useMemo(() => {
    const list = [];
    for (let year = currentYear; year >= 1900; year -= 1) {
      list.push(year);
    }
    return list;
  }, [currentYear]);

  function openSelector() {
    const parts = parseValue(value);
    setSelectedYear(parts.year);
    setSelectedMonth(parts.month);
    setSelectedDay(parts.day);
    setStep("year");
    setVisible(true);
  }

  function handleMonthPress(monthIndex) {
    setSelectedMonth(monthIndex);
    setSelectedDay(1);
    setStep("day");
  }

  function handleDayPress(day) {
    setSelectedDay(day);
    onChange(buildIsoDate(selectedYear, selectedMonth, day));
    setVisible(false);
  }

  const maxDate = new Date();
  const monthLimit = selectedYear === currentYear ? maxDate.getMonth() : 11;
  const dayLimit =
    selectedYear === currentYear && selectedMonth === maxDate.getMonth()
      ? maxDate.getDate()
      : daysInMonth(selectedYear, selectedMonth);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable style={styles.field} onPress={openSelector}>
        <Text style={value ? styles.value : styles.placeholder}>
          {value ? formatDateToEuropean(value) : placeholder}
        </Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona tu fecha</Text>
              <Pressable style={styles.closeButton} onPress={() => setVisible(false)}>
                <Ionicons name="close" size={20} color={theme.colors.primaryStrong} />
              </Pressable>
            </View>

            <View style={styles.stepsRow}>
              <StepChip
                label={`Año: ${selectedYear}`}
                active={step === "year"}
                onPress={() => setStep("year")}
                theme={theme}
              />
              <StepChip
                label={`Mes: ${MONTHS[selectedMonth]}`}
                active={step === "month"}
                onPress={() => setStep("month")}
                theme={theme}
              />
              <StepChip
                label={`Día: ${selectedDay}`}
                active={step === "day"}
                onPress={() => setStep("day")}
                theme={theme}
              />
            </View>

            {step === "year" ? (
              <>
                <Text style={styles.helperText}>1. Elige primero el año</Text>
                <ScrollView style={styles.selectorBox} showsVerticalScrollIndicator={false}>
                  <View style={styles.optionGrid}>
                    {years.map((year) => (
                      <Pressable
                        key={year}
                        style={[styles.optionButton, year === selectedYear && styles.optionButtonActive]}
                        onPress={() => {
                          setSelectedYear(year);
                          if (selectedMonth > monthLimit) {
                            setSelectedMonth(monthLimit);
                          }
                          setStep("month");
                        }}
                      >
                        <Text style={[styles.optionText, year === selectedYear && styles.optionTextActive]}>
                          {year}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </>
            ) : null}

            {step === "month" ? (
              <>
                <Text style={styles.helperText}>2. Ahora selecciona el mes</Text>
                <View style={styles.optionGrid}>
                  {MONTHS.map((month, index) => {
                    const disabled = index > monthLimit;
                    return (
                      <Pressable
                        key={month}
                        disabled={disabled}
                        style={[
                          styles.optionButton,
                          index === selectedMonth && styles.optionButtonActive,
                          disabled && styles.optionButtonDisabled
                        ]}
                        onPress={() => handleMonthPress(index)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            index === selectedMonth && styles.optionTextActive,
                            disabled && styles.optionTextDisabled
                          ]}
                        >
                          {month}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {step === "day" ? (
              <>
                <Text style={styles.helperText}>3. Por último elige el día</Text>
                <View style={styles.optionGrid}>
                  {Array.from({ length: dayLimit }, (_, index) => index + 1).map((day) => (
                    <Pressable
                      key={day}
                      style={[styles.dayButton, day === selectedDay && styles.optionButtonActive]}
                      onPress={() => handleDayPress(day)}
                    >
                      <Text style={[styles.optionText, day === selectedDay && styles.optionTextActive]}>
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StepChip({ label, active, onPress, theme }) {
  const styles = createStyles(theme);

  return (
    <Pressable style={[styles.stepChip, active && styles.stepChipActive]} onPress={onPress}>
      <Text style={[styles.stepChipText, active && styles.stepChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 12
    },
    label: {
      marginBottom: 8,
      color: theme.colors.textSoft,
      fontSize: 13,
      fontWeight: "700"
    },
    field: {
      backgroundColor: theme.isDark ? theme.colors.card : theme.colors.white,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    value: {
      color: theme.colors.text,
      fontSize: 15
    },
    placeholder: {
      color: theme.colors.textMuted,
      fontSize: 15
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      padding: 20
    },
    modalCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      padding: 18,
      maxHeight: "86%"
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    modalTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "800"
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center"
    },
    stepsRow: {
      gap: 10,
      marginTop: 14,
      marginBottom: 12
    },
    stepChip: {
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10
    },
    stepChipActive: {
      backgroundColor: theme.colors.primarySoft
    },
    stepChipText: {
      color: theme.colors.textSoft,
      fontWeight: "700"
    },
    stepChipTextActive: {
      color: theme.colors.primaryStrong
    },
    helperText: {
      color: theme.colors.textSoft,
      marginBottom: 12,
      lineHeight: 20
    },
    selectorBox: {
      maxHeight: 280
    },
    optionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10
    },
    optionButton: {
      minWidth: "30%",
      backgroundColor: theme.isDark ? theme.colors.card : theme.colors.white,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    dayButton: {
      width: "17%",
      backgroundColor: theme.isDark ? theme.colors.card : theme.colors.white,
      borderRadius: 16,
      paddingVertical: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    optionButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    optionButtonDisabled: {
      opacity: 0.45
    },
    optionText: {
      color: theme.colors.text,
      fontWeight: "700"
    },
    optionTextActive: {
      color: theme.colors.white
    },
    optionTextDisabled: {
      color: theme.colors.textMuted
    }
  });
