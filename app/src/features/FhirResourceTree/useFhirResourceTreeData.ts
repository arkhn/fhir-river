import { useCallback, useEffect, useMemo } from "react";

import { difference } from "lodash";
import { useParams } from "react-router";

import { useAppDispatch, useAppSelector } from "app/store";
import usePrevious from "common/hooks/usePrevious";
import {
  ElementNode,
  selectRootElementNode,
  attributeNodesDeleted,
  DefinitionNode,
  rootNodeDefinitionUpdated,
  rootElementNodeUpdated,
  attibuteItemsAdded,
  resourceTreeSliceStateReseted,
} from "features/FhirResourceTree/resourceTreeSlice";
import {
  getElementNodeByPath,
  findChildAttributes,
  computeChildPathIndex,
  buildTreeDefinition,
  createDefinitionNode,
  createElementDefinitionPathOrId,
} from "features/FhirResourceTree/resourceTreeUtils";
import {
  useApiStructureDefinitionRetrieveQuery,
  useApiAttributesListQuery,
  useApiAttributesDestroyMutation,
  useApiAttributesCreateMutation,
} from "services/api/endpoints";

/**
 * This hook computes the DefinitionNode tree structure from a fetched structureDefinition.
 * It also provides several help functions to either create or delete items and add extensions.
 *
 * When the DefinitionNode is built, it gets dispatched into the resourceTreeSlice store and also dispatches
 * an action to build the elementNode tree
 * @param params Contains the definitionId to fetch the structureDefinition from.
 * Node represents sur current node from which we want to inject the sub-tree
 * @param options Skip param to prevent structureDefinition fetching
 * @returns
 */
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

  // DefinitionNode tree building
  const data = useMemo(() => {
    // If we already have all the definition needed to populate the node children
    if (node && node.children.length === 0 && options?.skip) {
      return node.definitionNode;
    }
    // Else, we need to populate children DefinitionNode
    else if (structureDefinition?.snapshot) {
      let elementDefinitions = structureDefinition.snapshot.element;
      /**
       * Prefix paths with node definition's path
       * ie: structureDefinition of Reference
       * root definition node is of Observation type
       * We change Reference elementDefintion path/ids to prefix those with Observation paths
       * Reference.type => Observation.reference.type
       */
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
      const rootElementDefinition = elementDefinitions[0];
      if (!rootElementDefinition) return undefined;

      const currentRootDefinitionNode: DefinitionNode = createDefinitionNode(
        rootElementDefinition
      );
      buildTreeDefinition(
        elementDefinitions.slice(1),
        currentRootDefinitionNode,
        currentRootDefinitionNode
      );
      dispatch(
        rootNodeDefinitionUpdated({
          data: currentRootDefinitionNode,
          id: node?.definitionNode.definition.id,
        })
      );
      return currentRootDefinitionNode;
    }
    // We limit definition tree computing only on structureDefintition and nodeDefinition change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structureDefinition, nodeDefinition]);

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
        const parentNode = getElementNodeByPath(nodePath, rootElementNode);
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
    const parentNode = node ?? rootElementNode;
    const extensionArrayNode = parentNode?.children.find(
      ({ type }) => type === "Extension"
    );
    if (extensionArrayNode && extensionArrayNode.type && mappingId) {
      const pathIndex = computeChildPathIndex(extensionArrayNode);
      const attributePath = `${extensionArrayNode.path}[${pathIndex}]`;
      await createAttribute({
        attributeRequest: {
          definition_id: extensionArrayNode.type,
          path: attributePath,
          resource: mappingId,
        },
      }).unwrap();
    }
  }, [createAttribute, mappingId, node, rootElementNode]);

  // Trigger NodeElement tree building when DefinitionNode tree changes
  useEffect(() => {
    const isNodeRootOrChildless = !node || node.children.length === 0;
    if (data && isNodeRootOrChildless) {
      dispatch(
        rootElementNodeUpdated({
          rootNodeDefinition: data,
          nodePath: node?.path,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dispatch, node?.path, node?.definitionNode.definition.id]);

  // Add/Remove attribute nodes from ElementNode tree
  useEffect(() => {
    // The attribute injections only need to happen from the tree rootNodeDefinition scope (ie if !node)
    if (rootElementNode && attributes && !node) {
      const attributesToAdd = attributes.filter(
        ({ path }) => !getElementNodeByPath(path, rootElementNode)
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
  useEffect(() => {
    const addItemToEmptyArray = async () => {
      if (
        node &&
        node.isArray &&
        attributes &&
        node.type !== "Extension" &&
        node.children.length === 0 &&
        !isAttributesFetching
      ) {
        const hasNodeChildren = attributes.some(({ path }) =>
          path.startsWith(node.path)
        );

        if (!hasNodeChildren) {
          await createItem();
        }
      }
    };
    addItemToEmptyArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributes, isAttributesFetching]);

  // Reset Resource tree slice state when tree is unmounted
  useEffect(() => {
    return () => {
      if (!node) {
        dispatch(resourceTreeSliceStateReseted());
      }
    };
  }, [dispatch, node]);

  return {
    rootElementNode,
    isLoading,
    createItem,
    deleteItem,
    addExtension,
  };
};

export default useFhirResourceTreeData;
