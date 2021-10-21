import {
  attributeFactory,
  definitionNodeFactory,
  elementNodeFactory,
  structureDefinitionFactory,
} from "services/api/factory";
import { AttributeRequest } from "services/api/generated/api.generated";

import {
  buildTree,
  buildTreeDefinition,
  computeArrayItemsAttributeRequests,
  computeChildPathIndex,
  computePathWithoutIndexes,
  createDefinitionNode,
  createElementDefinitionPathOrId,
  createElementNode,
  findChildAttributes,
  getAncestorsPaths,
  getDefinitionNodeById,
  getDefinitionNodeFromItemAttribute,
  getDefinitionNodeParent,
  getElementNodeByPath,
  getParent,
} from "../resourceTreeUtils";

const structureDefinition = structureDefinitionFactory.build();

describe("BuildTree algorithm", () => {
  it("Should create correct path", () => {
    const elementDefinitions = structureDefinition.snapshot?.element ?? [];
    const elementDefinitionRoot = elementDefinitions[0];

    if (elementDefinitionRoot) {
      const rootDefinitionNode = createDefinitionNode(elementDefinitionRoot);
      buildTreeDefinition(
        elementDefinitions.slice(1),
        rootDefinitionNode,
        rootDefinitionNode
      );

      const elementNodeRoot = buildTree(rootDefinitionNode);

      //Basic tree generation
      expect(elementNodeRoot.path).toBe(elementDefinitionRoot.path);
      expect(elementNodeRoot.children[0]?.path).toBe(
        elementDefinitions?.[1]?.path
      );
    }
  });
});

describe("createElementDefinitionPathOrId", () => {
  it("simple path concat", () => {
    const parentPath = "Observation.partOf";
    const childPath = "Reference.type";
    const expectedResult = "Observation.partOf.type";
    expect(createElementDefinitionPathOrId(parentPath, childPath)).toBe(
      expectedResult
    );
  });

  it("child root path concat", () => {
    const parentPath = "Observation.partOf";
    const childPath = "Reference";
    const expectedResult = "Observation.partOf";
    expect(createElementDefinitionPathOrId(parentPath, childPath)).toBe(
      expectedResult
    );
  });

  it("child of slice", () => {
    const parentPath = "Observation.partOf:partOfSlice";
    const childPath = "Reference.type";
    const expectedResult = "Observation.partOf:partOfSlice.type";
    expect(createElementDefinitionPathOrId(parentPath, childPath)).toBe(
      expectedResult
    );
  });
});

describe("computeChildPathIndex", () => {
  it("indexes 0 & 1 are taken", () => {
    const rootElementNode = elementNodeFactory.build(
      {},
      { transient: { childrenIndexes: [0, 1] } }
    );
    expect(
      computeChildPathIndex(rootElementNode.children.map(({ path }) => path))
    ).toBe(2);
  });

  it("indexes 0 & 2 are taken", () => {
    const rootElementNode = elementNodeFactory.build(
      {},
      { transient: { childrenIndexes: [0, 2] } }
    );
    expect(
      computeChildPathIndex(rootElementNode.children.map(({ path }) => path))
    ).toBe(1);
  });
});

describe("findChildAttributes", () => {
  it("find simple children", () => {
    const attributePaths = [
      "Observation",
      "Observation.partOf[0]",
      "Observation.partOf[1]",
      "Observation.partOf[1].type",
      "Observation.partOf[1].code",
      "Observation.partOf[1].code.coding",
      "Observation.partOf[1].code.coding[0]",
    ];
    const attributes = attributePaths.map((path) =>
      attributeFactory.build({ path })
    );
    const attributeSource = attributes.find(
      ({ path }) => path === "Observation.partOf[1]"
    );

    if (attributeSource) {
      expect(findChildAttributes(attributeSource, attributes)).toStrictEqual(
        attributes.slice(2)
      );
    }
  });
});

describe("getDefinitionNodeFromItemAttribute", () => {
  it("find simple attribute", () => {
    const rootElementNode = elementNodeFactory.build(
      {},
      { transient: { childrenIndexes: [0, 1] } }
    );
    const secondChild = rootElementNode.children[1];
    const attribute = attributeFactory.build({
      path: secondChild?.path,
    });

    expect(
      getDefinitionNodeFromItemAttribute(attribute, rootElementNode)
    ).toStrictEqual(secondChild?.definitionNode);
  });
});

describe("getDefinitionNodeById", () => {
  const rootDefinitionNode = definitionNodeFactory.build();
  it("get simple node", () => {
    const id = "Observation.code.coding";
    expect(getDefinitionNodeById(id, rootDefinitionNode)).toBe(
      rootDefinitionNode.childrenDefinitions[0]
    );
  });
  it("get slice node", () => {
    const id = "Observation.code:codeSlice.coding";
    expect(getDefinitionNodeById(id, rootDefinitionNode)).toBe(
      rootDefinitionNode.sliceDefinitions[0]?.childrenDefinitions[0]
    );
  });
});

describe("getElementNodeByPath", () => {
  const rootElementNode = elementNodeFactory.build(
    {},
    { transient: { childrenIndexes: [0, 1] } }
  );

  it("get simple node", () => {
    const path = "Observation.code.coding";
    expect(getElementNodeByPath(path, rootElementNode)).toStrictEqual(
      rootElementNode
    );
  });
  it("get item node", () => {
    const path = "Observation.code.coding[1]";
    expect(getElementNodeByPath(path, rootElementNode)).toStrictEqual(
      rootElementNode.children[1]
    );
  });
});

describe("computePathWithoutIndexes", () => {
  it("simple path", () => {
    const path = "Observation.code.coding[0]";
    const pathWithoutIndex = "Observation.code.coding";

    expect(computePathWithoutIndexes(path)).toBe(pathWithoutIndex);
  });
  it("nested item path", () => {
    const path = "Observation.code.coding[0].type.coding[3]";
    const pathWithoutIndex = "Observation.code.coding[0].type.coding";

    expect(computePathWithoutIndexes(path)).toBe(pathWithoutIndex);
  });
});

describe("getDefinitionNodeParent", () => {
  const rootDefinitionNode = definitionNodeFactory.build();

  it("simple node parent", () => {
    const childDefinitionNode = rootDefinitionNode.childrenDefinitions[0];
    if (childDefinitionNode) {
      expect(
        getDefinitionNodeParent(childDefinitionNode, rootDefinitionNode)
      ).toStrictEqual(rootDefinitionNode);
    }
  });

  it("slice node parent", () => {
    const sliceDefinitionNode = rootDefinitionNode.sliceDefinitions[0];
    if (sliceDefinitionNode) {
      expect(
        getDefinitionNodeParent(sliceDefinitionNode, rootDefinitionNode)
      ).toStrictEqual(rootDefinitionNode);
    }
  });
});

describe("getParent", () => {
  const rootElementNode = elementNodeFactory.build(
    {},
    { transient: { childrenIndexes: [0, 1] } }
  );

  it("simple node parent", () => {
    const childElementNode = rootElementNode.children[1];
    if (childElementNode) {
      expect(getParent(childElementNode, rootElementNode)).toStrictEqual(
        rootElementNode
      );
    }
  });

  it("nested node item", () => {
    const childElementNode = rootElementNode.children[1]?.children[0];
    if (childElementNode) {
      expect(getParent(childElementNode, rootElementNode)).toStrictEqual(
        rootElementNode.children[1]
      );
    }
  });
});

describe("createElementNode", () => {
  const rootDefinitionNode = definitionNodeFactory.build();
  it("simple path check", () => {
    const elementNode = createElementNode(rootDefinitionNode, {});
    expect(elementNode.path).toEqual(rootDefinitionNode.definition.path);
  });
  it("parrent path concatenation check", () => {
    const parentPath = "Encounter.subject";
    const elementNode = createElementNode(rootDefinitionNode, { parentPath });
    const resultPath = "Encounter.subject.code";
    expect(elementNode.path).toEqual(resultPath);
  });
  it("parrent path concatenation with index check", () => {
    const parentPath = "Encounter.subject";
    const elementNode = createElementNode(rootDefinitionNode, {
      parentPath,
      index: 3,
    });
    const resultPath = "Encounter.subject[3]";
    expect(elementNode.path).toEqual(resultPath);
  });
});

describe("getAncestorsPaths", () => {
  it("simple path", () => {
    const path = "Observation.code";
    expect(getAncestorsPaths(path)).toStrictEqual([path]);
  });

  it("more complexe path", () => {
    const path = "Observation.code.coding";
    expect(getAncestorsPaths(path)).toStrictEqual(["Observation.code", path]);
  });

  it("path with array item", () => {
    const path = "Observation.code.coding[0]";
    expect(getAncestorsPaths(path)).toStrictEqual([
      "Observation.code",
      "Observation.code.coding",
      path,
    ]);
  });
  it("very nested path with array item", () => {
    const path = "Observation.code.coding[0].type.code.coding[3].type";
    expect(getAncestorsPaths(path)).toStrictEqual([
      "Observation.code",
      "Observation.code.coding",
      "Observation.code.coding[0]",
      "Observation.code.coding[0].type",
      "Observation.code.coding[0].type.code",
      "Observation.code.coding[0].type.code.coding",
      "Observation.code.coding[0].type.code.coding[3]",
      path,
    ]);
  });
  it("path with multiple choice", () => {
    const path = "Observation.component[3].valueQuantity";
    expect(getAncestorsPaths(path)).toStrictEqual([
      "Observation.component",
      "Observation.component[3]",
      "Observation.component[3].value[x]",
      path,
    ]);
  });
});

describe("computeSliceAttributeRequests", () => {
  const mappingId = "1";
  it("with simple slice and min cardinality === 1", () => {
    const rootElementNode = elementNodeFactory.build();
    const rootDefinitionNode = definitionNodeFactory.build({
      sliceDefinitions: [
        {
          definition: { min: 1 },
          childrenDefinitions: [],
          sliceDefinitions: [],
        },
      ],
    });

    expect(rootDefinitionNode.childrenDefinitions.length).toBe(1);
    expect(rootDefinitionNode.sliceDefinitions.length).toBe(1);

    rootElementNode.definitionNode = rootDefinitionNode;

    const attributeRequests = computeArrayItemsAttributeRequests(
      rootElementNode,
      [],
      mappingId
    );

    const expectedResult: Partial<AttributeRequest>[] = [
      {
        definition_id: rootElementNode.type,
        path: `${rootElementNode.path}[0]`,
        resource: mappingId,
        slice_name:
          rootDefinitionNode.sliceDefinitions[0]?.definition.sliceName,
      },
    ];

    expect(attributeRequests).toStrictEqual(expectedResult);
  });

  it("with simple slice and min cardinality === 3", () => {
    const rootElementNode = elementNodeFactory.build();
    const rootDefinitionNode = definitionNodeFactory.build({
      sliceDefinitions: [
        {
          definition: { min: 3 },
          childrenDefinitions: [],
          sliceDefinitions: [],
        },
      ],
    });

    expect(rootDefinitionNode.childrenDefinitions.length).toBe(1);
    expect(rootDefinitionNode.sliceDefinitions.length).toBe(1);

    rootElementNode.definitionNode = rootDefinitionNode;

    const attributeRequests = computeArrayItemsAttributeRequests(
      rootElementNode,
      [],
      mappingId
    );

    const expectedResult: Partial<AttributeRequest>[] = [
      {
        definition_id: rootElementNode.type,
        path: `${rootElementNode.path}[0]`,
        resource: mappingId,
        slice_name:
          rootDefinitionNode.sliceDefinitions[0]?.definition.sliceName,
      },
      {
        definition_id: rootElementNode.type,
        path: `${rootElementNode.path}[1]`,
        resource: mappingId,
        slice_name:
          rootDefinitionNode.sliceDefinitions[0]?.definition.sliceName,
      },
      {
        definition_id: rootElementNode.type,
        path: `${rootElementNode.path}[2]`,
        resource: mappingId,
        slice_name:
          rootDefinitionNode.sliceDefinitions[0]?.definition.sliceName,
      },
    ];

    expect(attributeRequests).toStrictEqual(expectedResult);
  });

  it("node has already a child with index 0 and min = 1", () => {
    const rootElementNode = elementNodeFactory.build();
    const attribute = attributeFactory.build({
      path: `${rootElementNode.path}[0]`,
      resource: mappingId,
      definition_id: rootElementNode.type,
    });
    const rootDefinitionNode = definitionNodeFactory.build({
      sliceDefinitions: [
        {
          definition: { min: 1, sliceName: "CodeSlice" },
          childrenDefinitions: [],
          sliceDefinitions: [],
        },
      ],
    });

    expect(rootDefinitionNode.childrenDefinitions.length).toBe(1);
    expect(rootDefinitionNode.sliceDefinitions.length).toBe(1);

    rootElementNode.definitionNode = rootDefinitionNode;

    const attributeRequests = computeArrayItemsAttributeRequests(
      rootElementNode,
      [attribute],
      mappingId
    );

    const expectedResult: Partial<AttributeRequest>[] = [
      {
        definition_id: rootElementNode.type,
        path: `${rootElementNode.path}[1]`,
        resource: mappingId,
        slice_name:
          rootDefinitionNode.sliceDefinitions[0]?.definition.sliceName,
      },
    ];

    expect(attributeRequests).toStrictEqual(expectedResult);
  });

  it("node has already a child with index 1 and min = 3", () => {
    const rootElementNode = elementNodeFactory.build(undefined, {
      transient: { childrenIndexes: [1] },
    });
    const attribute = attributeFactory.build({
      path: rootElementNode.children[0]?.path,
      resource: mappingId,
      definition_id: rootElementNode.type,
    });
    const rootDefinitionNode = definitionNodeFactory.build({
      sliceDefinitions: [
        {
          definition: { min: 3, sliceName: "CodeSlice" },
          childrenDefinitions: [],
          sliceDefinitions: [],
        },
      ],
    });

    expect(rootDefinitionNode.childrenDefinitions.length).toBe(1);
    expect(rootDefinitionNode.sliceDefinitions.length).toBe(1);

    rootElementNode.definitionNode = rootDefinitionNode;

    const attributeRequests = computeArrayItemsAttributeRequests(
      rootElementNode,
      [attribute],
      mappingId
    );

    const expectedResult: Partial<AttributeRequest>[] = [
      {
        definition_id: rootElementNode.type,
        path: `${rootElementNode.path}[0]`,
        resource: mappingId,
        slice_name:
          rootDefinitionNode.sliceDefinitions[0]?.definition.sliceName,
      },
      {
        definition_id: rootElementNode.type,
        path: `${rootElementNode.path}[2]`,
        resource: mappingId,
        slice_name:
          rootDefinitionNode.sliceDefinitions[0]?.definition.sliceName,
      },
      {
        definition_id: rootElementNode.type,
        path: `${rootElementNode.path}[3]`,
        resource: mappingId,
        slice_name:
          rootDefinitionNode.sliceDefinitions[0]?.definition.sliceName,
      },
    ];

    expect(attributeRequests).toStrictEqual(expectedResult);
  });
});
