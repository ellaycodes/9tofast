function randomNotificationMessage(category) {
  const group = messages[category];
  if (!group?.length) return { title: "", body: "" };

  const randomIndex = Math.floor(Math.random() * group.length);
  return group[randomIndex];
}

export default randomNotificationMessage;
