/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ElementDefinition_DiscriminatorTypeKind,
  IElementDefinition,
} from "@ahryman40k/ts-fhir-types/lib/R4";
import { cloneDeep, compact, sortedUniq } from "lodash";

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
  choices?: T[];
  slices?: T[];

  definition: IElementDefinition;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ElementNode extends Element<ElementNode> {}

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

const isMultipleChoice = (
  elementDefinition: IElementDefinition,
  previousElementDefinition: IElementDefinition
): boolean => {
  if (
    elementDefinition.path === previousElementDefinition.path &&
    !!elementDefinition.sliceName &&
    elementDefinition.path &&
    elementDefinition.path.endsWith("[x]")
  )
    return true;
  else return false;
};

const getType = (
  max: string,
  sliceName?: string,
  type?: string
): TypeNature => {
  if ((max === "*" || Number(max) > 1) && !sliceName) {
    return "multiple";
  } else if (
    primitiveTypes.find((primitiveType) => primitiveType === type) ||
    type === "http://hl7.org/fhirpath/System.String"
  ) {
    return "primitive";
  } else if (complexTypes.find((complexType) => complexType === type)) {
    return "complex";
  } else {
    return undefined;
  }
};

const getNature = (
  elementDefinition: IElementDefinition,
  cardinality?: string
): TypeNature => {
  if (
    elementDefinition.max &&
    elementDefinition.type &&
    elementDefinition.type?.length === 1
  ) {
    return getType(
      cardinality ?? elementDefinition.max,
      elementDefinition.sliceName,
      elementDefinition.type[0].code
    );
  } else if (elementDefinition.max && !elementDefinition.type) {
    return getType(
      cardinality ?? elementDefinition.max,
      elementDefinition.sliceName
    );
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
  };
};

const getChildren = (
  elementDefinition: ElementNode,
  elementDefinitions: ElementNode[]
): string[] => {
  const childrenElements = elementDefinitions.filter(
    (element) =>
      element.id?.substring(0, element.id.lastIndexOf(".")) ===
      elementDefinition.id
  );
  const children: string[] = [];
  childrenElements.forEach((c) => c.id && children.push(c.id));
  return children;
};

const getParent = (
  currentElementDefinition: IElementDefinition,
  elementDefinitions: IElementDefinition[]
): IElementDefinition | undefined => {
  const parentElement = elementDefinitions.find(
    (element) =>
      currentElementDefinition.id?.substring(
        0,
        currentElementDefinition.id.lastIndexOf(".")
      ) === element.id ||
      (currentElementDefinition.path === element.path &&
        !!currentElementDefinition.sliceName) ||
      (!currentElementDefinition.sliceName &&
        currentElementDefinition.id === element.id &&
        (currentElementDefinition.max === "*" ||
          Number(currentElementDefinition.max) > 1))
  );
  return parentElement;
};

const buildChildren = (
  snapshot: ElementNode[],
  elementNodes: ElementNode[]
) => {
  const parents = cloneDeep(snapshot);
  const indexToDelete: number[] = [];
  snapshot.forEach((element, index) => {
    if (element.parent) {
      const parentToFind = parents.find((parent) => {
        if (
          element.parent &&
          element.parent.id === parent.id &&
          element.parent.nature === parent.nature
        ) {
          return parent;
        }
      });
      if (parentToFind) {
        const newParent = cloneDeep(parentToFind);
        newParent.children.push(element);
        element.parent = newParent;
        //console.log(element);
        parentToFind.children = element.parent.children;
      }
      if (getChildren(element, parents).length === 0) {
        indexToDelete.push(index);
      }
    }
  });
  indexToDelete.reverse();
  indexToDelete.forEach((index) => {
    parents.splice(index, 1);
  });
  return parents;
};

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

const useFhirResourceTreeData = (): ElementNode[] | any => {
  if (fhirResource.snapshot) {
    const elementDefinitions = fhirResource.snapshot.element.slice(1);

    const buildElements = (): ElementNode[] => {
      const recBuildElements = (
        elementsDefinition: IElementDefinition[],
        elementNodes: ElementNode[],
        previousElementDefinition?: ElementNode
      ): ElementNode[] | any => {
        const [
          currentElementDefinition,
          nextElementDefinition,
          ...remainingSnapshot
        ] = elementsDefinition;

        if (!currentElementDefinition) {
          return elementNodes;
        }

        if (previousElementDefinition) {
          console.log(previousElementDefinition);
          if (
            isChildOf(
              currentElementDefinition,
              previousElementDefinition.definition
            ) &&
            !isChildOf(nextElementDefinition, currentElementDefinition)
          ) {
            console.log(previousElementDefinition.id);
            const child = createElementNode(currentElementDefinition);

            if (previousElementDefinition) {
              child.parent = previousElementDefinition;
              previousElementDefinition.children.push(child);
              return recBuildElements(
                remainingSnapshot,
                elementNodes,
                previousElementDefinition
              );
            }
          }
          const newElementNode = createElementNode(currentElementDefinition);
          elementNodes.push(newElementNode);
          return recBuildElements(
            remainingSnapshot,
            elementNodes,
            previousElementDefinition.parent
          );
        }

        const newElementNode = createElementNode(currentElementDefinition);
        elementNodes.push(newElementNode);
        return recBuildElements(
          remainingSnapshot,
          elementNodes,
          newElementNode
        );
      };

      return recBuildElements(elementDefinitions, []);
    };

    console.log(buildElements());
  }
};

export default useFhirResourceTreeData;
