import { IElementDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "app/store";

export type ElementKind =
  | "complex"
  | "primitive"
  | "array"
  | "choice"
  | undefined;

export type ElementNode = {
  id: string;
  name: string;
  path: string;
  kind?: ElementKind;
  isSlice: boolean;
  type?: string;
  definition: IElementDefinition;
  children: ElementNode[];
};

type ResourceTreeSliceState = {
  root?: ElementNode;
};

const initialState: ResourceTreeSliceState = {};

const getNodeById = (
  id: string,
  root: ElementNode
): ElementNode | undefined => {
  if (root.id === id) return root;
  for (const next of root.children) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = getNodeById(id, next);
    if (result) return result;
  }
  return undefined;
};

const resourceTreeSlice = createSlice({
  name: "resourceTree",
  initialState,
  reducers: {
    setNodeChildren: (
      state,
      { payload }: PayloadAction<{ nodeId?: string; children: ElementNode }>
    ) => {
      const { nodeId, children } = payload;
      if (!nodeId) {
        state.root = children;
      } else if (state.root) {
        const node = getNodeById(nodeId, state.root);
        if (node) node.children = [...node.children, children];
      }
    },
  },
});

export const selectRoot = (state: RootState): ElementNode | undefined =>
  state.resourceTree.root;

export const { setNodeChildren } = resourceTreeSlice.actions;
export default resourceTreeSlice.reducer;
