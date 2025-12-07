import { ScrollView, StyleSheet, Text } from "react-native";
import { View } from "react-native";
import SettingsPressable from "../../components/Settings/SettingsPressable";
import Title from "../../components/ui/Title";
import { useContext, useEffect, useState } from "react";
import { AppThemeContext } from "../../store/app-theme-context";
import Section from "../../components/ui/Section";
import StatsCard from "../../components/ui/StatsCard";
import { StatsContext } from "../../store/statsLogic/stats-context";
import OverrideStreakModal from "../../modals/OverrideStreakModal";

export default function Stats() {
  const { theme } = useContext(AppThemeContext);
  const { currentStreak, longestStreak, overrideStreak, canOverrideStreak } =
    useContext(StatsContext);

  const [openModal, setOpenModal] = useState(false);
  const [canOverride, setCanOverride] = useState();

  useEffect(() => {
    setCanOverride(canOverrideStreak().canOverride);
  }, []);

  function openOverrideStreakModal(toggle) {
    toggle === "close" ? setOpenModal(false) : setOpenModal(true);
  }

  async function handleOverride() {
    overrideStreak();
    setOpenModal(false);
  }

  return (
    <ScrollView>
      <View style={styles(theme).container}>
        <Section title="Stats">
          <StatsCard
            name="Current Streak"
            emoji="🔥"
            icon="flame"
            content={currentStreak}
            highlight
          ></StatsCard>
          <StatsCard
            name="Longest Streak"
            emoji="🏆"
            icon="trophy"
            content={longestStreak}
          ></StatsCard>
        </Section>
        <Title>Streak Management</Title>
        <SettingsPressable
          icon="local-fire-department"
          label="Get your streak back"
          subtitle={
            canOverride
              ? `Manually add a missed day to maintain your streak. ${"\n"}This feature can only be used once every 30 days`
              : `You have already used Override within the last 30 days. ${"\n"}You can override again in ${
                  30 - canOverrideStreak().diffInDays
                } days`
          }
          iconColour={canOverride ? theme.success : theme.muted}
          style={{ lineHeight: 0, width: "auto" }}
          onPress={() => (canOverride ? openOverrideStreakModal("open") : null)}
        />
      </View>

      <OverrideStreakModal
        showModal={openModal}
        onRequestClose={() => openOverrideStreakModal("close")}
        onSave={handleOverride}
      />
    </ScrollView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 20,
    },
  });
