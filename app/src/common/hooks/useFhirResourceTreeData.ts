import { useCallback, useEffect, useMemo } from "react";

import {
  IElementDefinition,
  IElementDefinition_Type,
} from "@ahryman40k/ts-fhir-types/lib/R4";
import upperFirst from "lodash/upperFirst";
import { useParams } from "react-router";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "app/store";
import {
  allowedAttributes,
  complexTypes,
  omittedResources,
  primitiveTypes,
} from "features/FhirResourceTree/fhirResource";
import {
  ElementNode,
  selectRoot,
  setNodeChildren,
  ElementKind,
  getNode,
  setAttributeNodes,
  resetResourceTreeSliceState,
} from "features/FhirResourceTree/resourceTreeSlice";
import {
  useApiStructureDefinitionRetrieveQuery,
  useApiAttributesListQuery,
  useApiAttributesDestroyMutation,
  useApiAttributesCreateMutation,
} from "services/api/endpoints";
import { Attribute } from "services/api/generated/api.generated";

const isOmittedElement = (elementDefinition: IElementDefinition): boolean => {
  if (elementDefinition.base && elementDefinition.base.path) {
    const parsedPath: string[] = elementDefinition.base.path.split(".");

    const pathTail = parsedPath.slice().pop();
    if (pathTail && allowedAttributes.includes(pathTail)) {
      return false;
    }

    const baseResource = parsedPath[0];
    return omittedResources.includes(baseResource);
  }
  return false;
};

const getKind = (elementDefinition: IElementDefinition): ElementKind => {
  const { type: types } = elementDefinition;
  const type = types?.length === 1 && types?.[0].code;

  if (
    (type && primitiveTypes.includes(type)) ||
    type === "http://hl7.org/fhirpath/System.String"
  ) {
    return "primitive";
  }

  if (type && complexTypes.includes(type)) {
    return "complex";
  }
  if (types && types.length > 1 && elementDefinition.path?.endsWith("[x]")) {
    return "choice";
  }
};

const computeType = (
  elementType?: IElementDefinition_Type
): string | undefined => {
  if (!elementType) return;
  const primitive =
    elementType.extension &&
    elementType.extension.find(
      (ext) =>
        ext.url ===
        "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type"
    );
  // when dealing with primitive types (eg: fhirpath/System.String), we use the definition indicated
  // by the extension of type "structuredefinition-fhir-type" (see "type" of Observation.id for example).
  if (primitive) return primitive.valueUrl;
  if (elementType.profile && elementType.profile.length > 0) {
    return elementType.profile[0].split("/").pop();
  }
  return elementType.code;
};

const isElementArray = ({ max, sliceName }: IElementDefinition): boolean =>
  (max && (max === "*" || +max > 1) && !sliceName) || false;

/**
 * Creates an ElementNode from the corresponding ElementDefinition item
 * @param elementDefinition Element of StructureDef's snapshot used to create an ElementNode
 * @param params Set of index and parentPath used to generate the ElementNode path attribute
 */
export const createElementNode = (
  elementDefinition: IElementDefinition,
  params: { index?: number; parentPath?: string }
): ElementNode => {
  const { index, parentPath } = params;
  const prefixPath = parentPath || elementDefinition.path?.split(".").shift();
  const suffixPath = elementDefinition.path?.split(".").slice(1).join(".");
  const elementPath = `${prefixPath}${
    prefixPath && suffixPath && "."
  }${suffixPath}${index !== undefined ? `[${index}]` : ""}`;
  return {
    id: uuid(),
    name: elementDefinition.id?.split(".").pop() ?? "",
    children: [],
    path: elementPath,
    definition: elementDefinition,
    isArray: index !== undefined ? false : isElementArray(elementDefinition),
    isSlice: !!elementDefinition.sliceName,
    kind: getKind(elementDefinition),
    type: elementDefinition.type?.map((t) => computeType(t)).join(" | "),
    backboneElementDefinitions: [],
  };
};

const createElementDefinition = (attribute: Attribute): IElementDefinition => {
  const elementDefinition: IElementDefinition = {
    path: attribute.path,
    id: attribute.path.split(/[[]\d+]/).join(""),
    type: [{ code: attribute.definition_id }],
  };
  if (attribute.slice_name) elementDefinition.sliceName = attribute.slice_name;
  return elementDefinition;
};

const getChildrenChoices = (
  elementDefinition: IElementDefinition,
  parentPath?: string
): ElementNode[] =>
  elementDefinition.type?.map((type) =>
    createElementNode(
      {
        ...elementDefinition,
        type: [{ code: computeType(type) }],
        id: elementDefinition.id?.replace("[x]", upperFirst(type.code) ?? ""),
        path: elementDefinition.path?.replace(
          "[x]",
          upperFirst(type.code) ?? ""
        ),
      },
      { parentPath }
    )
  ) ?? [];

const isSliceOf = (
  slice: IElementDefinition,
  element: IElementDefinition
): boolean => {
  if (slice.path) {
    return (
      slice.path === element.path && !!slice.sliceName && !element.sliceName
    );
  } else {
    return false;
  }
};

const isMultipleChoiceOf = (
  elementDefinition: IElementDefinition,
  previousElementDefinition: IElementDefinition
): boolean =>
  !!elementDefinition.path &&
  elementDefinition.path === previousElementDefinition.path &&
  !!elementDefinition.sliceName &&
  elementDefinition.path.endsWith("[x]");

const isChildOf = (
  child: IElementDefinition,
  parent: IElementDefinition
): boolean =>
  child.path
    ? child.path.substring(0, child.path.lastIndexOf(".")) === parent.path
    : false;

/**
 * Child of in ElementNode terms
 * ie if child is either child, slice or choice of parent
 * @param child
 * @param parent
 */
const isElementNodeChildOf = (child: ElementNode, parent: ElementNode) => {
  const { definition: childDefinition } = child;
  const { definition: parentDefinition } = parent;
  return (
    isMultipleChoiceOf(childDefinition, parentDefinition) ||
    isChildOf(childDefinition, parentDefinition) ||
    isSliceOf(childDefinition, parentDefinition)
  );
};

const getParent = (
  child: ElementNode,
  root: ElementNode
): ElementNode | undefined => {
  if (root.children.includes(child)) return root;
  for (const next of root.children) {
    const result = getParent(child, next);
    if (result) return result;
  }
  return undefined;
};

/**
 * Mutates the `rootNode` argument to build the whole ElementNode tree
 * @param elementDefinitions Array of ElementDefinition from which the ElementNode tree is built
 * @param rootNode Root of the ElementNode tree
 * @param previousElementNode Previous generated ElementNode which has been set in the tree
 */
export const buildTree = (
  elementDefinitions: IElementDefinition[],
  rootNode: ElementNode,
  previousElementNode: ElementNode
): void => {
  const [currentElementDefinition, ...rest] = elementDefinitions;
  if (!currentElementDefinition) return;

  if (isOmittedElement(currentElementDefinition)) {
    buildTree(rest, rootNode, previousElementNode);
    return;
  }

  const currentElementNode = createElementNode(currentElementDefinition, {
    parentPath: rootNode.path,
  });

  if (currentElementNode.kind === "choice") {
    currentElementNode.children = getChildrenChoices(
      currentElementNode.definition,
      rootNode.path
    );
  }
  if (isElementNodeChildOf(currentElementNode, previousElementNode)) {
    if (
      previousElementNode.isArray &&
      previousElementNode.type === "BackboneElement"
    ) {
      previousElementNode.backboneElementDefinitions.push(
        currentElementDefinition
      );
      buildTree(rest, rootNode, previousElementNode);
    } else {
      previousElementNode.children.push(currentElementNode);
      buildTree(rest, rootNode, currentElementNode);
    }
  } else {
    const parent = getParent(previousElementNode, rootNode);
    if (parent) buildTree(elementDefinitions, rootNode, parent);
  }
};

const findChildAttributes = (
  attributeToDelete: Attribute,
  attributes: Attribute[]
): Attribute[] => {
  const path = attributeToDelete.path;
  return attributes.filter((attribute) => attribute.path.startsWith(path));
};

const computeChildPathIndex = (parent: ElementNode) => {
  const childIndexes = parent.children
    .map(({ path }) => path.match(/[[](\d+)]$/)?.[1])
    .filter(Boolean)
    .map((index) => +(index as string));
  for (let i = 0; i <= parent.children.length; i++) {
    if (!childIndexes.includes(i)) return i;
  }
};

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
      const childAttributes =
        attributes && findChildAttributes(attributeToDelete, attributes);
      childAttributes &&
        (await Promise.all(
          childAttributes.map(({ id }) => deleteAttribute({ id }).unwrap())
        ));
    }
  }, [attributes, nodePath, deleteAttribute]);
  const createItem = useCallback(async () => {
    if (nodeId && root) {
      const parentNode = getNode("id", nodeId, root);

      if (parentNode && parentNode.isArray && parentNode.type && mappingId) {
        const pathIndex = computeChildPathIndex(parentNode);
        const attributePath = `${parentNode.path}[${pathIndex}]`;
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
      data && dispatch(setNodeChildren({ data, nodeId }));
    }
  }, [nodeId, data, dispatch]);

  useEffect(() => {
    if (attributes) {
      const attributeNodes = attributes.map((attribute) => {
        const elementDefinition = createElementDefinition(attribute);
        return createElementNode(elementDefinition, {});
      });
      dispatch(setAttributeNodes({ attributeNodes }));
    }
  }, [dispatch, attributes]);

  useEffect(
    () => () => {
      // Check on !node to call this only when the tree root in unmounted
      if (!node) {
        dispatch(resetResourceTreeSliceState());
      }
    },
    [dispatch, node]
  );

  return { root, isLoading, createItem, deleteItem };
};

export default useFhirResourceTreeData;
