import { StyleSheet, View } from "react-native";
import Title from "../../components/ui/Title";
import SubtitleText from "../../components/ui/SubtitleText";
import SettingsPressable from "../../components/Settings/SettingsPressable";
import PrimaryButton from "../../components/ui/PrimaryButton";
import FlatButton from "../../components/ui/FlatButton";
import { useAppTheme } from "../../store/app-theme-context";
import { useMemo } from "react";

function PremiumPaywallScreen() {
  const { theme } = useAppTheme();
  const memoStyle = useMemo(() => styles(theme), [theme]);
  return (
    <View style={memoStyle.container}>
      <View>
        <Title
          style={{
            alignItems: "flex-start",
            paddingLeft: 0,
          }}
          size={28}
        >
          Go Premium, Stay Focused
        </Title>

        <View style={memoStyle.pricesContainer}>
          <SubtitleText style={memoStyle.SubtitleText}>
            £1.49 Per Month
          </SubtitleText>
          <SubtitleText style={memoStyle.SubtitleText}>
            £14.99 Annual
          </SubtitleText>
          <SubtitleText style={memoStyle.SubtitleText}>
            £19.99 Forever
          </SubtitleText>
        </View>

        <View>
          <SettingsPressable icon="not-interested" label="No Ads" />
          {/* <SettingsPressable icon="calendar-month" label="Calendar Sync" /> */}
          <SettingsPressable icon="watch" label="Future Wearable Support" />
        </View>
      </View>

      <View>
        <SubtitleText>Coming Soon</SubtitleText>
        {/* <PrimaryButton onPress={() => console.log("TODO")} lowlight>
          Continue
        </PrimaryButton>
        <FlatButton onPress={() => console.log("TODO")} inline>
          Restore Purchase
        </FlatButton> */}
      </View>
    </View>
  );
}

export default PremiumPaywallScreen;

const styles = (theme) =>
  StyleSheet.create({
    pricesContainer: {
      justifyContent: "flex-start",
      marginBottom: 12,
    },
    SubtitleText: {
      padding: 0,
      alignItems: "flex-start",
    },
    container: {
      margin: 18,
      flex: 1,
      justifyContent: "space-between",
    },
  });
