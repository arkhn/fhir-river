import { IElementDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "app/store";

export type TypeNature =
  | "complex"
  | "primitive"
  | "array"
  | "choice"
  | undefined;

type Element<T> = {
  id: string;
  name: string;
  path: string;
  nature?: TypeNature;
  isSlice: boolean;
  parent?: T;
  children: T[];
  type?: string;
  definition: IElementDefinition;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementNode extends Element<ElementNode> {}

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
