import {
  IElementDefinition,
  IElementDefinition_Type,
} from "@ahryman40k/ts-fhir-types/lib/R4";
import upperFirst from "lodash/upperFirst";
import { v4 as uuid } from "uuid";

import {
  allowedAttributes,
  complexTypes,
  omittedResources,
  primitiveTypes,
} from "features/FhirResourceTree/fhirResource";
import {
  ElementNode,
  ElementKind,
  DefinitionNode,
} from "features/FhirResourceTree/resourceTreeSlice";
import {
  Attribute,
  AttributeRequest,
} from "services/api/generated/api.generated";

/**
 * Checks if `elementDefinition` has to be ignored from tree building algorithm
 * @param elementDefinition ElementDefinition to inspect
 * @returns True if element is omitted, else false
 */
const isOmittedElement = (elementDefinition: IElementDefinition): boolean => {
  if (elementDefinition.base && elementDefinition.base.path) {
    const parsedPath: string[] = elementDefinition.base.path.split(".");

    const pathTail = parsedPath.slice().pop();
    if (pathTail && allowedAttributes.includes(pathTail)) {
      return false;
    }

    const baseResource = parsedPath[0];
    return baseResource ? omittedResources.includes(baseResource) : false;
  }

  return elementDefinition.max !== undefined && +elementDefinition.max === 0;
};

/**
 * Returns the ElementKind matching the elementDefinition
 * @param elementDefinition ElementDefinition to inspect
 * @returns The kind of element the ElementDefinition is (primitive, complex of choice)
 */
const getKind = (elementDefinition: IElementDefinition): ElementKind => {
  const { type: types } = elementDefinition;
  const type = types?.length === 1 && types?.[0]?.code;

  if (
    (type && primitiveTypes.includes(type)) ||
    type === "http://hl7.org/fhirpath/System.String"
  ) {
    return "primitive";
  }

  if (types && elementDefinition.path?.endsWith("[x]")) {
    return "choice";
  }

  if (type && complexTypes.includes(type)) {
    return "complex";
  }
};

/**
 * @param elementType ElementDefinition type attribute item
 * @returns Type associated to the elementType attribute
 */
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
    return elementType.profile[0]?.split("/").pop();
  }
  return elementType.code;
};

/**
 * Checks if elementDefinition is of array type by checking its `max` value and whether it is a slice
 * @param elementDefinition ElementDefinition to inspect
 * @returns True if `elementDefinition.max` is either > 0 or `*` AND elementDefinition is not a slice, else false
 */
const isElementArray = ({ max, sliceName }: IElementDefinition): boolean =>
  (max && (max === "*" || +max > 1) && !sliceName) || false;

/**
 * @param definitionPath Current definition path
 * @param parentPath Path of the parent element
 * @param index Index of the current item
 * @returns Computed path for ElementNode
 */
const computeElementNodePath = (
  definitionPath?: string,
  parentPath?: string,
  index?: number
): string => {
  // If elementNode is an array item of parent, we just need to add index to parent path
  if (parentPath && index !== undefined) {
    return `${parentPath}[${index}]`;
  }

  // If parentPath is defined and there is no index, we build node path from parent path
  // and the last name of definitionPath
  if (parentPath && index === undefined) {
    return `${parentPath}.${definitionPath?.split(".").pop()}`;
  }

  //Else, we just return the definitionPath with an index if it is defined
  return `${definitionPath}${index !== undefined ? `[${index}]` : ""}`;
};

/**
 * Creates an ElementNode from the corresponding DefinitionNode item
 * @param nodeDefinition NodeDefinition created from ElementDefinition snapshot's item
 * @param params Set of index and parentPath used to generate the ElementNode path attribute
 */
export const createElementNode = (
  nodeDefinition: DefinitionNode,
  params: { index?: number; parentPath?: string }
): ElementNode => {
  const { index, parentPath } = params;
  const { definition } = nodeDefinition;
  const elementPath = computeElementNodePath(
    definition.path,
    parentPath,
    index
  );
  const elementName = `${definition.id?.split(".").pop()}`;
  return {
    id: `${definition.id}${index !== undefined ? `[${index}]` : ""}` ?? uuid(),
    name: elementName,
    children: [],
    path: elementPath,
    definitionNode: nodeDefinition,
    isArray: index !== undefined ? false : isElementArray(definition),
    sliceName: definition.sliceName,
    kind: getKind(definition),
    type: definition.type?.map((t) => computeType(t)).join(" | "),
    isRequired: definition.min !== undefined && definition.min > 0,
  };
};

/**
 * Creates a DefinitionNode from an ElementDefinition with its children & slices set to empty arrays
 * @param definition elementDefinition from which the DefinitionNode is created
 * @returns An instance of DefinitionNode
 */
export const createDefinitionNode = (
  definition: IElementDefinition
): DefinitionNode => ({
  definition,
  childrenDefinitions: [],
  sliceDefinitions: [],
});

/**
 * Computes elementDefinition choice children from its type items
 * @param elementDefinition ElementDefinition of Kind `choice`
 * @returns DefinitionNode[] corresponding to elementDefinition children.
 * Each item is a DefinitionNode corresponding to an elementDefinition type.
 */
const getChildrenChoicesDefinition = (
  elementDefinition: IElementDefinition
): DefinitionNode[] =>
  elementDefinition.type?.map((type) =>
    createDefinitionNode({
      ...elementDefinition,
      type: [{ code: computeType(type) }],
      id: elementDefinition.id?.replace("[x]", upperFirst(type.code) ?? ""),
      path: elementDefinition.path?.replace("[x]", upperFirst(type.code) ?? ""),
    })
  ) ?? [];

/**
 * @param slice Slice elementDefinition
 * @param element elementDefinition to check if is `slice` parent
 * @returns Returns true if `slice` is a slice of `elementDefinition`, else returns false
 */
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

/**
 * @param elementDefinition child elementDefinition
 * @param parentElementDefinition Parent element definition
 * @returns True if `elementDefinition` is child choice of `parentElementDefinition`
 */
const isMultipleChoiceOf = (
  elementDefinition: IElementDefinition,
  parentElementDefinition: IElementDefinition
): boolean =>
  !!elementDefinition.path &&
  elementDefinition.path === parentElementDefinition.path &&
  !!elementDefinition.sliceName &&
  elementDefinition.path.endsWith("[x]");

/**
 * @param child Child elementDefinition
 * @param parent Parent elementDefinition
 * @returns True if `child` is a child of `parent` by checking paths, else return false
 */
const isChildOf = (
  child: IElementDefinition,
  parent: IElementDefinition
): boolean =>
  child.path
    ? child.path.substring(0, child.path.lastIndexOf(".")) === parent.path
    : false;

/**
 * Child of in ElementNode terms
 * ie if child is either child, choice of parent
 * @param child
 * @param parent
 */
const isElementDefinitionChildOf = (
  child: IElementDefinition,
  parent: IElementDefinition
) => {
  return isMultipleChoiceOf(child, parent) || isChildOf(child, parent);
};

/**
 * @param child Node to get parent from
 * @param root Tree root in which the search is started
 * @returns The ElementNode parent of `child`, else return undefined
 */
export const getParent = (
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
 * Search in DefinitionNode children & slices to find the `child` parent
 * @param child DefinitionNode to get parent from
 * @param root Tree root DefinitionNode in which the search is started
 * @returns The DefinitionNode parent of `child`, else return undefined
 */
export const getDefinitionNodeParent = (
  child: DefinitionNode,
  root: DefinitionNode
): DefinitionNode | undefined => {
  const childrenAndSlices = [
    ...root.childrenDefinitions,
    ...root.sliceDefinitions,
  ];
  const rootChildrenAndSlicesDefinitionIds = childrenAndSlices.map(
    ({ definition }) => definition.id
  );
  if (rootChildrenAndSlicesDefinitionIds.includes(child.definition.id))
    return root;
  for (const next of childrenAndSlices) {
    const result = getDefinitionNodeParent(child, next);
    if (result) return result;
  }
  return undefined;
};

/**
 * Builds a ElementNode tree from the tree structure given by the `nodeDefinition` parameter
 * @param nodeDefinition Current nodeDefinition
 * @param parentElementNode Parent of the current nodeDefinition
 * @returns The ElementNode instanciated from the `nodeDefinition` parameter
 */
export const buildTree = (
  nodeDefinition: DefinitionNode,
  parentElementNode?: ElementNode
): ElementNode => {
  const currentNode = createElementNode(nodeDefinition, {
    parentPath:
      // If the parent is of choice kind (ie value[x]), we need to remove value[x] from its path to rightly set the child path instead
      parentElementNode?.kind !== "choice"
        ? parentElementNode?.path
        : parentElementNode?.path.split(".").slice(0, -1).join("."),
  });

  const isParentRoot =
    parentElementNode !== undefined && !parentElementNode.path.includes(".");

  if (
    parentElementNode === undefined ||
    !parentElementNode.isArray ||
    isParentRoot
  ) {
    if (parentElementNode !== undefined) {
      parentElementNode.children.push(currentNode);
    }

    nodeDefinition.childrenDefinitions.forEach((childDefinition) =>
      buildTree(childDefinition, currentNode)
    );
  }

  return currentNode;
};

/**
 * Mutates the `rootDefinitionNode` parameter to set the whole DefinitionNode tree
 * @param elementDefinitions Snapshot's elementDefinition array
 * @param rootDefinitionNode The DefinitionNode root of the tree
 * @param previousDefinitionNode
 */
export const buildTreeDefinition = (
  elementDefinitions: IElementDefinition[],
  rootDefinitionNode: DefinitionNode,
  previousDefinitionNode: DefinitionNode
): void => {
  const [currentElementDefinition, ...rest] = elementDefinitions;
  if (!currentElementDefinition) return;

  if (isOmittedElement(currentElementDefinition)) {
    buildTreeDefinition(rest, rootDefinitionNode, previousDefinitionNode);
    return;
  }

  const currentDefinitionNode: DefinitionNode = createDefinitionNode(
    currentElementDefinition
  );

  /**
   * currentElementDefinition path => Observation.category:VSCat
   * previousDefinitionNode path => Observation.category
   */
  if (isSliceOf(currentElementDefinition, previousDefinitionNode.definition)) {
    previousDefinitionNode.sliceDefinitions.push(currentDefinitionNode);
    buildTreeDefinition(rest, rootDefinitionNode, currentDefinitionNode);
  } else if (
    /**
     * currentElementDefinition path => Observation.category.type
     * previousDefinitionNode path => Observation.category
     */
    isElementDefinitionChildOf(
      currentElementDefinition,
      previousDefinitionNode.definition
    )
  ) {
    /**
     * currentElementDefinition path => Observation.value[x]
     */
    if (getKind(currentElementDefinition) === "choice") {
      currentDefinitionNode.childrenDefinitions = getChildrenChoicesDefinition(
        currentElementDefinition
      );
    }

    /**
     * previousDefinitionNode path => Observation.value[x]
     */
    if (
      getKind(previousDefinitionNode.definition) === "choice" &&
      previousDefinitionNode.childrenDefinitions.length > 0
    ) {
      previousDefinitionNode.childrenDefinitions.forEach(
        (prevChildDefinition) => {
          prevChildDefinition.childrenDefinitions.push(currentDefinitionNode);
          buildTreeDefinition(rest, rootDefinitionNode, currentDefinitionNode);
        }
      );
    } else {
      previousDefinitionNode.childrenDefinitions.push(currentDefinitionNode);
      buildTreeDefinition(rest, rootDefinitionNode, currentDefinitionNode);
    }
  } else {
    const parent = getDefinitionNodeParent(
      previousDefinitionNode,
      rootDefinitionNode
    );
    if (parent)
      buildTreeDefinition(elementDefinitions, rootDefinitionNode, parent);
  }
};

/**
 * Computes path without the last index :
 * `Identifier[0].type.coding[3]` -> `Identifier[0].type.coding`
 * @param node
 */
export const computePathWithoutIndexes = (path: string): string =>
  path.replace(/[[]\d+]$/, "");

/**
 * Computes path's index :
 * `Identifier[0].type.coding[3]` -> 3
 * `Identifier[0].type.coding` -> undefined
 * @param node
 */
export const getPathItemIndex = (node: {
  path: string;
}): number | undefined => {
  const strIndex = node.path.match(/[[](\d+)]$/)?.pop();
  return strIndex ? +strIndex : undefined;
};

/**
 *
 * @param path Path used to look for the elementNode
 * @param root ElementNode root of the tree
 * @returns The elementNode found or undefined if not found
 */
export const getElementNodeByPath = (
  path: string,
  root: ElementNode
): ElementNode | undefined => {
  if (root.path === path) return root;
  for (const next of root.children) {
    const result = getElementNodeByPath(path, next);
    if (result) return result;
  }
  return undefined;
};

/**
 * @param id Id used to look for the DefinitionNode
 * @param root DefinitionNode root of the tree
 * @returns The definitionNode found or undefiend if not found
 */
export const getDefinitionNodeById = (
  id: string,
  root: DefinitionNode
): DefinitionNode | undefined => {
  if (root.definition.id === id) return root;
  for (const next of [...root.childrenDefinitions, ...root.sliceDefinitions]) {
    const result = getDefinitionNodeById(id, next);
    if (result) return result;
  }
  return undefined;
};

/**
 * Gets the DefinitionNode matching the given attribute
 * @param attribute
 * @param rootElementNode ElementNode root of the tree
 * @returns The definitionNode matching the attribute path (without index) with the slice name if defined
 */
export const getDefinitionNodeFromItemAttribute = (
  attribute: Attribute,
  rootElementNode: ElementNode
): DefinitionNode | undefined => {
  const attributePathWithoutIndex = computePathWithoutIndexes(attribute.path);
  const attributeParentElementNode = getElementNodeByPath(
    attributePathWithoutIndex,
    rootElementNode
  );

  if (attribute.slice_name) {
    const sliceDefinitionNode = attributeParentElementNode?.definitionNode.sliceDefinitions.find(
      ({ definition }) => definition.sliceName === attribute.slice_name
    );

    if (sliceDefinitionNode) return sliceDefinitionNode;
  }

  return attributeParentElementNode?.definitionNode;
};

/**
 * @param attributeSource Attribute source from which to find children
 * @param attributes Attribute array
 * @returns Attributes which are children of `attributeSource` regarding its path
 */
export const findChildAttributes = (
  attributeSource: Attribute,
  attributes: Attribute[]
): Attribute[] => {
  const path = attributeSource.path;
  return attributes.filter((attribute) => attribute.path.startsWith(path));
};

/**
 * Returns the first available index from the `childrenPaths` array
 * ie: if `childrenPaths` has 3 items and their path indexes are respectively 1, 2 & 3
 * it will return 0.
 * If all path indexes are taken by the items, returns `childrenPaths.length`
 * @param childrenPaths children paths array
 */
export const computeChildPathIndex = (childrenPaths: string[]): number => {
  const childIndexes = childrenPaths
    // /[[](\d+)]$/ => matches the last path index. ie: for Identifier[0].type.coding[4] => matches 4
    .map((path) => path.match(/[[](\d+)]$/)?.[1])
    .filter(Boolean)
    .map((index) => +(index as string));
  for (let i = 0; i <= childrenPaths.length; i++) {
    if (!childIndexes.includes(i)) return i;
  }
  return childrenPaths.length;
};

/**
 * Concat parent path/id with child last suffix path/id
 * @param parentPathOrId `Observation.partOf` (of type Reference)
 * @param childPathOrId `Reference.type`
 * @returns `Observation.partOf.type`
 */
export const createElementDefinitionPathOrId = (
  parentPathOrId: string,
  childPathOrId: string
): string => {
  const suffix = childPathOrId.split(".").slice(1).join(".");
  return `${parentPathOrId}${suffix ? `.${suffix}` : ""}`;
};

/**
 * `Observation.component[3].valueQuantity` => `[Observation.component, Observation.component[3], Observation.component[3].value[x], Observation.component[3].valueQuantity]`
 * @param path Path to decompose
 * @returns Ancestors paths
 */
export const getAncestorsPaths = (path: string): string[] => {
  const fhirTypes = [...complexTypes, ...primitiveTypes].map(upperFirst);
  return path.split(".").reduce((acc: string[], val, index, array) => {
    const valEndingType = fhirTypes.find((type) => val.endsWith(type));
    const valWithoutIndex = computePathWithoutIndexes(val);

    const decomposedValuePath: string[] = [];

    if (valWithoutIndex !== val) {
      decomposedValuePath.push(valWithoutIndex);
    } else if (valEndingType !== undefined) {
      const valMultipleChoiceParent = val.replace(valEndingType, "[x]");
      decomposedValuePath.push(valMultipleChoiceParent);
    }
    decomposedValuePath.push(val);

    if (index === 0) return [];
    if (index === 1) {
      return decomposedValuePath.map((_val) => `${array[0]}.${_val}`);
    } else {
      return [
        ...acc,
        ...decomposedValuePath.map((_val) => `${acc[acc.length - 1]}.${_val}`),
      ];
    }
  }, []);
};

/**
 * Computes an array of AttributeRequests created for the `node` children slice items.
 * What is in the array depends on the min cardinality of the `node` slice definitions
 * & if slice items are already created or not.
 * @param node Current ElementNode
 * @param attributes Mapping attributes already existing
 * @param mappingId Mapping id
 */
export const computeArrayItemsAttributeRequests = (
  node: ElementNode,
  attributes: Attribute[],
  mappingId: string
): AttributeRequest[] => {
  const nodeChildrenAttribute = attributes.filter(
    ({ path }) => computePathWithoutIndexes(path) === node.path
  );
  const nodeChildrenAttributePaths = nodeChildrenAttribute.map(
    ({ path }) => path
  );

  // First create attribute requests for slice items
  const attributeRequests = [
    ...node.definitionNode.sliceDefinitions,
    node.definitionNode,
  ].reduce((acc: AttributeRequest[], { definition }) => {
    const isDefinitionSlice = definition.sliceName !== undefined;
    const minCardinality = definition.min ?? 0;

    /**
     * If definitionNode is a slice, we only count this type of slice items
     * Else, if definitionNode is a "simple" definition, we count ALL the items
     */
    const itemsCount = isDefinitionSlice
      ? nodeChildrenAttribute.filter(
          ({ slice_name }) => slice_name === (definition.sliceName ?? "")
        ).length
      : nodeChildrenAttributePaths.length;
    if (minCardinality > itemsCount) {
      const itemCountDiff = minCardinality - itemsCount;
      const itemAttributeRequests: AttributeRequest[] = [];
      for (let itemIndex = 0; itemIndex < itemCountDiff; itemIndex++) {
        const pathIndex = computeChildPathIndex(nodeChildrenAttributePaths);
        const attributePath = `${node.path}[${pathIndex}]`;
        nodeChildrenAttributePaths.push(attributePath);
        itemAttributeRequests.push({
          definition_id: node.type ?? "",
          path: attributePath,
          resource: mappingId,
          slice_name: definition.sliceName,
        });
      }
      return [...acc, ...itemAttributeRequests];
    }

    return [...acc];
  }, []);
  return attributeRequests;
};
