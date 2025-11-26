// utils/callMetadataStore.js
const callMetadata = new Map();

export const saveCallMetadata = (callSid, data) => {
  callMetadata.set(callSid, data);
};

export const getCallMetadata = (callSid) => {
  return callMetadata.get(callSid);
};

export const deleteCallMetadata = (callSid) => {
  callMetadata.delete(callSid);
};
