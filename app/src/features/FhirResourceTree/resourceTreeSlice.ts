import { IElementDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "app/store";
import { Attribute } from "services/api/generated/api.generated";

import {
  createElementNode,
  computePathWithoutIndexes,
  getNode,
} from "./resourceTreeUtils";

export type ElementKind = "complex" | "primitive" | "choice" | undefined;

export type ElementNode = {
  id: string;
  name: string;
  path: string;
  kind?: ElementKind;
  isArray: boolean;
  sliceName?: string;
  type?: string;
  definition: IElementDefinition;
  children: ElementNode[];
  backboneElementDefinitions: IElementDefinition[];
  isRequired?: boolean;
};

type ResourceTreeSliceState = {
  root?: ElementNode;
};

const initialState: ResourceTreeSliceState = {};

const resourceTreeSlice = createSlice({
  name: "resourceTree",
  initialState,
  reducers: {
    treeNodeUpdate: (
      state,
      { payload }: PayloadAction<{ nodeId?: string; data: ElementNode }>
    ) => {
      const { nodeId, data } = payload;
      if (!nodeId) {
        state.root = data;
      } else if (state.root) {
        const node = getNode("id", nodeId, state.root);
        if (node && node.children.length === 0) node.children = data.children;
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
            parent.isArray &&
            !parent.children.some(({ path }) => path === node.path)
          ) {
            parent.children.push(node);
            if (parent.type === "BackboneElement") {
              // Manually add children to the BackboneElement item
              parent.backboneElementDefinitions.forEach((elementDefinition) => {
                const childNode = createElementNode(
                  {
                    ...elementDefinition,
                    path: `${node.path}.${elementDefinition.path
                      ?.split(".")
                      .pop()}`,
                  },
                  {}
                );
                node.children.push(childNode);
              });
            }
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
  attibuteNodesAdded,
  attributeNodesDeleted,
} = resourceTreeSlice.actions;
export default resourceTreeSlice.reducer;
