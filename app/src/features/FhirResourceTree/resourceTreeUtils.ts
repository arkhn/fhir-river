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
import { Attribute } from "services/api/generated/api.generated";

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
  return false;
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
  const elementPath =
    parentPath && index !== undefined
      ? `${parentPath}[${index}]`
      : parentPath
      ? `${parentPath}.${definition.path?.split(".").pop()}`
      : `${definition.path}${index !== undefined ? `[${index}]` : ""}`;
  const elementName = `${definition.id?.split(".").pop()}`;
  return {
    id:
      `${nodeDefinition.definition.id}${
        index !== undefined ? `[${index}]` : ""
      }` ?? uuid(),
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
      parentElementNode?.kind !== "choice"
        ? parentElementNode?.path
        : parentElementNode?.path.split(".").slice(0, -1).join("."),
  });
  const isCurrentNodeRoot = !currentNode.path.includes(".");

  // If current nodeDefinition has slices, we add them to its children
  nodeDefinition.sliceDefinitions.forEach((sliceDefinition, index) => {
    if (
      sliceDefinition.definition.max &&
      (sliceDefinition.definition.max === "*" ||
        +sliceDefinition.definition.max > 0)
    ) {
      const sliceElementNode = createElementNode(sliceDefinition, {
        index: currentNode.isArray ? index : undefined,
        parentPath: currentNode.path,
      });
      currentNode.children.push(sliceElementNode);
      sliceDefinition.childrenDefinitions.forEach((sliceChildDefinition) => {
        buildTree(sliceChildDefinition, sliceElementNode);
      });
    }
  });

  // If current node is array, has no children and has definitions, we add an item
  if (
    !isCurrentNodeRoot &&
    currentNode.isArray &&
    currentNode.children.length === 0 &&
    nodeDefinition.childrenDefinitions.length > 0
  ) {
    const itemNode = createElementNode(nodeDefinition, {
      index: currentNode.children.length,
      parentPath: currentNode.path,
    });
    currentNode.children.push(itemNode);
    nodeDefinition.childrenDefinitions.forEach((childNodeDefinition) => {
      buildTree(childNodeDefinition, itemNode);
    });
  }

  if (parentElementNode) {
    const isParentRoot = !parentElementNode.path.includes(".");

    // If parent is not of type array, we add its childrenDefinitions as children
    if (!parentElementNode.isArray || isParentRoot) {
      parentElementNode.children.push(currentNode);
      nodeDefinition.childrenDefinitions.forEach((childDefinition) => {
        buildTree(childDefinition, currentNode);
      });
    }
  } else {
    nodeDefinition.childrenDefinitions.forEach((childDefinition) =>
      buildTree(childDefinition, currentNode)
    );
  }

  return currentNode;
};

/**
 * Mutates the `rootNodeDefinition` parameter to set the whole DefinitionNode tree
 * @param elementDefinitions Snapshot's elementDefinition array
 * @param rootNodeDefinition The DefinitionNode root of the tree
 * @param previousElementNodeDefinition
 */
export const buildTreeDefinition = (
  elementDefinitions: IElementDefinition[],
  rootNodeDefinition: DefinitionNode,
  previousElementNodeDefinition: DefinitionNode
): void => {
  const [currentElementDefinition, ...rest] = elementDefinitions;
  if (!currentElementDefinition) return;

  if (isOmittedElement(currentElementDefinition)) {
    buildTreeDefinition(
      rest,
      rootNodeDefinition,
      previousElementNodeDefinition
    );
    return;
  }

  const currentDefinitionNode: DefinitionNode = createDefinitionNode(
    currentElementDefinition
  );

  if (
    isSliceOf(
      currentElementDefinition,
      previousElementNodeDefinition.definition
    )
  ) {
    previousElementNodeDefinition.sliceDefinitions.push(currentDefinitionNode);
    buildTreeDefinition(rest, rootNodeDefinition, currentDefinitionNode);
  } else if (
    isElementDefinitionChildOf(
      currentElementDefinition,
      previousElementNodeDefinition.definition
    )
  ) {
    if (getKind(currentElementDefinition) === "choice") {
      currentDefinitionNode.childrenDefinitions = getChildrenChoicesDefinition(
        currentElementDefinition
      );
    }

    if (
      getKind(previousElementNodeDefinition.definition) === "choice" &&
      previousElementNodeDefinition.childrenDefinitions.length > 0
    ) {
      previousElementNodeDefinition.childrenDefinitions.forEach(
        (prevChildDefinition) => {
          prevChildDefinition.childrenDefinitions.push(currentDefinitionNode);
          buildTreeDefinition(rest, rootNodeDefinition, currentDefinitionNode);
        }
      );
    } else {
      previousElementNodeDefinition.childrenDefinitions.push(
        currentDefinitionNode
      );
      buildTreeDefinition(rest, rootNodeDefinition, currentDefinitionNode);
    }
  } else {
    const parent = getDefinitionNodeParent(
      previousElementNodeDefinition,
      rootNodeDefinition
    );
    if (parent)
      buildTreeDefinition(elementDefinitions, rootNodeDefinition, parent);
  }
};

/**
 * Computes path without the last index :
 * `Identifier[0].type.coding[3]` -> `Identifier[0].type.coding`
 * @param node
 */
export const computePathWithoutIndexes = (node: { path: string }): string =>
  node.path.replace(/[[]\d+]$/, "");

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
  for (const next of root.childrenDefinitions) {
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
  const attributePathWithoutIndex = computePathWithoutIndexes(attribute);
  const attributeParentElementNode = getElementNodeByPath(
    attributePathWithoutIndex,
    rootElementNode
  );

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
 * Returns the first available index from the parent node path
 * ie: if parent has 3 children and their path indexes are respectively 1, 2 & 3
 * it will return 0.
 * If all path indexes are taken by the parent children, returns parent.childen.length
 * @param parent Parent node from which we want to create the child path
 */
export const computeChildPathIndex = (parent: ElementNode): number => {
  const childIndexes = parent.children
    // /[[](\d+)]$/ => matches the last path index. ie: for Identifier[0].type.coding[4] => matches 4
    .map(({ path }) => path.match(/[[](\d+)]$/)?.[1])
    .filter(Boolean)
    .map((index) => +(index as string));
  for (let i = 0; i <= parent.children.length; i++) {
    if (!childIndexes.includes(i)) return i;
  }
  return parent.children.length;
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
