/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

const getKind = (elementDefinition: IElementDefinition): ElementKind => {
  const { type: types } = elementDefinition;
  const type = types?.length === 1 && types?.[0]?.code;

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
    return elementType.profile[0]?.split("/").pop();
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

export const createDefinitionNode = (
  definition: IElementDefinition
): DefinitionNode => ({
  definition,
  childrenDefinitions: [],
  sliceDefinitions: [],
});

export const createElementDefinition = (
  attribute: Attribute
): IElementDefinition => {
  const elementDefinition: IElementDefinition = {
    path: attribute.path,
    sliceName: attribute.slice_name,
    id: attribute.path.split(/[[]\d+]/).join(""),
    type: [{ code: attribute.definition_id }],
  };
  if (attribute.slice_name) elementDefinition.sliceName = attribute.slice_name;
  return elementDefinition;
};

const getChildrenChoicesDefinition = (
  elementDefinition: IElementDefinition,
  parentPath?: string
): DefinitionNode[] =>
  elementDefinition.type?.map((type) =>
    createDefinitionNode({
      ...elementDefinition,
      type: [{ code: computeType(type) }],
      id: elementDefinition.id?.replace("[x]", upperFirst(type.code) ?? ""),
      path: elementDefinition.path?.replace("[x]", upperFirst(type.code) ?? ""),
    })
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
const isElementDefinitionChildOf = (
  child: IElementDefinition,
  parent: IElementDefinition
) => {
  return isMultipleChoiceOf(child, parent) || isChildOf(child, parent);
};

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

  nodeDefinition.sliceDefinitions.forEach((sliceNodeDefinition) => {
    // TODO: Slice cardinality conditions
    currentNode.children.push(buildTree(sliceNodeDefinition, currentNode));
  });

  if (nodeDefinition.sliceDefinitions.length === 0) {
    nodeDefinition.childrenDefinitions.forEach((childNodeDefinition) => {
      currentNode.children.push(buildTree(childNodeDefinition, currentNode));
    });
  }

  if (parentElementNode) {
    // const isParentRoot = !parentElementNode.path.includes(".");
    // const isParentArray = parentElementNode.isArray;
    // const isDefPathEqualToParentDefPath =
    //   nodeDefinition.definition.path ===
    //   parentElementNode.definitionNode.definition.path;
    // const hasOrWillParentNodeHaveItem =
    //   parentElementNode.children.length > 0 ||
    //   parentElementNode.definitionNode.childrenDefinitions.some(
    //     ({ definition }) =>
    //       definition.path === parentElementNode.definitionNode.definition.path
    //   );
    // if (!isParentRoot && isParentArray) {
    //   if (isDefPathEqualToParentDefPath) {
    //     currentNode.path = `${parentElementNode.path}[${parentElementNode.children.length}]`;
    //     parentElementNode.children.push(currentNode);
    //   } else {
    //     if (!hasOrWillParentNodeHaveItem) {
    //       const arrayItem = createElementNode(
    //         parentElementNode.definitionNode,
    //         {
    //           parentPath: parentElementNode.path,
    //           index: 0,
    //         }
    //       );
    //       parentElementNode.children.push(arrayItem);
    //       parentElementNode.definitionNode.childrenDefinitions.forEach(
    //         (childNodeDef) => {
    //           buildTree(childNodeDef, arrayItem);
    //         }
    //       );
    //       return arrayItem;
    //     }
    //   }
    // } else {
    //   parentElementNode.children.push(currentNode);
    // }
  }

  // nodeDefinition.childrenDefinitions.forEach((childNodeDef) => {
  //   buildTree(childNodeDef, currentNode);
  // });

  return currentNode;
};

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
        currentElementDefinition,
        previousElementNodeDefinition.definition.path
      );
    }

    previousElementNodeDefinition.childrenDefinitions.push(
      currentDefinitionNode
    );
    buildTreeDefinition(rest, rootNodeDefinition, currentDefinitionNode);
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

export const getNodeDefinition = (
  id: string,
  root: DefinitionNode
): DefinitionNode | undefined => {
  if (root.definition.id === id) return root;
  for (const next of root.childrenDefinitions) {
    const result = getNodeDefinition(id, next);
    if (result) return result;
  }
  return undefined;
};

/**
 * Return the last nodeDefinition child having the given path in its definition
 */
export const getNodeDefinitionFromAttribute = (
  attribute: Attribute,
  root: DefinitionNode
): DefinitionNode | undefined => {
  const { path, slice_name } = attribute;
  const elementDefinitionId = `${path.split(/[[]\d+]/).join("")}${
    slice_name ? `:${slice_name}` : ""
  }`;
  if (root.definition.id === elementDefinitionId) return root;
  for (const next of root.childrenDefinitions) {
    const result = getNodeDefinitionFromAttribute(attribute, next);
    if (result) return result;
  }
  return undefined;
};

export const findChildAttributes = (
  attributeToDelete: Attribute,
  attributes: Attribute[]
): Attribute[] => {
  const path = attributeToDelete.path;
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
