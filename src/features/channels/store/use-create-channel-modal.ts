import { atom, useAtom } from "jotai";

const channelModalState = atom(false);

export function useCreateChannelModal() {
  return useAtom(channelModalState);
}
