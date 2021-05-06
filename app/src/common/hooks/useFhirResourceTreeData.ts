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

  children?: any[];
  choices?: T[];
  slices?: string[];

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
  const newNode: ElementNode = {
    id: elementDefinition.id ?? "",
    name: elementDefinition.id?.split(".").pop() ?? "",
    //children: [],
    path: elementDefinition.path ?? "",
    definition: elementDefinition,
    isSlice: !!elementDefinition.sliceName,
  };
  return newNode;
};

const getChildren = (
  elementDefinition: IElementDefinition,
  elementDefinitions: IElementDefinition[]
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
  const clone = cloneDeep(snapshot);
  snapshot.forEach((element) => {
    if (element.parent) {
      //console.log(element);
    }
  });
};

const useFhirResourceTreeData = (): ElementNode[] | any => {
  if (fhirResource.snapshot) {
    const elementDefinitions = fhirResource.snapshot.element.slice(1);
    const snapshot: ElementNode[] = [];

    fhirResource.snapshot.element.slice(1).forEach((elementDefinition) => {
      const elementNode = createElementNode(elementDefinition);
      if (
        getParent(elementDefinition, elementDefinitions) &&
        !elementDefinition.sliceName
      ) {
        const parentElement = getParent(elementDefinition, elementDefinitions);
        const nature = getNature(elementDefinition);
        if (parentElement) {
          const parent = createElementNode(parentElement);
          parent.nature = nature;
          elementNode.parent = parent;
          if (nature === "multiple") {
            const newElementNode = createElementNode(elementDefinition);
            newElementNode.nature = nature;
            elementNode.nature = "complex";
            snapshot.push(newElementNode);
          } else {
            elementNode.nature = nature;
          }
        }
        snapshot.push(elementNode);
        /* if (
          !nature &&
          elementDefinition.path?.endsWith("[x]") &&
          !elementDefinition.sliceName
        ) {
          // creer les enfants des multiple choice
          //console.log(elementDefinition);
        } */
        //push dans
      } else if (
        !getParent(elementDefinition, elementDefinitions) &&
        !elementDefinition.sliceName
      ) {
        const nature = getNature(elementDefinition);
        if (nature === "multiple") {
          const parentElement = createElementNode(elementDefinition);
          parentElement.nature = nature;
          elementNode.nature = getNature(elementDefinition, "1");
          elementNode.parent = parentElement;
          snapshot.push(parentElement);
        } else {
          elementNode.nature = nature;
        }
        snapshot.push(elementNode);
      } else if (elementNode.isSlice) {
        const parentElement = snapshot.find(
          (snap) =>
            elementDefinition.id?.substring(
              0,
              elementDefinition.id.lastIndexOf(".")
            ) === snap.id ||
            (elementDefinition.path === snap.path &&
              !!elementDefinition.sliceName)
        );
        const nature = getNature(elementDefinition, "1");
        elementNode.nature = nature;
        elementNode.parent = parentElement;
        snapshot.push(elementNode);
      }
    });

    const complexSnapshot: ElementNode[] = [];

    const tree = buildChildren(snapshot, []);

    console.log(snapshot);
  }
};

export default useFhirResourceTreeData;
