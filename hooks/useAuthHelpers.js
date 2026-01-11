import { useContext } from "react";
import { AuthContext } from "../store/auth-context";
import { addUser, getUser } from "../firebase/users.db.js";
import { getPreferences } from "../firebase/fasting.db.js";
import randomUsername from "../util/randomUsername.js";
import { useFasting } from "../store/fastingLogic/fasting-context.js";
import { getIdToken } from "firebase/auth";
import { StatsContext } from "../store/statsLogic/stats-context.js";

export default function useAuthHelpers() {
  const authCxt = useContext(AuthContext);
  const { setSchedule } = useFasting();
  const username = randomUsername();
  const { loadStreak } = useContext(StatsContext);

  async function handleExistingUserLogin(user, existingUser) {
    const token = await getIdToken(user, true);
    const prefs = await getPreferences(user.uid);

    authCxt.authenticate(token, existingUser.displayName, user.uid);
    authCxt.setEmailAddress(existingUser.email);
    authCxt.setOnboarded(true);
    authCxt.updateFullName(existingUser.fullName);
    loadStreak();

    if (existingUser.avatarId) {
      authCxt.updateAvatarId(existingUser.avatarId);
    }

    if (prefs && prefs.fastingSchedule) {
      await setSchedule(prefs.fastingSchedule, { anchor: false });
    }
  }

  async function handleNewProviderUser(user, email, fullName, navigation) {
    await addUser({
      uid: user.uid,
      email: email || null,
      displayName: username,
      fullName: fullName || null,
      isAnonymous: false,
    });

    if (email) authCxt.setEmailAddress(email);
    if (fullName) authCxt.updateFullName(fullName);

    return navigation.navigate("OnboardingCarousel", {
      token: user.stsTokenManager.accessToken,
      userName: username,
      localId: user.uid,
    });
  }

  async function handleNewAnonymousUser(user, navigation) {
    await addUser({
      uid: user.uid,
      email: null,
      displayName: username,
      isAnonymous: true,
    });

    navigation.navigate("OnboardingCarousel", {
      token: user.stsTokenManager.accessToken,
      userName: username,
      localId: user.uid,
    });
  }

  return {
    handleExistingUserLogin,
    handleNewProviderUser,
    handleNewAnonymousUser,
  };
}
