import { useSession, MODULE_SESSION_PREFIX } from "@/client_API_calls/session_storage/useSession";
import { MODULE_DEFINITIONS } from "@/module_definitions/module_definitions";
import ModuleHeader from "../ModuleHeader.js/ModuleHeader";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import DictionaryNode from "./DictNodes/DictionaryNode";
import { deleteNode, editNode, findNode } from "./treeOperations";
import DictNodeEditor from "./DictNodes/DictNodeEditor";
import NodeSelector from "./NodeSelector/NodeSelector";
import { useDashboardMode } from "@/components/Dashboard/DashboardMode/DashboardModeContext";
import { generateUUID } from "@/components/Dashboard/moduleFactory";
import { Add } from "@mui/icons-material";
import "./NestedDictionary.css";


//Determines what happens when a node is clicked
export type nestedDictHeaderOnClick = "expand" | "navigate";

//template of the node
export type nestedDictNodeTemplate = "text" | "image" | "table" | "navigable";


export interface DictNodeNavigable {
    type: "navigable";
}

export interface DictNodeContentText {
    type: "text";
    text: string;
}

export interface DictNodeContentImage {
    type: "image";
    imageAssetId?: number | null;
}


type DictNodeContent = DictNodeContentText | DictNodeContentImage  | DictNodeNavigable | null;

//Contains a single node in the dict
export interface DictNode {
    key: string;
    onClick: nestedDictHeaderOnClick;
    label: string;
    content: DictNodeContent;
    children: DictNode[];
}



export default function NestedDictionary({ id, onRemove, onSettings }) {

    const { isEditMode } = useDashboardMode();

    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            const scale = Math.min(width / 300, height / 220);
            el.style.setProperty('--nd-scale', String(Math.max(0.5, Math.min(scale, 1.8))));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const [data, setData] = useSession(
        MODULE_SESSION_PREFIX + id,
        MODULE_DEFINITIONS.nestedDictionary.defaultData
    );

    const [editingNode, setEditingNode] = useState<DictNode | null>(null);
    const [renderedNodes, setRenderedNodes] = useState<React.ReactNode[]>([]);


    function handleOnExpand(key: string) {
        //Do nothing for now. I don't THINK I need to do anything?
    }

    function handleOnNavigate(key: string | null) {
        console.log("handleOnNavigate: ", key);
        console.log(data.currentRoot);
        setData({ ...data, currentRoot: key ?? null });
    }

    function handleAddNode(isNavigate: boolean) {
        const newNode: DictNode = {
            key: generateUUID(),
            onClick: isNavigate ? "navigate" : "expand",
            label: isNavigate ? "New Link" : "New Content",
            content: isNavigate ? { type: "navigable" } : { type: "text", text: "" },
            children: [],
        }

        const isTargetingRoot = data.currentRoot === null;

        //If targeting root, just append it to the root DictNode array
        if (isTargetingRoot) {
            const newArray = [...data.dictionary, newNode];
            setData({ ...data, dictionary: newArray });
        }
        else {
            //Else, we have to update the node in place using recursive helpers.
            const targetNode = findNode(data.dictionary, data.currentRoot);
            if (!targetNode) {
                throw new Error("Target node not found");
            }

            const targetCopy = { ...targetNode };
            targetCopy.children.push(newNode);

            const result = editNode(data.dictionary, targetCopy);
            if (result.success) {
                setData({ ...data, dictionary: result.updatedDictionary });
            } else {
                console.error(result.error);
            }
        }

        setEditingNode(newNode);
    }

    function handleEditorDelete() {
        const result = deleteNode(data.dictionary, editingNode.key);
        setData({ ...data, dictionary: result.updatedDictionary });
        setEditingNode(null);
    }



    function handleEditorSave(updatedNode: DictNode) {

        const result = editNode(data.dictionary, updatedNode);
        if (result.success) {
            //Check if current root still exists
            const currentRootStillExists = findNode(result.updatedDictionary, data.currentRoot) !== null;

            //Update dict & currentRoot
            setData({
                ...data,
                dictionary: result.updatedDictionary,
                currentRoot: currentRootStillExists ? data.currentRoot : null,
            });
            setEditingNode(null);
        } else {
            console.error(result.error);
        }
    }


    //Render the nodes onLoad or when the currentRoot changes
    useEffect(() => {
        //If a root node is selected, only render its direct children.
        //Else, render nodes where parentKey === NULL
        const rootNode = data.currentRoot ? findNode(data.dictionary, data.currentRoot) : null;
        const nodesToRender = rootNode ? rootNode.children : data.dictionary;


        console.log("nodesToRender: ", nodesToRender);
        const renderedNodes = nodesToRender.map((node: DictNode) => (
            <DictionaryNode
                key={node.key}
                nodeDef={node}
                onEdit={() => handleNodeEdit(node.key)}
                onDelete={() => handleNodeDelete(node.key)}
                onExpand={handleOnExpand}
                onNavigate={handleOnNavigate} />
        ));
        setRenderedNodes(renderedNodes);

    }, [data.currentRoot, data.dictionary])


    function handleNodeDelete(key: string) {
        const result = deleteNode(data.dictionary, key);
        if (result.success) {
            setData({ ...data, dictionary: result.updatedDictionary });
        } else {
            console.error(result.error);
        }
    }
    function handleNodeEdit(key: string) {
        const node = findNode(data.dictionary, key);
        if (!node) {
            throw new Error("Node not found");
        }
        setEditingNode(node);
    }

    return (
        <div className="nested-dictionary"
            ref={containerRef}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <ModuleHeader
                title={data.title}
                onTitleChange={(newTitle: string) => setData({ ...data, title: newTitle })}
                onRemove={() => onRemove(id)}
                onSettings={() => onSettings(id)}
                onReset={undefined}
                children={undefined}
            />
            <Stack
                direction="column"
                spacing={0}
                sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
            >
                <Stack
                    direction="row"
                    flexWrap="wrap"
                    useFlexGap
                    spacing={1}
                    alignItems="center"
                    sx={{ flexShrink: 0, pb: 1 }}
                >
                    <Box sx={{ flex: '1 1 120px', minWidth: 0 }}>
                        <NodeSelector
                            data={data.dictionary}
                            currentRoot={data.currentRoot}
                            onChange={handleOnNavigate}
                            linksOnlyInDropdown={data.linksOnlyInDropdown}
                        />
                    </Box>
                    {isEditMode && (

                        <>
                            <Button
                                className="nested-dict-button__primary nested-dict-add-btn"
                                onClick={() => handleAddNode(false)}
                                startIcon={<Add />}
                                sx={{ background: 'var(--gradient-button)', '&:hover': { background: 'var(--gradient-button)', filter: 'brightness(0.9)' } }}
                            >
                                <Typography sx={{ fontSize: '0.75rem' }}>Content</Typography>
                            </Button>
                            <Button
                                className="nested-dict-button__primary nested-dict-add-btn"
                                onClick={() => handleAddNode(true)}
                                startIcon={<Add />}
                                sx={{ background: 'var(--gradient-button)', '&:hover': { background: 'var(--gradient-button)', filter: 'brightness(0.9)' } }}
                            >
                                <Typography sx={{ fontSize: '0.75rem' }}>Link</Typography>
                            </Button>
                            </>
                    )}
                    <Divider/>
                </Stack>



                <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                    {renderedNodes}
                </Box>
            </Stack>
            <DictNodeEditor
                nodeDef={editingNode}
                isOpen={editingNode !== null}
                onSave={handleEditorSave}
                onDelete={() => handleEditorDelete()}
                onCancel={() => setEditingNode(null)}
            />

        </div>
    )
}