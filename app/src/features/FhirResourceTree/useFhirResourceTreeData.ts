/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useMemo } from "react";

import { cloneDeep, difference } from "lodash";
import { useParams } from "react-router";

import { useAppDispatch, useAppSelector } from "app/store";
import usePrevious from "common/hooks/usePrevious";
import {
  ElementNode,
  selectRootNodeDefinition,
  selectRootElementNode,
  attributeNodesDeleted,
  DefinitionNode,
  rootNodeDefinitionUpdate,
  rootElementNodeUpdate,
  attibuteItemsAdded,
} from "features/FhirResourceTree/resourceTreeSlice";
import {
  getNode,
  buildTree,
  createElementDefinition,
  createElementNode,
  findChildAttributes,
  computeChildPathIndex,
  buildTreeDefinition,
  createDefinitionNode,
  getNodeDefinitionFromAttribute,
  computePathWithoutIndexes,
  createElementDefinitionPathOrId,
} from "features/FhirResourceTree/resourceTreeUtils";
import {
  useApiStructureDefinitionRetrieveQuery,
  useApiAttributesListQuery,
  useApiAttributesDestroyMutation,
  useApiAttributesCreateMutation,
} from "services/api/endpoints";

const useFhirResourceTreeData = (
  params: {
    definitionId: string;
    node?: ElementNode;
  },
  options?: { skip?: boolean }
): {
  rootElementNode?: ElementNode;
  isLoading: boolean;
  deleteItem: () => Promise<void>;
  addExtension: () => Promise<void>;
  createItem: (sliceName?: string) => Promise<void>;
} => {
  const { definitionId, node } = params;
  const {
    data: structureDefinition,
    isLoading: isStructureDefinitionLoading,
  } = useApiStructureDefinitionRetrieveQuery(
    {
      id: definitionId,
    },
    options
  );
  const [deleteAttribute] = useApiAttributesDestroyMutation();
  const { mappingId } = useParams<{ mappingId?: string }>();
  const dispatch = useAppDispatch();
  const rootNodeDefinition = useAppSelector(selectRootNodeDefinition);
  const rootElementNode = useAppSelector(selectRootElementNode);
  const {
    data: attributes,
    isLoading: isAttributesLoading,
    isFetching: isAttributesFetching,
  } = useApiAttributesListQuery({ resource: mappingId });
  const prevAttributes = usePrevious(attributes);
  const [createAttribute] = useApiAttributesCreateMutation();

  const isLoading = isAttributesLoading && isStructureDefinitionLoading;
  const nodeDefinition = node?.definitionNode.definition;
  const nodePath = node?.path;
  const nodeId = node?.id;

  // DefinitionNode tree building
  const data = useMemo(() => {
    // If we already have all the definition needed to populate the node children
    if (node && node.children.length === 0 && options?.skip) {
      return node.definitionNode;
    }
    // Else, we need to populate children DefinitionNode
    else if (structureDefinition?.snapshot) {
      let elementDefinitions = structureDefinition.snapshot.element;
      // Prefix paths with node definition's path
      if (nodeDefinition) {
        elementDefinitions = elementDefinitions.map((elementDefinition) => ({
          ...elementDefinition,
          id: createElementDefinitionPathOrId(
            nodeDefinition.id ?? "",
            elementDefinition.id ?? ""
          ),
          path: createElementDefinitionPathOrId(
            nodeDefinition.path ?? "",
            elementDefinition.path ?? ""
          ),
        }));
      }
      const elementDefinition = elementDefinitions[0];
      if (!elementDefinition) return undefined;

      const currentRootDefinitionNode: DefinitionNode = createDefinitionNode(
        elementDefinition
      );
      buildTreeDefinition(
        elementDefinitions.slice(1),
        currentRootDefinitionNode,
        currentRootDefinitionNode
      );
      dispatch(
        rootNodeDefinitionUpdate({
          data: currentRootDefinitionNode,
          id: node?.definitionNode.definition.id,
        })
      );
      return currentRootDefinitionNode;
    }
  }, [structureDefinition, nodeDefinition]);

  useEffect(() => {
    console.log(data);
  }, [data]);

  const deleteItem = useCallback(async () => {
    const attributeToDelete = attributes?.find(({ path }) => path === nodePath);

    if (attributeToDelete && !attributeToDelete.slice_name) {
      const childAttributes =
        attributes && findChildAttributes(attributeToDelete, attributes);
      childAttributes &&
        (await Promise.all(
          childAttributes.map(({ id }) => deleteAttribute({ id }).unwrap())
        ));
    }
  }, [attributes, nodePath, deleteAttribute]);

  const createItem = useCallback(
    async (sliceName?: string) => {
      if (nodePath && rootElementNode) {
        const parentNode = getNode("path", nodePath, rootElementNode);
        if (parentNode && parentNode.isArray && parentNode.type && mappingId) {
          const pathIndex = computeChildPathIndex(parentNode);
          const attributePath = `${parentNode.path}[${pathIndex}]`;
          await createAttribute({
            attributeRequest: {
              definition_id: parentNode.type,
              path: attributePath,
              resource: mappingId,
              slice_name: sliceName,
            },
          }).unwrap();
        }
      }
    },
    [createAttribute, mappingId, nodePath, rootElementNode]
  );

  const addExtension = useCallback(async () => {
    // const parentNode = node ?? rootNodeDefinition;
    // const extensionArrayNode = parentNode?.children.find(
    //   ({ type }) => type === "Extension"
    // );
    // if (extensionArrayNode && extensionArrayNode.type && mappingId) {
    //   const pathIndex = computeChildPathIndex(extensionArrayNode);
    //   const attributePath = `${extensionArrayNode.path}[${pathIndex}]`;
    //   await createAttribute({
    //     attributeRequest: {
    //       definition_id: extensionArrayNode.type,
    //       path: attributePath,
    //       resource: mappingId,
    //     },
    //   }).unwrap();
    // }
  }, [createAttribute, mappingId, node, rootNodeDefinition]);
  useEffect(() => {
    if (data && (!node || node.children.length === 0)) {
      dispatch(
        rootElementNodeUpdate({
          rootNodeDefinition: data,
          nodePath: node?.path,
        })
      );
    }
  }, [data, dispatch, node?.path, node?.definitionNode.definition.id]);

  // We build the tree only for the root node (ie !node)
  // useEffect(() => {
  //   if (rootNodeDefinition && !node) {
  //     const root = buildTree(rootNodeDefinition, rootNodeDefinition);
  //     dispatch(rootElementNodeUpdate({ root }));
  //   }
  // }, [dispatch, rootNodeDefinition, node]);

  useEffect(() => {
    // The attribute injections only need to happen from the tree rootNodeDefinition scope (ie if !node)
    if (rootElementNode && attributes && !node) {
      const attributesToAdd = attributes.filter(
        ({ path }) => !getNode("path", path, rootElementNode)
      );

      if (attributesToAdd.length > 0) {
        dispatch(attibuteItemsAdded({ attributes: attributesToAdd }));
      }

      if (prevAttributes) {
        const attributesToRemove = difference(prevAttributes, attributes);
        if (attributesToRemove.length > 0) {
          dispatch(attributeNodesDeleted({ attributes: attributesToRemove }));
        }
      }
    }
  }, [dispatch, attributes, prevAttributes, rootElementNode, node]);

  // Add attribute items to array nodes
  // useEffect(() => {
  //   const addItemToEmptyArray = async () => {
  //     if (
  //       node &&
  //       node.isArray &&
  //       attributes &&
  //       node.type !== "Extension" &&
  //       node.children.length === 0 &&
  //       !isAttributesFetching
  //     ) {
  //       const hasNodeChildren = attributes.some(({ path }) =>
  //         path.startsWith(node.path)
  //       );

  //       if (!hasNodeChildren) {
  //         await createItem();
  //       }
  //     }
  //   };
  //   addItemToEmptyArray();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [node, attributes, isAttributesFetching]);

  return {
    rootElementNode,
    isLoading,
    createItem,
    deleteItem,
    addExtension,
  };
};

export default useFhirResourceTreeData;
