import { IElementDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import { last } from "lodash";

import {
  //complexTypes,
  fhirResource,
  //primitiveTypes,
} from "features/FhirResourceTree/fhirResource";

/**
 * name: newPath
 * id: id
 */
type Element<T> = {
  id: string;
  name: string;
  type?: string;
  status: string;
  nature: "complex" | "primitive" | "multiple";
  children: T[];
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ElementNode extends Element<ElementNode> {}

const createElementNode = (element: IElementDefinition): ElementNode => {
  const id = element.id ?? "";
  const name = last(id.split(".")) ?? "";
  return {
    id,
    name,
    status: "toto",
    nature: "complex",
    children: [],
  };
};

const useFhirResourceTreeData = (): ElementNode[] => {
  const nodes: ElementNode[] = [];
  if (fhirResource.snapshot) {
    const unstructuredNodes = fhirResource.snapshot.element.map(
      createElementNode
    );

    for (const node of unstructuredNodes) {
      const { id } = node;
      const splittedId = id.split(".");
      const parentNodeId = splittedId.slice(0, splittedId.length - 1).join(".");
      const parentNode = unstructuredNodes.find((n) => n.id === parentNodeId);

      parentNode && parentNode.children.push(node);
    }
    console.log(unstructuredNodes);
  }
  return nodes;
};

export default useFhirResourceTreeData;
