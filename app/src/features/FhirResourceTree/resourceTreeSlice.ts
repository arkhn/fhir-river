import { IElementDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import differenceBy from "lodash/differenceBy";

import { RootState } from "app/store";

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
    attributeNodeUpdate: (
      state,
      { payload }: PayloadAction<{ attributeNodes: ElementNode[] }>
    ) => {
      const { attributeNodes } = payload;
      const { attributeNodesInTree, root } = state;
      if (root) {
        const nodesToRemove = differenceBy(
          attributeNodesInTree,
          attributeNodes,
          (node) => node.path
        );
        const nodesToAdd = differenceBy(
          attributeNodes,
          attributeNodesInTree,
          (node) => node.path
        );

        // Add attribute nodes to the tree
        nodesToAdd.forEach((node) => {
          const parent = getNode("path", computePathWithoutIndexes(node), root);
          if (
            parent &&
            !parent.children.some(({ path }) => path === node.path)
          ) {
            parent.children.push(node);
            attributeNodesInTree.push(node);
          }
        });

        // Remove attribute nodes from the tree
        nodesToRemove.forEach((node) => {
          const parent = getNode("path", computePathWithoutIndexes(node), root);
          if (parent) {
            parent.children = parent.children.filter(
              ({ path }) => path !== node.path
            );
            state.attributeNodesInTree = attributeNodesInTree.filter(
              ({ path }) => path !== node.path
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
  attributeNodeUpdate,
  resetResourceTreeSliceState,
} = resourceTreeSlice.actions;
export default resourceTreeSlice.reducer;
