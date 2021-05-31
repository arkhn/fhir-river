import { IElementDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import differenceBy from "lodash/differenceBy";

import { RootState } from "app/store";

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

const computePathWithoutIndexes = (node: ElementNode) =>
  node.path.split(/[[]\d+]$/).join("");

export const getNode = (
  get: "path" | "id",
  path: string,
  root: ElementNode
): ElementNode | undefined => {
  if (root[get] === path) return root;
  for (const next of root.children) {
    const result = getNode(get, path, next);
    if (result) return result;
  }
  return undefined;
};

const resourceTreeSlice = createSlice({
  name: "resourceTree",
  initialState,
  reducers: {
    resetResourceTreeSliceState: (state) => {
      state.root = undefined;
      state.attributeNodesInTree = [];
    },
    setNodeChildren: (
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
    setAttributeNodes: (
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
          const parent = getNode(
            "path",
            computePathWithoutIndexes(node),
            root as ElementNode
          );
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
          const parent = getNode(
            "path",
            computePathWithoutIndexes(node),
            root as ElementNode
          );
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
  setNodeChildren,
  setAttributeNodes,
  resetResourceTreeSliceState,
} = resourceTreeSlice.actions;
export default resourceTreeSlice.reducer;
