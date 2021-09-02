import { IElementDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "app/store";
import { Attribute } from "services/api/generated/api.generated";

import {
  buildTree,
  computePathWithoutIndexes,
  createElementNode,
  getElementNodeByPath,
  getDefinitionNodeById,
  getDefinitionNodeFromItemAttribute,
  getPathItemIndex,
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
  definitionNode: DefinitionNode;
  children: ElementNode[];
  isRequired?: boolean;
};

export type DefinitionNode = {
  definition: IElementDefinition;
  childrenDefinitions: DefinitionNode[];
  sliceDefinitions: DefinitionNode[];
};

type ResourceTreeSliceState = {
  rootElementNode?: ElementNode;
  rootNodeDefinition?: DefinitionNode;
};

const initialState: ResourceTreeSliceState = {};

const resourceTreeSlice = createSlice({
  name: "resourceTree",
  initialState,
  reducers: {
    rootNodeDefinitionUpdated: (
      state,
      { payload }: PayloadAction<{ id?: string; data: DefinitionNode }>
    ) => {
      const { id, data } = payload;
      if (!id) {
        state.rootNodeDefinition = data;
      } else if (state.rootNodeDefinition) {
        const nodeDefinition = getDefinitionNodeById(
          id,
          state.rootNodeDefinition
        );
        if (nodeDefinition)
          nodeDefinition.childrenDefinitions = data.childrenDefinitions;
      }
    },
    rootElementNodeUpdated: (
      state,
      {
        payload,
      }: PayloadAction<{
        rootNodeDefinition: DefinitionNode;
        nodePath?: string;
      }>
    ) => {
      const { nodePath, rootNodeDefinition } = payload;
      if (!nodePath) {
        const rootElementNode = buildTree(rootNodeDefinition);
        state.rootElementNode = rootElementNode;
      } else if (state.rootElementNode) {
        const node = getElementNodeByPath(nodePath, state.rootElementNode);
        if (node) {
          rootNodeDefinition.childrenDefinitions
            .filter(({ definition }) => !definition.sliceName)
            .forEach((nodeDefinition) => buildTree(nodeDefinition, node));
        }
      }
    },
    attibuteItemsAdded: (
      state,
      { payload }: PayloadAction<{ attributes: Attribute[] }>
    ) => {
      const { rootElementNode, rootNodeDefinition } = state;
      if (rootNodeDefinition && rootElementNode) {
        const { attributes } = payload;
        attributes.forEach((attribute) => {
          const attributeElementDefinition = getDefinitionNodeFromItemAttribute(
            attribute,
            rootElementNode
          );
          if (attributeElementDefinition) {
            const parentPath = computePathWithoutIndexes(attribute.path);
            const itemIndex = getPathItemIndex(attribute) ?? 0;
            const attributeElementNode = createElementNode(
              attributeElementDefinition,
              { parentPath, index: itemIndex }
            );
            const parent = getElementNodeByPath(parentPath, rootElementNode);
            if (
              parent &&
              parent.isArray &&
              !parent.children.some(
                ({ path }) => path === attributeElementNode.path
              )
            ) {
              parent.children.push(attributeElementNode);
            }
          }
        });
      }
    },
    attributeNodesDeleted: (
      state,
      { payload }: PayloadAction<{ attributes: Attribute[] }>
    ) => {
      const { rootElementNode } = state;
      if (rootElementNode) {
        const { attributes } = payload;
        attributes.forEach((attribute) => {
          const parent = getElementNodeByPath(
            computePathWithoutIndexes(attribute.path),
            rootElementNode
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

export const selectRootElementNode = (
  state: RootState
): ElementNode | undefined => state.resourceTree.rootElementNode;

export const {
  rootNodeDefinitionUpdated,
  rootElementNodeUpdated,
  attibuteItemsAdded,
  attributeNodesDeleted,
} = resourceTreeSlice.actions;
export default resourceTreeSlice.reducer;
