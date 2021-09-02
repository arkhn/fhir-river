import {
  attributeFactory,
  definitionNodeFactory,
  elementNodeFactory,
  structureDefinitionFactory,
} from "services/api/factory";

import {
  buildTree,
  buildTreeDefinition,
  computeChildPathIndex,
  computePathWithoutIndexes,
  createDefinitionNode,
  createElementDefinitionPathOrId,
  createElementNode,
  findChildAttributes,
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
    expect(computeChildPathIndex(rootElementNode)).toBe(2);
  });

  it("indexes 0 & 2 are taken", () => {
    const rootElementNode = elementNodeFactory.build(
      {},
      { transient: { childrenIndexes: [0, 2] } }
    );
    expect(computeChildPathIndex(rootElementNode)).toBe(1);
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
