import { IElementDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";

import {
  allowedAttributes,
  complexTypes,
  fhirResourceObs as fhirResource,
  omittedResources,
  primitiveTypes,
} from "features/FhirResourceTree/fhirResource";

type TypeNature = "complex" | "primitive" | "multiple" | undefined;

type Element<T> = {
  id: string;
  name: string;
  path: string;

  nature?: TypeNature;
  isSlice: boolean;

  parent?: T;
  children: T[];

  definition: IElementDefinition;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElementNode extends Element<ElementNode> {}

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
  const type = types?.[0].code;

  if (max && (max === "*" || +max > 1) && !sliceName) {
    return "multiple";
  }

  if (
    (type && primitiveTypes.includes(type)) ||
    type === "http://hl7.org/fhirpath/System.String" // Fix : Question
  ) {
    return "primitive";
  }

  if (type && complexTypes.includes(type)) {
    return "complex";
  }
};

const createElementNode = (
  elementDefinition: IElementDefinition
): ElementNode => {
  return {
    id: elementDefinition.id ?? "",
    name: elementDefinition.id?.split(".").pop() ?? "",
    children: [],
    path: elementDefinition.path ?? "",
    definition: elementDefinition,
    isSlice: !!elementDefinition.sliceName,
    nature: getNature(elementDefinition),
  };
};

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
): boolean => {
  if (child.path)
    return child.path.substring(0, child.path.lastIndexOf(".")) === parent.path;
  else {
    return false;
  }
};

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

const useFhirResourceTreeData = (): ElementNode[] => {
  if (fhirResource.snapshot) {
    const elementDefinitions = fhirResource.snapshot.element.slice(1);

    const buildElements = (): ElementNode[] => {
      const recBuildElements = (
        elementsDefinition: IElementDefinition[],
        elementNodes: ElementNode[],
        previousElementDefinition?: ElementNode
      ): ElementNode[] => {
        const [current, ...rest] = elementsDefinition;

        if (!current) {
          return elementNodes;
        }

        if (shouldOmit(current)) {
          return recBuildElements(
            rest,
            elementNodes,
            previousElementDefinition
          );
        }

        const currentElementNode = createElementNode(current);

        if (previousElementDefinition) {
          if (
            isElementNodeChildOf(currentElementNode, previousElementDefinition)
          ) {
            currentElementNode.parent = previousElementDefinition;
            previousElementDefinition.children.push(currentElementNode);
            return recBuildElements(rest, elementNodes, currentElementNode);
          } else {
            return recBuildElements(
              elementsDefinition,
              elementNodes,
              previousElementDefinition.parent
            );
          }
        }

        elementNodes.push(currentElementNode);
        return recBuildElements(rest, elementNodes, currentElementNode);
      };

      return recBuildElements(elementDefinitions, []);
    };

    return buildElements();
  }
  return [];
};

export default useFhirResourceTreeData;
