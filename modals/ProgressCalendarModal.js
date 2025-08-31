import { Modal, Pressable, StyleSheet, View, Text, FlatList, Dimensions } from "react-native"
import { useAppTheme } from "../store/app-theme-context"
import FlatButton from "../components/ui/FlatButton"
import * as dt from "date-fns"
import { useMemo, useRef } from "react"
import useWeeklyStats from "../store/fastingLogic/useWeeklyStats"
import { AnimatedCircularProgress } from "react-native-circular-progress"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

function MonthGrid({ monthDate, theme, statsMap }) {
  const startOfMonth = dt.startOfMonth(monthDate)
  const endOfMonth = dt.endOfMonth(monthDate)
  const startDate = dt.startOfWeek(startOfMonth, { weekStartsOn: 0 })

  const days = useMemo(() => {
    return Array.from({ length: 42 }).map((_, i) => {
      const d = dt.addDays(startDate, i)
      const key = dt.format(d, "yyyy-MM-dd")
      return {
        date: d,
        inMonth: dt.isSameMonth(d, monthDate),
        percent: statsMap.get(key) ?? 0
      }
    })
  }, [monthDate, statsMap, startDate])

  return (
    <View>
      <View style={styles.weekRow}>
        {"SMTWTFS".split("").map((d, i) => (
          <Text key={d + i} style={[styles.weekDay, { color: theme.muted, width: `${100 / 7}%` }]}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.days}>
        {days.map((item, idx) => (
          <View key={idx} style={styles.dayCell}>
            <AnimatedCircularProgress
              size={28}
              width={5}
              fill={item.inMonth ? Math.min(100, Math.max(0, item.percent)) : 0}
              tintColor={item.inMonth ? theme.success : theme.secondary100}
              backgroundColor={theme.secondary100}
              lineCap="round"
              rotation={0}
            />
          </View>
        ))}
      </View>
    </View>
  )
}

export default function ProgressCalendarModal({ showModal, onRequestClose }) {
  const { theme } = useAppTheme()
  const { weeklyStats, refreshWeeklyStats } = useWeeklyStats()

  // build a rolling list of months, index 0 is current month, 1 is previous, etc
  const months = useMemo(() => {
    return Array.from({ length: 24 }).map((_, idx) => {
      const m = dt.startOfMonth(dt.subMonths(new Date(), idx))
      return { key: dt.format(m, "yyyy-MM"), month: m }
    })
  }, [])

  // hydrate stats on view change
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (!viewableItems?.length) return
    const first = viewableItems[0]?.item
    if (!first) return
    const start = dt.startOfMonth(first.month)
    const end = dt.endOfMonth(first.month)
    refreshWeeklyStats(start, end)
  }).current

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current

  const statsMap = useMemo(() => {
    const m = new Map()
    weeklyStats.forEach(s => m.set(s.day, s.percent ?? 0))
    return m
  }, [weeklyStats])

  const renderMonth = ({ item }) => (
    <View style={{ height: SCREEN_HEIGHT * 0.55 }}>
      <Text style={[styles.monthLabel, { color: theme.text }]}>
        {dt.format(item.month, "MMMM yyyy")}
      </Text>
      <MonthGrid monthDate={item.month} theme={theme} statsMap={statsMap} />
    </View>
  )

  return (
    <Modal visible={showModal} transparent animationType="slide" onRequestClose={onRequestClose}>
      <Pressable onPress={onRequestClose} style={styles.modalBackdrop} />
      <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
        <View style={styles.modalHeader}>
          <FlatButton size="l" onPress={onRequestClose}>
            Close
          </FlatButton>
          <Text style={[styles.headerHint, { color: theme.muted }]}>
            Swipe up or down for months
          </Text>
        </View>

        <FlatList
          data={months}
          renderItem={renderMonth}
          keyExtractor={m => m.key}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)"
  },
  modalSheet: {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerHint: {
    fontSize: 12
  },
  monthLabel: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  weekDay: {
    textAlign: "center",
    fontSize: 12
  },
  days: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  dayCell: {
    width: `${100 / 7}%`,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center"
  }
})
