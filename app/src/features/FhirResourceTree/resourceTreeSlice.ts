import { IElementDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "app/store";
import { Attribute } from "services/api/generated/api.generated";

import { computePathWithoutIndexes, getNode } from "./resourceTreeUtils";

export type ElementKind = "complex" | "primitive" | "choice" | undefined;

export type ElementNode = {
  id: string;
  name: string;
  path: string;
  kind?: ElementKind;
  isArray: boolean;
  isSlice: boolean;
  type?: string;
  definition: IElementDefinition;
  children: ElementNode[];
};

type ResourceTreeSliceState = {
  root?: ElementNode;
  attributeNodesInTree: ElementNode[];
};

const initialState: ResourceTreeSliceState = {
  attributeNodesInTree: [],
};

const resourceTreeSlice = createSlice({
  name: "resourceTree",
  initialState,
  reducers: {
    resetResourceTreeSliceState: (state) => {
      state.root = undefined;
      state.attributeNodesInTree = [];
    },
    treeNodeUpdate: (
      state,
      { payload }: PayloadAction<{ nodeId?: string; data: ElementNode }>
    ) => {
      const { nodeId, data } = payload;
      if (!nodeId) {
        state.root = data;
      } else if (state.root) {
        const node = getNode("id", nodeId, state.root);
        if (node) node.children = data.children;
      }
    },
    attibuteNodesAdded: (
      state,
      { payload }: PayloadAction<{ nodes: ElementNode[] }>
    ) => {
      const { root } = state;
      if (root) {
        const { nodes } = payload;
        nodes.forEach((node) => {
          const parent = getNode("path", computePathWithoutIndexes(node), root);
          if (
            parent &&
            !parent.children.some(({ path }) => path === node.path)
          ) {
            parent.children.push(node);
          }
        });
      }
    },
    attributeNodesDeleted: (
      state,
      { payload }: PayloadAction<{ attributes: Attribute[] }>
    ) => {
      const { root } = state;
      if (root) {
        const { attributes } = payload;
        attributes.forEach((attribute) => {
          const parent = getNode(
            "path",
            computePathWithoutIndexes(attribute),
            root
          );
          if (parent) {
            parent.children = parent.children.filter(
              ({ path }) => path !== attribute.path
            );
          }
        });
      }
    },
  },
});

export const selectRoot = (state: RootState): ElementNode | undefined =>
  state.resourceTree.root;

export const {
  treeNodeUpdate,
  resetResourceTreeSliceState,
  attibuteNodesAdded,
  attributeNodesDeleted,
} = resourceTreeSlice.actions;
export default resourceTreeSlice.reducer;
