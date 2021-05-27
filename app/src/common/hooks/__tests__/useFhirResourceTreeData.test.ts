import { structureDefinitionFactory } from "services/api/factory";

import { buildTree, createElementNode } from "../useFhirResourceTreeData";

const structureDefinition = structureDefinitionFactory.build();

describe("BuildTree algorithm", () => {
  it("Should create correct path", () => {
    const elementDefinitions = structureDefinition.snapshot?.element ?? [];
    const rootNode = createElementNode(elementDefinitions[0], {});
    buildTree(elementDefinitions.slice(1), rootNode, rootNode);

    //Basic tree generation
    expect(rootNode.path).toBe(elementDefinitions[0].path);
    expect(rootNode.children[0].path).toBe(elementDefinitions[1].path);
  });

  it("Should concat correctly the paths", () => {
    const parentPath = "path.to.parent";
    const elementDefinitions = structureDefinition.snapshot?.element ?? [];
    const rootNode = createElementNode(elementDefinitions[0], {
      parentPath,
    });
    buildTree(elementDefinitions.slice(1), rootNode, rootNode);

    //Basic tree generation
    expect(rootNode.path).toBe(parentPath);
    expect(rootNode.children[0].path).toBe(
      `${parentPath}.${elementDefinitions[1].path
        ?.split(".")
        .slice(1)
        .join(".")}`
    );
  });

  it("Should create paths with correct index", () => {
    const parentPath = "path.to.parent";
    const index = 3;
    const elementDefinitions = structureDefinition.snapshot?.element ?? [];
    const rootNode = createElementNode(elementDefinitions[0], {
      parentPath,
      index,
    });
    buildTree(elementDefinitions.slice(1), rootNode, rootNode);

    //Basic tree generation
    expect(rootNode.path).toBe(`${parentPath}[${index}]`);
    expect(rootNode.children[0].path).toBe(
      `${parentPath}[${index}].${elementDefinitions[1].path
        ?.split(".")
        .slice(1)
        .join(".")}`
    );
  });
});
