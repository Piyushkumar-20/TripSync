export const ROLES = {
  OWNER: "Owner",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

const PERMISSIONS = {
  editTrip:          ["Owner", "Editor"],
  deleteTrip:        ["Owner"],
  addMember:         ["Owner"],
  removeMember:      ["Owner"],
  updateMemberRole:  ["Owner"],
  addDestination:    ["Owner"],
  editDestination:   ["Owner", "Editor"],
  deleteDestination: ["Owner"],
  addActivity:       ["Owner", "Editor"],
  editActivity:      ["Owner", "Editor"],
  deleteActivity:    ["Owner"],
  addExpense:        ["Owner", "Editor", "Viewer"],
  deleteExpense:     ["Owner"],
  uploadDocument:    ["Owner", "Editor", "Viewer"],
  deleteDocument:    ["Owner"],
};

/** Returns true if the given role is allowed to perform the action. */
export const can = (role, action) =>
  role ? (PERMISSIONS[action]?.includes(role) ?? false) : false;
