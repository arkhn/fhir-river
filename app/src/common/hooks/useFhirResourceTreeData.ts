import { useEffect, useMemo } from "react";

import {
  IElementDefinition,
  IElementDefinition_Type,
} from "@ahryman40k/ts-fhir-types/lib/R4";
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
  selectRootNodes,
  setNodeChildren,
  TypeNature,
} from "features/FhirResourceTree/resourceTreeSlice";
import { useApiStructureDefinitionRetrieveQuery } from "services/api/endpoints";

const toCamelCase = (string?: string) => {
  return string && string.charAt(0).toUpperCase() + string.slice(1);
};

const shouldOmit = (
  elementDefinition: IElementDefinition
): boolean | undefined => {
  if (elementDefinition.base && elementDefinition.base.path) {
    const parsedPath: string[] = elementDefinition.base.path.split(".");

    const pathTail = parsedPath.slice().pop();
    if (pathTail && allowedAttributes.includes(pathTail)) {
      return false;
    }

    const baseResource = parsedPath[0];
    return omittedResources.includes(baseResource);
  }
};

const getNature = (elementDefinition: IElementDefinition): TypeNature => {
  const { max, sliceName, type: types } = elementDefinition;
  const type = types?.length === 1 && types?.[0].code;

  if (max && (max === "*" || +max > 1) && !sliceName) {
    return "array";
  }

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
  typeElement?: IElementDefinition_Type
): string | undefined => {
  if (!typeElement) return;
  const primitive =
    typeElement.extension &&
    typeElement.extension.find(
      (ext) =>
        ext.url ===
        "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type"
    );
  // when dealing with primitive types (eg: fhirpath/System.String), we use the definition indicated
  // by the extension of type "structuredefinition-fhir-type" (see "type" of Observation.id for example).
  if (primitive) return primitive.valueUrl;
  if (typeElement.profile && typeElement.profile.length > 0) {
    return typeElement.profile[0].split("/").pop();
  }
  return typeElement.code;
};

const createElementNode = (
  elementDefinition: IElementDefinition
): ElementNode => {
  return {
    id: uuid(),
    name: elementDefinition.id?.split(".").pop() ?? "",
    children: [],
    path: elementDefinition.path ?? "",
    definition: elementDefinition,
    isSlice: !!elementDefinition.sliceName,
    nature: getNature(elementDefinition),
    type: elementDefinition.type
      ?.map((t) => toCamelCase(computeType(t)))
      .join(" | "),
  };
};

const getChildrenChoices = (
  elementDefinition: IElementDefinition
): ElementNode[] =>
  elementDefinition.type?.map((type) =>
    createElementNode({
      ...elementDefinition,
      type: [{ code: computeType(type) }],
      id: elementDefinition.id?.replace("[x]", toCamelCase(type.code) ?? ""),
      path: elementDefinition.path?.replace(
        "[x]",
        toCamelCase(type.code) ?? ""
      ),
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
  nodes: ElementNode[]
): ElementNode | undefined => {
  const isChildInNodes = nodes.some(({ id }) => id === child.id);

  // If we find the child in the nodes array, this means it doesn't have any parents
  if (isChildInNodes) return undefined;

  for (const node of nodes) {
    const isChildInNodeChildren = node.children.some(
      ({ id }) => id === child.id
    );

    if (isChildInNodeChildren) {
      return node;
    }
  }

  const flattenChildren = nodes.reduce(
    (acc: ElementNode[], node) => [...acc, ...node.children],
    []
  );
  return getParent(child, flattenChildren);
};

const buildElements = (
  elementsDefinition: IElementDefinition[],
  elementNodes: ElementNode[],
  previousElementDefinition?: ElementNode
): ElementNode[] => {
  const [current, ...rest] = elementsDefinition;

  if (!current) {
    return elementNodes;
  }

  if (shouldOmit(current)) {
    return buildElements(rest, elementNodes, previousElementDefinition);
  }

  const currentElementNode = createElementNode(current);

  if (currentElementNode.nature === "choice") {
    currentElementNode.children = getChildrenChoices(
      currentElementNode.definition
    );
  }

  if (previousElementDefinition) {
    if (isElementNodeChildOf(currentElementNode, previousElementDefinition)) {
      previousElementDefinition.children.push(currentElementNode);
      return buildElements(rest, elementNodes, currentElementNode);
    } else {
      // console.log(getParent(previousElementDefinition, elementNodes));
      return buildElements(
        elementsDefinition,
        elementNodes,
        getParent(previousElementDefinition, elementNodes)
      );
    }
  }

  elementNodes.push(currentElementNode);
  return buildElements(rest, elementNodes, currentElementNode);
};

const useFhirResourceTreeData = (
  params: {
    id: string;
    nodeId?: string;
  },
  options?: { skip?: boolean }
): {
  rootNodes?: ElementNode[];
  isLoading: boolean;
} => {
  const { id, nodeId } = params;
  const {
    data: structureDefinition,
    isLoading,
  } = useApiStructureDefinitionRetrieveQuery(
    {
      id,
    },
    options
  );
  const dispatch = useAppDispatch();
  const rootNodes = useAppSelector(selectRootNodes);

  const data = useMemo(() => {
    if (structureDefinition?.snapshot) {
      const elementDefinitions = structureDefinition.snapshot.element.slice(1);
      return buildElements(elementDefinitions, []);
    }
  }, [structureDefinition]);

  useEffect(() => {
    if (data) {
      data && dispatch(setNodeChildren({ children: data, nodeId }));
    }
  }, [nodeId, data, dispatch]);

  return { rootNodes, isLoading };
};

export default useFhirResourceTreeData;
