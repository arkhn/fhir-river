import { useCallback, useEffect, useMemo } from "react";

import { difference } from "lodash";
import { useParams } from "react-router";

import { useAppDispatch, useAppSelector } from "app/store";
import {
  ElementNode,
  selectRoot,
  treeNodeUpdate,
  attibuteNodesAdded,
  attributeNodesDeleted,
} from "features/FhirResourceTree/resourceTreeSlice";
import {
  getNode,
  buildTree,
  createElementDefinition,
  createElementNode,
} from "features/FhirResourceTree/resourceTreeUtils";
import {
  useApiStructureDefinitionRetrieveQuery,
  useApiAttributesListQuery,
  useApiAttributesDestroyMutation,
  useApiAttributesCreateMutation,
} from "services/api/endpoints";

import usePrevious from "./usePrevious";

const useFhirResourceTreeData = (
  params: {
    definitionId: string;
    node?: ElementNode;
  },
  options?: { skip?: boolean }
): {
  root?: ElementNode;
  isLoading: boolean;
  deleteItem: () => Promise<void>;
  createItem: () => Promise<void>;
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
  const root = useAppSelector(selectRoot);
  const {
    data: attributes,
    isLoading: isAttributesLoading,
  } = useApiAttributesListQuery({ resource: mappingId });
  const prevAttributes = usePrevious(attributes);
  const [createAttribute] = useApiAttributesCreateMutation();

  const isLoading = isAttributesLoading && isStructureDefinitionLoading;
  const nodeId = node?.id;
  const nodePath = node?.path;

  const data = useMemo(() => {
    if (structureDefinition?.snapshot) {
      const elementDefinitions = structureDefinition.snapshot.element;
      const rootNode = createElementNode(elementDefinitions[0], {
        parentPath: nodePath,
      });
      buildTree(elementDefinitions.slice(1), rootNode, rootNode);
      return rootNode;
    }
  }, [structureDefinition, nodePath]);

  const deleteItem = useCallback(async () => {
    const attributeToDelete = attributes?.find(({ path }) => path === nodePath);

    if (attributeToDelete) {
      await deleteAttribute({ id: attributeToDelete.id }).unwrap();
    }
  }, [attributes, nodePath, deleteAttribute]);
  const createItem = useCallback(async () => {
    if (nodeId && root) {
      const parentNode = getNode("id", nodeId, root);

      if (parentNode && parentNode.isArray && parentNode.type && mappingId) {
        const attributePath = `${parentNode.path}[${parentNode.children.length}]`;
        await createAttribute({
          attributeRequest: {
            definition_id: parentNode.type,
            path: attributePath,
            resource: mappingId,
          },
        }).unwrap();
      }
    }
  }, [createAttribute, mappingId, nodeId, root]);

  useEffect(() => {
    if (data) {
      data && dispatch(treeNodeUpdate({ data, nodeId }));
    }
  }, [nodeId, data, dispatch]);

  useEffect(() => {
    // The attribute injections only need to happen from the tree root scope (ie if !node)
    if (root && attributes && !node) {
      const attributesToAdd = attributes.filter(
        ({ path }) => !getNode("path", path, root)
      );

      if (attributesToAdd.length > 0) {
        const attributeNodes = attributesToAdd.map((attribute) => {
          const elementDefinition = createElementDefinition(attribute);
          return createElementNode(elementDefinition, {});
        });
        dispatch(attibuteNodesAdded({ nodes: attributeNodes }));
      }

      if (prevAttributes) {
        const attributesToRemove = difference(prevAttributes, attributes);
        if (attributesToRemove.length > 0) {
          dispatch(attributeNodesDeleted({ attributes: attributesToRemove }));
        }
      }
    }
  }, [dispatch, attributes, prevAttributes, root, node]);

  return { root, isLoading, createItem, deleteItem };
};

export default useFhirResourceTreeData;
