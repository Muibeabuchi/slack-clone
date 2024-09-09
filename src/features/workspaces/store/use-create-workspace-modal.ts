import { atom, useAtom } from "jotai";

const workSpaceModalState = atom(false);

export function useCreateWorkSpaceModal() {
  return useAtom(workSpaceModalState);
}
