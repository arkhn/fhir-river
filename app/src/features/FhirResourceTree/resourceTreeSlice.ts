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
  rootNodes?: ElementNode[];
};

const initialState: ResourceTreeSliceState = {};

const findNestedNode = (
  nodes: ElementNode[],
  id: string
): ElementNode | undefined => {
  const node = nodes.find(({ id: nodeId }) => nodeId === id);
  if (node) return node;

  const flattenChildren = nodes.reduce(
    (acc: ElementNode[], _node) => [...acc, ..._node.children],
    []
  );

  return findNestedNode(flattenChildren, id);
};

const resourceTreeSlice = createSlice({
  name: "resourceTree",
  initialState,
  reducers: {
    setNodeChildren: (
      state,
      { payload }: PayloadAction<{ nodeId?: string; children: ElementNode[] }>
    ) => {
      const { nodeId, children } = payload;
      if (!nodeId) {
        state.rootNodes = children;
      } else {
        const stateNode =
          state.rootNodes && findNestedNode(state.rootNodes, nodeId);
        if (stateNode) {
          stateNode.children = [...stateNode.children, ...children];
        }
      }
    },
  },
});

export const selectRootNodes = (state: RootState): ElementNode[] | undefined =>
  state.resourceTree.rootNodes;

export const { setNodeChildren } = resourceTreeSlice.actions;
export default resourceTreeSlice.reducer;
