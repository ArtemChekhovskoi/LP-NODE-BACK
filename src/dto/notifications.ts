import * as yup from "yup";
import { NOTIFICATION_ACTION_TYPES_ARRAY } from "@constants/notifications";

const postUpdateNotificationStatusSchema = yup.object({
  usersNotificationID: yup.string().required(),
  action: yup.string().oneOf(NOTIFICATION_ACTION_TYPES_ARRAY).required(),
});

export { postUpdateNotificationStatusSchema };
