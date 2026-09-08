import { useMemo } from "react";
import { TreeSelect, type TreeSelectProps } from "antd";
import { DictNode } from "../NestedDictionary";
import "./NodeSelector.css";

interface NodeSelectorProps{
    data: DictNode[];
    currentRoot: string | null;
    onChange: (value: string | null) => void;
    linksOnlyInDropdown: boolean;
};

//Key string for the "root" node (Top level, not an actual DictNode)
const ROOT_KEY = "home";

export default function NodeSelector({ data, currentRoot, onChange, linksOnlyInDropdown }: NodeSelectorProps){


    //Take the full JSON tree of nodes, and prune it down to only the "navigate" ones.
    function pruneToNavigable(nodes: DictNode[]): TreeSelectProps['treeData'] {
        return nodes
            .filter(node => linksOnlyInDropdown ? node.onClick === "navigate" : true)
            .map(node => ({
                value: node.key,
                title: node.label,
                children: pruneToNavigable(node.children),//Call recursively to build the full tree
            }));
    }

    //Collect every value in the tree so treeExpandedKeys always expands all.
    function collectAllKeys(treeData: TreeSelectProps['treeData']): string[] {
        if (!treeData) return [];
        return treeData.flatMap(node => [
            node.value as string,
            ...collectAllKeys(node.children),
        ]);
    }

    function handleOnChange(value: string){
        onChange(value === ROOT_KEY ? null : value);
    }

    const treeData = useMemo(
        () =>
            [{ value: ROOT_KEY, title: "Home", children: pruneToNavigable(data) }] as TreeSelectProps["treeData"],
        [data, linksOnlyInDropdown]
    );

    const expandedKeys = useMemo(() => collectAllKeys(treeData), [treeData]);

    return (
        <TreeSelect
            style={{ width: "100%" }}
            classNames={{ popup: { root: "node-selector-tree-popup" } }}
            popupMatchSelectWidth={false}
            styles={{
                popup: {
                    root: {
                        maxHeight: 400,
                        overflow: "auto",
                        minWidth: 200,
                    },
                },
            }}
            treeData={treeData}
            onChange={handleOnChange}
            value={currentRoot ?? ROOT_KEY}
            treeLine={true && { showLeafIcon: true }}
            treeDefaultExpandedKeys={[ROOT_KEY, ...expandedKeys]}
            treeIcon
            
        />
    )

}