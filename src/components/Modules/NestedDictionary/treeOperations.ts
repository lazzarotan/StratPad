import type { DictNode } from "./NestedDictionary";

interface TreeOperationResult{
    success: boolean;
    updatedDictionary?: DictNode[];
    error?: string;
}

export function editNode(dictionary: DictNode[], nodeDef: DictNode): TreeOperationResult {
    function buildNewTree_Recursive(nodes: DictNode[]): { updatedNodes: DictNode[]; edited: boolean } {

        console.log("Entered BuildNewTree (Recursive fn)");
        console.log("Nodes:", nodes);

        let edited = false;
        const updatedNodes: DictNode[] = [];

        for (const node of nodes) {
            // If we find the target node, replace it
            if (node.key === nodeDef.key) {
                edited = true;
                updatedNodes.push(nodeDef);
                continue;
                
            }

            // Otherwise recurse into children
            const childResult = buildNewTree_Recursive(node.children);

            if (childResult.edited) {
                edited = true;
                updatedNodes.push({
                    ...node,
                    children: childResult.updatedNodes,
                });
            } else {
                // Preserve untouched node as-is
                updatedNodes.push(node);
            }
        }

        return { updatedNodes, edited };
    }

    console.log("Entered EditNode (Top-level fn)");
    console.log("Dictionary:", dictionary);
    console.log("Updated node def:", nodeDef);

    const result = buildNewTree_Recursive(dictionary);

    if (!result.edited) {
        return { success: false, error: "Node not found" };
    }

    return {
        success: true,
        updatedDictionary: result.updatedNodes,
    };
}

//Recursively look for the node with a given key
export function findNode(nodes: DictNode[], key: string): DictNode | null{
    for(const node of nodes){
        if(node.key === key) return node;
        const found = findNode(node.children, key);
        if(found) return found;
    }
    return null;
}

export function deleteNode(dictionary: DictNode[], nodeKey: string): TreeOperationResult {

    //Recursive function to build a new tree while excluding the target node.
    function deleteFromNodes(nodes: DictNode[]): { updatedNodes: DictNode[]; deleted: boolean } {
        let deleted = false;

        const updatedNodes: DictNode[] = [];

        for (const node of nodes) {

            //If we find the key, flag it as deleted, and skip re-creating it.
            if (node.key === nodeKey) {
                deleted = true;
                continue;
            }

            //Recursion.
            const childResult = deleteFromNodes(node.children);

            //If the child was deleted, flag it as deleted, and skip re-creating it.
            if (childResult.deleted) {
                deleted = true;
                updatedNodes.push({
                    ...node,
                    children: childResult.updatedNodes,
                });
            } else {
                //If the child was not deleted, add it to the updated nodes.
                updatedNodes.push(node);
            }
        }

        //Return the updated nodes and the deleted flag.
        return { updatedNodes, deleted };
    }

    //Kick off the recursive delete search
    const result = deleteFromNodes(dictionary);

    //If node not found
    if (!result.deleted) {
        return {
            success: false,
            updatedDictionary: dictionary,
            error: "Node not found",
        };
    }

    //Build the updated tree.
    const updatedDictionary: DictNode[] = result.updatedNodes;

    return {
        success: true,
        updatedDictionary,
    };
}