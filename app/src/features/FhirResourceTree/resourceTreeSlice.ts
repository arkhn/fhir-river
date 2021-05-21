import { IElementDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
};

const initialState: ResourceTreeSliceState = {};

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

const addDataAttributes = (
  dataAttributes: ElementNode[],
  data: ElementNode
) => {
  dataAttributes.forEach((attribute) => {
    if (attribute.definition.path) {
      const node = getNode("path", attribute.definition.path, data);
      if (node) {
        node.children.push(attribute);
        node.children.sort((a, b) => (a.path > b.path ? 1 : -1));
      }
    }
  });
};

const resourceTreeSlice = createSlice({
  name: "resourceTree",
  initialState,
  reducers: {
    setNodeChildren: (
      state,
      {
        payload,
      }: PayloadAction<{
        nodeId?: string;
        data: ElementNode;
        dataAttributes?: ElementNode[];
      }>
    ) => {
      const { nodeId, data, dataAttributes } = payload;
      if (!nodeId) {
        dataAttributes && addDataAttributes(dataAttributes, data);
        state.root = data;
      } else if (state.root) {
        const node = getNode("id", nodeId, state.root);
        if (node) {
          node.children = data.children;
          dataAttributes && addDataAttributes(dataAttributes, node);
        }
      }
    },
  },
});

export const selectRoot = (state: RootState): ElementNode | undefined =>
  state.resourceTree.root;

export const { setNodeChildren } = resourceTreeSlice.actions;
export default resourceTreeSlice.reducer;
