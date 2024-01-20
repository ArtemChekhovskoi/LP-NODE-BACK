import * as crypto from "crypto";

const createSha512Hash = (data: string): string => {
  const hash = crypto.createHash("sha512");
  return hash.update(data).digest("hex");
};

export default createSha512Hash;
