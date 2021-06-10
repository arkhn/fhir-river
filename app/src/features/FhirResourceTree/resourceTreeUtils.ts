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
  const elementName = `${elementDefinition.id?.split(".").pop() ?? ""}${
    elementDefinition.sliceName ? `:${elementDefinition.sliceName}` : ""
  }`;
  return {
    id: uuid(),
    name: elementName,
    children: [],
    path: elementPath,
    definition: elementDefinition,
    isArray: index !== undefined ? false : isElementArray(elementDefinition),
    sliceName: elementDefinition.sliceName,
    kind: getKind(elementDefinition),
    type: elementDefinition.type?.map((t) => computeType(t)).join(" | "),
    backboneElementDefinitions: [],
  };
};

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
 * @param elementDefinitions Array of ElementDefinition form which the ElementNode tree is built
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
