import ScheduleSelect from "../ui/ScheduleSelect";

function ScheduleSlide({ setWizardState, token, refreshToken, userName }) {
  return <ScheduleSelect setWizardState={setWizardState} token={token} refreshToken={refreshToken} userName={userName}/>;
}

export default ScheduleSlide;
