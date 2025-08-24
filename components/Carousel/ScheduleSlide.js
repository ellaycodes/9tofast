import ScheduleSelect from "../ui/ScheduleSelect";

function ScheduleSlide({ setWizardState, token, userName, localId }) {
  return <ScheduleSelect setWizardState={setWizardState} token={token} userName={userName} uid={localId}/>;
}

export default ScheduleSlide;
