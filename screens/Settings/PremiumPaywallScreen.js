import { StyleSheet, View } from "react-native";
import Title from "../../components/ui/Title";
import SubtitleText from "../../components/ui/SubtitleText";
import SettingsPressable from "../../components/Settings/SettingsPressable";
import PrimaryButton from "../../components/ui/PrimaryButton";
import FlatButton from "../../components/ui/FlatButton";
import { useAppTheme } from "../../store/app-theme-context";
import { useMemo } from "react";
// import { setOptimisticPremium, usePremium } from "../../hooks/usePremium";
// import RevenueCatUI from "react-native-purchases-ui";
// import Purchases from "react-native-purchases";
import { usePremium } from "../../store/premium-context";

function PremiumPaywallScreen({ navigation }) {
  const { theme } = useAppTheme();
  const memoStyle = useMemo(() => styles(theme), [theme]);
  const { refresh } = usePremium();

  async function handleContinuePremium() {}

  async function handleRestorePurchase() {}

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
            £0.99 Per Month
          </SubtitleText>
          <SubtitleText style={memoStyle.SubtitleText}>
            £9.99 Annual
          </SubtitleText>
          <SubtitleText style={memoStyle.SubtitleText}>
            £19.99 Forever
          </SubtitleText>
        </View>

        <View>
          <SettingsPressable icon="not-interested" label="No Ads" />
          <SettingsPressable
            icon="new-releases"
            label="Early Access to New Features"
          />
          <SettingsPressable icon="watch" label="Future Wearable Support" />
        </View>
      </View>

      <View>
        <PrimaryButton onPress={handleContinuePremium} lowlight>
          Continue
        </PrimaryButton>
        <FlatButton onPress={handleRestorePurchase} inline>
          Restore Purchase
        </FlatButton>
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
