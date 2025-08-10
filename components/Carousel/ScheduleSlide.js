import ScheduleSelect from "../ui/ScheduleSelect";

function ScheduleSlide({ setWizardState, token, userName }) {
  return <ScheduleSelect setWizardState={setWizardState} token={token} userName={userName}/>;
}

export default ScheduleSlide;
