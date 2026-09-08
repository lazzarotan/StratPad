import { useState } from "react";
import type { DictNode } from "../NestedDictionary";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Stack, Divider } from "@mui/material";
import { KeyboardDoubleArrowRight, ExpandMore, Edit, Delete } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import DOMPurify from "dompurify";
import { useDashboardMode } from "@/components/Dashboard/DashboardMode/DashboardModeContext";
import ImageBody from "./TemplateBodies/ImageBody";
// //Contains a single node in the dict
// export interface DictNode {
//     key: string;
//     onClick: nestedDictHeaderOnClick;
//     label: string;
//     template: nestedDictNodeTemplate;
//     content: string | null;
//     imageAssetId: string | null;
//     tableData: string[][] | null;
//     children: DictNode[];
// }

interface DictionaryNodeProps {
    nodeDef: DictNode;
    onEdit: (key: string) => void;
    onDelete: (key: string) => void;
    onExpand: (key: string) => void;
    onNavigate: (key: string) => void;
}

export default function DictionaryNode({ nodeDef, onEdit, onDelete, onExpand, onNavigate }: DictionaryNodeProps) {

    //Global dashboard mode (hide stuff when not in edit mode)
    const { isEditMode } = useDashboardMode();


    //Main onClick for the accordion header
    function handleClick() {
        if (nodeDef.onClick === "expand") {
            onExpand(nodeDef.key);
        } else if (nodeDef.onClick === "navigate") {
            onNavigate(nodeDef.key);
        }
    }




    function renderContent() {
        const contentType = nodeDef.content?.type;
        // null/undefined content or legacy nodes without `content.type`
        if (contentType == null) {
            return null;
        }
        switch (contentType) {
            case "text":
                const sanitizedText = DOMPurify.sanitize(nodeDef.content.text);
                return <div dangerouslySetInnerHTML={{ __html: sanitizedText }} />
            case "image":
                return <ImageBody imageAssetId={nodeDef.content?.imageAssetId ?? null} />
            case "navigable":
                return <div></div>;
            default: {
                const _exhaustive = contentType as never;
                throw new Error(`Invalid content type: ${_exhaustive}`);
            }
        }
    }


    //Styling to differentiate between navigate & expand nodes
    const expandOrNavIcon = nodeDef.onClick === "navigate" ? <KeyboardDoubleArrowRight /> : <ExpandMore />;
    
    const accordianSummaryStyle = {
        '& .MuiAccordionSummary-content': {
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            marginRight: 1,
        },
    }


    const navigateNodeStyle = {
        ...accordianSummaryStyle,
        cursor: "pointer",
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.08)",
        },
        backgroundColor: "#8b5cf608"
    }

    return (
        <>
            <Accordion disableGutters elevation={0} square sx={{ border: "1px solid rgba(0, 0, 0, 0.1)" }} >
                {/* MUST USE component="div" TO AVOID <button> INSIDE <button> ERROR */}
                <AccordionSummary
                aria-controls="panel1d-content"
                    sx={nodeDef.onClick === "navigate" ? navigateNodeStyle : accordianSummaryStyle}
                    component="div"
                    expandIcon={expandOrNavIcon} // >> for navigate or ^ for expand
                    onClick={handleClick}//Route to either onExpand or onNavigate
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ minWidth: 0, width: '100%' }}
                    >
                        <Typography
                            noWrap
                            title={nodeDef.label}
                            sx={{ flex: 1, minWidth: 0 }}
                        >
                            {nodeDef.label}
                        </Typography>
                        {/* Hide the Edit/Delete buttons when not in edit mode */}
                        {!isEditMode
                            ? <div></div>
                            : (
                                <>
                                    <IconButton
                                        size="small"
                                        aria-label="Edit node"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(nodeDef.key);
                                        }}
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        aria-label="Delete node"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(nodeDef.key);
                                        }}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </>
                            )}
                        {/* End conditional hide of Edit/Delete buttons*/}
                    </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: "rgba(0, 0, 0, 0.03)", borderTop: "1px solid rgba(0, 0, 0, 0.1)" }}>
                    {renderContent()}
                </AccordionDetails>
            </Accordion>
        </>
    )

}