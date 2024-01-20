const NOTIFICATION_ACTION_TYPES = {
  CLOSE: "close",
  OPEN: "open",
  CLICK: "click",
};

const ACTION_FIELDS = {
  [NOTIFICATION_ACTION_TYPES.CLOSE]: {
    isClosed: true,
  },
  [NOTIFICATION_ACTION_TYPES.OPEN]: {
    isOpened: true,
  },
  [NOTIFICATION_ACTION_TYPES.CLICK]: {
    isClicked: true,
  },
};

const NOTIFICATION_ACTION_TYPES_ARRAY = Object.values(
  NOTIFICATION_ACTION_TYPES,
);

export {
  NOTIFICATION_ACTION_TYPES_ARRAY,
  NOTIFICATION_ACTION_TYPES,
  ACTION_FIELDS,
};
