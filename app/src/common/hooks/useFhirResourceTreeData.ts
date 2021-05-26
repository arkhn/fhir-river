import { useEffect, useMemo } from "react";

import {
  IElementDefinition,
  IElementDefinition_Type,
} from "@ahryman40k/ts-fhir-types/lib/R4";
import upperFirst from "lodash/upperFirst";
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
  getNode,
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
  return {
    id: uuid(),
    name: elementDefinition.id?.split(".").pop() ?? "",
    children: [],
    path: elementPath,
    definition: elementDefinition,
    isArray: index !== undefined ? false : isElementArray(elementDefinition),
    isSlice: !!elementDefinition.sliceName,
    kind: getKind(elementDefinition),
    type: elementDefinition.type?.map((t) => computeType(t)).join(" | "),
  };
};

const createElementDefinition = (attribute: Attribute): IElementDefinition => {
  const elementDefinition: IElementDefinition = {
    path: attribute.path,
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
 * @param parentPath Path used to prefix new nodes paths
 */
export const buildTree = (
  elementDefinitions: IElementDefinition[],
  rootNode: ElementNode,
  previousElementNode: ElementNode,
  parentPath?: string
): void => {
  const [currentElementDefinition, ...rest] = elementDefinitions;
  if (!currentElementDefinition) return;

  if (isOmittedElement(currentElementDefinition)) {
    buildTree(rest, rootNode, previousElementNode, parentPath);
    return;
  }

  const currentElementNode = createElementNode(currentElementDefinition, {
    parentPath,
  });

  if (currentElementNode.kind === "choice") {
    currentElementNode.children = getChildrenChoices(
      currentElementNode.definition,
      parentPath
    );
  }

  if (isElementNodeChildOf(currentElementNode, previousElementNode)) {
    if (
      previousElementNode.isArray &&
      previousElementNode.type === "BackboneElement"
    ) {
      buildTree(rest, rootNode, previousElementNode, parentPath);
    } else {
      previousElementNode.children.push(currentElementNode);
      buildTree(rest, rootNode, currentElementNode, parentPath);
    }
  } else {
    const parent = getParent(previousElementNode, rootNode);
    if (parent) buildTree(elementDefinitions, rootNode, parent, parentPath);
  }
};

/**
 * Add Attributes to RootNode array elements
 * @param rootNode Root of the ElementNode tree
 * @param attributeNodes attributes to add to RootNode
 */
const addAttributesToTree = (
  rootNode: ElementNode,
  attributeNodes: ElementNode[]
) => {
  attributeNodes.forEach((attribute) => {
    if (attribute.definition.path) {
      const node = getNode(
        "path",
        attribute.path.split(/[[]\d+]$/).join(""),
        rootNode
      );
      if (node) {
        node.children.push(attribute);
        node.children.sort((a, b) => (a.path > b.path ? 1 : -1));
      }
    }
  });
};

const useFhirResourceTreeData = (
  params: {
    definitionId: string;
    node?: ElementNode;
  },
  options?: { skip?: boolean }
): {
  root?: ElementNode;
  isStructureDefinitionLoading: boolean;
  isAttributesLoading: boolean;
} => {
  const { definitionId, node } = params;
  const nodeId = node?.id;
  const nodePath = node?.path;
  const {
    data: structureDefinition,
    isLoading: isStructureDefinitionLoading,
  } = useApiStructureDefinitionRetrieveQuery(
    {
      id: definitionId,
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
    if (structureDefinition?.snapshot && attributes) {
      const elementDefinitions = structureDefinition.snapshot.element;
      const rootNode = createElementNode(elementDefinitions[0], {
        parentPath: nodePath,
      });
      buildTree(elementDefinitions.slice(1), rootNode, rootNode, nodePath);
      const attributeNodes = attributes.map((attribute) => {
        const elementDefinition = createElementDefinition(attribute);
        const newElementNode = createElementNode(elementDefinition, {});
        return newElementNode;
      });
      addAttributesToTree(rootNode, attributeNodes);
      return rootNode;
    }
  }, [structureDefinition, nodePath, attributes]);

  useEffect(() => {
    if (data) {
      data && dispatch(setNodeChildren({ data, nodeId }));
    }
  }, [nodeId, data, dispatch]);

  return { root, isStructureDefinitionLoading, isAttributesLoading };
};

export default useFhirResourceTreeData;
