import PreAuthProfile from "../../components/Settings/PreAuthProfile";
import AuthedProfile from "../../components/Settings/AuthedProfile";

function ProfileScreen({ route }) {
  const { emailAddress } = route.params;
  return emailAddress ? (
    <AuthedProfile emailAddress={emailAddress} />
  ) : (
    <PreAuthProfile />
  );
}

export default ProfileScreen;