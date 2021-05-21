/* eslint-disable @typescript-eslint/no-unused-vars */
import { createElement, useEffect, useMemo } from "react";

import {
  IElementDefinition,
  IElementDefinition_Type,
} from "@ahryman40k/ts-fhir-types/lib/R4";
import camelCase from "lodash/camelCase";
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
} from "features/FhirResourceTree/resourceTreeSlice";
import {
  useApiStructureDefinitionRetrieveQuery,
  useApiAttributesListQuery,
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

const createElementNode = (
  elementDefinition: IElementDefinition,
  isArrayItem?: boolean
): ElementNode => {
  return {
    id: uuid(),
    name: elementDefinition.id?.split(".").pop() ?? "",
    children: [],
    path: elementDefinition.path ?? "",
    definition: elementDefinition,
    isArray:
      undefined !== isArrayItem
        ? !isArrayItem
        : isElementArray(elementDefinition),
    isSlice: !!elementDefinition.sliceName,
    kind: getKind(elementDefinition),
    type: elementDefinition.type?.map((t) => computeType(t)).join(" | "),
  };
};

const getNewPath = (path: string): string => {
  if (path.endsWith(`]`)) {
    const splittedPath = path.split(".");
    const lastPathElement = splittedPath.pop()?.split("[")[0];
    if (lastPathElement) splittedPath.push(lastPathElement);
    return splittedPath.join(".");
  } else {
    return path;
  }
};

const createElementDefinition = (attribute: Attribute): IElementDefinition => {
  const elementDefinition: IElementDefinition = {
    path: attribute.path,
    id: getNewPath(attribute.path),
    type: [{ code: attribute.definition_id }],
  };
  if (attribute.slice_name) elementDefinition.sliceName = attribute.slice_name;
  return elementDefinition;
};

const getChildrenChoices = (
  elementDefinition: IElementDefinition
): ElementNode[] =>
  elementDefinition.type?.map((type) =>
    createElementNode({
      ...elementDefinition,
      type: [{ code: computeType(type) }],
      id: elementDefinition.id?.replace("[x]", camelCase(type.code) ?? ""),
      path: elementDefinition.path?.replace("[x]", camelCase(type.code) ?? ""),
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

const buildTree = (
  elementsDefinition: IElementDefinition[],
  rootNode: ElementNode,
  previousElementNode: ElementNode
): void => {
  const [currentElementDefinition, ...rest] = elementsDefinition;

  if (!currentElementDefinition) return;

  if (isOmittedElement(currentElementDefinition)) {
    buildTree(rest, rootNode, previousElementNode);
    return;
  }

  const currentElementNode = createElementNode(currentElementDefinition);

  if (currentElementNode.kind === "choice") {
    currentElementNode.children = getChildrenChoices(
      currentElementNode.definition
    );
  }

  if (
    isElementNodeChildOf(currentElementNode, previousElementNode) &&
    (!previousElementNode.isArray || rootNode === previousElementNode)
  ) {
    previousElementNode.children.push(currentElementNode);
    buildTree(rest, rootNode, currentElementNode);
  } else {
    const parent = getParent(previousElementNode, rootNode);
    if (parent) buildTree(elementsDefinition, rootNode, parent);
  }
};

const useFhirResourceTreeData = (
  params: {
    id: string;
    nodeId?: string;
  },
  options?: { skip?: boolean }
): {
  root?: ElementNode;
  isStructureDefinitionLoading: boolean;
  isAttributesLoading: boolean;
} => {
  const { id, nodeId } = params;
  const {
    data: structureDefinition,
    isLoading: isStructureDefinitionLoading,
  } = useApiStructureDefinitionRetrieveQuery(
    {
      id,
    },
    options
  );
  const { mappingId } = useParams<{ mappingId?: string }>();
  const dispatch = useAppDispatch();
  const root = useAppSelector(selectRoot);

  const {
    data: attributes,
    isLoading: isAttributesLoading,
  } = useApiAttributesListQuery({ resource: mappingId });

  const data = useMemo(() => {
    if (structureDefinition?.snapshot) {
      const elementDefinitions = structureDefinition.snapshot.element;
      const rootNode = createElementNode(elementDefinitions[0]);
      buildTree(elementDefinitions.slice(1), rootNode, rootNode);
      return rootNode;
    }
  }, [structureDefinition]);

  const dataAttributes = useMemo(() => {
    if (attributes) {
      const elementNodes: ElementNode[] = [];
      attributes.forEach((attribute) => {
        const elementDefinition = createElementDefinition(attribute);
        const newElementNode = createElementNode(elementDefinition);
        newElementNode.definition.path = newElementNode.definition.id;
        elementNodes.push(newElementNode);
      });
      return elementNodes;
    }
  }, [attributes]);

  useEffect(() => {
    if (data) {
      data && dispatch(setNodeChildren({ data, nodeId, dataAttributes }));
    }
  }, [nodeId, data, dispatch, dataAttributes]);

  return { root, isStructureDefinitionLoading, isAttributesLoading };
};

export default useFhirResourceTreeData;
